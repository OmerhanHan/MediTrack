import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import AppHeader from '../components/AppHeader';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState('Selin');
  const [lastName, setLastName] = useState('Yılmaz');
  const [title, setTitle] = useState('Uzman Doktor');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Profil Ayarları</Text>
          <Text style={styles.pageDesc}>Klinik kimliğinizi ve erişim tercihlerinizi buradan yönetin.</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={Colors.outlineVariant} />
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="pencil" size={12} color={Colors.onPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>S.Y.</Text>
          <Text style={styles.profileRole}>Kardiyoloji Uzmanı</Text>

          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={16} color={Colors.primary} />
              <Text style={styles.infoText}>selin.yilmaz@hospital.com</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={16} color={Colors.primary} />
              <Text style={styles.infoText}>Sicil: #88291</Text>
            </View>
          </View>
        </View>

        {/* Personal Info Form */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
          </View>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <FormInput label="AD" value={firstName} onChangeText={setFirstName} />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput label="SOYAD" value={lastName} onChangeText={setLastName} />
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <FormInput label="UNVAN" value={title} onChangeText={setTitle} />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput label="BÖLÜM / DEPARTMAN" value="Kardiyoloji" />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={[styles.formSection, styles.securitySection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Güvenlik ve Şifre</Text>
          </View>
          <FormInput
            label="MEVCUT ŞİFRE"
            placeholder="••••••••"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <FormInput
                label="YENİ ŞİFRE"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput
                label="YENİ ŞİFRE (TEKRAR)"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>İptal Et</Text>
          </TouchableOpacity>
          <PrimaryButton title="Değişiklikleri Kaydet" onPress={() => {}} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { paddingBottom: 120, paddingHorizontal: 20 },
  pageHeader: { marginTop: 8, marginBottom: 24 },
  pageTitle: {
    fontSize: 26, fontWeight: '800', color: Colors.onSurface,
    letterSpacing: -0.5, marginBottom: 6,
  },
  pageDesc: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 20 },
  // Profile Card
  profileCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
    marginBottom: 20,
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.surfaceContainer,
    borderWidth: 3, borderColor: Colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  profileName: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  profileRole: { fontSize: 14, fontWeight: '500', color: Colors.onSurfaceVariant, marginBottom: 16 },
  profileInfo: {
    width: '100%', paddingTop: 16, borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer, gap: 10,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 13, color: Colors.onSurfaceVariant },
  // Form Sections
  formSection: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
    marginBottom: 16,
  },
  securitySection: {
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  formRow: { flexDirection: 'row', gap: 12 },
  // Actions
  actions: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 14, fontWeight: '600', color: Colors.onSurfaceVariant,
  },
});
