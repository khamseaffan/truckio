import { useState, useCallback } from 'react';
// TODO: Wire up expo-location and expo-notifications

/** Hook to manage app permissions (location, notifications) */
export function usePermissions() {
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  const requestLocation = useCallback(async () => {
    // TODO: Request location permission via expo-location
    setLocationGranted(true);
  }, []);

  const requestNotifications = useCallback(async () => {
    // TODO: Request notification permission via expo-notifications
    setNotificationsGranted(true);
  }, []);

  return { locationGranted, notificationsGranted, requestLocation, requestNotifications };
}
