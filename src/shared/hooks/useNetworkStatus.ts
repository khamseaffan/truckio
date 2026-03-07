import { useState, useEffect } from 'react';
// TODO: Replace with @react-native-community/netinfo when installed
// import NetInfo from '@react-native-community/netinfo';

/** Hook to track online/offline status */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // TODO: Wire up NetInfo listener
    // const unsubscribe = NetInfo.addEventListener(state => {
    //   setIsOnline(state.isConnected ?? true);
    // });
    // return () => unsubscribe();
  }, []);

  return { isOnline };
}
