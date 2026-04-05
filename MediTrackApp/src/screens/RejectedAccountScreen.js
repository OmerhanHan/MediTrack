import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';

export default function RejectedAccountScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.layerLow}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="close-circle-outline" size={44} color={Colors.error} />
          </View>
          <Text style={styles.title}>Hesap onaylanmadı</Text>
          <Text style={styles.body}>
            Bu hesap için başvuru reddedildi. Detay için klinik yönetimi ile iletişime geçin.
            {user?.sicil ? ` Sicil referansı: ${user.sicil}` : ''}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={logout} activeOpacity={0.88}>
          <Text style={styles.btnText}>Çıkış yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  layerLow: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 3,
  },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.onSurface, textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 24, color: Colors.onSurfaceVariant, textAlign: 'center' },
  email: { fontSize: 13, color: Colors.slate400, textAlign: 'center', marginTop: 16 },
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '700', color: Colors.onPrimary },
});
