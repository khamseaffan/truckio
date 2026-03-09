import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Input from '@/shared/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import { database } from '@/db';
import Order from '@/db/models/Order';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { enqueue } from '@/sync/queue';
import { syncManager } from '@/sync/SyncManager';
import { supabase } from '@/services/supabase/client';

interface FormData {
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  dropAddress: string;
  materialType: string;
  quantityValue: string;
  quantityUnit: string;
  scheduledDate: string;
  notes: string;
}

interface FormErrors {
  customerName?: string;
  pickupAddress?: string;
  dropAddress?: string;
  materialType?: string;
}

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.customerName.trim()) errors.customerName = 'Customer name is required';
  if (!form.pickupAddress.trim()) errors.pickupAddress = 'Pickup address is required';
  if (!form.dropAddress.trim()) errors.dropAddress = 'Drop address is required';
  if (!form.materialType.trim()) errors.materialType = 'Material type is required';
  return errors;
}

export default function NewOrderScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { showToast } = useUiStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    pickupAddress: '',
    dropAddress: '',
    materialType: '',
    quantityValue: '',
    quantityUnit: '',
    scheduledDate: '',
    notes: '',
  });

  function set(key: keyof FormData) {
    return (value: string) => setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (!session?.user) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setLoading(true);
    try {
      const quantityValue = form.quantityValue ? parseFloat(form.quantityValue) : undefined;

      // Parse date string DD/MM/YYYY → timestamp
      let scheduledDate: number | undefined;
      if (form.scheduledDate.trim()) {
        const [day, month, year] = form.scheduledDate.split('/').map(Number);
        if (day && month && year) {
          scheduledDate = new Date(year, month - 1, day).getTime();
        }
      }

      const order = await Order.createNew(database, {
        ownerId: session.user.id,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim() || undefined,
        pickupAddress: form.pickupAddress.trim(),
        dropAddress: form.dropAddress.trim(),
        materialType: form.materialType.trim(),
        quantityValue,
        quantityUnit: form.quantityUnit.trim() || undefined,
        scheduledDate,
        notes: form.notes.trim() || undefined,
      });

      enqueue({
        table: 'orders',
        recordId: order.id,
        operation: 'upsert',
        data: {
          id: order.id,
          owner_id: order.ownerId,
          customer_name: order.customerName,
          customer_phone: order.customerPhone || null,
          pickup_address: order.pickupAddress,
          drop_address: order.dropAddress,
          material_type: order.materialType,
          quantity_value: order.quantityValue || null,
          quantity_unit: order.quantityUnit || null,
          status: order.status,
          notes: order.notes || null,
          scheduled_date: order.scheduledDate || null,
        },
      });

      syncManager.sync(database, supabase);
      showToast('Order created', 'success');
      router.replace('/(owner)/orders');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to create order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>New Order</Text>
          </View>

          <Text style={styles.section}>Customer</Text>
          <Input
            label="Customer Name *"
            placeholder="e.g. Ramesh Traders"
            value={form.customerName}
            onChangeText={set('customerName')}
            error={errors.customerName}
            autoCapitalize="words"
          />
          <Input
            label="Customer Phone"
            placeholder="e.g. 9876543210"
            value={form.customerPhone}
            onChangeText={set('customerPhone')}
            keyboardType="phone-pad"
          />

          <Text style={styles.section}>Route</Text>
          <Input
            label="Pickup Address *"
            placeholder="e.g. 12 MG Road, Pune"
            value={form.pickupAddress}
            onChangeText={set('pickupAddress')}
            error={errors.pickupAddress}
            multiline
            numberOfLines={2}
            style={styles.multilineInput}
          />
          <Input
            label="Drop Address *"
            placeholder="e.g. MIDC, Aurangabad"
            value={form.dropAddress}
            onChangeText={set('dropAddress')}
            error={errors.dropAddress}
            multiline
            numberOfLines={2}
            style={styles.multilineInput}
          />

          <Text style={styles.section}>Material</Text>
          <Input
            label="Material Type *"
            placeholder="e.g. Sand, Steel, Bricks"
            value={form.materialType}
            onChangeText={set('materialType')}
            error={errors.materialType}
            autoCapitalize="words"
          />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Input
                label="Quantity"
                placeholder="e.g. 10"
                value={form.quantityValue}
                onChangeText={set('quantityValue')}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rowRight}>
              <Input
                label="Unit"
                placeholder="kg / ton / bags"
                value={form.quantityUnit}
                onChangeText={set('quantityUnit')}
                autoCapitalize="none"
              />
            </View>
          </View>

          <Text style={styles.section}>Schedule</Text>
          <Input
            label="Scheduled Date"
            placeholder="DD/MM/YYYY"
            value={form.scheduledDate}
            onChangeText={set('scheduledDate')}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.section}>Notes</Text>
          <Input
            label="Notes"
            placeholder="Any extra instructions..."
            value={form.notes}
            onChangeText={set('notes')}
            multiline
            numberOfLines={3}
            style={styles.multilineInput}
          />

          <Button
            title="Create Order"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D2A26',
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8279',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowLeft: {
    flex: 1.5,
  },
  rowRight: {
    flex: 1,
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    marginTop: 16,
  },
});
