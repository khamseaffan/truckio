import { supabase } from './client';
import { logger } from '@/shared/utils/logger';

/** Send OTP to phone number */
export async function sendOtp(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({ phone });
  if (error) {
    logger.error('sendOtp failed:', error.message);
    throw error;
  }
  return data;
}

/** Verify OTP code */
export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) {
    logger.error('verifyOtp failed:', error.message);
    throw error;
  }
  return data;
}

/** Sign in with Google (ID token from Google Sign-In) */
// Uncomment when Google provider is enabled in Supabase
// export async function signInWithGoogle(idToken: string) {
//   const { data, error } = await supabase.auth.signInWithIdToken({
//     provider: 'google',
//     token: idToken,
//   });
//   if (error) {
//     logger.error('Google sign-in failed:', error.message);
//     throw error;
//   }
//   return data;
// }

/** Get current session */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    logger.error('getSession failed:', error.message);
    return null;
  }
  return data.session;
}

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    logger.error('signOut failed:', error.message);
    throw error;
  }
}

/** Fetch user role from owners/drivers table */
export async function fetchUserRole(userId: string): Promise<'owner' | 'driver' | null> {
  // Check owners table first
  const { data: owner } = await supabase
    .from('owners')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (owner) return 'owner';

  // Check drivers table
  const { data: driver } = await supabase
    .from('drivers')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (driver) return 'driver';

  return null;
}
