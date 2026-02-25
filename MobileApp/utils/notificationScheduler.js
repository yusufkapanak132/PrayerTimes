import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculatePrayerTimesForDate, order, getPrayerDisplayName, REFERENCE_CITIES } from './PrayerCalculator';
import translationsData from '../assets/translations.json';

const SYSTEM_TO_JSON_MAP = {
    "Fajr": "Зора",
    "Sunrise": "Изгрев",
    "Dhuhr": "Обяд",
    "Asr": "Следобяд",
    "Maghrib": "Залез",
    "Isha": "Нощ"
};

const getWeekday = (date) => {
    return date.toLocaleDateString("bg-BG", { weekday: "long" });
};

const getLocalPrayerName = (systemKey, language = 'bg', isFriday = false) => {
    const jsonKey = SYSTEM_TO_JSON_MAP[systemKey] || systemKey;
    
    if (translationsData[language] && translationsData[language].prayers) {
        const prayerTranslation = translationsData[language].prayers[jsonKey];
        
    
        if (Array.isArray(prayerTranslation)) {
            if (systemKey === "Dhuhr") {
                // За Dhuhr: [0] = обикновен ден, [1] = петък
                return isFriday ? prayerTranslation[1] : prayerTranslation[0];
            }
            return prayerTranslation[0]; // Връщаме първия елемент по подразбиране
        }
        
        return prayerTranslation || systemKey;
    }
    return systemKey;
};

const getNotificationMessage = (prayerName, minutesBefore, language = 'bg', isFriday = false) => {
    const messages = translationsData[language]?.notificationMessages;
    if (!messages) return { reminder: '', exact: '' };

    const isFajr = prayerName === "Fajr" || prayerName === "Зора" || prayerName === "Sabah" || prayerName === "الفجر";
    const isSunrise = prayerName === "Sunrise" || prayerName === "Изгрев" || prayerName === "Güneş" || prayerName === "الشروق";
    const isDhuhr = prayerName === "Dhuhr" || prayerName === "Обяд" || prayerName === "Öğle" || prayerName === "الظهر";
    const isAsr = prayerName === "Asr" || prayerName === "Следобяд" || prayerName === "İkindi" || prayerName === "العصر";
    const isMaghrib = prayerName === "Maghrib" || prayerName === "Залез" || prayerName === "Akşam" || prayerName === "المغرب";
    const isIsha = prayerName === "Isha" || prayerName === "Нощ" || prayerName === "Yatsı" || prayerName === "العشاء";

    let reminderKey = '';
    let exactKey = '';

    if (isFajr) {
        reminderKey = 'fajrReminder';
        exactKey = 'fajrExact';
    } else if (isSunrise) {
        reminderKey = 'sunriseReminder';
        exactKey = 'sunriseExact';
    } else if (isDhuhr) {
        if (isFriday) {
            reminderKey = 'jummahReminder';
            exactKey = 'jummahExact';
        } else {
            reminderKey = 'dhuhrReminder';
            exactKey = 'dhuhrExact';
        }
    } else if (isAsr) {
        reminderKey = 'asrReminder';
        exactKey = 'asrExact';
    } else if (isMaghrib) {
        reminderKey = 'maghribReminder';
        exactKey = 'maghribExact';
    } else if (isIsha) {
        reminderKey = 'ishaReminder';
        exactKey = 'ishaExact';
    }

    const reminderMessage = messages[reminderKey]?.replace('{minutes}', minutesBefore) || `${prayerName} begins in ${minutesBefore} minutes.`;
    const exactMessage = messages[exactKey] || `${prayerName} has started now.`;

    return { reminder: reminderMessage, exact: exactMessage };
};

export const scheduleNotifications = async () => {
    try {
        console.log("🔔 Стартиране на планиране (Smart Schedule)...");

        const enabled = await AsyncStorage.getItem('notificationsEnabled');
        if (enabled !== 'true') {
            await Notifications.cancelAllScheduledNotificationsAsync();
            return;
        }

        const settingsStr = await AsyncStorage.getItem('prayerSettings');
        const prayerSettings = settingsStr ? JSON.parse(settingsStr) : {};

        const language = await AsyncStorage.getItem("appLanguage") || 'bg';
        const cityStr = await AsyncStorage.getItem("selectedCity");
        let selectedCity = null;

        if (cityStr) {
            try {
                selectedCity = JSON.parse(cityStr);
            } catch (e) {
                selectedCity = REFERENCE_CITIES.find(c => c.name === cityStr) || { name: cityStr };
            }
        }

        const isAutoStr = await AsyncStorage.getItem("isAutoLocation");
        const isAuto = isAutoStr === 'true';

        const coordsStr = await AsyncStorage.getItem("userCoords");
        const userCoords = coordsStr ? JSON.parse(coordsStr) : null;

        await Notifications.cancelAllScheduledNotificationsAsync();

        const now = new Date();
        let totalNotificationsScheduled = 0;
        const MAX_NOTIFICATIONS = 60;

        for (let i = 0; i < 5; i++) {
            if (totalNotificationsScheduled >= MAX_NOTIFICATIONS) break;

            const targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() + i);
            const isFriday = getWeekday(targetDate) === 'петък';

            const { rawDates } = calculatePrayerTimesForDate(
                targetDate,
                userCoords,
                selectedCity,
                isAuto
            );

            if (!rawDates) continue;

            for (const prayerName of order) {
                if (totalNotificationsScheduled >= MAX_NOTIFICATIONS) break;

                const settings = prayerSettings[prayerName];
                if (!settings?.enabled) continue;

                const prayerTime = rawDates[prayerName];
                if (prayerTime <= now) continue;

                const minutesBefore = settings.minutesBefore || 0;
                
                // Подаваме isFriday на getLocalPrayerName, за да върне правилното име
                const localPrayerName = getLocalPrayerName(prayerName, language, isFriday);
                const notificationMessages = getNotificationMessage(prayerName, minutesBefore, language, isFriday);

                if (minutesBefore > 0) {
                    const reminderTime = new Date(prayerTime.getTime() - (minutesBefore * 60 * 1000));
                    if (reminderTime > now) {
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: `${localPrayerName}`,
                                body: notificationMessages.reminder,
                                sound: true,
                                vibrate: [0, 250, 250, 250],
                                data: { type: 'prayer-reminder', prayer: prayerName }
                            },
                            trigger: reminderTime,
                        });
                        totalNotificationsScheduled++;
                    }
                }

                if (totalNotificationsScheduled < MAX_NOTIFICATIONS) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: `${localPrayerName}`,
                            body: notificationMessages.exact,
                            sound: true,
                            vibrate: [0, 500, 250, 500],
                            data: { type: 'prayer-exact', prayer: prayerName }
                        },
                        trigger: prayerTime,
                    });
                    totalNotificationsScheduled++;
                }
            }
        }

        console.log(`✅ Успешно планирани ${totalNotificationsScheduled} бъдещи известия.`);
    } catch (error) {
        console.error('Грешка в планировчика:', error);
    }
};