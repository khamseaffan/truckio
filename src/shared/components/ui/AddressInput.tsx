import { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

interface Props {
  label: string;
  value: string;
  onSelect: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  error?: string;
}

export default function AddressInput({ label, value, onSelect, placeholder = 'Search address', error }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.field, !!error && styles.fieldError]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.fieldText, !value && styles.placeholder]} numberOfLines={2}>
          {value || placeholder}
        </Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Search address</Text>
            <Pressable onPress={() => setOpen(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>

          <GooglePlacesAutocomplete
            placeholder="Type an address..."
            fetchDetails
            onPress={(data, details) => {
              const address = data.description;
              const lat = details?.geometry?.location.lat ?? 0;
              const lng = details?.geometry?.location.lng ?? 0;
              onSelect(address, lat, lng);
              setOpen(false);
            }}
            query={{
              key: GOOGLE_KEY,
              language: 'en',
              components: 'country:in',
            }}
            enablePoweredByContainer={false}
            keepResultsAfterBlur
            keyboardShouldPersistTaps="handled"
            styles={{
              container: { flex: 1 },
              textInputContainer: inputStyles.container,
              textInput: inputStyles.textInput,
              row: inputStyles.row,
              description: inputStyles.description,
              separator: inputStyles.separator,
            }}
          />
        </SafeAreaView>
      </Modal>
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
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  fieldError: {
    borderColor: '#C0392B',
  },
  fieldText: {
    fontSize: 15,
    color: '#2D2A26',
  },
  placeholder: {
    color: '#B5AFA6',
  },
  errorText: {
    fontSize: 12,
    color: '#C0392B',
    marginTop: 4,
  },
  modal: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2A26',
  },
  cancelBtn: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    color: '#1A6B5A',
    fontWeight: '600',
  },
});

const inputStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  textInput: {
    height: 48,
    fontSize: 16,
    color: '#2D2A26',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 0,
  },
  row: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 14,
    color: '#2D2A26',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3EDE4',
    marginHorizontal: 16,
  },
});
