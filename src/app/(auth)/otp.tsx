import { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { verifyOtp, sendOtp } from '@/services/supabase/auth';
import { logger } from '@/shared/utils/logger';

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError('Enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOtp(phone, code);
      // Auth state listener in _layout.tsx handles redirect
      logger.info('OTP verified successfully');
    } catch (err: any) {
      logger.error('OTP verify failed:', err);
      setError(err.message || 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp(phone);
      setError('');
      logger.info('OTP resent');
    } catch (err: any) {
      logger.error('Resend failed:', err);
      setError('Failed to resend. Try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          Sent to {phone}
        </Text>

        <TextInput
          ref={inputRef}
          style={styles.codeInput}
          placeholder="000000"
          placeholderTextColor="#B5AFA6"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          maxLength={6}
          autoFocus
          textContentType="oneTimeCode"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
        </Pressable>

        <Pressable onPress={handleResend} style={styles.resendButton}>
          <Text style={styles.resendText}>Didn't receive it? Resend</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 32,
  },
  backText: {
    fontSize: 16,
    color: '#1A6B5A',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D2A26',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A8279',
    marginBottom: 32,
  },
  codeInput: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2A26',
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 12,
  },
  error: {
    color: '#C4553A',
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1A6B5A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    color: '#1A6B5A',
    fontSize: 14,
    fontWeight: '500',
  },
});
