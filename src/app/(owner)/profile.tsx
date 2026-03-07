import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/client';
import { signOut } from '@/services/supabase/auth';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@/shared/utils/logger';

interface OwnerProfile {
  id: string;
  business_name: string;
  phone: string;
  email: string;
  gst_number: string;
  address: string;
  invoice_prefix: string;
  invoice_auto_number: boolean;
  plan_tier: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [invoiceAuto, setInvoiceAuto] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
        setBusinessName(data.business_name || '');
        setPhone(data.phone || '');
        setGstNumber(data.gst_number || '');
        setAddress(data.address || '');
        setInvoicePrefix(data.invoice_prefix || '');
        setInvoiceAuto(data.invoice_auto_number ?? true);
      }
    } catch (err) {
      logger.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !businessName.trim()) {
      Alert.alert('Error', 'Business name is required');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('owners')
        .update({
          business_name: businessName.trim(),
          phone: phone.trim(),
          gst_number: gstNumber.trim() || null,
          address: address.trim() || null,
          invoice_prefix: invoicePrefix.trim() || null,
          invoice_auto_number: invoiceAuto,
        })
        .eq('id', profile.id);

      if (error) throw error;
      Alert.alert('Saved', 'Profile updated successfully');
      logger.info('Profile updated');
    } catch (err: any) {
      logger.error('Profile save failed:', err);
      Alert.alert('Error', err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            useAuthStore.getState().reset();
            router.replace('/(auth)/phone');
          } catch (err) {
            logger.error('Sign out failed:', err);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1A6B5A" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Plan badge */}
        <View style={styles.planBadge}>
          <Ionicons name="diamond-outline" size={16} color="#1A6B5A" />
          <Text style={styles.planText}>
            {(profile?.plan_tier || 'starter').charAt(0).toUpperCase() +
              (profile?.plan_tier || 'starter').slice(1)}{' '}
            Plan
          </Text>
        </View>

        {/* Business Info */}
        <Text style={styles.sectionHeader}>Business Information</Text>

        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Your business name"
          placeholderTextColor="#B5AFA6"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 98765 43210"
          placeholderTextColor="#B5AFA6"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <View style={[styles.input, styles.inputDisabled]}>
          <Text style={styles.disabledText}>{user?.email || user?.phone || '—'}</Text>
        </View>

        <Text style={styles.label}>GST Number</Text>
        <TextInput
          style={styles.input}
          value={gstNumber}
          onChangeText={setGstNumber}
          placeholder="e.g. 29ABCDE1234F1Z5"
          placeholderTextColor="#B5AFA6"
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={address}
          onChangeText={setAddress}
          placeholder="Business address"
          placeholderTextColor="#B5AFA6"
          multiline
          numberOfLines={3}
        />

        {/* Invoice Settings */}
        <Text style={styles.sectionHeader}>Invoice Settings</Text>

        <Text style={styles.label}>Invoice Numbering</Text>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggle, invoiceAuto && styles.toggleActive]}
            onPress={() => setInvoiceAuto(true)}
          >
            <Text style={[styles.toggleText, invoiceAuto && styles.toggleTextActive]}>Auto</Text>
          </Pressable>
          <Pressable
            style={[styles.toggle, !invoiceAuto && styles.toggleActive]}
            onPress={() => setInvoiceAuto(false)}
          >
            <Text style={[styles.toggleText, !invoiceAuto && styles.toggleTextActive]}>
              Custom Prefix
            </Text>
          </Pressable>
        </View>

        {!invoiceAuto && (
          <>
            <Text style={styles.label}>Invoice Prefix</Text>
            <TextInput
              style={styles.input}
              value={invoicePrefix}
              onChangeText={setInvoicePrefix}
              placeholder="e.g. RAM/2026/"
              placeholderTextColor="#B5AFA6"
            />
          </>
        )}

        {/* Save Button */}
        <Pressable
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </Pressable>

        {/* Sign Out */}
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#C4553A" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D2A26',
    marginBottom: 16,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0ED',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 24,
  },
  planText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A6B5A',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D2A26',
    marginTop: 24,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A8279',
    marginBottom: 6,
    marginTop: 12,
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
  inputDisabled: {
    backgroundColor: '#F5F2ED',
    justifyContent: 'center',
  },
  disabledText: {
    fontSize: 16,
    color: '#8A8279',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    fontSize: 14,
    color: '#8A8279',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#1A6B5A',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1A6B5A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C4553A',
  },
});
