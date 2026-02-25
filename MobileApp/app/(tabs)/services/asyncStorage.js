import AsyncStorage from '@react-native-async-storage/async-storage';

export default {
  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (e) {
      console.error('AsyncStorage getItem error:', e);
      return null;
    }
  },
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('AsyncStorage setItem error:', e);
    }
  }
};
