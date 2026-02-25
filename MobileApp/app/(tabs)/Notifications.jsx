import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  Linking
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Entypo, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import { scheduleNotifications } from '../../utils/notificationScheduler';
import translationsData from '../../assets/translations.json';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size) => Math.round(size * SCREEN_WIDTH / 375);


const ORDER = ["Зора", "Изгрев", "Обяд", "Следобяд", "Залез", "Нощ"];

// Настройки на нотификациите за Expo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const PrayerRow = React.memo(({ prayerKey, settings, onToggle, onTimeChange, language }) => {
  const isEnabled = settings?.enabled || false;
  const [localMinutes, setLocalMinutes] = useState(settings?.minutesBefore ?? 5);

  // Локална функция за превод (специфична за този компонент)
  const t_local = (key) => {
    if (translationsData[language] && translationsData[language][key]) {
      return translationsData[language][key];
    }
    // Fallback за специфични вложени ключове, ако JSON структурата е различна
    if (translationsData[language]?.notificationsScreen?.[key]) {
       return translationsData[language].notificationsScreen[key];
    }
    return key;
  };
  const getDisplayPrayerName = (prayerKey, dateObj, language) => {
    const prayer = translationsData[language]?.prayers?.[prayerKey];
  
    if (Array.isArray(prayer)) {
      // [0] = нормално, [1] = петък
      if (prayerKey === "Обяд" && dateObj?.getDay() === 5) {
        return prayer[1]; // Джума
      }
      return prayer[0]; // Обедна
    }
  
    return prayer || prayerKey;
  };
  const today = new Date();

  const prayerLabel = getDisplayPrayerName(
    prayerKey,
    today,
    language
  );

  useEffect(() => {
    setLocalMinutes(settings?.minutesBefore ?? 5);
  }, [settings?.minutesBefore]);

  const handleSliderChange = (val) => setLocalMinutes(Math.round(val));
  
  const handleSliderComplete = (val) => {
    const rounded = Math.round(val);
    onTimeChange(prayerKey, rounded);
  };

  const increment = () => {
    if (localMinutes < 60) {
      const newVal = localMinutes + 1;
      setLocalMinutes(newVal);
      onTimeChange(prayerKey, newVal);
    }
  };

  const decrement = () => {
    if (localMinutes > 0) {
      const newVal = localMinutes - 1;
      setLocalMinutes(newVal);
      onTimeChange(prayerKey, newVal);
    }
  };


  return (
    <View style={styles.prayerCard}>
      <View style={styles.prayerHeader}>
        <View style={styles.prayerInfo}>
        <Text style={styles.prayerName}>{prayerLabel}</Text>
          <Text style={[styles.prayerStatus, { color: isEnabled ? '#38b000' : '#888' }]}>
            {isEnabled 
              ? t_local('enabledStatus') || "Включено"
              : t_local('disabledStatus') || "Изключено"}
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={(val) => onToggle(prayerKey, val)}
          trackColor={{ false: '#767577', true: '#38b000' }}
          thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        />
      </View>

      {isEnabled && (
        <View style={styles.timeSelector}>
          <Text style={styles.timeLabel}>
            {localMinutes} {t_local('minutesBefore') || "мин. преди молитва"}
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.minusButton, localMinutes <= 0 && styles.buttonDisabled]}
              onPress={decrement}
              disabled={localMinutes <= 0}
            >
              <MaterialIcons name="remove" size={16} color="#fff" />
            </TouchableOpacity>

            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={60}
                step={1}
                value={localMinutes}
                onValueChange={handleSliderChange}
                onSlidingComplete={handleSliderComplete}
                minimumTrackTintColor="#38b000"
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor="#38b000"
              />
            </View>

            <TouchableOpacity
              style={[styles.plusButton, localMinutes >= 60 && styles.buttonDisabled]}
              onPress={increment}
              disabled={localMinutes >= 60}
            >
              <MaterialIcons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

// --- ГЛАВЕН КОМПОНЕНТ ---
export default function NotificationsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prayerSettings, setPrayerSettings] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState('bg');

  const debounceTimerRef = useRef(null);

  // Зареждане на езика (Точно както в Info екрана)
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("appLanguage");
        if (savedLanguage) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.log("Error loading language:", error);
      }
    };
    loadInitialData(); // Load logic data
    loadLanguage();    // Load language data
  }, []);

  // Функция за превод (Точно както в Info екрана)
  const t = (key) => {
    // 1. Проверка в основния корен на JSON (за менюто и общи текстове)
    if (translationsData[language] && translationsData[language][key]) {
      return translationsData[language][key];
    }
    // 2. Fallback: Проверка дали не е специфичен ключ за notificationsScreen (за съвместимост със стария JSON)
    if (translationsData[language]?.notificationsScreen?.[key]) {
       return translationsData[language].notificationsScreen[key];
    }
    return key;
  };

  const loadInitialData = async () => {
    await loadNotificationSettings();
    await setupNotifications();
  };

  const setupNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('prayer-times', {
          name: 'Prayer Times Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }
    } catch (error) {
      console.log('Error setting up notifications:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('notificationsEnabled');
      const settings = await AsyncStorage.getItem('prayerSettings');
      setNotificationsEnabled(enabled === 'true');

      if (settings) {
        setPrayerSettings(JSON.parse(settings));
      } else {
        const defaultSettings = {};
        ORDER.forEach(prayer => {
          defaultSettings[prayer] = { enabled: false, minutesBefore: 5 };
        });
        setPrayerSettings(defaultSettings);
        await AsyncStorage.setItem('prayerSettings', JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const scheduleNotificationsDebounced = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      console.log("⏳ Записване и планиране на известия...");
      await scheduleNotifications();
      debounceTimerRef.current = null;
    }, 1500);
  }, []);

  const toggleNotifications = async (value) => {
    await AsyncStorage.setItem('notificationsEnabled', value.toString());
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionsRequired') || 'Разрешенията за известия са необходими');
        setNotificationsEnabled(false);
        return;
      }
    }
    setNotificationsEnabled(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    await scheduleNotifications(); 
  };

  const updatePrayerSetting = async (prayerName, newValues) => {
    const newSettings = {
      ...prayerSettings,
      [prayerName]: { ...prayerSettings[prayerName], ...newValues }
    };
    setPrayerSettings(newSettings);
    await AsyncStorage.setItem('prayerSettings', JSON.stringify(newSettings));
    scheduleNotificationsDebounced();
  };

  const handlePrayerToggle = useCallback((prayerName, value) => {
    updatePrayerSetting(prayerName, { enabled: value });
  }, [prayerSettings]);

  const handleTimeChange = useCallback((prayerName, minutes) => {
    updatePrayerSetting(prayerName, { minutesBefore: minutes });
  }, [prayerSettings]);

  const sendTestNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('testNotificationTitle') || '✅ Тест на известията',
          body: t('testNotificationBody') || 'Известията работят правилно! Бисмиллях.',
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.log('Error sending test notification', error);
      Alert.alert("Error", "Could not send test notification.");
    }
  };

  const openBatteryOptimizationSettings = async () => {
    if (Platform.OS !== 'android') return;
    Alert.alert(
      t('batteryInstructionsTitle') || "Инструкции за Android",
      t('batteryInstructions') || "За да работят известията точно:\n1. Намерете приложението в списъка.\n2. Изберете 'Не ограничавай' (No restrictions) или изключете оптимизацията за батерията.",
      [
        { text: t('cancel') || "Отказ", style: "cancel" },
        { 
          text: t('openSettings') || "Отвори настройки", 
          onPress: async () => {
            try {
              await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            } catch (e) {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  };

  return (
    <ImageBackground source={require('../../assets/mosque.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={() => setMenuOpen(true)}>
            <Entypo name="menu" size={scale(28)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { fontSize: scale(28) }]}>
              {t('notifications') || "Известия"}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* GLOBAL SWITCH */}
        <View style={styles.globalSwitchContainer}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.globalSwitchText}>
              {t('allNotifications') || "Всички известия"}
            </Text>
            <Text style={[styles.globalSwitchSubtext, { color: notificationsEnabled ? '#38b000' : '#888' }]}>
              {notificationsEnabled 
                ? t('enabled') || "Включени"
                : t('disabled') || "Изключени"}
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: '#38b000' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        </View>

        {/* BATTERY WARNING (ANDROID) */}
        {notificationsEnabled && Platform.OS === 'android' && (
          <View style={styles.batteryWarningContainer}>
             <View style={styles.batteryWarningContent}>
                <View style={styles.batteryTitleRow}>
                  <FontAwesome5 name="battery-full" size={14} color="#FFD700" />
                  <Text style={styles.batteryWarningTitle}>
                    {t('accuracyAndroid') || "Точност (Android)"}
                  </Text>
                </View>
                <Text style={styles.batteryWarningText}>
                  {t('batteryOptimization') || "Разрешете работа на заден план за точни времена."}
                </Text>
             </View>
             <TouchableOpacity 
                style={styles.batteryFixButton} 
                onPress={openBatteryOptimizationSettings}
             >
                <Text style={styles.batteryFixButtonText}>
                  {t('fixBattery') || "Оправи"}
                </Text>
             </TouchableOpacity>
          </View>
        )}

        {/* PRAYER SETTINGS LIST */}
        {notificationsEnabled && (
          <>
            <Text style={styles.sectionTitle}>
              {t('prayerSettings') || "Настройки за молитви"}
            </Text>

            <View style={styles.prayersListContainer}>
              {ORDER.map((prayerName) => (
                <PrayerRow
                  key={prayerName}
                  prayerKey={prayerName}
                  settings={prayerSettings[prayerName]}
                  onToggle={handlePrayerToggle}
                  onTimeChange={handleTimeChange}
                  language={language}
                />
              ))}
            </View>

            {/* TEST BUTTON */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={sendTestNotification}
            >
              <MaterialIcons name="notifications" size={20} color="#fff" />
              <Text style={styles.testButtonText}>
                {t('testNotification') || "Тестово известие"}
              </Text>
            </TouchableOpacity>

            {/* INFO BOX */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>
                {t('infoTitle') || "Информация"}
              </Text>
              <Text style={styles.infoText}>
                {t('infoText') || "• Ако изберете минути (напр. 10): получавате 2 известия.\n• Ако изберете 0 минути: получавате само 1 известие."}
              </Text>
            </View>
          </>
        )}

        {/* DISABLED STATE */}
        {!notificationsEnabled && (
          <View style={styles.disabledState}>
            <MaterialIcons name="notifications-off" size={40} color="#888" />
            <Text style={styles.disabledText}>
              {t('notificationsDisabled') || "Активирайте известията, за да настройвате напомняния."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* SIDE MENU (Вградено точно както в Info примера) */}
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackground} activeOpacity={1} onPress={() => setMenuOpen(false)} />
          <View style={styles.sideMenu}>
            <View style={styles.menuHeader}>
              <MaterialIcons name="mosque" size={28} color="#38b000" />
              <Text style={styles.menuTitle}>{t('menuTitle') || "Меню"}</Text>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/'); }}>
                <MaterialIcons name="schedule" size={20} color="#fff" />
                <Text style={styles.menuText}>{t('prayerTimes') || "Времена"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/Notifications'); }}>
                <MaterialIcons name="notifications" size={20} color="#fff" />
                <Text style={styles.menuText}>{t('notifications') || "Известия"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/Info'); }}>
                <MaterialIcons name="info" size={20} color="#fff" />
                <Text style={styles.menuText}>{t('information') || "Информация"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/About'); }}>
                <MaterialIcons name="people" size={20} color="#fff" />
                <Text style={styles.menuText}>{t('aboutUs') || "За нас"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuFooter}>
              <TouchableOpacity style={styles.menuCloseBtn} onPress={() => setMenuOpen(false)}>
                <Text style={styles.menuCloseText}>{t('close') || "Затвори"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  container: { flex: 1, backgroundColor: 'transparent' },
  contentContainer: { paddingBottom: 70 },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
    marginTop: 20
  },
  navButton: { padding: 6 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: {
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center'
  },
  placeholder: { width: scale(28) },
  
  // Global Switch
  globalSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 16
  },
  switchTextContainer: { flex: 1 },
  globalSwitchText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  globalSwitchSubtext: {
    fontSize: 12,
  },

  // Battery Warning
  batteryWarningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8
  },
  batteryWarningContent: { flex: 1, paddingRight: 8 },
  batteryTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  batteryWarningTitle: { color: '#FFD700', fontWeight: '700', fontSize: 13 },
  batteryWarningText: { color: '#eee', fontSize: 11, lineHeight: 14 },
  batteryFixButton: { backgroundColor: '#FFD700', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  batteryFixButtonText: { color: '#000', fontWeight: 'bold', fontSize: 12 },

  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#38b000',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 5
  },
  prayersListContainer: {
    marginHorizontal: 16,
  },

  prayerCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  prayerInfo: { flex: 1 },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 0
  },
  prayerStatus: {
    fontSize: 12,
    marginTop: 2
  },

  timeSelector: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)'
  },
  timeLabel: {
    fontSize: 12,
    color: '#ddd',
    marginBottom: 6,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  minusButton: {
    backgroundColor: '#ff5252',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  plusButton: {
    backgroundColor: '#38b000',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  buttonDisabled: { opacity: 0.3 },
  
  sliderContainer: {
    flex: 1,
    marginHorizontal: 8,
    height: 30,
    justifyContent: 'center'
  },
  slider: {
    width: '100%',
    height: 30,
  },

  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 176, 0, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#38b000',
    gap: 8
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  infoBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    marginBottom: 4
  },
  infoText: {
    fontSize: 12,
    color: '#bbb',
    lineHeight: 16
  },
  disabledState: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 16,
    alignItems: 'center',
    marginTop: 20
  },
  disabledText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10
  },

  menuOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', flexDirection: 'row', zIndex: 1000 },
  menuBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sideMenu: { position: 'absolute', top: 0, left: 0, height: '100%', width: '75%', backgroundColor: 'rgba(0,0,0,0.95)', paddingTop: 50, paddingHorizontal: 0, zIndex: 999 },
  menuHeader: { padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', alignItems: 'center', flexDirection: 'row' },
  menuTitle: { fontSize: 18, fontWeight: '800', color: '#38b000', marginLeft: 10 },
  menuItems: { padding: 16, paddingTop: 8 },
  menuBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 6 },
  menuText: { fontSize: 16, color: '#fff', fontWeight: '600', marginLeft: 12 },
  menuFooter: { padding: 16, marginTop: 'auto' },
  menuCloseBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  menuCloseText: { fontWeight: '700', color: '#ff6b6b', fontSize: 14 }
});