#pragma once

#include <sys/cdefs.h>
#include <stdbool.h>
#include "esp_codec_dev.h"
#include "esp_err.h"
#include "driver/gpio.h"
#include "driver/i2s_std.h"

#ifdef __cplusplus
extern "C" {
#endif

// Initialization
esp_err_t bsp_extra_init(void);

// RTC Functions
esp_err_t bsp_rtc_init(void);
int rtc_register_read(uint8_t regAddr, uint8_t *data, uint8_t len);
int rtc_register_write(uint8_t regAddr, uint8_t *data, uint8_t len);

// --- POWER FUNCTIONS (Missing in new Waveshare lib, added here) ---
esp_err_t bsp_power_init(void);
int bsp_power_get_battery_percent(void);
int bsp_power_get_batt_voltage_mv(void);
int bsp_power_get_vbus_voltage_mv(void);
int bsp_power_get_system_voltage_mv(void);
float bsp_power_get_temperature_c(void);
bool bsp_power_is_charging(void);
bool bsp_power_is_vbus_in(void);
bool bsp_power_poll_pwr_button_short(void);

#ifdef __cplusplus
}
#endif