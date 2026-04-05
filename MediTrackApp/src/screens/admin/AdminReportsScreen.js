import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import { fetchAdminAnalytics } from '../../services/adminRepository';

export default function AdminReportsScreen({ navigation }) {
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

  const exportCsv = () => {
    Alert.alert(
      'Dışa aktarma',
      'Özet: Hasta ' + (stats?.patientTotal ?? '—') + ', Randevu ' + (stats?.appointmentTotal ?? '—') + '. Tam CSV/PDF entegrasyonu sonraki sürümde.',
    );
  };

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
        <Text style={styles.topTitle}>Raporlar</Text>
        <View style={styles.topRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Klinik özet raporu ve dışa aktarma. Sayılar canlı veritabanından okunur.
        </Text>

        {loading ? (
          <ActivityIndicator style={{ marginVertical: 24 }} color={Colors.primary} />
        ) : stats ? (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Anlık özet</Text>
            <Text style={styles.summaryLine}>Toplam hasta kaydı: {stats.patientTotal}</Text>
            <Text style={styles.summaryLine}>Toplam randevu: {stats.appointmentTotal}</Text>
            <Text style={styles.summaryLine}>Personel (doktor/personel): {stats.doctorTotal}</Text>
            <Text style={styles.summaryLine}>30 günlük kayıt artışı: %{stats.growthPercent}</Text>
          </View>
        ) : (
          <Text style={styles.fallback}>Özet alınamadı.</Text>
        )}

        <TouchableOpacity onPress={exportCsv} activeOpacity={0.9} style={styles.exportWrap}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryContainer]}
            style={styles.exportBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="download-outline" size={22} color={Colors.onPrimary} />
            <Text style={styles.exportBtnText}>Özeti dışa aktar (önizleme)</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.note}>
          Tam Excel/PDF çıktısı için şablon ve dosya oluşturma adımı eklenebilir; ham veri için
          Supabase panelinden tablo dışa aktarımı da kullanılabilir.
        </Text>
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
  topTitle: { fontSize: 17, fontWeight: '700', color: Colors.onSurface },
  topRight: { width: 40 },
  scroll: { padding: 20, paddingBottom: 40 },
  lead: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 21, marginBottom: 16 },
  summary: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginBottom: 10 },
  summaryLine: { fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 6 },
  fallback: { textAlign: 'center', color: Colors.slate500, marginBottom: 16 },
  exportWrap: { marginBottom: 16 },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  exportBtnText: { fontSize: 15, fontWeight: '700', color: Colors.onPrimary },
  note: { fontSize: 12, color: Colors.slate500, lineHeight: 18 },
});
