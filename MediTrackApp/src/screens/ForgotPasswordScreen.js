import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import ErrorToast from '../components/ErrorToast';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = () => {
    if (!email || !email.includes('@')) {
      setError('Lütfen geçerli bir e-posta adresi girin');
      return;
    }

    // Gerçek API'ye bağlama öncesi sahte senaryo
    setIsSent(true);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ErrorToast visible={!!error} message={error} onHide={() => setError(null)} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            Kayıtlı e-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.
          </Text>

          {!isSent ? (
            <View style={styles.formContainer}>
              <FormInput
                label="E-POSTA ADRESİ"
                icon="mail-outline"
                placeholder="doktor@hastane.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <PrimaryButton title="Bağlantı Gönder" onPress={handleReset} style={{ marginTop: 12 }} />
            </View>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="mail-unread-outline" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.successTitle}>E-posta Gönderildi</Text>
              <Text style={styles.successText}>
                {email} adresine şifre sıfırlama talimatlarını gönderdik. Lütfen gelen kutunuzu kontrol edin.
              </Text>
              <PrimaryButton 
                title="Giriş Sayfasına Dön" 
                onPress={() => navigation.goBack()} 
                style={{ marginTop: 24, width: '100%' }} 
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surfaceContainerLowest },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 16 },
  backButton: { marginBottom: 32, alignSelf: 'flex-start' },
  content: { flex: 1 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.onSurface, marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 20, marginBottom: 32 },
  formContainer: { gap: 16 },
  successContainer: { alignItems: 'center', marginTop: 16 },
  successIconWrapper: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 20, fontWeight: '700', color: Colors.onSurface, marginBottom: 8 },
  successText: { fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
});
