import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { logger } from '@/shared/utils/logger';

/** First-time owner setup — business name, invoice numbering preference */
export default function OnboardingScreen() {
  const router = useRouter();
  const { user, setRole } = useAuthStore();
  const [businessName, setBusinessName] = useState('');
  const [invoiceAuto, setInvoiceAuto] = useState(true);
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!businessName.trim() || !user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('owners').insert({
        user_id: user.id,
        business_name: businessName.trim(),
        phone: user.phone || '',
        email: user.email || '',
        invoice_auto_number: invoiceAuto,
        invoice_prefix: invoicePrefix.trim() || null,
        plan_tier: 'starter',
        plan_status: 'active',
      });

      if (error) throw error;

      setRole('owner');
      logger.info('Onboarding complete — owner record created');
      router.replace('/(owner)/dashboard');
    } catch (err: any) {
      logger.error('Onboarding failed:', err);
      Alert.alert('Error', err.message || 'Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Set up your business</Text>
      <Text style={styles.subtitle}>This takes 30 seconds</Text>

      <Text style={styles.label}>Business name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Ram Transport"
        placeholderTextColor="#B5AFA6"
        value={businessName}
        onChangeText={setBusinessName}
      />

      <Text style={styles.label}>Invoice numbering</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggle, invoiceAuto && styles.toggleActive]}
          onPress={() => setInvoiceAuto(true)}
        >
          <Text style={[styles.toggleText, invoiceAuto && styles.toggleTextActive]}>
            Auto (INV-2026-001)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, !invoiceAuto && styles.toggleActive]}
          onPress={() => setInvoiceAuto(false)}
        >
          <Text style={[styles.toggleText, !invoiceAuto && styles.toggleTextActive]}>
            Custom prefix
          </Text>
        </Pressable>
      </View>

      {!invoiceAuto && (
        <TextInput
          style={styles.input}
          placeholder="e.g. RAM/2026/"
          placeholderTextColor="#B5AFA6"
          value={invoicePrefix}
          onChangeText={setInvoicePrefix}
        />
      )}

      <Pressable
        style={[styles.button, (!businessName.trim() || loading) && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={!businessName.trim() || loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Setting up...' : 'Get Started'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 100,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A8279',
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2A26',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2D2A26',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggle: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  toggleActive: {
    borderColor: '#1A6B5A',
    backgroundColor: '#E8F0ED',
  },
  toggleText: {
    fontSize: 13,
    color: '#8A8279',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#1A6B5A',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1A6B5A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
