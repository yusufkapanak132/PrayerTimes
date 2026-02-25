#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "bsp/display.h"
#include "bsp/esp-bsp.h"
#include "bsp_board_extra.h"

#include "display_manager.h"
#include "esp_event.h"
#include "esp_log.h"

#include "settings.h"
#include "ui.h"
#include "sensors.h"

#include "audio_alert.h"
#include "ble_sync.h"

#include "esp_wifi.h"
#include "esp_bt.h"
#include "esp_pm.h"

static const char *TAG = "MAIN";

/* ============================
   Power Init
   ============================ */

static void power_init(void)
{
    esp_wifi_stop();
    esp_wifi_deinit();

    /* Release Classic BT memory */
    esp_bt_controller_mem_release(ESP_BT_MODE_CLASSIC_BT);
}

/* ============================
   Main Entry
   ============================ */

extern "C" void app_main(void)
{
    ESP_LOGI(TAG, "Booting Smartwatch...");

    power_init();

    /* Default event loop */
    esp_event_loop_create_default();

    /* Prevent sleep during boot */
    display_manager_pm_early_init();

    /* Start display + LVGL */
    bsp_display_start();

    /* Extra board init */
    bsp_extra_init();

    /* Load settings */
    settings_init();

    /* Apply stored BLE state */
    esp_err_t ble_err =
        ble_sync_set_enabled(settings_get_bluetooth_enabled());

    if (ble_err != ESP_OK)
    {
        ESP_LOGE(TAG, "BLE state restore failed: %s",
                 esp_err_to_name(ble_err));
    }

    /* ============================
       Sensors (Init + Task Start)
       ============================ */
    // ЗАБЕЛЕЖКА: Task-ът сега се стартира вътре в sensors_init, 
    // за да може sensors.c да си управлява Handle-a.
    sensors_init();

    /* ============================
       UI Task
       ============================ */

    xTaskCreate(ui_task, "ui", 8192, NULL, 4, NULL);

    /* Startup sound */
    audio_alert_play_startup();

    /* ============================
       Enable Light Sleep + DFS
       ============================ */

    esp_pm_config_t pm_cfg = {
        .max_freq_mhz = 240,
        .min_freq_mhz = 80,
        .light_sleep_enable = true,
    };

    ESP_ERROR_CHECK(esp_pm_configure(&pm_cfg));

    ESP_LOGI(TAG, "System ready (Light Sleep Enabled)");
}