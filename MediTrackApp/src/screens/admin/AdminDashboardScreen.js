import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../theme/colors';
import AppHeader from '../../components/AppHeader';
import { fetchAdminAnalytics } from '../../services/adminRepository';

const maxBar = (items) => Math.max(1, ...items.map((x) => x.count));

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchAdminAnalytics();
      setStats(data);
    } catch (e) {
      setError(e.message || 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onExportExcel = () => {
    Alert.alert('Excel', 'Dışa aktarma yakında eklenecek (CSV/Excel).');
  };

  const onExportPdf = () => {
    Alert.alert('PDF raporu', 'PDF oluşturma yakında eklenecek.');
  };

  const doctorSum =
    stats &&
    stats.doctorBuckets.uzman +
      stats.doctorBuckets.operator +
      stats.doctorBuckets.pratisyen +
      stats.doctorBuckets.diger;

  const barScale = stats ? maxBar(stats.weeklyFlow) : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="MediTrack" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Yönetici Paneli</Text>
        <Text style={styles.pageSubtitle}>
          Klinik operasyonlarının gerçek zamanlı verileri ve personel performans analitiği
        </Text>

        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportExcel} onPress={onExportExcel} activeOpacity={0.85}>
            <Ionicons name="document-text-outline" size={18} color={Colors.slate500} />
            <Text style={styles.exportExcelText}>Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onExportPdf} activeOpacity={0.9}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.exportPdf}
            >
              <Ionicons name="document-attach-outline" size={18} color={Colors.onPrimary} />
              <Text style={styles.exportPdfText}>PDF Raporu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {!loading && stats && (
          <TouchableOpacity
            style={styles.approvalCard}
            onPress={() => navigation.navigate('AdminPendingApprovals')}
            activeOpacity={0.88}
          >
            <View style={styles.approvalIcon}>
              <Ionicons
                name="finger-print-outline"
                size={22}
                color={stats.pendingApprovals > 0 ? Colors.tertiary : Colors.slate400}
              />
            </View>
            <View style={styles.approvalText}>
              <Text style={styles.approvalTitle}>Hesap onay kuyruğu</Text>
              <Text style={styles.approvalSub}>
                {stats.pendingApprovals > 0
                  ? `${stats.pendingApprovals} yeni başvuru inceleme bekliyor`
                  : 'Bekleyen başvuru yok'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.slate400} />
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>Özet yükleniyor…</Text>
          </View>
        )}

        {error && !loading ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={load}>
              <Text style={styles.retry}>Yeniden dene</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && stats && (
          <>
            <View style={styles.grid2}>
              <View style={styles.cardLight}>
                <View style={styles.cardLightTop}>
                  <Ionicons name="people" size={22} color={Colors.emerald} />
                  <Text style={styles.cardLightBadge}>+{stats.growthPercent}%</Text>
                </View>
                <Text style={styles.cardLightValue}>{stats.patientTotal.toLocaleString('tr-TR')}</Text>
                <Text style={styles.cardLightLabel}>Hasta ekosistemi</Text>
                <Text style={styles.cardLightHint}>Önceki 30 güne göre hasta kaydı</Text>
              </View>

              <LinearGradient
                colors={[Colors.blue700, Colors.blue800]}
                style={styles.cardDark}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.cardDarkValue}>{stats.activeRate.toFixed(1)}%</Text>
                <Text style={styles.cardDarkLabel}>Aktif hasta oranı</Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, stats.activeRate)}%` }]} />
                </View>
                <Text style={styles.cardDarkHint}>
                  Kapasite kullanımı. Tahmini boş kapasite: {stats.emptyBeds}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.cardWide}>
              <Text style={styles.cardWideTitle}>Haftalık hasta akışı</Text>
              <Text style={styles.cardWideSub}>
                Son 7 gün — en yoğun: {stats.peakDay.label} ({stats.peakDay.count})
              </Text>
              <View style={styles.barRow}>
                {stats.weeklyFlow.map((d) => (
                  <View key={d.date} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: Math.max(0, Math.round((d.count / barScale) * 100)),
                            minHeight: d.count > 0 ? 6 : 0,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{d.label}</Text>
                    <Text style={styles.barCount}>{d.count}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.cardWide}>
              <Text style={styles.cardWideTitle}>Doktor dağılımı</Text>
              <Text style={styles.cardWideSub}>Toplam {doctorSum || stats.doctorTotal} kayıt (ünvan sınıflandırması)</Text>
              <View style={styles.distRow}>
                <View style={[styles.distSeg, { flex: Math.max(1, stats.doctorBuckets.uzman) }]} />
                <View style={[styles.distSeg2, { flex: Math.max(1, stats.doctorBuckets.operator) }]} />
                <View style={[styles.distSeg3, { flex: Math.max(1, stats.doctorBuckets.pratisyen) }]} />
                <View style={[styles.distSeg4, { flex: Math.max(1, stats.doctorBuckets.diger) }]} />
              </View>
              <View style={styles.distLegend}>
                <Text style={styles.legendItem}>Uzman: {stats.doctorBuckets.uzman}</Text>
                <Text style={styles.legendItem}>Operatör: {stats.doctorBuckets.operator}</Text>
                <Text style={styles.legendItem}>Pratisyen: {stats.doctorBuckets.pratisyen}</Text>
                <Text style={styles.legendItem}>Diğer: {stats.doctorBuckets.diger}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.linkCard}
              onPress={() => navigation.navigate('AdminPersonnel')}
              activeOpacity={0.88}
            >
              <View style={styles.linkIcon}>
                <Ionicons name="briefcase-outline" size={22} color={Colors.blue700} />
              </View>
              <View style={styles.linkText}>
                <Text style={styles.linkTitle}>Personel kadrosu</Text>
                <Text style={styles.linkSub}>Tüm personel listesini, sicil numaralarını ve detayları görüntüle</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkCard}
              onPress={() => navigation.navigate('AdminOperational')}
              activeOpacity={0.88}
            >
              <View style={styles.linkIcon}>
                <Ionicons name="trending-up-outline" size={22} color={Colors.blue700} />
              </View>
              <View style={styles.linkText}>
                <Text style={styles.linkTitle}>Operasyonel mükemmellik</Text>
                <Text style={styles.linkSub}>Verimlilik ve kalite analizlerini inceleyin</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.slate400} />
            </TouchableOpacity>

            <View style={styles.moreRow}>
              <TouchableOpacity style={styles.moreBtn} onPress={() => navigation.navigate('AdminAudit')}>
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
                <Text style={styles.moreBtnText}>Denetim</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreBtn} onPress={() => navigation.navigate('AdminReports')}>
                <Ionicons name="bar-chart-outline" size={18} color={Colors.primary} />
                <Text style={styles.moreBtnText}>Raporlar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingBottom: 120, paddingHorizontal: 20 },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.onSurface,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  exportRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  exportExcel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  exportExcelText: { fontSize: 14, fontWeight: '600', color: Colors.slate500 },
  exportPdf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exportPdfText: { fontSize: 14, fontWeight: '700', color: Colors.onPrimary },
  approvalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiaryFixed,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  approvalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalText: { flex: 1 },
  approvalTitle: { fontSize: 15, fontWeight: '800', color: Colors.onSurface },
  approvalSub: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4, lineHeight: 18 },
  loadingBox: { alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 8, color: Colors.slate500, fontSize: 13 },
  errorBox: {
    padding: 16,
    backgroundColor: Colors.errorContainer,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: { color: Colors.onErrorContainer, fontSize: 14 },
  retry: { marginTop: 8, fontWeight: '700', color: Colors.primary },
  grid2: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardLight: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  cardLightTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardLightBadge: { fontSize: 12, fontWeight: '700', color: Colors.emerald },
  cardLightValue: { fontSize: 26, fontWeight: '800', color: Colors.onSurface },
  cardLightLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginTop: 4 },
  cardLightHint: { fontSize: 11, color: Colors.slate400, marginTop: 4 },
  cardDark: { flex: 1, borderRadius: 16, padding: 16 },
  cardDarkValue: { fontSize: 28, fontWeight: '800', color: Colors.onPrimary },
  cardDarkLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.onPrimary, borderRadius: 4 },
  cardDarkHint: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 10, lineHeight: 16 },
  cardWide: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  cardWideTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  cardWideSub: { fontSize: 12, color: Colors.slate500, marginTop: 4, marginBottom: 12 },
  barRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', minHeight: 120 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: 22,
    height: 100,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: Colors.blue600, borderRadius: 8 },
  barLabel: { fontSize: 10, color: Colors.slate500, marginTop: 6 },
  barCount: { fontSize: 11, fontWeight: '700', color: Colors.onSurface },
  distRow: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 8 },
  distSeg: { backgroundColor: Colors.blue600 },
  distSeg2: { backgroundColor: Colors.blue700 },
  distSeg3: { backgroundColor: Colors.emerald },
  distSeg4: { backgroundColor: Colors.slate400 },
  distLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  legendItem: { fontSize: 12, color: Colors.onSurfaceVariant },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkText: { flex: 1 },
  linkTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  linkSub: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4, lineHeight: 18 },
  moreRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 8 },
  moreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  moreBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
});
