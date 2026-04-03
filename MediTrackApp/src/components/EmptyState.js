import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export default function EmptyState({ 
  icon = 'document-text-outline', 
  title = 'Veri Bulunamadı', 
  message = 'Şu anda gösterilecek herhangi bir kayıt yok.',
  style
}) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={48} color={Colors.outlineVariant} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    flex: 1,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
