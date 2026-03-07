import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { sendOtp } from '@/services/supabase/auth';
// import { supabase } from '@/services/supabase/client';
// import * as AuthSession from 'expo-auth-session';
// import * as WebBrowser from 'expo-web-browser';
import { logger } from '@/shared/utils/logger';

// WebBrowser.maybeCompleteAuthSession();

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      setError('Enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhone = cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;
      await sendOtp(fullPhone);
      router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
    } catch (err: any) {
      logger.error('OTP send failed:', err);
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Google Sign-In (uncomment when Google provider is enabled in Supabase) ---
  // const handleGoogleSignIn = async () => {
  //   try {
  //     setLoading(true);
  //     setError('');
  //     const redirectUrl = AuthSession.makeRedirectUri();
  //     const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
  //       provider: 'google',
  //       options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
  //     });
  //     if (oauthError) throw oauthError;
  //     if (!data.url) throw new Error('No OAuth URL returned');
  //     const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
  //     if (result.type === 'success') {
  //       const url = result.url;
  //       const params = new URLSearchParams(url.split('#')[1] || '');
  //       const accessToken = params.get('access_token');
  //       const refreshToken = params.get('refresh_token');
  //       if (accessToken && refreshToken) {
  //         await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  //         logger.info('Google Sign-In successful');
  //       }
  //     }
  //   } catch (err: any) {
  //     logger.error('Google Sign-In failed:', err);
  //     setError(err.message || 'Google Sign-In failed. Try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>Trukio</Text>
        <Text style={styles.title}>Enter your phone number</Text>
        <Text style={styles.subtitle}>
          We'll send you a one-time code to verify
        </Text>

        <View style={styles.inputRow}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="98765 43210"
            placeholderTextColor="#B5AFA6"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={12}
            autoFocus
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send OTP'}
          </Text>
        </Pressable>

        {/* Google Sign-In — uncomment when provider is enabled */}
        {/* <Text style={styles.divider}>or</Text>
        <Pressable style={styles.googleButton} onPress={handleGoogleSignIn}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </Pressable> */}
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
  logo: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '900',
    color: '#1A6B5A',
    marginBottom: 40,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  prefix: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D2A26',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#2D2A26',
    paddingVertical: 16,
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
  divider: {
    textAlign: 'center',
    color: '#B5AFA6',
    fontSize: 14,
    marginVertical: 20,
  },
  googleButton: {
    borderWidth: 1.5,
    borderColor: '#E8E2D9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  googleButtonText: {
    color: '#2D2A26',
    fontSize: 16,
    fontWeight: '600',
  },
});
