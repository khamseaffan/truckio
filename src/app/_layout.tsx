import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/client';
import { fetchUserRole } from '@/services/supabase/auth';
import { logger } from '@/shared/utils/logger';

/** Redirect based on auth state and role */
function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, role, isLoading, setSession, setRole, setLoading } =
    useAuthStore();

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        logger.info('Auth state changed:', _event);
        setSession(session);

        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id);
          setRole(userRole);
        } else {
          setRole(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not signed in — redirect to auth
      router.replace('/(auth)/phone');
    } else if (isAuthenticated && inAuthGroup) {
      // Signed in but still on auth screen — redirect to correct role
      if (role === 'driver') {
        router.replace('/(driver)/job');
      } else {
        // Default to owner (or onboarding if no role)
        router.replace('/(owner)/dashboard');
      }
    }
  }, [isAuthenticated, role, isLoading, segments]);
}

export default function RootLayout() {
  useProtectedRoute();

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(owner)" />
        <Stack.Screen name="(driver)" />
      </Stack>
    </>
  );
}
