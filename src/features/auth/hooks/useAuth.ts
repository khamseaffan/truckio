import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import * as authService from '@/services/supabase/auth';
import { logger } from '@/shared/utils/logger';

/** Central auth hook used by auth screens */
export function useAuth() {
  const { setSession, setRole, setLoading, reset } = useAuthStore();

  const sendOtp = useCallback(async (phone: string) => {
    await authService.sendOtp(phone);
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const data = await authService.verifyOtp(phone, code);
    if (data.session) {
      setSession(data.session);
      const role = await authService.fetchUserRole(data.session.user.id);
      setRole(role);
    }
    return data;
  }, []);

  // --- Google Sign-In (uncomment when Google provider is enabled) ---
  // const signInWithGoogle = useCallback(async (idToken: string) => {
  //   const data = await authService.signInWithGoogle(idToken);
  //   if (data.session) {
  //     setSession(data.session);
  //     const role = await authService.fetchUserRole(data.session.user.id);
  //     setRole(role);
  //   }
  //   return data;
  // }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    reset();
    logger.info('User signed out');
  }, []);

  return { sendOtp, verifyOtp, /* signInWithGoogle, */ signOut };
}
