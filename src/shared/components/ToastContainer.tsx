import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUiStore } from '@/store/uiStore';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const BG: Record<ToastType, string> = {
  success: '#1A6B5A',
  error: '#C0392B',
  warning: '#D68910',
  info: '#2C3E7A',
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; message: string; type: ToastType };
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <View style={[styles.toast, { backgroundColor: BG[toast.type] ?? BG.info }]}>
      <Text style={styles.message}>{toast.message}</Text>
    </View>
  );
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
