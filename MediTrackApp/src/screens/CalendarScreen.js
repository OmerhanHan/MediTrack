import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import AppHeader from '../components/AppHeader';

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const DAYS_HEADER = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

// Day data with load indicators: 'low' (green), 'med' (amber), 'high' (red), null (none)
const DAY_DATA = {
  1: 'low', 2: 'med', 3: 'high', 4: 'low', 6: 'low', 7: 'med',
  8: 'low', 9: 'high', 10: 'med', 11: 'low', 13: 'low', 14: 'low',
  15: 'high', 16: 'med', 17: 'low', 18: 'low', 20: 'low',
};

const APPOINTMENTS_BY_DAY = {
  10: [
    { id: '1', time: '09:30', period: 'AM', name: 'Elena Rodriguez', desc: 'Follow-up: Hypertension' },
    { id: '2', time: '11:15', period: 'AM', name: 'Marcus Chen', desc: 'New Patient Consultation' },
    { id: '3', time: '02:45', period: 'PM', name: 'Sarah Jenkins', desc: 'Lab Results Review' },
    
    
  ],
};

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

const LOAD_COLORS = {
  low: Colors.emerald,
  med: Colors.amber,
  high: Colors.error,
};

export default function CalendarScreen({ navigation, route }) {
  const [currentMonth, setCurrentMonth] = useState(9); // October (0-indexed)
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedDay, setSelectedDay] = useState(10);
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

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const appointments = APPOINTMENTS_BY_DAY[selectedDay] || [];

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(1);
  };

  const renderCalendarDays = () => {
    const cells = [];
    // Empty cells for start offset
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const load = DAY_DATA[day] || null;
      const isSelected = day === selectedDay;
      const isWeekend = ((firstDay + day - 1) % 7 >= 5);
      cells.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell, isSelected && styles.dayCellSelected]}
          onPress={() => setSelectedDay(day)}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.dayTextSelected,
            !load && !isSelected && styles.dayTextFaded,
          ]}>
            {day}
          </Text>
          {load && (
            <View style={[styles.loadDot, { backgroundColor: LOAD_COLORS[load] }]} />
          )}
        </TouchableOpacity>
      );
    }
    return cells;
  };

  const dayOfWeek = new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('en-US', { weekday: 'long' });
  const monthShort = MONTHS[currentMonth].substring(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageLabel}>Clinic Schedule</Text>
          <Text style={styles.pageTitle}>Appointments</Text>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Month Header */}
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</Text>
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
                <Ionicons name="chevron-back" size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
                <Ionicons name="chevron-forward" size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Days Header */}
          <View style={styles.calendarGrid}>
            {DAYS_HEADER.map((d) => (
              <View key={d} style={styles.dayHeaderCell}>
                <Text style={styles.dayHeaderText}>{d.toUpperCase()}</Text>
              </View>
            ))}
            {renderCalendarDays()}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.emerald }]} />
              <Text style={styles.legendText}>LOW</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.amber }]} />
              <Text style={styles.legendText}>MED</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
              <Text style={styles.legendText}>HIGH</Text>
            </View>
          </View>
        </View>

        {/* Day Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Day Details</Text>
            <Text style={styles.detailsDate}>{dayOfWeek}, {monthShort} {selectedDay}</Text>
          </View>

          {appointments.length > 0 ? (
            appointments.map((apt) => (
              <View key={apt.id} style={styles.appointmentItem}>
                <View style={styles.appointmentLeft}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeValue}>{apt.time}</Text>
                    <Text style={styles.timePeriod}>{apt.period}</Text>
                  </View>
                  <View style={styles.timeDivider} />
                  <View>
                    <Text style={styles.aptName}>{apt.name}</Text>
                    <Text style={styles.aptDesc}>{apt.desc}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                  <Ionicons name="ellipsis-vertical" size={18} color={Colors.outline} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyDay}>
              <Ionicons name="calendar-outline" size={36} color={Colors.outlineVariant} />
              <Text style={styles.emptyDayText}>Bu gün için randevu bulunmuyor</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {showSuccessToast && (
        <View style={styles.successToast}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.onPrimary} />
          <Text style={styles.successToastText}>Randevu başarıyla oluşturuldu</Text>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AppointmentEntry', { sourceScreen: 'CalendarMain' })}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={Colors.onPrimary} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { paddingBottom: 120, paddingHorizontal: 20 },
  pageHeader: { marginTop: 8, marginBottom: 24 },
  pageLabel: { fontSize: 13, fontWeight: '600', color: Colors.blue600, marginBottom: 4 },
  pageTitle: { fontSize: 30, fontWeight: '800', color: Colors.onSurface, letterSpacing: -0.5 },
  // Calendar Card
  calendarCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
    marginBottom: 24,
  },
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: { fontSize: 17, fontWeight: '700', color: Colors.onSurface },
  monthNav: { flexDirection: 'row', gap: 4 },
  navBtn: { padding: 8, borderRadius: 10, backgroundColor: Colors.surfaceContainerLow },
  calendarGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
  },
  dayHeaderCell: {
    width: '14.28%', alignItems: 'center', marginBottom: 12,
  },
  dayHeaderText: {
    fontSize: 9, fontWeight: '700', color: Colors.outline, letterSpacing: 1,
  },
  dayCell: {
    width: '14.28%', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8,
  },
  dayCellSelected: {
    borderWidth: 2, borderColor: Colors.blue600, borderRadius: 10,
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
  },
  dayText: { fontSize: 14, fontWeight: '500', color: Colors.onSurface, marginBottom: 4 },
  dayTextSelected: { fontWeight: '700', color: Colors.blue700 },
  dayTextFaded: { color: 'rgba(66, 71, 82, 0.35)' },
  loadDot: { width: 6, height: 6, borderRadius: 3 },
  // Legend
  legend: {
    flexDirection: 'row', justifyContent: 'center', gap: 24,
    marginTop: 24, paddingTop: 20, borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 9, fontWeight: '700', color: Colors.onSurfaceVariant, letterSpacing: 2 },
  // Day Details
  detailsSection: {},
  detailsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingHorizontal: 4,
  },
  detailsTitle: { fontSize: 17, fontWeight: '700', color: Colors.onSurface },
  detailsDate: { fontSize: 13, fontWeight: '500', color: Colors.onSurfaceVariant },
  appointmentItem: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  appointmentLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  timeBlock: { alignItems: 'center' },
  timeValue: { fontSize: 12, fontWeight: '700', color: Colors.blue600 },
  timePeriod: { fontSize: 9, fontWeight: '500', color: Colors.outline },
  timeDivider: {
    width: 2, height: 36, borderRadius: 1,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  aptName: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  aptDesc: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 },
  moreBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyDay: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40, gap: 10,
  },
  emptyDayText: { fontSize: 13, color: Colors.onSurfaceVariant },
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
  // FAB
  fab: {
    position: 'absolute', bottom: 100, right: 24,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  fabGradient: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
});
