import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/features/settings/useSettingsStore';

export function ProtectionBanner() {
  const router = useRouter();
  const { protectionEnabled } = useSettingsStore();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.iconWrap, !protectionEnabled && styles.iconWrapDisabled]}>
          <Ionicons
            name={protectionEnabled ? 'shield-checkmark' : 'shield-outline'}
            size={22}
            color={protectionEnabled ? '#0073f6' : '#94a3b8'}
          />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>
            {protectionEnabled ? 'TapTignan Protection Active' : 'Protection Paused'}
          </Text>
          <Text style={styles.subtitle}>
            {protectionEnabled
              ? 'Pre-payment verification guards every QR scan'
              : 'Tap to re-enable QR verification'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() => router.push('/(tabs)/scan')}
        activeOpacity={0.85}
      >
        <Ionicons name="qr-code" size={15} color="#0073f6" />
        <Text style={styles.scanBtnText}>Verify QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 6,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#dbeafe',
    shadowColor: '#0073f6',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eaf3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconWrapDisabled: {
    backgroundColor: '#f1f5f9',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  scanBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0073f6',
  },
});
