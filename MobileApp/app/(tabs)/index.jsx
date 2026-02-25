import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
  FlatList, AppState, Dimensions, ImageBackground, ActivityIndicator, StatusBar,
  TextInput
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Entypo, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';

// --- ИМПОРТИ ---
import { 
  calculatePrayerTimesForDate, 
  REFERENCE_CITIES, 
  order, 
  getNearestReferenceCity
} from '../../utils/PrayerCalculator';

import { scheduleNotifications } from '../../utils/notificationScheduler';
import translationsData from '../../assets/translations.json';

// --- UI HELPERS ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size) => Math.round((size * SCREEN_WIDTH) / 375);

function formatDate(d) {
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const formatTimeSec = (sec) => {
  if (sec === null || sec === undefined) return { hhmm: "--:--", ss: "--" };
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60); 
  return { 
    hhmm: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, 
    ss: String(s).padStart(2, '0') 
  };
};

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";


const SYSTEM_TO_JSON_MAP = {
  "Fajr": "Зора",
  "Sunrise": "Изгрев",
  "Dhuhr": "Обяд", 
  "Asr": "Следобяд",
  "Maghrib": "Залез",
  "Isha": "Нощ"
};

// --- COMPONENT ---

export default function Index() {
  const router = useRouter();
  
  // Settings State
  const [selectedCity, setSelectedCity] = useState(REFERENCE_CITIES[0]); 
  const [isAuto, setIsAuto] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [language, setLanguage] = useState('bg');
  const [isReading, setIsReading] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  // Flags
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // UI State
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Search State
  const [searchText, setSearchText] = useState("");

  // Table State
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0); 
    return d;
  });
  const [dayTimes, setDayTimes] = useState({});
  const [dayTimesFull, setDayTimesFull] = useState({}); 
  
  // Timer State
  const [globalTimerData, setGlobalTimerData] = useState({
    prevPrayer: null,     
    prevTime: null,       
    nextPrayer: null,     
    nextTime: null,       
    remainingSec: 0,
    elapsedSec: 0,
    progress: 0.5
  });
  
  const appState = useRef(AppState.currentState);
  const lastSystemDay = useRef(new Date().getDate());
  
  // Ref за таймера за известия
  const notificationTimeoutRef = useRef(null);

  // --- ФУНКЦИИ ЗА ПРЕВОД ---
  const getTranslatedCityName = (originalCityName) => {
    if (!originalCityName) return "";
    const langData = translationsData[language];
    if (langData && langData.cityNames && langData.cityNames[originalCityName]) {
        return langData.cityNames[originalCityName];
    }
    return originalCityName;
  };

  /**
   * Основна функция за превод на името на молитвата.
   * @param {string} systemKey - Ключът от системата (напр. 'Dhuhr')
   * @param {Date|null} dateObj - Датата, за която искаме името (важно за Петък)
   */
  const getLocalPrayerName = (systemKey, dateObj = null) => {
    // 1. Взимаме ключа за JSON (напр. "Dhuhr" -> "Обяд")
    const jsonKey = SYSTEM_TO_JSON_MAP[systemKey] || systemKey;
    
    // 2. Взимаме стойността от JSON файла
    if (translationsData[language] && translationsData[language].prayers) {
        const translationValue = translationsData[language].prayers[jsonKey];

        
        if (Array.isArray(translationValue)) {
            // Проверяваме дали подадената дата е Петък (5)
            const isFriday = dateObj && new Date(dateObj).getDay() === 5;
            
            // Ако е Петък връщаме второто (index 1), иначе първото (index 0)
            return isFriday ? translationValue[1] : translationValue[0];
        }

        // Ако е обикновен текст, връщаме го
        if (translationValue) {
            return translationValue;
        }
    }
    
    return systemKey;
  };

  const getTranslatedDayOfWeek = (date) => {
    const englishDay = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (translationsData[language] && translationsData[language].days) {
        return translationsData[language].days[englishDay] || englishDay;
    }
    return englishDay;
  };

  const t = (key) => {
    if (translationsData[language] && translationsData[language][key]) {
        return translationsData[language][key];
    }
    return key; 
  };

  const getLanguageFlag = (lang) => {
    switch(lang) {
      case 'bg': return '🇧🇬';
      case 'en': return '🇺🇸';
      case 'tr': return '🇹🇷';
      case 'ar': return '🇸🇦';
      default: return '🇧🇬';
    }
  };

  // --- SPEECH LOGIC ---
  const getSpeechLanguage = (lang) => {
    switch(lang) {
      case 'bg': return 'bg-BG';
      case 'en': return 'en-US';
      case 'tr': return 'tr-TR';
      case 'ar': return 'ar-SA';
      default: return 'en-US';
    }
  };

  const formatFullTimeForSpeech = (dateObj) => {
    if (!dateObj) return "";
    const h = dateObj.getHours();
    const m = dateObj.getMinutes();
    const s = dateObj.getSeconds();
    
    const hoursLabel = t('hoursShort') || 'часа';
    const minutesLabel = t('minutesShort') || 'минути';
    const secondsLabel = t('secondsShort') || 'секунди';
    
    let text = `${h} ${hoursLabel} ${m} ${minutesLabel}`;
    text += ` ${s} ${secondsLabel}`;
    
    return text;
  };

  const formatDurationForSpeech = (seconds) => {
    if (seconds === null || seconds === undefined) return "";
    const totalSeconds = Math.floor(seconds);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    let result = "";
    if (h > 0) result += `${h} ${t('hoursShort')} `;
    if (m > 0) result += `${m} ${t('minutesShort')} `;
    result += `${s} ${t('secondsShort')}`;
    
    return result.trim();
  };

  const readPrayerTimes = async () => {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isReading || isSpeaking) {
      Speech.stop();
      setIsReading(false);
      return;
    }

    try {
      setIsReading(true);

      const now = new Date();
      now.setHours(12, 0, 0, 0);
      const { rawDates } = calculatePrayerTimesForDate(now, userCoords, selectedCity, isAuto);

      const speechQueue = [];
      const cityLabel = t('cityLabel') || "Град";
      const introLabel = t('todaysPrayerTimes') || "Времената за намаз днес са";
      
      speechQueue.push(`${cityLabel} ${cityDisplayName}.`);
      speechQueue.push(`${introLabel}:`);

      const atWord = t('atTime') || "в"; 
      
      order.forEach((prayerName) => {
        const dateObj = rawDates[prayerName];

        if (dateObj) {
            // Подаваме dateObj, за да разбере функцията дали да чете "Джума" или "Обедна"
            const displayName = getLocalPrayerName(prayerName, dateObj);
            const timeSpeech = formatFullTimeForSpeech(dateObj);
            speechQueue.push(`${displayName} ${atWord} ${timeSpeech}.`);
        }
      });

      if (globalTimerData.nextPrayer && globalTimerData.remainingSec > 0) {
        // Подаваме времето на следващата молитва
        const nextPrayerTranslated = getLocalPrayerName(globalTimerData.nextPrayer, globalTimerData.nextTime);
        const timeLeftText = formatDurationForSpeech(globalTimerData.remainingSec);
        
        const untilWord = t('until') || "До";      
        const remainsWord = t('remains') || "остават"; 

        speechQueue.push(`${untilWord} ${nextPrayerTranslated} ${remainsWord} ${timeLeftText}.`);
      } else {
        speechQueue.push(t('end') || "Край.");
      }

      const languageCode = getSpeechLanguage(language);
      
      const speakQueueItem = (index) => {
        if (index >= speechQueue.length) {
          setIsReading(false);
          return;
        }

        const textPart = speechQueue[index];
        Speech.speak(textPart, {
          language: languageCode,
          pitch: 1.0,
          rate: 0.9,
          onDone: () => speakQueueItem(index + 1),
          onError: () => setIsReading(false), 
          onStopped: () => setIsReading(false)
        });
      };

      speakQueueItem(0);

    } catch (error) {
      console.log("Speech error:", error);
      setIsReading(false);
      Speech.stop();
    }
  };

  const changeLanguage = async (newLanguage) => {
    if (newLanguage === language) return;
    setLanguage(newLanguage);
    await AsyncStorage.setItem("appLanguage", newLanguage);
    setLanguageModalVisible(false);
    setForceUpdate(prev => prev + 1); 
  };

  // --- CALCULATION LOGIC ---
  const updateTableData = useCallback(() => {
    const { times, rawDates } = calculatePrayerTimesForDate(currentDate, userCoords, selectedCity, isAuto);
    setDayTimes(times);
    
    const fullTimes = {};
    order.forEach(key => {
        if (rawDates[key]) {
            fullTimes[key] = rawDates[key].toLocaleTimeString("bg-BG", { hour12: false });
        }
    });
    setDayTimesFull(fullTimes);
  }, [currentDate, userCoords, selectedCity, isAuto]); 

  const updateGlobalTimer = useCallback(() => {
    const now = new Date();
    const datesToCheck = [-1, 0, 1].map(offset => {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      d.setHours(12, 0, 0, 0);
      return d;
    });
  
    let timeline = [];
    datesToCheck.forEach(date => {
      const { rawDates } = calculatePrayerTimesForDate(date, userCoords, selectedCity, isAuto);
      order.forEach(name => {
        if(rawDates[name]) {
          timeline.push({ 
            name: name,
            time: rawDates[name]
          });
        }
      });
    });
  
    timeline.sort((a, b) => a.time - b.time);
  
    let prev = null, next = null;
    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].time > now) {
        next = timeline[i];
        prev = timeline[i - 1]; 
        break;
      }
    }
    if (!next && timeline.length > 0) prev = timeline[timeline.length - 1];
  
    if (prev && next) {
        const remaining = Math.max(0, Math.floor((next.time - now) / 1000));
        const elapsed = Math.max(0, Math.floor((now - prev.time) / 1000));
        const totalDuration = (next.time - prev.time) / 1000;
        const prog = totalDuration > 0 ? Math.min(1, Math.max(0, elapsed / totalDuration)) : 0;
  
        setGlobalTimerData({
            prevPrayer: prev.name, 
            prevTime: prev.time,
            nextPrayer: next.name, 
            nextTime: next.time,
            remainingSec: remaining,
            elapsedSec: elapsed,
            progress: prog
        });
    }
  }, [userCoords, selectedCity, isAuto]);

  // --- 1. INITIAL LOAD EFFECT ---
  useEffect(() => {
    const loadSettings = async () => {
      try { 
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        const savedCity = await AsyncStorage.getItem("selectedCity"); 
        const savedAuto = await AsyncStorage.getItem("isAutoLocation");
        const savedCoords = await AsyncStorage.getItem("userCoords");

        let finalLang = 'bg';
        let finalCity = REFERENCE_CITIES[0];
        let finalIsAuto = false;
        let finalCoords = null;

        if (savedLanguage) finalLang = savedLanguage;

        if (savedCity) {
          const parsedCity = JSON.parse(savedCity);
          const refCity = REFERENCE_CITIES.find(c => c.name === parsedCity.name) || parsedCity;
          finalCity = refCity;
        }
        if (savedAuto === 'true') {
          finalIsAuto = true;
          if (savedCoords) finalCoords = JSON.parse(savedCoords);
        }
        
        setLanguage(finalLang);
        setSelectedCity(finalCity);
        setIsAuto(finalIsAuto);
        setUserCoords(finalCoords);
        
      } catch (error) { 
          console.log("Error loading settings", error); 
      } finally {
        setIsSettingsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  // --- 2. NOTIFICATION SCHEDULER (DEBOUNCED) ---
  useEffect(() => {
    if (!isSettingsLoaded) return;

    if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
    }

    notificationTimeoutRef.current = setTimeout(() => {
        const manageNotifications = async () => {
            try {
                await Notifications.cancelAllScheduledNotificationsAsync();
                await scheduleNotifications();
            } catch (e) {
                console.error("Notification scheduler error:", e);
            }
        };
        manageNotifications();
    }, 1000);

    return () => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
    };

  }, [
    isSettingsLoaded,
    selectedCity,
    isAuto,
    userCoords,
    language
  ]);

  // --- OTHER EFFECTS ---
  useEffect(() => {
    updateTableData();
  }, [updateTableData, forceUpdate, language]); 

  useEffect(() => {
    const tick = () => {
      updateGlobalTimer(); 
      const now = new Date();
      if (now.getDate() !== lastSystemDay.current) {
        lastSystemDay.current = now.getDate();
        const newDateForTable = new Date(now);
        newDateForTable.setHours(12, 0, 0, 0);
        setCurrentDate(newDateForTable); 
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [updateGlobalTimer, forceUpdate]);

  // --- HANDLERS ---
  const handleAutoLocation = async () => {
    setLoadingLoc(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoadingLoc(false); return; }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      const userLocation = { lat: location.coords.latitude, lng: location.coords.longitude };
      const nearestCity = getNearestReferenceCity(userLocation.lat, userLocation.lng);

      await AsyncStorage.setItem("selectedCity", JSON.stringify(nearestCity || { name: "GPS" }));
      await AsyncStorage.setItem("isAutoLocation", "true");
      await AsyncStorage.setItem("userCoords", JSON.stringify(userLocation));
      
      setSelectedCity(nearestCity || { name: "GPS" });
      setUserCoords(userLocation);
      setIsAuto(true);

      setModalVisible(false);
      setSearchText(""); 
      setCurrentDate(new Date()); 
      setForceUpdate(prev => prev + 1);
    } catch (e) { console.log("GPS Error:", e.message); } 
    finally { setLoadingLoc(false); }
  };
  
  const onCitySelect = async (city) => {
    await AsyncStorage.setItem("selectedCity", JSON.stringify(city));
    await AsyncStorage.setItem("isAutoLocation", "false");
    await AsyncStorage.removeItem("userCoords");

    setSelectedCity(city);
    setIsAuto(false);
    setUserCoords(null);

    setSearchText(""); 
    setModalVisible(false);
    setCurrentDate(new Date());
    setForceUpdate(prev => prev + 1);
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    const today = new Date();
    today.setHours(0,0,0,0);
    const checkDate = new Date(newDate);
    checkDate.setHours(0,0,0,0);
    if (checkDate < today) return;
    setCurrentDate(newDate);
  };

  // --- FILTER LOGIC ---
  const filteredCities = REFERENCE_CITIES.filter(city => {
    const searchLower = searchText.toLowerCase();
    const originalName = city.name.toLowerCase();
    const translatedName = getTranslatedCityName(city.name)?.toLowerCase() || "";
    return originalName.includes(searchLower) || translatedName.includes(searchLower);
  });

  // --- RENDER VARS ---
  const cityDisplayName = isAuto ? 
    (t('myLocation') || "Location") : 
    getTranslatedCityName(selectedCity?.name || "Sofia");
  
  const dateStrForTable = formatDate(currentDate);
  const remainingDisplay = formatTimeSec(globalTimerData.remainingSec);
  const elapsedDisplay = formatTimeSec(globalTimerData.elapsedSec);
  const isTodayDate = new Date().toDateString() === currentDate.toDateString();

  const getProgressBarColor = () => {
    const sec = globalTimerData.remainingSec;
    if (sec <= 300) return '#ff6b6b'; 
    if (sec <= 900) return '#ffa726'; 
    return '#38b000'; 
  };

  return (
    <ImageBackground 
      source={require('../../assets/mosque.jpg')} 
      style={{ flex: 1 }} 
      resizeMode="cover"
      key={`main_bg_${language}_${forceUpdate}`} 
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setMenuOpen(true)}>
              <Entypo name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, isReading && styles.iconButtonActive]}
              onPress={readPrayerTimes}
              disabled={loadingLoc}
            >
              <FontAwesome5 name={isReading ? "stop-circle" : "volume-up"} size={20} color={isReading ? "#ffa726" : "#fff"} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cityNameContainer}>
            <Text 
              key={`city_${language}_${cityDisplayName}`} 
              style={styles.cityTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {cityDisplayName}
            </Text>
            <Text style={styles.currentTime}>
              {new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </Text>
          </View>
          
          <View style={styles.headerRightGroup}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setLanguageModalVisible(true)}>
              <Text style={styles.flagText}>{getLanguageFlag(language)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => { setModalVisible(true); setSearchText(""); }}>
              <MaterialIcons name="location-on" size={22} color="#38b000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* TIMER SECTION */}
        {globalTimerData.nextPrayer && (
          <View style={styles.remainingContainer}>
            <View style={styles.remainingRow}>
              <Text style={[styles.remainingBig, { fontSize: scale(50) }]}>- {remainingDisplay.hhmm}</Text>
              <Text style={[styles.remainingSmall, { fontSize: scale(25), lineHeight: scale(28), transform: [{ translateY: -scale(16) }] }]}>{`:${remainingDisplay.ss}`}</Text>
              <Text key={`hr_${language}`} style={[styles.remainingBig, { fontSize: scale(25) }]}> {t('hoursShort')}</Text>
            </View>
            <Text key={`until_${language}`} style={[styles.untilText, { fontSize: scale(18), width: '100%', textAlign: 'center', marginBottom: 8 }]}>
              {t('until')}
            </Text>
            <Text key={`nextP_${language}`} style={[styles.nextPrayerText, { fontSize: scale(25) }]}>
                {/* Тук подаваме и датата, за да се покаже правилно Джума ако е петък */}
                {getLocalPrayerName(globalTimerData.nextPrayer, globalTimerData.nextTime)}
                
                {globalTimerData.nextTime && globalTimerData.nextTime.getDate() !== new Date().getDate() ? 
                  ` (${t('tomorrow')})` : ""}
            </Text>
          </View>
        )}

        {/* ELAPSED TIME */}
        {globalTimerData.prevPrayer && (
          <View style={styles.elapsedContainer}>
            <View style={styles.elapsedRowWrapper}>
              <View style={styles.elapsedInfo}>
                <MaterialIcons name="access-time" size={16} color="#ff6b6b" />
                <Text key={`prevP_${language}`} style={styles.elapsedName}>
                    {/* Тук подаваме и датата */}
                    {getLocalPrayerName(globalTimerData.prevPrayer, globalTimerData.prevTime)}

                    {globalTimerData.prevTime && globalTimerData.prevTime.getDate() !== new Date().getDate() ? 
                      ` (${t('yesterday')})` : ""}
                </Text>
              </View>
              <View style={styles.elapsedTimeBox}>
                <Text style={styles.elapsedTimeText}>+{elapsedDisplay.hhmm}</Text>
              </View>
            </View>
            <View style={styles.elapsedProgressContainer}>
              <View style={styles.elapsedProgressBackground}>
                <View 
                  style={[styles.elapsedProgressFill, { width: `${globalTimerData.progress * 100}%`, backgroundColor: getProgressBarColor() }]} 
                />
              </View>
            </View>
          </View>
        )}

        {/* CALENDAR NAV */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={[styles.dateButton, isTodayDate && styles.disabledButton]} disabled={isTodayDate}>
            <AntDesign name="left" size={scale(20)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.dateContainer}>
            <MaterialIcons name="calendar-today" size={16} color="#38b000" style={styles.dateIcon} />
            <Text style={[styles.dateText, { fontSize: scale(16) }]}>{dateStrForTable}</Text>
          </View>
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
            <AntDesign name="right" size={scale(20)} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* TABLE */}
        <View style={styles.timesContainer}>
          <View style={styles.tableHeader}>
            <MaterialIcons name="schedule" size={18} color="#38b000" />
            <Text key={`day_${language}_${currentDate}`} style={[styles.tableDayTitle, { fontSize: scale(18) }]}>
              {capitalize(getTranslatedDayOfWeek(currentDate))}
            </Text>
          </View>
          
          {order.map((key, index) => {
            const timeFullStr = dayTimesFull[key];
            let rowColor = '#ffffff';
            
            // Проверяваме дали този ред е текущата/следващата молитва
            const isCurrentNext = (globalTimerData.nextPrayer === key && 
              formatDate(currentDate) === (globalTimerData.nextTime ? formatDate(globalTimerData.nextTime) : ""));
            
            const isCurrentPrev = (globalTimerData.prevPrayer === key && 
              formatDate(currentDate) === (globalTimerData.prevTime ? formatDate(globalTimerData.prevTime) : ""));
            
            if (isCurrentNext) rowColor = '#38b000';
            if (isCurrentPrev) rowColor = '#ff6b6b';

            return (
              <View 
                key={`${key}_${index}_${language}`} 
                style={[styles.timeRow, index !== order.length - 1 && styles.timeRowBorder]}
              >
                <View style={styles.timeNameContainer}>
                  {isCurrentNext && <MaterialIcons name="notifications-active" size={14} color="#38b000" style={styles.prayerIcon} />}
                  {isCurrentPrev && <MaterialIcons name="check-circle" size={14} color="#ff6b6b" style={styles.prayerIcon} />}
                  
                  <Text style={[styles.timeName, { color: rowColor, fontSize: scale(15) }]}>
                  {}
                  {getLocalPrayerName(key, currentDate)}
                  </Text>
                </View>
                <View style={styles.timeValueContainer}>
                  <Text style={[styles.timeValue, { color: rowColor, fontSize: scale(15) }]}>
                    {timeFullStr ? timeFullStr.slice(0, 8) : "--:--:--"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />

        {/* CITY MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <MaterialIcons name="location-city" size={28} color="#38b000" />
                <Text style={[styles.modalTitle, { fontSize: scale(20), marginLeft: 10 }]}>
                  {t('selectCity')}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                  <AntDesign name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.autoLocationBtn} onPress={handleAutoLocation} disabled={loadingLoc}>
                {loadingLoc ? <ActivityIndicator color="#fff" size="small" /> : <MaterialIcons name="my-location" size={20} color="#fff" />}
                <Text style={styles.autoLocationText}>
                  {loadingLoc ? t('calculating') : t('autoLocationGPS')}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('searchCity')}
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText("")} style={{ padding: 5 }}>
                        <AntDesign name="closecircle" size={16} color="#999" />
                    </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={filteredCities}
                keyExtractor={item => item.name}
                extraData={[language, searchText]} 
                showsVerticalScrollIndicator={false}
                style={styles.cityList}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={10}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => onCitySelect(item)} 
                    style={[styles.cityItem, (item.name === selectedCity?.name && !isAuto) && styles.cityItemSelected]}
                  >
                    <View style={styles.cityItemContent}>
                      <MaterialIcons name="location-on" size={20} color={(item.name === selectedCity?.name && !isAuto) ? '#fff' : '#38b000'} />
                      <View style={styles.cityTextContainer}>
                        <Text style={[styles.cityText, { fontSize: scale(16) }, (item.name === selectedCity?.name && !isAuto) && styles.cityTextSelected]}>
                          {getTranslatedCityName(item.name)}
                        </Text>
                        {(item.name === selectedCity?.name && !isAuto) && 
                          <Text style={styles.selectedLabel}>{t('selected')}</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* LANGUAGE MODAL */}
        <Modal visible={languageModalVisible} transparent animationType="fade">
          <View style={styles.langModalOverlay}>
            <TouchableOpacity 
              style={styles.langModalBackground} 
              activeOpacity={1} 
              onPress={() => setLanguageModalVisible(false)}
            />
            <View style={styles.langModalContainer}>
              <Text style={styles.langTitle}>
                {translationsData[language]?.languages?.[language] || t('languages') || "Language"}
              </Text>
              
              <TouchableOpacity style={[styles.langOption, language === 'bg' && styles.langOptionSelected]} onPress={() => changeLanguage('bg')}>
                <Text style={styles.langText}>🇧🇬 Български</Text>
                {language === 'bg' && <AntDesign name="check" size={20} color="#38b000" />}
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.langOption, language === 'en' && styles.langOptionSelected]} onPress={() => changeLanguage('en')}>
                <Text style={styles.langText}>🇺🇸 English</Text>
                {language === 'en' && <AntDesign name="check" size={20} color="#38b000" />}
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.langOption, language === 'tr' && styles.langOptionSelected]} onPress={() => changeLanguage('tr')}>
                <Text style={styles.langText}>🇹🇷 Türkçe</Text>
                {language === 'tr' && <AntDesign name="check" size={20} color="#38b000" />}
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.langOption, language === 'ar' && styles.langOptionSelected]} onPress={() => changeLanguage('ar')}>
                <Text style={styles.langText}>🇸🇦 العربية</Text>
                {language === 'ar' && <AntDesign name="check" size={20} color="#38b000" />}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* SIDE MENU */}
        {menuOpen && (
          <View style={styles.menuOverlay}>
            <TouchableOpacity style={styles.menuBackground} activeOpacity={1} onPress={() => setMenuOpen(false)} />
            <View style={styles.sideMenu}>
              <View style={styles.menuHeader}>
                <MaterialIcons name="mosque" size={28} color="#38b000" />
                <Text style={styles.menuTitle}>{translationsData[language]?.appName || "Молитви"}</Text>
              </View>
              <View style={styles.menuItems}>
                <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/'); }}>
                  <MaterialIcons name="schedule" size={20} color="#fff" />
                  <Text style={styles.menuText}>{translationsData[language]?.prayerTimes || "Времена за молитва"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/Notifications'); }}>
                  <MaterialIcons name="notifications" size={20} color="#fff" />
                  <Text style={styles.menuText}>{translationsData[language]?.notifications || "Известия"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/Info'); }}>
                  <MaterialIcons name="info" size={20} color="#fff" />
                  <Text style={styles.menuText}>{translationsData[language]?.information || "Информация"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/About'); }}>
                  <MaterialIcons name="people" size={20} color="#fff" />
                  <Text style={styles.menuText}>{translationsData[language]?.aboutUs || "За нас"}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.menuFooter}>
                <TouchableOpacity style={styles.menuCloseBtn} onPress={() => setMenuOpen(false)}>
                  <Text style={styles.menuCloseText}>{translationsData[language]?.close || "Затвори"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.55)' 
  },
  container: { 
    flex: 1, 
    backgroundColor: 'transparent' 
  },
  contentContainer: { 
    flexGrow: 1, 
    paddingBottom: 10, 
    minHeight: Dimensions.get('window').height - 30 
  },
  
  // ПРОМЕНЕН HEADER СТИЛ
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 15,
    gap: 4
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1
  },
  cityNameContainer: { 
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    minWidth: 0, 
  },
  cityTitle: { 
    fontWeight: '800', 
    color: '#fff', 
    textShadowColor: 'rgba(0,0,0,0.75)', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3,
    textAlign: 'center',
    fontSize: 16,
    flexShrink: 1,
  },
  currentTime: { 
    color: '#fff', 
    fontWeight: '600', 
    marginTop: 2, 
    opacity: 0.9,
    fontSize: 12
  },
  iconButton: { 
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconButtonActive: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)'
  },
  flagText: {
    fontSize: 20,
  },
  
  // ОСТАНАЛИ СТИЛОВЕ
  remainingContainer: { 
    alignItems: 'center', 
    marginVertical: 15, 
    marginBottom: 20 
  },
  remainingRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginBottom: 8 
  },
  remainingBig: { 
    fontWeight: '800', 
    color: '#fff', 
    textShadowColor: 'rgba(0,0,0,0.75)', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3 
  },
  remainingSmall: { 
    fontWeight: '700', 
    color: '#fff', 
    marginLeft: 4, 
    lineHeight: 28, 
    textShadowColor: 'rgba(0,0,0,0.75)', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 3 
  },
  untilText: { 
    color: '#fff', 
    opacity: 0.9, 
    fontWeight: '600' 
  },
  nextPrayerText: { 
    fontWeight: '800', 
    color: '#38b000', 
    textShadowColor: 'rgba(0,0,0,0.5)', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 2 
  },
  elapsedContainer: { 
    marginHorizontal: 16, 
    marginBottom: 16, 
    borderRadius: 10, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    borderLeftWidth: 3, 
    borderLeftColor: '#ff6b6b', 
    overflow: 'hidden' 
  },
  elapsedRowWrapper: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 14 
  },
  elapsedInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  elapsedName: { 
    color: '#ff6b6b', 
    fontSize: 14, 
    fontWeight: '700', 
    marginLeft: 6 
  },
  elapsedTimeBox: { 
    backgroundColor: '#ff6b6b', 
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    borderRadius: 6 
  },
  elapsedTimeText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 14 
  },
  elapsedProgressContainer: { 
    width: '100%', 
    paddingHorizontal: 14, 
    paddingBottom: 8 
  },
  elapsedProgressBackground: { 
    height: 3, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 2, 
    overflow: 'hidden' 
  },
  elapsedProgressFill: { 
    height: '100%', 
    borderRadius: 2 
  },
  dateNavigation: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20, 
    paddingHorizontal: 16 
  },
  dateButton: { 
    padding: 10, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 8 
  },
  disabledButton: { 
    opacity: 0.3 
  },
  dateContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  dateIcon: { 
    marginRight: 6 
  },
  dateText: { 
    fontWeight: '700', 
    color: '#fff' 
  },
  timesContainer: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    borderRadius: 14, 
    marginHorizontal: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.3)' 
  },
  tableHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12 
  },
  tableDayTitle: { 
    fontWeight: '800', 
    textAlign: 'center', 
    marginLeft: 6, 
    color: '#fff', 
    textShadowColor: 'rgba(0,0,0,0.5)', 
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 2 
  },
  timeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  timeRowBorder: { 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.3)' 
  },
  timeNameContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  prayerIcon: { 
    marginRight: 6 
  },
  timeName: { 
    fontWeight: '700', 
    flex: 1 
  },
  timeValueContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingHorizontal: 10, 
    paddingVertical: 3, 
    borderRadius: 5, 
    width: '35%', 
    justifyContent: 'flex-end' 
  },
  timeValue: { 
    fontWeight: '700' 
  },
  bottomSpacer: { 
    height: 10 
  },
  
  // МОДАЛ ЗА ГРАД
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  modalContainer: { 
    width: '100%', 
    maxHeight: '75%', 
    backgroundColor: '#1a1a1a', 
    borderRadius: 16, 
    padding: 0 
  },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.1)', 
    position: 'relative' 
  },
  modalTitle: { 
    fontWeight: '800', 
    textAlign: 'center', 
    color: '#fff', 
    marginLeft: 6 
  },
  modalCloseButton: { 
    position: 'absolute', 
    right: 16, 
    top: 16, 
    padding: 4 
  },
  autoLocationBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#38b000', 
    margin: 16, 
    marginBottom: 0, 
    padding: 12, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  autoLocationText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    marginLeft: 10, 
    fontSize: 16 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    margin: 16, 
    marginBottom: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  searchIcon: { 
    marginRight: 6 
  },
  searchPlaceholder: { 
    color: '#888', 
    fontSize: 14 
  },
  cityList: { 
    maxHeight: 350, 
    paddingHorizontal: 16 
  },
  cityItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    paddingHorizontal: 10, 
    borderRadius: 10, 
    marginBottom: 6, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  cityItemSelected: { 
    backgroundColor: '#38b000', 
    borderColor: '#38b000' 
  },
  cityItemContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  cityTextContainer: { 
    marginLeft: 10 
  },
  cityText: { 
    fontWeight: '600', 
    color: '#fff' 
  },
  cityTextSelected: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  selectedLabel: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 11, 
    marginTop: 2 
  },
  
  // НОВИ СТИЛОВЕ ЗА МОДАЛ ЗА ЕЗИК
  langModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langModalBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  langModalContainer: {
    width: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  langTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  langOptionSelected: {
    backgroundColor: 'rgba(56, 176, 0, 0.2)',
    borderColor: '#38b000',
  },
  langText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // МЕНЮ СТИЛОВЕ
  menuOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    flexDirection: 'row', 
    zIndex: 1000 
  },
  menuBackground: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)' 
  },
  sideMenu: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    height: "100%", 
    width: "75%", 
    backgroundColor: "rgba(0,0,0,0.95)", 
    paddingTop: 50, 
    paddingHorizontal: 0, 
    zIndex: 999 
  },
  menuHeader: { 
    padding: 24, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center', 
    flexDirection: 'row' 
  },
  menuTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#38b000', 
    marginLeft: 10 
  },
  menuItems: { 
    padding: 16, 
    paddingTop: 8 
  },
  menuBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 12, 
    borderRadius: 10, 
    marginBottom: 6 
  },
  menuText: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: '600', 
    marginLeft: 12 
  },
  menuFooter: { 
    padding: 16, 
    marginTop: 'auto' 
  },
  menuCloseBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 10, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  menuCloseText: { 
    fontWeight: '700', 
    color: '#ff6b6b', 
    fontSize: 14 
  }
});