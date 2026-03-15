import { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface Props {
  label: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export default function DateField({ label, value, onChange, placeholder = 'Select date' }: Props) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value ?? new Date());

  const displayText = value
    ? value.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  function handleChange(_evt: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') setOpen(false);
    if (date) {
      setTempDate(date);
      onChange(date);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={displayText ? styles.value : styles.placeholder}>
          {displayText ?? placeholder}
        </Text>
      </Pressable>

      {/* Android: native picker renders inline */}
      {Platform.OS === 'android' && open && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}

      {/* iOS: modal with spinner at bottom */}
      {Platform.OS === 'ios' && (
        <Modal visible={open} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.pickerCard}>
              <View style={styles.pickerHeader}>
                <Pressable onPress={() => setOpen(false)} style={styles.doneBtn}>
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                style={{ height: 200 }}
              />
            </View>
          </View>
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
    fontSize: 13,
    fontWeight: '600',
    color: '#2D2A26',
    marginBottom: 6,
  },
  field: {
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  value: {
    fontSize: 15,
    color: '#2D2A26',
  },
  placeholder: {
    fontSize: 15,
    color: '#B5AFA6',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
  },
  doneBtn: {
    padding: 4,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A6B5A',
  },
});
