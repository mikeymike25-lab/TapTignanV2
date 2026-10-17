import React, { useEffect } from 'react';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavState?.key) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, rootNavState?.key, router]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pay" options={{ headerShown: false }} />
        <Stack.Screen name="report" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
