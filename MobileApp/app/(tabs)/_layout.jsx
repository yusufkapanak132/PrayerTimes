import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { scheduleNotifications } from '../../utils/notificationScheduler';

export default function RootLayout() {
  useEffect(() => {
    scheduleNotifications();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" options={{ headerShown: false }} />
      <Stack.Screen name="Info" options={{ headerShown: false }} />
      <Stack.Screen name="About" options={{ headerShown: false }} />
    </Stack>
  );
}