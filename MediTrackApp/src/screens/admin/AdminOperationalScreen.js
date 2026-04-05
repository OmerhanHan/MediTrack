import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { fetchAdminAnalytics } from '../../services/adminRepository';

export default function AdminOperationalScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAnalytics();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.blue700} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Operasyonel mükemmellik</Text>
        <View style={styles.topRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Klinik operasyonlarında verimlilik ve kalite göstergeleri. Veriler canlı veritabanı özetine dayanır.
        </Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : stats ? (
          <>
            <LinearGradient
              colors={[Colors.primaryFixed, Colors.surface]}
              style={styles.kpi}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.kpiLabel}>Randevu / hasta oranı (özet)</Text>
              <Text style={styles.kpiValue}>
                {stats.appointmentTotal} / {stats.patientTotal}
              </Text>
              <Text style={styles.kpiHint}>
                Aktif randevu yoğunluğu: %{stats.activeRate.toFixed(1)}
              </Text>
            </LinearGradient>

            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Ionicons name="pulse-outline" size={22} color={Colors.primary} />
                <Text style={styles.cardTitle}>Kalite göstergeleri</Text>
              </View>
              <Text style={styles.bullet}>• Hasta kayıt artışı (30 gün): %{stats.growthPercent}</Text>
              <Text style={styles.bullet}>• Haftalık zirve gün: {stats.peakDay.label} ({stats.peakDay.count} kayıt)</Text>
              <Text style={styles.bullet}>• Personel sayısı (doktor/personel): {stats.doctorTotal}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Ionicons name="analytics-outline" size={22} color={Colors.primary} />
                <Text style={styles.cardTitle}>İyileştirme önerileri</Text>
              </View>
              <Text style={styles.para}>
                Düşük trafikli günlerde kapasiteyi dengelemek için randevu aralıklarını gözden geçirin.
                Ünvan dağılımı “Diğer” grubunda yoğunlaşıyorsa ünvan alanlarını standartlaştırın.
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.fallback}>Özet yüklenemedi.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  backBtn: { padding: 8 },
  topTitle: { fontSize: 17, fontWeight: '700', color: Colors.onSurface, flex: 1, textAlign: 'center' },
  topRight: { width: 40 },
  scroll: { padding: 20, paddingBottom: 48 },
  lead: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 21, marginBottom: 20 },
  center: { padding: 32, alignItems: 'center' },
  kpi: { borderRadius: 18, padding: 20, marginBottom: 16 },
  kpiLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSecondaryContainer },
  kpiValue: { fontSize: 32, fontWeight: '800', color: Colors.primary, marginTop: 8 },
  kpiHint: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 8 },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  bullet: { fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 8, lineHeight: 20 },
  para: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 22 },
  fallback: { textAlign: 'center', color: Colors.slate500 },
});
