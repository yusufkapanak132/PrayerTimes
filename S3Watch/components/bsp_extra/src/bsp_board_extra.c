#include <stdint.h>
#include <stdbool.h>
#include <string.h>
#include "esp_check.h"
#include "esp_err.h"
#include "esp_log.h"
// UPDATE: The new I2C API (i2c_master_bus_handle_t) lives here in IDF 5.x
#include "driver/i2c_master.h" 
#include "driver/i2s_std.h"
#include "driver/gpio.h"
#include "driver/ledc.h"
#include "esp_event.h"

#include "bsp/esp-bsp.h"
#include "bsp_board_extra.h"
#include "pcf85063a.h"
#include "ble_sync.h"

static const char *TAG = "bsp_extra_board";

static i2c_master_bus_handle_t bus_handle;

static i2c_master_dev_handle_t rtc_dev_handle = NULL;

esp_err_t bsp_rtc_init(void)
{
    // Configuration for the new I2C driver
    i2c_device_config_t dev_config = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = 0x51,
        .scl_speed_hz = 400000, // Standard 400kHz (CONFIG_I2C_MASTER_FREQUENCY might not be defined)
        .scl_wait_us = 0,
        .flags = {
            .disable_ack_check = 0
        }
    };

    // Safety check if bus_handle is null (meaning bsp_i2c_get_handle failed or isn't compatible)
    if (bus_handle == NULL) {
        ESP_LOGW(TAG, "I2C Bus Handle is NULL, skipping device add");
        return ESP_FAIL;
    }

    return i2c_master_bus_add_device(bus_handle, &dev_config, &rtc_dev_handle);
}

// read function using new API
int rtc_register_read(uint8_t regAddr, uint8_t *data, uint8_t len) {
    if (rtc_dev_handle == NULL) return -1;

    esp_err_t ret = i2c_master_transmit_receive(rtc_dev_handle, &regAddr, 1, data, len, -1);
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "RTC READ FAILED!");
        return -1;
    }
    return 0;
}

// write function using new API
int rtc_register_write(uint8_t regAddr, uint8_t *data, uint8_t len) {
    if (rtc_dev_handle == NULL) return -1;

    uint8_t *buffer = (uint8_t *)malloc(len + 1);
    if (!buffer) return -1;
    buffer[0] = regAddr;
    memcpy(&buffer[1], data, len);

    esp_err_t ret = i2c_master_transmit(rtc_dev_handle, buffer, len + 1, -1);
    free(buffer);

    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "RTC WRITE FAILED!");
        return -1;
    }
    return 0;
}

// --- POWER FUNCTIONS IMPLEMENTATION (Re-added for compatibility) ---

esp_err_t bsp_power_init(void) {
    // TODO: Initialize ADC for battery reading here
    return ESP_OK;
}

int bsp_power_get_battery_percent(void) {
    // TODO: Return real calculation from ADC
    return 85; // Dummy value: 85%
}

int bsp_power_get_batt_voltage_mv(void) {
    return 4000; // Dummy value: 4.0V
}

int bsp_power_get_vbus_voltage_mv(void) {
    return 5000; // Dummy value: 5.0V (USB plugged in)
}

int bsp_power_get_system_voltage_mv(void) {
    return 3300; // Dummy value: 3.3V
}

float bsp_power_get_temperature_c(void) {
    return 30.0f; // Dummy value
}

bool bsp_power_is_charging(void) {
    return true; // Dummy value
}

bool bsp_power_is_vbus_in(void) {
    return true; // Dummy value
}

bool bsp_power_poll_pwr_button_short(void) {
    return false; // Dummy value
}


esp_err_t bsp_extra_init(void)
{
    esp_err_t ret;

    // Ensure default event loop exists for cross-component events
    (void)esp_event_loop_create_default();

    // Note: If bsp_i2c_get_handle() returns a legacy driver handle, 
    // casting it to i2c_master_bus_handle_t might cause issues. 
    // Assuming Waveshare lib 1.0.6 uses the new driver or this is handled elsewhere.
    bus_handle = (i2c_master_bus_handle_t)bsp_i2c_get_handle(); 
    
    ret = bsp_rtc_init();
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "RTC init failed");
        // return ret; // We continue even if RTC fails, to debug display
    }

    ret = pcf85063a_init();
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "PCF85063A init failed");
        // return ret;
    }    

    ret = ble_sync_init();
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "BLE sync init failed");
        return ret;
    }       

    ret = bsp_power_init();
    if (ret != ESP_OK) {
        ESP_LOGE(TAG, "Power init failed");
    }

    return ESP_OK;
}