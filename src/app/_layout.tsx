import { useEffect } from 'react';
import { View, AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase/client';
import { fetchUserRole } from '@/services/supabase/auth';
import { logger } from '@/shared/utils/logger';
import { database } from '@/db';
import { syncManager } from '@/sync/SyncManager';
import SyncBanner from '@/shared/components/SyncBanner';
import OfflineBanner from '@/shared/components/OfflineBanner';
import ToastContainer from '@/shared/components/ToastContainer';

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
          syncManager.stopAutoSync();
        }

        setLoading(false);
      }
    );

    // Safety timeout — if auth never resolves (e.g. bad keys), stop loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        logger.warn('Auth state did not resolve in time, defaulting to unauthenticated');
        setLoading(false);
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Start auto-sync once authenticated with a known role
  useEffect(() => {
    if (!isAuthenticated || !role || role === null) return;
    syncManager.startAutoSync(database, supabase);
    return () => syncManager.stopAutoSync();
  }, [isAuthenticated, role]);

  // Re-sync when app comes back to foreground
  useEffect(() => {
    if (!isAuthenticated || !role) return;
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') syncManager.sync(database, supabase);
    });
    return () => sub.remove();
  }, [isAuthenticated, role]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/phone');
    } else if (isAuthenticated && inAuthGroup) {
      if (role === 'driver') {
        router.replace('/(driver)/job');
      } else if (role === 'owner') {
        router.replace('/(owner)/dashboard');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  }, [isAuthenticated, role, isLoading, segments]);
}

export default function RootLayout() {
  useProtectedRoute();

  return (
    <DatabaseProvider database={database}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <OfflineBanner />
        <SyncBanner />
        <ToastContainer />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(owner)" />
          <Stack.Screen name="(driver)" />
        </Stack>
      </View>
    </DatabaseProvider>
  );
}
