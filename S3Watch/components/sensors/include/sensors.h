#pragma once

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    SENSORS_ACTIVITY_IDLE = 0,
    SENSORS_ACTIVITY_WALK,
    SENSORS_ACTIVITY_RUN,
    SENSORS_ACTIVITY_OTHER,
} sensors_activity_t;

/**
 * @brief Инициализира I2C шината и QMI8658 сензора.
 */
void sensors_init(void);

/**
 * @brief Основен Task за броене на крачки (активен, когато екранът свети).
 */
void sensors_task(void *pvParameters);

/**
 * @brief Спира обработката на данни (вика се преди заспиване).
 */
void sensors_suspend(void);

/**
 * @brief Възобновява обработката (вика се след събуждане).
 */
void sensors_resume(void);

/**
 * @brief Подготвя сензора за сън (WoM).
 * * @return true Ако сензорът е готов и пинът за прекъсване е чист (може да се спи).
 * @return false Ако има движение в момента и пинът е LOW (не може да се спи).
 */
bool sensors_prepare_for_sleep(void);

// Getters
uint32_t sensors_get_step_count(void);
sensors_activity_t sensors_get_activity(void);

#ifdef __cplusplus
}
#endif