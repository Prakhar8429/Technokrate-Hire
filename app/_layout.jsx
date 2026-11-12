import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from '../components/ErrorBoundary';

// Crash prevention: intercept unhandled JS errors in production so the app does not terminate abruptly
if (typeof global !== 'undefined' && global.ErrorUtils) {
  const previousHandler = global.ErrorUtils.getGlobalHandler && global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.warn('[CrashPrevention] Intercepted runtime error:', error?.message || error);
    if (__DEV__ && previousHandler) {
      previousHandler(error, isFatal);
    }
  });
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="jobs" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="plans" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="applied-jobs" />
        <Stack.Screen name="saved-jobs" />
        <Stack.Screen name="application-status" />
        <Stack.Screen name="hr-updates" />
        <Stack.Screen name="employer" />
      </Stack>
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}