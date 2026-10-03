import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const isInteractive = !loading && !disabled;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!isInteractive}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#0073f6' : '#ffffff'}
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: '#0073f6',
  },
  secondary: {
    backgroundColor: '#eaf3ff',
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0073f6',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 38,
  },
  size_md: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  size_lg: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    minHeight: 54,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  text_primary: {
    color: '#ffffff',
  },
  text_secondary: {
    color: '#0073f6',
  },
  text_danger: {
    color: '#ffffff',
  },
  text_outline: {
    color: '#0073f6',
  },
  text_ghost: {
    color: '#64748b',
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 16,
  },
});
