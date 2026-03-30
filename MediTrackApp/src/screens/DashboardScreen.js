import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import AppHeader from '../components/AppHeader';

const APPOINTMENTS = [
  {
    id: '1', time: '09:30', name: 'Ahmet Yılmaz', phone: '0532 123 45 67', date: '2026-03-30', status: 'completed', type: 'Tamamlandı',
  },
  {
    id: '2', time: '10:45', name: 'Elif Demir', phone: '0541 222 11 33', date: '2026-03-30', status: 'next', type: 'Kronik Takip',
  },
  {
    id: '3', time: '11:30', name: 'Caner Özcan', phone: '0555 888 90 12', date: '2026-03-30', status: 'upcoming', type: 'Laboratuvar',
  },
  {
    id: '4', time: '13:15', name: 'Zeynep Ak', phone: '0533 444 22 10', date: '2026-03-30', status: 'upcoming', type: 'İlk Muayene',
  },
];

export default function DashboardScreen({ navigation, route }) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (route?.params?.showSuccess) {
      setShowSuccessToast(true);
      navigation.setParams({ showSuccess: false });
    }
  }, [route?.params?.showSuccess, navigation]);

  useEffect(() => {
    if (!showSuccessToast) {
      return undefined;
    }

    const timer = setTimeout(() => setShowSuccessToast(false), 2600);
    return () => clearTimeout(timer);
  }, [showSuccessToast]);

  const openDetailModal = (item) => {
    setSelectedAppointment(item);
    setShowDetailModal(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.greeting}>Hoş Geldiniz, Dr. Aras</Text>
          <Text style={styles.heroTitle}>
            Bugün <Text style={styles.heroHighlight}>12 Randevunuz</Text> Var.
          </Text>
          <TouchableOpacity
            style={styles.addPatientBtn}
            onPress={() => navigation.navigate('AppointmentEntry', { sourceScreen: 'DashboardMain' })}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addPatientGradient}
            >
              <Ionicons name="person-add" size={18} color={Colors.onPrimary} />
              <Text style={styles.addPatientText}>Hızlı Hasta Ekle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Appointments Section */}
        <View style={styles.appointmentsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Randevular</Text>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="filter" size={20} color={Colors.onSurface} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={APPOINTMENTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.appointmentsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.appointmentCard,
                item.status === 'next' && styles.appointmentCardNext,
                item.status === 'completed' && styles.appointmentCardCompleted,
              ]}>
                {item.status === 'next' && (
                  <View style={styles.nextBadge}>
                    <Text style={styles.nextBadgeText}>SIRADAKİ</Text>
                  </View>
                )}
                <View style={styles.appointmentTop}>
                  <View style={[
                    styles.timeCircle,
                    item.status === 'next' && styles.timeCircleNext,
                    item.status === 'completed' && styles.timeCircleCompleted,
                  ]}>
                    <Text style={[
                      styles.timeText,
                      (item.status === 'next' || item.status === 'completed') && styles.timeTextWhite,
                    ]}>{item.time}</Text>
                  </View>
                  <View>
                    <Text style={styles.patientName}>{item.name}</Text>
                    <Text style={[
                      styles.appointmentType,
                      item.status === 'completed' && styles.appointmentTypeCompleted,
                    ]}>{item.type}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.detailBtn,
                    item.status === 'next' && styles.detailBtnNext,
                  ]}
                  onPress={() => openDetailModal(item)}
                >
                  <Text style={styles.detailBtnText}>Detay</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity 
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Text style={styles.viewAllText}>Tüm Randevuları Görüntüle (12)</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>GÜNÜN ÖZETİ</Text>
            <Ionicons name="analytics" size={22} color={Colors.primary} />
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Tamamlanan</Text>
            <Text style={styles.summaryRowValue}>4 / 12</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statCardLabel}>Yeni Hasta</Text>
              <Text style={styles.statCardValue}>3</Text>
            </View>
            <View style={[styles.statCard, styles.statCardWarning]}>
              <Text style={[styles.statCardLabel, styles.statCardLabelWarning]}>Bekleyen</Text>
              <Text style={[styles.statCardValue, styles.statCardValueWarning]}>8</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {showSuccessToast && (
        <View style={styles.successToast}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.onPrimary} />
          <Text style={styles.successToastText}>Randevu başarıyla oluşturuldu</Text>
        </View>
      )}

      <Modal visible={showDetailModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.detailModalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailModal(false)}
        >
          <View style={styles.detailModalContent}>
            <Text style={styles.detailModalTitle}>Randevu Detayı</Text>
            <View style={styles.detailModalCard}>
              <View style={styles.detailModalRow}>
                <Text style={styles.detailModalLabel}>Hasta:</Text>
                <Text style={styles.detailModalValue}>{selectedAppointment?.name || '-'}</Text>
              </View>
              <View style={styles.detailModalRow}>
                <Text style={styles.detailModalLabel}>Telefon:</Text>
                <Text style={styles.detailModalValue}>{selectedAppointment?.phone || '-'}</Text>
              </View>
              <View style={styles.detailModalRow}>
                <Text style={styles.detailModalLabel}>Tarih & Saat:</Text>
                <Text style={styles.detailModalValue}>
                  {(selectedAppointment?.date || '-')} / {(selectedAppointment?.time || '-')}
                </Text>
              </View>
              <View style={styles.detailModalNotes}>
                <Text style={styles.detailModalLabel}>Notlar:</Text>
                <Text style={styles.detailModalNoteValue}>{selectedAppointment?.type || '-'}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { paddingBottom: 100, paddingHorizontal: 20 },
  heroSection: { marginTop: 12, marginBottom: 24 },
  greeting: {
    fontSize: 14, fontWeight: '500', color: Colors.onSurfaceVariant,
    opacity: 0.7, marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32, fontWeight: '800', color: Colors.onSurface,
    letterSpacing: -1, lineHeight: 38, marginBottom: 20,
  },
  heroHighlight: { color: Colors.primary },
  addPatientBtn: { borderRadius: 14, overflow: 'hidden', alignSelf: 'flex-start' },
  addPatientGradient: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 14,
  },
  addPatientText: { color: Colors.onPrimary, fontWeight: '600', fontSize: 14 },
  // Appointments
  appointmentsCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 212, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceContainer,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  filterBtn: { padding: 8, borderRadius: 10 },
  appointmentsList: { paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  appointmentCard: {
    width: 220,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  appointmentCardNext: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: 'rgba(121, 48, 0, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  appointmentCardCompleted: { opacity: 0.7 },
  nextBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: Colors.tertiaryFixed,
    paddingHorizontal: 8, paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  nextBadgeText: {
    fontSize: 8, fontWeight: '900', color: Colors.onTertiaryFixed,
    letterSpacing: 0.5,
  },
  appointmentTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  timeCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surfaceContainerLowest,
  },
  timeCircleNext: { backgroundColor: Colors.tertiary },
  timeCircleCompleted: { backgroundColor: Colors.primary },
  timeText: { fontSize: 9, fontWeight: '700', color: Colors.onSurfaceVariant },
  timeTextWhite: { color: Colors.onPrimary },
  patientName: { fontSize: 13, fontWeight: '700', color: Colors.onSurface },
  appointmentType: { fontSize: 10, fontWeight: '500', color: Colors.onSurfaceVariant, textTransform: 'uppercase' },
  appointmentTypeCompleted: { color: Colors.primary, fontWeight: '700' },
  detailBtn: {
    width: '100%', paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: 'rgba(194, 198, 212, 0.2)',
    alignItems: 'center',
  },
  detailBtnNext: { backgroundColor: Colors.surfaceContainerLow, borderWidth: 0 },
  detailBtnText: { fontSize: 11, fontWeight: '700', color: Colors.onSurfaceVariant },
  viewAllBtn: {
    paddingVertical: 16, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.surfaceContainer,
  },
  viewAllText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  // Summary
  summaryCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 212, 0.1)',
  },
  summaryHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.onSurfaceVariant,
    letterSpacing: 2, opacity: 0.6,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  summaryRowLabel: { fontSize: 14, color: Colors.onSurfaceVariant },
  summaryRowValue: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  progressBg: {
    width: '100%', height: 8, borderRadius: 4,
    backgroundColor: Colors.surfaceContainerLow,
    overflow: 'hidden', marginBottom: 20,
  },
  progressFill: {
    height: '100%', borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12, padding: 16,
  },
  statCardWarning: { backgroundColor: Colors.tertiaryFixed },
  statCardLabel: { fontSize: 11, color: Colors.onSurfaceVariant, marginBottom: 4 },
  statCardLabelWarning: { color: Colors.onTertiaryFixedVariant },
  statCardValue: { fontSize: 22, fontWeight: '700', color: Colors.onSurface },
  statCardValueWarning: { color: Colors.onTertiaryFixed },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  detailModalContent: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
  },
  detailModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 12,
  },
  detailModalCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
  },
  detailModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194, 198, 212, 0.2)',
  },
  detailModalLabel: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  detailModalValue: { fontSize: 13, color: Colors.onSurface, fontWeight: '700' },
  detailModalNotes: { paddingTop: 8 },
  detailModalNoteValue: {
    fontSize: 13,
    color: Colors.onSurface,
    fontWeight: '700',
    marginTop: 4,
    fontStyle: 'italic',
  },
  successToast: {
    position: 'absolute',
    top: 92,
    left: 16,
    right: 16,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  successToastText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
