import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

const SAMPLE_LOGS = [
  { id: '1', time: '09:42', actor: 'Sistem', action: 'RLS politikaları doğrulandı', level: 'bilgi' },
  { id: '2', time: '09:38', actor: 'Yönetici', action: 'Personel listesi görüntülendi', level: 'bilgi' },
  { id: '3', time: '08:15', actor: 'Oturum', action: 'Başarılı giriş (yönetici)', level: 'başarı' },
  { id: '4', time: 'Dün', actor: 'Sistem', action: 'Yedekleme hatırlatması (örnek)', level: 'uyarı' },
];

export default function AdminAuditScreen({ navigation }) {
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
        <Text style={styles.topTitle}>Denetim & güvenlik</Text>
        <View style={styles.topRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Aşağıdaki kayıtlar örnek veridir. Üretimde denetim logları Supabase Edge Function, veritabanı
          tetikleyicileri veya harici SIEM entegrasyonu ile beslenmelidir.
        </Text>

        {SAMPLE_LOGS.map((log) => (
          <View key={log.id} style={styles.logRow}>
            <View style={styles.logIcon}>
              <Ionicons
                name={log.level === 'uyarı' ? 'warning-outline' : 'checkmark-circle-outline'}
                size={20}
                color={log.level === 'uyarı' ? Colors.amber : Colors.emerald}
              />
            </View>
            <View style={styles.logBody}>
              <View style={styles.logTop}>
                <Text style={styles.logTime}>{log.time}</Text>
                <Text style={styles.logActor}>{log.actor}</Text>
              </View>
              <Text style={styles.logAction}>{log.action}</Text>
            </View>
          </View>
        ))}

        <View style={styles.tip}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.tipText}>
            Sicil numaraları veritabanında benzersizdir ve güncelleme ile değiştirilemez.
          </Text>
        </View>
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
  intro: { fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 19, marginBottom: 16 },
  logRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  logIcon: { marginRight: 12, justifyContent: 'center' },
  logBody: { flex: 1 },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logTime: { fontSize: 12, fontWeight: '600', color: Colors.slate500 },
  logActor: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  logAction: { fontSize: 14, color: Colors.onSurface, lineHeight: 20 },
  tip: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    padding: 14,
    backgroundColor: Colors.blue50,
    borderRadius: 12,
  },
  tipText: { flex: 1, fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 19 },
});
