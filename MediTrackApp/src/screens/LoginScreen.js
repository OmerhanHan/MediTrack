import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz</Text>
          <Text style={styles.welcomeSubtitle}>
            Lütfen hesabınıza erişmek için bilgilerinizi girin.
          </Text>

          <View style={styles.formContainer}>
            <FormInput
              label="E-POSTA ADRESİ"
              icon="mail-outline"
              placeholder="doktor@hastane.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>ŞİFRE</Text>
                <TouchableOpacity>
                  <Text style={styles.forgotLink}>Şifremi Unuttum</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordInputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.outlineVariant} style={styles.inputIcon} />
                <View style={{ flex: 1 }}>
                  <FormInput
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={{ marginBottom: 0 }}
                  />
                </View>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.outlineVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me */}
            <View style={styles.rememberRow}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: Colors.surfaceContainerHigh, true: Colors.primaryFixedDim }}
                thumbColor={rememberMe ? Colors.primary : Colors.outline}
                style={{ transform: [{ scale: 0.8 }] }}
              />
              <Text style={styles.rememberText}>Beni hatırla</Text>
            </View>

            <PrimaryButton
              title="Giriş Yap"
              onPress={() => navigation.replace('Main')}
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>VEYA</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={18} color={Colors.onSurface} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={18} color={Colors.onSurface} />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Henüz bir hesabınız yok mu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorRegister')}>
              <Text style={styles.registerLink}>Ücretsiz Kayıt Olun</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  scrollContent: {
    flexGrow: 1,
  },
  brandingSection: {
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  brandingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  brandingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onPrimary,
    letterSpacing: -0.3,
  },
  brandingHeadline: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.onPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 10,
  },
  brandingSubtext: {
    fontSize: 15,
    color: Colors.onPrimaryContainer,
    lineHeight: 22,
    fontWeight: '300',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {},
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.onPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onPrimaryContainer,
    letterSpacing: 1.5,
  },
  formSection: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 28,
  },
  formContainer: {
    gap: 4,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  forgotLink: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 212, 0.2)',
    paddingLeft: 14,
    paddingRight: 8,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeButton: {
    padding: 10,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginLeft: -4,
  },
  rememberText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.outlineVariant,
    letterSpacing: 2,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 36,
  },
  registerText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
