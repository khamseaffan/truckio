import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const colors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#E8F0ED', text: '#1A6B5A' },
  warning: { bg: '#FDF5E9', text: '#A07335' },
  error: { bg: '#FDF0EC', text: '#C4553A' },
  info: { bg: '#EBF2FA', text: '#3A6FA0' },
  neutral: { bg: '#F3EDE4', text: '#8A8279' },
};

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const c = colors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
