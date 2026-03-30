import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import AppHeader from '../components/AppHeader';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';

export default function AppointmentEntryScreen({ navigation, route }) {
  const params = route?.params || {};

  const [name, setName] = useState(params.name || 'Ahmet Yılmaz');
  const [phone, setPhone] = useState(params.phone || '0532 123 45 67');
  const [date, setDate] = useState(params.date || '2023-11-25');
  const [time, setTime] = useState(params.time || '14:30');
  const [notes, setNotes] = useState(params.notes || 'Rutin diş kontrolü ve temizlik işlemi.');
  const [showConfirm, setShowConfirm] = useState(Boolean(params.openConfirm));

  useEffect(() => {
    if (route?.params?.openConfirm) {
      setShowConfirm(true);
    }
  }, [route?.params?.openConfirm]);

  const handleSubmit = () => setShowConfirm(true);
  const handleConfirm = () => {
    setShowConfirm(false);
    if (params.sourceScreen) {
      navigation.replace(params.sourceScreen, { showSuccess: true });
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Back button + Title */}
        <View style={styles.titleSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Randevu Girişi</Text>
            <Text style={styles.pageDesc}>
              Lütfen hastanın kişisel bilgilerini ve planlanan işlem detaylarını eksiksiz doldurun.
            </Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Patient Info */}
          <Text style={styles.sectionTitle}>Hasta Kimlik Bilgileri</Text>
          <FormInput
            label="ADI SOYADI"
            icon="person-outline"
            placeholder="Örn: Ahmet Yılmaz"
            value={name}
            onChangeText={setName}
          />
          <FormInput
            label="TELEFON NUMARASI"
            icon="call-outline"
            placeholder="05XX XXX XX XX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Appointment Details */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Randevu ve İşlem Planı</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="RANDEVU TARİHİ"
                icon="calendar-outline"
                placeholder="GG/AA/YYYY"
                value={date}
                onChangeText={setDate}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput
                label="RANDEVU SAATİ"
                icon="time-outline"
                placeholder="SS:DD"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          <FormInput
            label="İŞLEM / KLİNİK NOTLAR"
            placeholder="Yapılacak işlem detaylarını ve özel notları buraya giriniz..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          <PrimaryButton
            title="Randevu Oluştur"
            onPress={handleSubmit}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowConfirm(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Bilgileri onaylıyor musunuz?</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Hasta:</Text>
                <Text style={styles.summaryValue}>{name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Telefon:</Text>
                <Text style={styles.summaryValue}>{phone}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tarih & Saat:</Text>
                <Text style={styles.summaryValue}>{date} / {time}</Text>
              </View>
              <View style={{ paddingTop: 8 }}>
                <Text style={styles.summaryLabel}>Notlar:</Text>
                <Text style={[styles.summaryValue, { fontStyle: 'italic', marginTop: 4 }]}>{notes}</Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelBtnText}>Hayır</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmBtnText}>Evet</Text>
              </TouchableOpacity>
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
  titleSection: {
    flexDirection: 'row', gap: 16, alignItems: 'flex-start',
    marginTop: 8, marginBottom: 24,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  pageTitle: {
    fontSize: 24, fontWeight: '700', color: Colors.onSurface, letterSpacing: -0.3,
    marginBottom: 4,
  },
  pageDesc: { fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 18 },
  formCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04, shadowRadius: 20, elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: Colors.onSurface,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', gap: 12 },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 48, height: 6, borderRadius: 3,
    backgroundColor: Colors.surfaceContainerHigh,
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: Colors.onSurface, marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14, padding: 16, marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1,
    borderBottomColor: 'rgba(194, 198, 212, 0.1)',
  },
  summaryLabel: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  summaryValue: { fontSize: 13, color: Colors.onSurface, fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(194, 198, 212, 0.3)',
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.onSurfaceVariant },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: Colors.primary, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  confirmBtnText: { fontSize: 14, fontWeight: '600', color: Colors.onPrimary },
});
