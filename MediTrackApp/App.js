import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { Colors } from './src/theme/colors';

function SplashLoading() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

export default function App() {
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) {
    return <SplashLoading />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
});
