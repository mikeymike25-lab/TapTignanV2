import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportStatus, Verdict } from '@/types';

type BadgeType = Verdict | ReportStatus;

interface StatusBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ type, size = 'md' }: StatusBadgeProps) {
  const config = {
    safe: {
      label: 'Safe',
      icon: 'shield-checkmark',
      color: '#16a34a',
      bg: '#dcfce7',
      border: '#86efac',
    },
    caution: {
      label: 'Caution',
      icon: 'warning',
      color: '#d97706',
      bg: '#fef3c7',
      border: '#fde68a',
    },
    suspicious: {
      label: 'Suspicious',
      icon: 'alert-circle',
      color: '#dc2626',
      bg: '#fee2e2',
      border: '#fca5a5',
    },
    under_review: {
      label: 'Under Review',
      icon: 'time',
      color: '#0284c7',
      bg: '#e0f2fe',
      border: '#7dd3fc',
    },
    resolved: {
      label: 'Resolved',
      icon: 'checkmark-circle',
      color: '#16a34a',
      bg: '#dcfce7',
      border: '#86efac',
    },
  }[type];

  return (
    <View
      style={[
        styles.badge,
        styles[`size_${size}`],
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <Ionicons
        name={config.icon as any}
        size={size === 'sm' ? 12 : size === 'md' ? 14 : 18}
        color={config.color}
      />
      <Text style={[styles.text, styles[`textSize_${size}`], { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  size_sm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  size_md: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  size_lg: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  text: {
    fontWeight: '700',
  },
  textSize_sm: {
    fontSize: 11,
  },
  textSize_md: {
    fontSize: 12.5,
  },
  textSize_lg: {
    fontSize: 14,
  },
});
