set(SRCS "")

set(SRC_DIRS "")
list(APPEND SRC_DIRS "font")
list(APPEND SRC_DIRS "icons")
list(APPEND SRC_DIRS "src")

set(INCLUDE_DIRS "")
list(APPEND INCLUDE_DIRS "include")

foreach(SRC_DIR IN LISTS SRC_DIRS)
    file(GLOB_RECURSE SRC ${SRC_DIR}/*.c)
    list(APPEND SRCS ${SRC})    
endforeach()

# FIX: Exclude the file explorer to prevent LVGL 9 compilation errors
# (Remove this line if you enabled File Explorer in menuconfig)
list(REMOVE_ITEM SRCS "${CMAKE_CURRENT_LIST_DIR}/src/storage_file_explorer.c")

idf_component_register(
    SRCS ${SRCS}
    INCLUDE_DIRS ${INCLUDE_DIRS}
    REQUIRES lvgl sensors settings display_manager ble_sync esp32_s3_touch_amoled_2_06 audio_alert bsp_extra
    PRIV_REQUIRES esp_event
)