import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/phone" />;
  }

  if (role === 'driver') {
    return <Redirect href="/(driver)/job" />;
  }

  return <Redirect href="/(owner)/dashboard" />;
}
