import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MpinKeypadProps {
  onPressDigit: (digit: string) => void;
  onPressBackspace: () => void;
  onPressBiometrics: () => void;
  onPressHelp: () => void;
  onPressForgot: () => void;
  inputLength: number;
  biometricsEnabled?: boolean;
  disabled?: boolean;
}

export function MpinKeypad({
  onPressDigit,
  onPressBackspace,
  onPressBiometrics,
  onPressHelp,
  onPressForgot,
  inputLength,
  biometricsEnabled = true,
  disabled = false,
}: MpinKeypadProps) {
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(20);
      } catch {
        // ignore if not supported
      }
    }
  };

  const handleDigit = (digit: string) => {
    if (disabled) return;
    triggerHaptic();
    onPressDigit(digit);
  };

  const handleBackspace = () => {
    if (disabled) return;
    triggerHaptic();
    onPressBackspace();
  };

  const handleBiometrics = () => {
    if (disabled) return;
    triggerHaptic();
    onPressBiometrics();
  };

  const ROWS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  const showBackspace = inputLength > 0;

  return (
    <View style={styles.container}>
      {/* 3x4 Number Grid */}
      <View style={styles.grid}>
        {ROWS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((digit) => (
              <TouchableOpacity
                key={digit}
                style={styles.key}
                onPress={() => handleDigit(digit)}
                activeOpacity={0.5}
                disabled={disabled}
              >
                <Text style={styles.digitText}>{digit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Bottom Row: Biometrics (or blank), 0, Backspace (or blank) */}
        <View style={styles.row}>
          {/* Left Action: Biometrics */}
          <TouchableOpacity
            style={styles.key}
            onPress={handleBiometrics}
            activeOpacity={0.6}
            disabled={disabled || !biometricsEnabled}
          >
            {biometricsEnabled ? (
              <Ionicons name="finger-print-outline" size={28} color="#002060" />
            ) : (
              <View style={styles.emptyKey} />
            )}
          </TouchableOpacity>

          {/* Center: 0 */}
          <TouchableOpacity
            style={styles.key}
            onPress={() => handleDigit('0')}
            activeOpacity={0.5}
            disabled={disabled}
          >
            <Text style={styles.digitText}>0</Text>
          </TouchableOpacity>

          {/* Right Action: Backspace */}
          <TouchableOpacity
            style={styles.key}
            onPress={handleBackspace}
            activeOpacity={0.6}
            disabled={disabled || !showBackspace}
          >
            {showBackspace ? (
              <Ionicons name="backspace-outline" size={28} color="#002060" />
            ) : (
              <View style={styles.emptyKey} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Footer Actions: Help Center & Forgot MPIN? */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          onPress={onPressHelp}
          activeOpacity={0.7}
          style={styles.footerBtn}
        >
          <Text style={styles.footerLinkText}>Help Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPressForgot}
          activeOpacity={0.7}
          style={styles.footerBtn}
        >
          <Text style={styles.footerLinkText}>Forgot MPIN?</Text>
        </TouchableOpacity>
      </View>

      {/* Home Bar Indicator */}
      <View style={styles.homeBarWrap}>
        <View style={styles.homeBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    paddingTop: 10,
    paddingBottom: 8,
  },
  grid: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 58,
  },
  key: {
    width: 80,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  digitText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#002060', // Exact royal blue from GCash screenshot
    letterSpacing: 0.5,
  },
  emptyKey: {
    width: 28,
    height: 28,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 24,
    paddingBottom: 12,
  },
  footerBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  footerLinkText: {
    color: '#0073f6',
    fontSize: 14,
    fontWeight: '700',
  },
  homeBarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  homeBar: {
    width: 134,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
  },
});
