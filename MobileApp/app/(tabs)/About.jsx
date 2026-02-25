import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  ImageBackground
} from 'react-native';
import { Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Импортираме JSON файла с преводите
import translationsData from '../../assets/translations.json';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size) => Math.round(size * SCREEN_WIDTH / 375);

export default function About() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState('bg'); // Език по подразбиране

  // Зареждане на езика при стартиране на екрана
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

  // Функция за взимане на превод по ключ
  const t = (key) => {
    if (translationsData[language] && translationsData[language][key]) {
      return translationsData[language][key];
    }
    return key; // Връща ключа, ако няма намерен превод
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  return (
    <ImageBackground
      source={require('../../assets/mosque.jpg')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.navButton} onPress={() => setMenuOpen(true)}>
            <Entypo name="menu" size={scale(28)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {/* Използваме 'aboutUs' ключа от JSON */}
            <Text style={[styles.title, { fontSize: scale(28) }]}>{t('aboutUs')}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Main About Content */}
        <View style={styles.scrollContent}>

          <View style={styles.logoContainer}>
            <FontAwesome5 name="mosque" size={scale(80)} color="#38b000" />
            <Text style={styles.appName}>{t('appName')}</Text>
            <Text style={styles.version}>{t('version')} 1.0.3</Text>
          </View>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              {t('aboutDescription')}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>{t('connectTitle')}</Text>

          {/* Social Media Links */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => openLink('https://facebook.com/yusuf.kapanak')}>
              <FontAwesome5 name="facebook" size={scale(30)} color="#1877f2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => openLink('https://instagram.com/y_kapanak')}>
              <FontAwesome5 name="instagram" size={scale(30)} color="#e4405f" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => openLink('mailto:yusuf.kapanak@pmggd.bg')}>
              <MaterialIcons name="email" size={scale(30)} color="#fff" />
              <Text style={styles.socialText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => openLink('https://discord.com/users/776490369084031076')}>
              <FontAwesome5 name="discord" size={scale(30)} color="#7289da" />
              <Text style={styles.socialText}>Discord</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>{t('contactsTitle')}</Text>
            <Text style={styles.contactText}>📧 Email: yusuf.kapanak@pmggd.bg</Text>
            <Text style={styles.contactText}>🌐 {t('websiteLabel')}:https://vremenazanamaz.free.nf/</Text>
            <Text style={styles.contactText}>📍 {t('addressLabel')}: {t('addressText')}</Text>
          </View>

          <View style={styles.teamCard}>
            <Text style={styles.teamTitle}>{t('teamTitle')}</Text>
            <Text style={styles.teamText}>
              {t('teamDescription')}
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* Side Menu */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 18,
    marginTop: 20
  },
  navButton: { padding: 6 },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontWeight: '700', color: '#fff', textAlign: 'center' },
  placeholder: { width: scale(28) },
  scrollContent: { padding: 20, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  appName: { fontSize: 28, fontWeight: '800', color: '#38b000', marginTop: 16, marginBottom: 8 },
  version: { fontSize: 16, color: '#888', fontWeight: '600' },
  aboutCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 30 },
  aboutText: { fontSize: 16, color: '#fff', lineHeight: 22, textAlign: 'center' },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#38b000', marginBottom: 20, textAlign: 'center' },
  socialContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  socialButton: { width: '48%', backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  socialText: { color: '#fff', marginTop: 8, fontWeight: '600' },
  contactCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 20 },
  contactTitle: { fontSize: 18, fontWeight: '700', color: '#38b000', marginBottom: 12 },
  contactText: { fontSize: 16, color: '#fff', marginBottom: 8 },
  teamCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12 },
  teamTitle: { fontSize: 18, fontWeight: '700', color: '#38b000', marginBottom: 12 },
  teamText: { fontSize: 16, color: '#fff', lineHeight: 22 },
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