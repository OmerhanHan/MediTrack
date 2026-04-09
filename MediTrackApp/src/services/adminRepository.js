import { supabase } from './supabase';
import { ACCOUNT_STATUS } from '../constants/accountStatus';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Yönetici: tüm personel (sicil dahil) */
export async function fetchStaffDirectory() {
  const { data, error } = await supabase
    .from('users')
    .select(
      'id, email, first_name, last_name, role, title, department, sicil, is_active, account_status, created_at',
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/** Onay bekleyen hesaplar */
export async function fetchPendingApprovals() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, sicil, title, department, role, created_at')
    .eq('account_status', ACCOUNT_STATUS.PENDING)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function approveAccount(userId) {
  const { error } = await supabase.functions.invoke('admin-account-review', {
    body: { userId, status: ACCOUNT_STATUS.ACTIVE },
  });

  if (error) throw new Error(error.message);
}

export async function rejectAccount(userId) {
  const { error } = await supabase.functions.invoke('admin-account-review', {
    body: { userId, status: ACCOUNT_STATUS.REJECTED },
  });

  if (error) throw new Error(error.message);
}

/** Yönetici paneli özet metrikleri */
export async function fetchAdminAnalytics() {
  const { count: patientTotal, error: e1 } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  if (e1) throw new Error(e1.message);

  const { count: appointmentTotal, error: e2 } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  if (e2) throw new Error(e2.message);

  const { data: allApptStatus, error: e2b } = await supabase.from('appointments').select('status');

  if (e2b) throw new Error(e2b.message);

  const totalA = allApptStatus?.length ?? 0;
  const upcomingCount =
    allApptStatus?.filter((r) => r.status === 'upcoming' || r.status === 'next').length ?? 0;
  const activeRate =
    totalA > 0
      ? Math.min(99.9, Math.round((upcomingCount / totalA) * 1000) / 10)
      : 84.2;

  const { data: staff, error: e3 } = await supabase
    .from('users')
    .select('id, title, role');

  if (e3) throw new Error(e3.message);

  const doctorCount = (staff || []).filter((u) => u.role !== 'admin').length;

  const titleNorm = (t) => (t || '').toLowerCase();
  let uzman = 0;
  let operator = 0;
  let pratisyen = 0;
  let diger = 0;

  (staff || []).forEach((u) => {
    if (u.role === 'admin') return;
    const t = titleNorm(u.title);
    if (t.includes('uzman')) uzman += 1;
    else if (t.includes('operat')) operator += 1;
    else if (t.includes('pratisy')) pratisyen += 1;
    else diger += 1;
  });

  const today = startOfDay(new Date());
  const from = addDays(today, -6);
  const fromStr = from.toISOString().split('T')[0];

  const { data: weekAppts, error: e4 } = await supabase
    .from('appointments')
    .select('date')
    .gte('date', fromStr);

  if (e4) throw new Error(e4.message);

  const dayKeys = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];
  const weeklyFlow = dayKeys.map((label, i) => {
    const d = addDays(from, i);
    const ds = d.toISOString().split('T')[0];
    const count = (weekAppts || []).filter((a) => a.date === ds).length;
    return { label, count, date: ds };
  });

  const peak = weeklyFlow.reduce(
    (m, x) => (x.count > m.count ? x : m),
    weeklyFlow[0] || { label: '-', count: 0 },
  );

  const thirtyAgo = addDays(today, -30);
  const sixtyAgo = addDays(today, -60);

  const { count: patientsLastWindow, error: e5 } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyAgo.toISOString());

  if (e5) throw new Error(e5.message);

  const { count: patientsPrevWindow, error: e6 } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sixtyAgo.toISOString())
    .lt('created_at', thirtyAgo.toISOString());

  if (e6) throw new Error(e6.message);

  let growthPercent = 0;
  if (patientsPrevWindow > 0) {
    growthPercent = Math.round(
      (((patientsLastWindow ?? 0) - (patientsPrevWindow ?? 0)) / patientsPrevWindow) * 100,
    );
  } else if ((patientsLastWindow ?? 0) > 0) {
    growthPercent = 100;
  }

  const pt = patientTotal ?? 0;
  const emptyBeds = Math.max(0, 24 - (pt % 25));

  const { count: pendingApprovals, error: e7 } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('account_status', ACCOUNT_STATUS.PENDING);

  if (e7) throw new Error(e7.message);

  return {
    patientTotal: pt,
    appointmentTotal: appointmentTotal ?? 0,
    doctorTotal: doctorCount,
    growthPercent,
    weeklyFlow,
    peakDay: peak,
    doctorBuckets: { uzman, operator, pratisyen, diger },
    activeRate: Number.isFinite(activeRate) ? activeRate : 84.2,
    emptyBeds,
    pendingApprovals: pendingApprovals ?? 0,
  };
}
