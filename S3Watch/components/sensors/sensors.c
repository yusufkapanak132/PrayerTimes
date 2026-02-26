#include "sensors.h"
#include "bsp/esp32_s3_touch_amoled_2_06.h"
#include "display_manager.h"

#include "driver/gpio.h"
#include "driver/i2c_master.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "esp_rom_sys.h"
#include "esp_sleep.h"

#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "freertos/task.h"

#include "qmi8658.h"

#include <math.h>
#include <time.h>
#include <string.h> 

#define TAG "SENSORS"

// === ТВОЯТА КОНФИГУРАЦИЯ ===
#define IMU_IRQ_GPIO     GPIO_NUM_21  // Тук е IMU Interrupt (както каза)
#define IMU_ADDR_HIGH    QMI8658_ADDRESS_HIGH
#define IMU_ADDR_LOW     QMI8658_ADDRESS_LOW
#define STEP_THRESH_MG   80.0f

static qmi8658_dev_t s_imu;
static bool s_imu_ready = false;
static uint8_t s_imu_addr_found = 0;
static volatile uint32_t s_step_count = 0;
static sensors_activity_t s_activity = SENSORS_ACTIVITY_IDLE;
static SemaphoreHandle_t s_wom_sem = NULL;
static TaskHandle_t s_sensor_task_handle = NULL;
static time_t s_last_midnight = 0;

/* --- Helpers --- */

static void maybe_reset_daily_counter(void) {
    time_t now = time(NULL);
    if (s_last_midnight == 0) {
        struct tm tm_now;
        localtime_r(&now, &tm_now);
        tm_now.tm_hour = 0; tm_now.tm_min = 0; tm_now.tm_sec = 0;
        s_last_midnight = mktime(&tm_now);
    }

}

/* --- I2C Register Helper --- */
static void qmi8658_write_reg(uint8_t reg, uint8_t val)
{
    if (!s_imu_addr_found) return;
    i2c_master_bus_handle_t bus = bsp_i2c_get_handle();
    if (!bus) return;

    i2c_device_config_t dev_cfg = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = s_imu_addr_found,
        .scl_speed_hz = 100000,
    };

    i2c_master_dev_handle_t dev_handle;
    if (i2c_master_bus_add_device(bus, &dev_cfg, &dev_handle) == ESP_OK) {
        uint8_t data[2] = {reg, val};
        i2c_master_transmit(dev_handle, data, 2, -1);
        i2c_master_bus_rm_device(dev_handle);
    }
}

// Четене на статус, за да се изчисти прекъсването (вдига пина HIGH)
static void force_read_status_register(void)
{
    if (!s_imu_addr_found) return;
    i2c_master_bus_handle_t bus = bsp_i2c_get_handle();
    if (!bus) return;

    i2c_device_config_t dev_cfg = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = s_imu_addr_found,
        .scl_speed_hz = 100000,
    };

    i2c_master_dev_handle_t dev_handle;
    if (i2c_master_bus_add_device(bus, &dev_cfg, &dev_handle) == ESP_OK) {
        uint8_t reg_addr = 0x30; // STATUS1 register
        uint8_t data = 0;
        i2c_master_transmit_receive(dev_handle, &reg_addr, 1, &data, 1, -1);
        i2c_master_bus_rm_device(dev_handle);
    }
}

/* --- Interrupt Handler --- */
static void IRAM_ATTR imu_irq_isr(void *arg) {
    // Тази функция се вика при нормална работа (не в сън)
    BaseType_t hp = pdFALSE;
    if (s_wom_sem) xSemaphoreGiveFromISR(s_wom_sem, &hp);
    if (hp) portYIELD_FROM_ISR();
}

static esp_err_t imu_setup_irq(void) {
    gpio_config_t io = {
        .pin_bit_mask = 1ULL << IMU_IRQ_GPIO,
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE, 
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_NEGEDGE,   // Реагираме при спад (High -> Low)
    };
    ESP_ERROR_CHECK(gpio_config(&io));

    
    esp_err_t err = gpio_install_isr_service(0);
    if (err != ESP_OK && err != ESP_ERR_INVALID_STATE) {
        ESP_LOGE(TAG, "ISR Install failed: %d", err);
    }

    gpio_isr_handler_add(IMU_IRQ_GPIO, imu_irq_isr, NULL);
   
    return ESP_OK;
}

static bool imu_try_init(uint8_t addr) {
    i2c_master_bus_handle_t bus = bsp_i2c_get_handle();
    if (!bus) return false;
    
  
    if (qmi8658_init(&s_imu, bus, addr) != ESP_OK) return false;
    
    // Начални настройки за крачкомер
    qmi8658_enable_sensors(&s_imu, QMI8658_DISABLE_ALL);
    qmi8658_set_accel_range(&s_imu, QMI8658_ACCEL_RANGE_4G);
    qmi8658_set_accel_odr(&s_imu, QMI8658_ACCEL_ODR_62_5HZ);
    qmi8658_enable_accel(&s_imu, true);
    
    s_imu_addr_found = addr;
    return true;
}

