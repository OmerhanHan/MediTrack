import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';

const SPECIALTIES = [
  'Kardiyoloji', 'İç Hastalıkları (Dahiliye)', 'Nöroloji',
  'Çocuk Sağlığı ve Hastalıkları', 'Ortopedi ve Travmatoloji', 'Dermatoloji', 'Üroloji',
];
const LEVELS = ['Pratisyen Hekim', 'Uzman Doktor', 'Operatör Doktor'];

export default function DoctorRegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [level, setLevel] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPicker, setShowPicker] = useState(null); // 'specialty' | 'level' | null

  const handleRegister = () => {
    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Yeni Doktor Hesabı</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.cardAccent} />
          <Text style={styles.formTitle}>Doktor Kayıt</Text>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="AD SOYAD"
                icon="person-outline"
                placeholder="Dr. Ahmet Yılmaz"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Specialty Picker */}
          <View style={styles.pickerField}>
            <Text style={styles.pickerLabel}>BRANŞ</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowPicker('specialty')}
            >
              <Ionicons name="fitness-outline" size={18} color={Colors.outline} style={{ marginRight: 10 }} />
              <Text style={[styles.pickerText, !specialty && styles.pickerPlaceholder]}>
                {specialty || 'Branş Seçiniz'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.outline} />
            </TouchableOpacity>
          </View>

          {/* Level Picker */}
          <View style={styles.pickerField}>
            <Text style={styles.pickerLabel}>UZMANLIK SEVİYESİ</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowPicker('level')}
            >
              <Ionicons name="school-outline" size={18} color={Colors.outline} style={{ marginRight: 10 }} />
              <Text style={[styles.pickerText, !level && styles.pickerPlaceholder]}>
                {level || 'Seviye Seçiniz'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.outline} />
            </TouchableOpacity>
          </View>

          <FormInput
            label="E-POSTA"
            icon="mail-outline"
            placeholder="ornek@hastane.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <FormInput
            label="ŞİFRE"
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryButton
            title="Kayıt Ol ve Onaya Gönder"
            onPress={handleRegister}
            style={{ marginTop: 8 }}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Zaten bir hesabınız mı var? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Picker Modal */}
      <Modal visible={showPicker !== null} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(null)}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerModalTitle}>
              {showPicker === 'specialty' ? 'Branş Seçiniz' : 'Seviye Seçiniz'}
            </Text>
            {(showPicker === 'specialty' ? SPECIALTIES : LEVELS).map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.pickerOption}
                onPress={() => {
                  if (showPicker === 'specialty') setSpecialty(item);
                  else setLevel(item);
                  setShowPicker(null);
                }}
              >
                <Text style={[
                  styles.pickerOptionText,
                  (showPicker === 'specialty' ? specialty : level) === item && styles.pickerOptionActive,
                ]}>
                  {item}
                </Text>
                {(showPicker === 'specialty' ? specialty : level) === item && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.successTitle}>Kayıt İşlemi Başarılı</Text>
            <Text style={styles.successText}>
              Kaydınız onaya gönderildi. Onaylandığı zaman mail ile bilgi verilecektir.
            </Text>
            <PrimaryButton
              title="Giriş Paneline Git"
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
              style={{ width: '100%', marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { paddingBottom: 40 },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  formCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
  cardAccent: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(215, 227, 255, 0.15)',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 24,
  },
  row: { flexDirection: 'row', gap: 12 },
  pickerField: { marginBottom: 16 },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 212, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pickerText: {
    flex: 1,
    fontSize: 15,
    color: Colors.onSurface,
  },
  pickerPlaceholder: {
    color: Colors.outlineVariant,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(194, 198, 212, 0.1)',
  },
  loginText: { fontSize: 13, color: Colors.onSurfaceVariant },
  loginLink: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  // Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  pickerHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.surfaceContainerHigh,
    alignSelf: 'center',
    marginBottom: 20,
  },
  pickerModalTitle: {
    fontSize: 18, fontWeight: '700', color: Colors.onSurface,
    marginBottom: 16,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194, 198, 212, 0.1)',
  },
  pickerOptionText: {
    fontSize: 15, color: Colors.onSurface,
  },
  pickerOptionActive: {
    color: Colors.primary, fontWeight: '700',
  },
  // Success Modal
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(25, 28, 30, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  successIconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(0, 92, 185, 0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18, fontWeight: '700', color: Colors.onSurface,
    marginBottom: 8, letterSpacing: -0.3,
  },
  successText: {
    fontSize: 14, color: Colors.onSurfaceVariant,
    textAlign: 'center', lineHeight: 20,
  },
});
