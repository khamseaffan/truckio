import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation, LANG_LIST, LANG_LABELS } from '@/i18n';
import type { Lang } from '@/i18n';
import { logger } from '@/shared/utils/logger';

type RoleChoice = 'owner' | 'driver' | null;
type Step = 'language' | 'role' | 'owner_setup' | 'driver_setup';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, setRole } = useAuthStore();
  const { language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('language');
  const [roleChoice, setRoleChoice] = useState<RoleChoice>(null);
  const [loading, setLoading] = useState(false);

  // Owner fields
  const [businessName, setBusinessName] = useState('');
  const [invoiceAuto, setInvoiceAuto] = useState(true);
  const [invoicePrefix, setInvoicePrefix] = useState('');

  // Driver fields
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  function handleRoleNext() {
    if (!roleChoice) return;
    setStep(roleChoice === 'owner' ? 'owner_setup' : 'driver_setup');
  }

  async function handleOwnerComplete() {
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
      logger.error('Owner onboarding failed:', err);
      Alert.alert('Error', err.message || 'Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDriverComplete() {
    if (!driverName.trim() || !inviteCode.trim() || !user) return;
    setLoading(true);
    try {
      // Look up owner by matching first 8 chars of their user_id (the invite code)
      const code = inviteCode.trim().toLowerCase();
      const { data: owners, error: ownerErr } = await supabase
        .from('owners')
        .select('user_id')
        .ilike('user_id', `${code}%`)
        .limit(1);

      if (ownerErr) throw ownerErr;
      if (!owners || owners.length === 0) {
        Alert.alert('Invalid Code', 'No owner found with that invite code. Ask your operator for the code from the Drivers screen.');
        setLoading(false);
        return;
      }

      const ownerUserId = owners[0].user_id;

      const { error: driverErr } = await supabase.from('drivers').insert({
        user_id: user.id,
        owner_id: ownerUserId,
        name: driverName.trim(),
        phone: driverPhone.trim() || user.phone || '',
        is_active: true,
      });
      if (driverErr) throw driverErr;

      setRole('driver');
      logger.info('Onboarding complete — driver record created');
      router.replace('/(driver)/job');
    } catch (err: any) {
      logger.error('Driver onboarding failed:', err);
      Alert.alert('Error', err.message || 'Failed to join fleet. Try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1: Language selection ──────────────────────────
  if (step === 'language') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.subtitle}>Apni bhasha chunein</Text>

        <View style={styles.langGrid}>
          {LANG_LIST.map(lang => (
            <Pressable
              key={lang}
              style={[styles.langChip, language === lang && styles.langChipActive]}
              onPress={() => setLanguage(lang)}
            >
              <Text style={[styles.langChipText, language === lang && styles.langChipTextActive]}>
                {LANG_LABELS[lang]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.button}
          onPress={() => setStep('role')}
        >
          <Text style={styles.buttonText}>{t('continue')}</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── Step 2: Role selection ─────────────────────────────
  if (step === 'role') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={() => setStep('language')} style={styles.back}>
          <Text style={styles.backText}>{`← ${t('back')}`}</Text>
        </Pressable>
        <Text style={styles.title}>{t('welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('roleQuestion')}</Text>

        <Pressable
          style={[styles.roleCard, roleChoice === 'owner' && styles.roleCardActive]}
          onPress={() => setRoleChoice('owner')}
        >
          <Text style={styles.roleEmoji}>🏢</Text>
          <View style={styles.roleTextBlock}>
            <Text style={[styles.roleTitle, roleChoice === 'owner' && styles.roleTitleActive]}>
              {t('roleOwner')}
            </Text>
            <Text style={styles.roleDesc}>{t('roleOwnerDesc')}</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.roleCard, roleChoice === 'driver' && styles.roleCardActive]}
          onPress={() => setRoleChoice('driver')}
        >
          <Text style={styles.roleEmoji}>🚛</Text>
          <View style={styles.roleTextBlock}>
            <Text style={[styles.roleTitle, roleChoice === 'driver' && styles.roleTitleActive]}>
              {t('roleDriver')}
            </Text>
            <Text style={styles.roleDesc}>{t('roleDriverDesc')}</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.button, !roleChoice && styles.buttonDisabled]}
          onPress={handleRoleNext}
          disabled={!roleChoice}
        >
          <Text style={styles.buttonText}>{t('continue')}</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── Step 3a: Owner setup (English-only — owner is business user) ──
  if (step === 'owner_setup') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={() => setStep('role')} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
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
          onPress={handleOwnerComplete}
          disabled={!businessName.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Get Started</Text>
          )}
        </Pressable>
      </ScrollView>
    );
  }

  // ── Step 3b: Driver setup (translated) ─────────────────
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => setStep('role')} style={styles.back}>
        <Text style={styles.backText}>{`← ${t('back')}`}</Text>
      </Pressable>
      <Text style={styles.title}>{t('joinFleet')}</Text>
      <Text style={styles.subtitle}>{t('inviteCodeHint')}</Text>

      <Text style={styles.label}>{t('yourName')}</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Ramesh Kumar"
        placeholderTextColor="#B5AFA6"
        value={driverName}
        onChangeText={setDriverName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>{t('yourPhone')}</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 9876543210"
        placeholderTextColor="#B5AFA6"
        value={driverPhone}
        onChangeText={setDriverPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>{t('inviteCode')}</Text>
      <TextInput
        style={[styles.input, styles.codeInput]}
        placeholder="e.g. A1B2C3D4"
        placeholderTextColor="#B5AFA6"
        value={inviteCode}
        onChangeText={setInviteCode}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <Pressable
        style={[styles.button, (!driverName.trim() || !inviteCode.trim() || loading) && styles.buttonDisabled]}
        onPress={handleDriverComplete}
        disabled={!driverName.trim() || !inviteCode.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>{t('joinFleetBtn')}</Text>
        )}
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  back: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 15,
    color: '#1A6B5A',
    fontWeight: '600',
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
  // Language chips
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  langChip: {
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    minWidth: '45%',
    alignItems: 'center',
  },
  langChipActive: {
    borderColor: '#1A6B5A',
    backgroundColor: '#E8F0ED',
  },
  langChipText: {
    fontSize: 15,
    color: '#8A8279',
    fontWeight: '500',
  },
  langChipTextActive: {
    color: '#1A6B5A',
    fontWeight: '700',
  },
  // Role cards
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    gap: 16,
  },
  roleCardActive: {
    borderColor: '#1A6B5A',
    backgroundColor: '#E8F0ED',
  },
  roleEmoji: {
    fontSize: 32,
  },
  roleTextBlock: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2A26',
    marginBottom: 4,
  },
  roleTitleActive: {
    color: '#1A6B5A',
  },
  roleDesc: {
    fontSize: 13,
    color: '#8A8279',
  },
  // Form fields
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
  codeInput: {
    letterSpacing: 2,
    fontWeight: '700',
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
