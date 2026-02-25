#include "display_manager.h"

#include "bsp/display.h"
#include "bsp/esp32_s3_touch_amoled_2_06.h"
#include "bsp_board_extra.h"

#include "driver/gpio.h"
#include "driver/uart.h"
#include "esp_err.h"
#include "esp_log.h"
#include "esp_lvgl_port.h"
#include "esp_pm.h"
#include "esp_sleep.h"
#include "esp_timer.h"
#include "esp_rom_sys.h" 

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "lvgl.h"
#include "nimble-nordic-uart.h"
#include "settings.h"
#include "sensors.h" 

#include <stdbool.h>
#include <stdint.h>

#define TAG "DISPLAY_MGR"

#define WAKE_BUTTON_GPIO GPIO_NUM_0 
#define IMU_IRQ_GPIO     GPIO_NUM_21

static bool s_display_on = true;
static uint32_t s_timeout_ms = 10000;
static TaskHandle_t s_task_handle = NULL;

#if CONFIG_PM_ENABLE
static esp_pm_lock_handle_t s_no_ls_lock = NULL;
#endif

/* ============================
   Helpers
   ============================ */

bool display_manager_is_on(void)
{
    return s_display_on;
}

void display_manager_reset_timer(void)
{
#if LVGL_VERSION_MAJOR >= 9
    lv_display_trigger_activity(NULL);
#else
    lv_disp_trig_activity(NULL);
#endif
}

static void touch_event_cb(lv_event_t *e)
{
    lv_event_code_t code = lv_event_get_code(e);
    if (code == LV_EVENT_PRESSED || code == LV_EVENT_CLICKED || code == LV_EVENT_GESTURE) {
        display_manager_reset_timer();
    }
}

/* ============================
   SLEEP SEQUENCE
   ============================ */

static void process_sleep_sequence(void)
{
    ESP_LOGI(TAG, "Preparing Sleep...");

    // Check button state (active low)
    if (gpio_get_level(WAKE_BUTTON_GPIO) == 0) {
        display_manager_reset_timer(); 
        return;
    }

    // 1. Спираме Sensors Task (Hard Suspend)
    sensors_suspend();
    
    // 2. Конфигурираме хардуера на сензора за WoM
    bool motion_wake_enabled = sensors_prepare_for_sleep();
    
    if (!motion_wake_enabled) {
        ESP_LOGE(TAG, "Sensor failed to prep. Aborting sleep.");
        sensors_resume();
        display_manager_turn_on();
        return;
    }

    // 3. Гасим екрана
    bsp_display_backlight_off();
    bsp_display_brightness_set(0);
    vTaskDelay(pdMS_TO_TICKS(50));

    // 4. Спираме LVGL
    if (lvgl_port_lock(100)) {
        lvgl_port_stop();
        lvgl_port_unlock();
    }
    nordic_uart_set_low_power_mode(true);

    s_display_on = false;

    // 5. Release PM Lock (Allow Light Sleep)
#if CONFIG_PM_ENABLE
    if (s_no_ls_lock) esp_pm_lock_release(s_no_ls_lock);
#endif

    /* --- WAKEUP SOURCES --- */
    gpio_wakeup_enable(WAKE_BUTTON_GPIO, GPIO_INTR_LOW_LEVEL);
    // Сензорът вече е конфигуриран в sensors_prepare_for_sleep
    
    esp_sleep_enable_gpio_wakeup();
    uart_wait_tx_idle_polling(CONFIG_ESP_CONSOLE_UART_NUM);

    ESP_LOGI(TAG, "ENTERING LIGHT SLEEP");
    
    // ================================
    // SLEEP
    // ================================
    esp_light_sleep_start();
    // ================================
    // WAKE UP
    // ================================
    
    ESP_LOGI(TAG, "WOKE UP!");

   
#if CONFIG_PM_ENABLE
    if (s_no_ls_lock) esp_pm_lock_acquire(s_no_ls_lock);
#endif

   
    gpio_wakeup_disable(IMU_IRQ_GPIO);
    gpio_wakeup_disable(WAKE_BUTTON_GPIO);

    
    sensors_resume(); 


    display_manager_turn_on();
}

void display_manager_turn_on(void)
{
    if (s_display_on) {
        display_manager_reset_timer();
        return;
    }

    ESP_LOGI(TAG, "Display ON routine");

#if CONFIG_PM_ENABLE
    if (s_no_ls_lock) esp_pm_lock_acquire(s_no_ls_lock);
#endif

    nordic_uart_set_low_power_mode(false);
    lvgl_port_resume();
    
    lv_indev_t *indev = bsp_display_get_input_dev();
    if (indev) lv_indev_enable(indev, true);

    bsp_display_backlight_on();
    bsp_display_brightness_set(settings_get_brightness());
    lv_obj_invalidate(lv_scr_act());

    s_display_on = true;
    display_manager_reset_timer();
}

void display_manager_turn_off(void)
{
    process_sleep_sequence();
}

static void display_manager_task(void *arg)
{
    ESP_LOGI(TAG, "DispMgr Task Started");

    // Init Button GPIO
    gpio_config_t btn_conf = {
        .pin_bit_mask = (1ULL << WAKE_BUTTON_GPIO),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .intr_type = GPIO_INTR_DISABLE, 
    };
    gpio_config(&btn_conf);

    while (1) {
        s_timeout_ms = settings_get_display_timeout();
        if (s_timeout_ms < 5000) s_timeout_ms = 5000;

        if (s_display_on) {
#if LVGL_VERSION_MAJOR >= 9
            uint32_t inactive = lv_display_get_inactive_time(NULL);
#else
            uint32_t inactive = lv_disp_get_inactive_time(NULL);
#endif
            if (inactive >= s_timeout_ms) {
                process_sleep_sequence();
                display_manager_reset_timer();
                vTaskDelay(pdMS_TO_TICKS(1000)); 
            }
        }
        vTaskDelay(pdMS_TO_TICKS(500));
    }
}

void display_manager_init(void)
{
#if CONFIG_PM_ENABLE
    if (!s_no_ls_lock) {
        esp_pm_lock_create(ESP_PM_NO_LIGHT_SLEEP, 0, "disp_lock", &s_no_ls_lock);
    }
    if (s_no_ls_lock) esp_pm_lock_acquire(s_no_ls_lock);
#endif

    lv_obj_add_event_cb(lv_scr_act(), touch_event_cb, LV_EVENT_ALL, NULL);
    xTaskCreate(display_manager_task, "DispMgr", 4096, NULL, 5, &s_task_handle);
}

void display_manager_pm_early_init(void) {
#if CONFIG_PM_ENABLE
    if (!s_no_ls_lock) {
        esp_pm_lock_create(ESP_PM_NO_LIGHT_SLEEP, 0, "disp_lock", &s_no_ls_lock);
    }
    if (s_no_ls_lock) esp_pm_lock_acquire(s_no_ls_lock);
#endif
}