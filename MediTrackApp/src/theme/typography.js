import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = {
  headlineXL: {
    fontFamily,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headlineLarge: {
    fontFamily,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headlineMedium: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  titleLarge: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  titleMedium: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  titleSmall: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
  },
  labelLarge: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelMedium: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};
