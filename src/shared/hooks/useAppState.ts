import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/** Hook to track foreground/background state */
export function useAppState() {
  const appState = useRef(AppState.currentState);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      appState.current = nextState;
      setIsActive(nextState === 'active');
    });

    return () => subscription.remove();
  }, []);

  return { isActive, appState: appState.current };
}
