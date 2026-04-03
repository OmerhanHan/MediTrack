import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function formatDate(date) {
  const d = date.getDate();
  const m = MONTHS_TR[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePickerInput({
  label,
  icon,
  mode = 'date', // 'date' | 'time'
  value,          // Date object
  onChange,        // (date: Date, formattedString: string) => void
  minimumDate,
  maximumDate,
  error,
  style,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const currentValue = value || new Date();

  const displayText = mode === 'date'
    ? (value ? formatDate(value) : 'Tarih Seçin')
    : (value ? formatTime(value) : 'Saat Seçin');

  const iconName = mode === 'date'
    ? (icon || 'calendar-outline')
    : (icon || 'time-outline');

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    if (selectedDate && onChange) {
      const formatted = mode === 'date'
        ? toDateString(selectedDate)
        : formatTime(selectedDate);
      onChange(selectedDate, formatted);
    }
  };

  const handleConfirmIOS = () => {
    setShowPicker(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.inputWrapper, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={iconName}
          size={18}
          color={error ? '#E53935' : Colors.outlineVariant}
          style={styles.icon}
        />
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.outlineVariant} />
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={13} color="#E53935" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Android: inline picker dialog */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={currentValue}
          mode={mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          locale="tr-TR"
        />
      )}

      {/* iOS: modal bottom sheet */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {mode === 'date' ? 'Tarih Seçin' : 'Saat Seçin'}
                </Text>
                <TouchableOpacity onPress={handleConfirmIOS}>
                  <Text style={styles.modalDone}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={currentValue}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale="tr-TR"
                style={{ height: 200 }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 212, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: '#E53935',
    borderWidth: 1.5,
    backgroundColor: 'rgba(229, 57, 53, 0.04)',
  },
  icon: {
    marginRight: 10,
  },
  valueText: {
    flex: 1,
    fontSize: 15,
    color: Colors.onSurface,
  },
  placeholderText: {
    color: Colors.outlineVariant,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#E53935',
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194, 198, 212, 0.15)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
});
