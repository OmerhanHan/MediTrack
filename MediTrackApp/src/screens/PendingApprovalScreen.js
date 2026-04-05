import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';

export default function PendingApprovalScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const refreshAccountProfile = useAuthStore((s) => s.refreshAccountProfile);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAccountProfile();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.layerLow}>
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Ionicons name="medical" size={22} color={Colors.onPrimary} />
          </View>
          <Text style={styles.brand}>MediTrack</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="hourglass-outline" size={40} color={Colors.tertiary} />
          </View>
          <Text style={styles.title}>Hesap onayı bekleniyor</Text>
          <Text style={styles.body}>
            Kaydınız yönetici incelemesine alındı. Onaylandığında uygulamaya tam erişim
            kazanırsınız. Bu süreçte hasta ve randevu işlemleri kapalıdır.
          </Text>
          {user?.sicil ? (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Sicil numaranız</Text>
              <Text style={styles.metaValue}>{user.sicil}</Text>
            </View>
          ) : null}
          <Text style={styles.emailHint}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.9}
          style={styles.refreshWrap}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            {refreshing ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color={Colors.onPrimary} />
                <Text style={styles.primaryBtnText}>Durumu yenile</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.ghostBtnText}>Çıkış yap</Text>
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
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 22, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 4,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
    marginBottom: 20,
  },
  metaBlock: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  metaLabel: { fontSize: 12, fontWeight: '600', color: Colors.slate500, marginBottom: 4 },
  metaValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  emailHint: { fontSize: 13, color: Colors.slate400 },
  refreshWrap: { marginBottom: 16 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: Colors.onPrimary },
  ghostBtn: { alignItems: 'center', paddingVertical: 14 },
  ghostBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
