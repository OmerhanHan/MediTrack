import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import {
  fetchPendingApprovals,
  approveAccount,
  rejectAccount,
} from '../../services/adminRepository';

export default function AdminPendingApprovalsScreen({ navigation }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchPendingApprovals();
      setRows(data);
    } catch (e) {
      setError(e.message || 'Liste alınamadı');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const confirmApprove = (item) => {
    Alert.alert(
      'Hesabı onayla',
      `${item.email} adresli başvuruyu onaylamak istiyor musunuz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            setBusyId(item.id);
            try {
              await approveAccount(item.id);
              await load();
            } catch (e) {
              Alert.alert('Hata', e.message || 'İşlem başarısız');
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  const confirmReject = (item) => {
    Alert.alert(
      'Başvuruyu reddet',
      `${item.email} reddedilecek. Kullanıcı girişte bilgilendirilecek.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            setBusyId(item.id);
            try {
              await rejectAccount(item.id);
              await load();
            } catch (e) {
              Alert.alert('Hata', e.message || 'İşlem başarısız');
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => {
    const busy = busyId === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>
              {(item.first_name?.[0] || '?').toUpperCase()}
              {(item.last_name?.[0] || '').toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.name}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.meta}>
              Sicil {item.sicil} · {item.title || '—'} · {item.department || '—'}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btnReject, busy && styles.btnDisabled]}
            onPress={() => confirmReject(item)}
            disabled={busy}
          >
            <Text style={styles.btnRejectTxt}>Reddet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnOk, busy && styles.btnDisabled]}
            onPress={() => confirmApprove(item)}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={Colors.onPrimary} size="small" />
            ) : (
              <Text style={styles.btnOkTxt}>Onayla</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.topTitle}>Onay kuyruğu</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.intro}>
        Yeni kayıtlar doğrudan ana uygulamaya düşmez; buradan onaylandıktan sonra aktif olur.
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
            <View style={styles.emptyWrap}>
              <Ionicons name="checkmark-done-outline" size={48} color={Colors.emerald} />
              <Text style={styles.emptyTitle}>Bekleyen başvuru yok</Text>
              <Text style={styles.emptySub}>Yeni kayıtlar burada listelenecek.</Text>
            </View>
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceContainer,
  },
  backBtn: { padding: 8 },
  topTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.onSurface, textAlign: 'center' },
  refreshBtn: { padding: 8, width: 40 },
  intro: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    lineHeight: 19,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', marginBottom: 14 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarTxt: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  email: { fontSize: 13, color: Colors.primary, marginTop: 2 },
  meta: { fontSize: 12, color: Colors.slate500, marginTop: 6, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 10 },
  btnReject: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
  },
  btnRejectTxt: { fontSize: 14, fontWeight: '700', color: Colors.onSurfaceVariant },
  btnOk: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  btnOkTxt: { fontSize: 14, fontWeight: '700', color: Colors.onPrimary },
  btnDisabled: { opacity: 0.6 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  err: { color: Colors.error, textAlign: 'center', marginBottom: 8 },
  retry: { fontWeight: '700', color: Colors.primary },
  emptyWrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface, marginTop: 12 },
  emptySub: { fontSize: 14, color: Colors.slate500, marginTop: 8, textAlign: 'center' },
});
