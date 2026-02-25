import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground
} from 'react-native';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Импортираме JSON файла с преводите
import translationsData from '../../assets/translations.json';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size) => Math.round(size * SCREEN_WIDTH / 375);

export default function Info() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState('bg'); // Език по подразбиране

  // Зареждане на езика
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
    loadLanguage();
  }, []);

  // Функция за превод
  const t = (key) => {
    if (translationsData[language] && translationsData[language][key]) {
      return translationsData[language][key];
    }
    return key;
  };

  return (
    <ImageBackground source={require('../../assets/mosque.jpg')} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={() => setMenuOpen(true)}>
            <Entypo name="menu" size={scale(28)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { fontSize: scale(28) }]}>{t('information')}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.scrollContent}>
          <Text style={styles.sectionTitle}>{t('aboutAppTitle')}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {t('welcomeMessage')}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{t('keyFeaturesTitle')}</Text>
            <Text style={styles.featureItem}>{t('featureAccurateTimes')}</Text>
            <Text style={styles.featureItem}>{t('featureVisualization')}</Text>
            <Text style={styles.featureItem}>{t('featureCities')}</Text>
            <Text style={styles.featureItem}>{t('featureAutoLocation')}</Text>
            <Text style={styles.featureItem}>{t('featureCountdown')}</Text>
            <Text style={styles.featureItem}>{t('featureElapsedTime')}</Text>
            <Text style={styles.featureItem}>{t('featureVoiceReading')}</Text>
            <Text style={styles.featureItem}>{t('featureLanguages')}</Text>
            <Text style={styles.featureItem}>{t('featureNotifications')}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{t('calculationMethodTitle')}</Text>
            <Text style={styles.infoText}>
              {t('calculationMethodText')}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>{t('dataAccuracyTitle')}</Text>
            <Text style={styles.infoText}>
              {t('dataAccuracyText')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* SIDE MENU */}
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackground} activeOpacity={1} onPress={() => setMenuOpen(false)} />
          <View style={styles.sideMenu}>
            <View style={styles.menuHeader}>
              <MaterialIcons name="mosque" size={28} color="#38b000" />
              <Text style={styles.menuTitle}>{t('menuTitle')}</Text>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/'); }}>
                <MaterialIcons name="schedule" size={20} color="#fff" />
                <Text style={styles.menuText}>{t('prayerTimes')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/Notifications'); }}>
                <MaterialIcons name="notifications" size={20} color="#fff" />
                <Text style={styles.menuText}>{t('notifications')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/Info'); }}>
                <MaterialIcons name="info" size={20} color="#fff" />
                <Text style={styles.menuText}>{t('information')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuBtn} onPress={() => { setMenuOpen(false); router.push('/About'); }}>
                <MaterialIcons name="people" size={20} color="#fff" />
                <Text style={styles.menuText}>{t('aboutUs')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuFooter}>
              <TouchableOpacity style={styles.menuCloseBtn} onPress={() => setMenuOpen(false)}>
                <Text style={styles.menuCloseText}>{t('close')}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 18, marginTop: 20 },
  navButton: { padding: 6 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontWeight: '700', color: '#fff', textAlign: 'center' },
  placeholder: { width: scale(28) },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#38b000', marginBottom: 20, textAlign: 'center' },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#38b000' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#38b000', marginBottom: 8 },
  infoText: { fontSize: 16, color: '#fff', lineHeight: 22 },
  featureItem: { fontSize: 16, color: '#fff', marginBottom: 4, lineHeight: 22 },
  // Side Menu
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