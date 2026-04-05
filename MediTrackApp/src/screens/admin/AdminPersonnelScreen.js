import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { fetchStaffDirectory } from '../../services/adminRepository';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';

function roleLabel(role) {
  if (role === 'admin') return 'Yönetici';
  if (role === 'staff') return 'Personel';
  return 'Doktor';
}

function statusLabel(st) {
  if (st === ACCOUNT_STATUS.PENDING) return 'Onay bekliyor';
  if (st === ACCOUNT_STATUS.REJECTED) return 'Reddedildi';
  return 'Aktif';
}

export default function AdminPersonnelScreen({ navigation }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchStaffDirectory();
      setRows(data);
    } catch (e) {
      setError(e.message || 'Liste yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.first_name?.[0] || '?').toUpperCase()}
          {(item.last_name?.[0] || '').toUpperCase()}
        </Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.name}>
          {item.first_name || ''} {item.last_name || ''}
        </Text>
        <Text style={styles.email}>{item.email}</Text>
        <View style={styles.metaRow}>
          <View style={styles.sicilPill}>
            <Text style={styles.sicilText}>{item.sicil || '—'}</Text>
          </View>
          <Text style={styles.dept}>{item.department || '—'} · {item.title || '—'}</Text>
        </View>
      </View>
      <View style={styles.pillCol}>
        <View style={[styles.rolePill, item.role === 'admin' && styles.rolePillAdmin]}>
          <Text style={[styles.roleText, item.role === 'admin' && styles.roleTextAdmin]}>
            {roleLabel(item.role)}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            item.account_status === ACCOUNT_STATUS.PENDING && styles.statusPillPending,
            item.account_status === ACCOUNT_STATUS.REJECTED && styles.statusPillRejected,
          ]}
        >
          <Text style={styles.statusText}>{statusLabel(item.account_status)}</Text>
        </View>
      </View>
    </View>
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
        <Text style={styles.topTitle}>Personel kadrosu</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.intro}>
        Her kullanıcıya sistem tarafından tek ve benzersiz bir sicil numarası atanır (MT-000001 formatı).
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.err}>{error}</Text>
          <TouchableOpacity onPress={load}>
            <Text style={styles.retry}>Yeniden dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Henüz kayıtlı personel yok.</Text>
          }
        />
      )}
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
  refreshBtn: { padding: 8, width: 40 },
  intro: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: Colors.blue700 },
  rowBody: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  email: { fontSize: 12, color: Colors.slate500, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6 },
  sicilPill: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sicilText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  dept: { fontSize: 11, color: Colors.onSurfaceVariant, flex: 1 },
  pillCol: { alignItems: 'flex-end', gap: 6 },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainer,
  },
  rolePillAdmin: { backgroundColor: Colors.blue50 },
  roleText: { fontSize: 11, fontWeight: '700', color: Colors.slate500 },
  roleTextAdmin: { color: Colors.blue700 },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.emerald + '22',
  },
  statusPillPending: { backgroundColor: Colors.tertiaryFixed },
  statusPillRejected: { backgroundColor: Colors.errorContainer },
  statusText: { fontSize: 10, fontWeight: '700', color: Colors.onSurfaceVariant },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  err: { color: Colors.error, textAlign: 'center', marginBottom: 8 },
  retry: { fontWeight: '700', color: Colors.primary },
  empty: { textAlign: 'center', color: Colors.slate500, marginTop: 24 },
});