/* --- ВАЖНАТА ФУНКЦИЯ ЗА СЪН --- */
bool sensors_prepare_for_sleep(void)
{
    if (!s_imu_ready) return true;

    ESP_LOGI(TAG, "Preparing Sleep: WOM on GPIO %d...", IMU_IRQ_GPIO);

    // 1. НАСТРОЙКА НА СЕНЗОРА (QMI8658)
    // ---------------------------------------------------------
  
    qmi8658_write_reg(0x02, 0x74); 
    
    
    qmi8658_write_reg(0x08, 0x01);

    
    qmi8658_write_reg(0x03, 0x05); 
    
    // CTRL5: Disable LPF
    qmi8658_write_reg(0x06, 0x00); 

    // CAL1_L: Праг на движение (AnyMotion Threshold)
    // Сваляме го на 0x02 - СУПЕР чувствително.
    qmi8658_write_reg(0x0A, 0x02); 

    // CAL1_H: Interrupt Blanking (1 sample)
    qmi8658_write_reg(0x0B, 0x01); 

    // CAL1_L (0x0C): Map AnyMotion to INT1
    qmi8658_write_reg(0x0C, 0x01); 

    // CTRL8: Enable AnyMotion Engine
    qmi8658_write_reg(0x09, 0x01);

    esp_rom_delay_us(20000); 

    // Чистим статуса
    force_read_status_register();
    esp_rom_delay_us(5000); 
    
   
    // ---------------------------------------------------------
    
    // Първо проверяваме дали пинът е HIGH
    int pin_level = gpio_get_level(IMU_IRQ_GPIO);
    ESP_LOGI(TAG, "Pin %d Level: %d (Target: 1)", IMU_IRQ_GPIO, pin_level);

    if (pin_level == 0) {
        ESP_LOGW(TAG, "Pin is LOW! Force clearing...");
        force_read_status_register();
        esp_rom_delay_us(10000);
    }

 
    

    gpio_set_direction(IMU_IRQ_GPIO, GPIO_MODE_INPUT);
    gpio_set_pull_mode(IMU_IRQ_GPIO, GPIO_PULLUP_ONLY);

    
    esp_err_t err = gpio_wakeup_enable(IMU_IRQ_GPIO, GPIO_INTR_LOW_LEVEL);
    
    esp_sleep_enable_gpio_wakeup();


    gpio_sleep_set_direction(IMU_IRQ_GPIO, GPIO_MODE_INPUT);
    gpio_sleep_set_pull_mode(IMU_IRQ_GPIO, GPIO_PULLUP_ONLY);
    


    if (err == ESP_OK) {
        ESP_LOGI(TAG, "WoM Armed. ESP32 Configured not to ignore Pin %d!", IMU_IRQ_GPIO);
        return true;
    } else {
        ESP_LOGE(TAG, "Failed to enable GPIO wakeup: %s", esp_err_to_name(err));
        return false;
    }
}

void sensors_resume(void)
{
    if (s_imu_ready) {
        // Спираме WoM
        qmi8658_write_reg(0x09, 0x00); 
        force_read_status_register();

      
        qmi8658_write_reg(0x02, 0x60); 
        qmi8658_write_reg(0x03, 0x05); 
        qmi8658_enable_accel(&s_imu, true); 
    }
    if (s_sensor_task_handle) vTaskResume(s_sensor_task_handle);
    ESP_LOGI(TAG, "Sensors Resumed");
}

void sensors_suspend(void)
{
    if (s_sensor_task_handle) vTaskSuspend(s_sensor_task_handle);
   
}


void sensors_task_entry(void *pvParameters) {
    TickType_t last = xTaskGetTickCount();
    float lp = 0.0f;
    const float alpha = 0.90f;
    uint32_t last_step_ms = 0;
    bool ready_for_peak = true;

    while (1) {
        maybe_reset_daily_counter();
        
        float ax, ay, az;
        if (qmi8658_read_accel(&s_imu, &ax, &ay, &az) == ESP_OK) {
        
            float mag = sqrtf(ax * ax + ay * ay + az * az);
            float hp = mag - 1000.0f;
            lp = alpha * lp + (1.0f - alpha) * hp;
            
            uint32_t now_ms = (uint32_t)(esp_timer_get_time() / 1000ULL);
            uint32_t dt = now_ms - last_step_ms;

            if (lp > STEP_THRESH_MG && dt > 280 && dt < 2000) {
                if (ready_for_peak) {
                    s_step_count++;
                    last_step_ms = now_ms;
                    ready_for_peak = false;
                }
            } else if (lp < STEP_THRESH_MG * 0.5f) {
                ready_for_peak = true;
            }
            // Активност
            if (dt < 500) s_activity = SENSORS_ACTIVITY_RUN;
            else if (dt < 2000) s_activity = SENSORS_ACTIVITY_WALK;
            else s_activity = SENSORS_ACTIVITY_IDLE;
        }
        vTaskDelayUntil(&last, pdMS_TO_TICKS(40)); // 25Hz loop
    }
}

uint32_t sensors_get_step_count(void) { return s_step_count; }
sensors_activity_t sensors_get_activity(void) { return s_activity; }

void sensors_init(void) {
    ESP_LOGI(TAG, "Initializing Sensors on GPIO %d...", IMU_IRQ_GPIO);
    
  
    if (bsp_i2c_init() != ESP_OK) {
        ESP_LOGE(TAG, "I2C Init Failed");
        return;
    }
    
    // Търсим сензора на двата възможни адреса
    s_imu_ready = imu_try_init(IMU_ADDR_HIGH) || imu_try_init(IMU_ADDR_LOW);
    
    if (!s_imu_ready) {
        ESP_LOGE(TAG, "QMI8658 not found!");
        return;
    }
    
    ESP_LOGI(TAG, "QMI8658 Found!");

    s_wom_sem = xSemaphoreCreateBinary();
    if (s_wom_sem) {
        imu_setup_irq(); // Настройваме GPIO 21
    }
    
    // Пускаме таска за броене на крачки
    xTaskCreate(sensors_task_entry, "sensors", 4096, NULL, 3, &s_sensor_task_handle);
}
