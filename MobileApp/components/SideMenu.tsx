import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size: number) => Math.round(size * SCREEN_WIDTH / 375);

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  currentScreen?: string;
}

const menuItems = [
  { key: 'home', label: 'Времена за намаз', icon: 'schedule', route: '/' },
  { key: 'notifications', label: 'Известия', icon: 'notifications', route: '/Notifications' },
  { key: 'info', label: 'Информация', icon: 'info', route: '/Info' },
  { key: 'about', label: 'За нас', icon: 'people', route: '/About' },
];

export default function SideMenu({ isVisible, onClose, currentScreen }: SideMenuProps) {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    onClose();
    if (route !== currentScreen) {
      router.push(route as any);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.menuOverlay}>
      <TouchableOpacity
        style={styles.menuBackground}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sideMenu}>
        <View style={styles.menuHeader}>
          <MaterialIcons name="mosque" size={28} color="#38b000" />
          <Text style={styles.menuTitle}>Времена за Намаз</Text>
        </View>

        <View style={styles.menuItems}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuBtn}
              onPress={() => handleNavigation(item.route)}
            >
              <MaterialIcons name={item.icon as any} size={20} color="#fff" />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuFooter}>
          <TouchableOpacity style={styles.menuCloseBtn} onPress={onClose}>
            <Text style={styles.menuCloseText}>Затвори</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(0,0,0,0.55)'
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