import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { useSettingsStore } from '@/features/settings/useSettingsStore';

export default function ProfileScreen() {
  const { demoMode, protectionEnabled, toggleDemoMode, toggleProtection, resetDemoData } =
    useSettingsStore();

  const handleReset = () => {
    Alert.alert(
      'Reset Demo Data',
      'This will clear all saved security reports, reset transactions, and restore the demo state to a clean slate.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All Data',
          style: 'destructive',
          onPress: async () => {
            await resetDemoData();
            Alert.alert('Reset Complete', 'All demo data and reports have been cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Security Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Juan Dela Cruz</Text>
            <Text style={styles.userPhone}>+63 908 *** 6789</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
              <Text style={styles.verifiedText}>Fully Verified Account</Text>
            </View>
          </View>
        </Card>

        {/* TapTignan Security Settings */}
        <Text style={styles.sectionHeader}>TapTignan Usable Security</Text>

        <Card style={styles.settingsCard}>
          {/* Protection Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: '#eaf3ff' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#0073f6" />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingTitle}>Pre-Payment Verification</Text>
                <Text style={styles.settingDesc}>
                  Mandatory security check between scan and send funds
                </Text>
              </View>
            </View>
            <Switch
              value={protectionEnabled}
              onValueChange={toggleProtection}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={protectionEnabled ? '#0073f6' : '#f8fafc'}
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Demo Mode Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="flask" size={20} color="#d97706" />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingTitle}>Demo Mode Simulation</Text>
                <Text style={styles.settingDesc}>
                  Enables one-tap test scenarios on the QR scanner screen
                </Text>
              </View>
            </View>
            <Switch
              value={demoMode}
              onValueChange={toggleDemoMode}
              trackColor={{ false: '#cbd5e1', true: '#fde68a' }}
              thumbColor={demoMode ? '#d97706' : '#f8fafc'}
            />
          </View>
        </Card>

        {/* Demo Management (FR-21) */}
        <Text style={styles.sectionHeader}>Testing & Session Management</Text>

        <Card style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.resetButtonRow}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={[styles.settingTitle, { color: '#dc2626' }]}>
                  Reset Demo Data
                </Text>
                <Text style={styles.settingDesc}>
                  Clears reports, transaction history, and resets demo counters
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </Card>

        {/* Academic Project Info */}
        <Card style={styles.academicCard}>
          <Text style={styles.academicTitle}>About TapTignan Project</Text>
          <Text style={styles.academicBody}>
            IT 021 Usable Security • Group 7 • BSIT-IT31S4{'\n'}
            Technological Institute of the Philippines, Quezon City{'\n'}
            Instructor: Allan A. Burgos
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8ff',
  },
  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eef3f8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 28,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 20,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0073f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  userPhone: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16a34a',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0a1e4a',
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    padding: 6,
    marginBottom: 18,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  resetButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a1e4a',
  },
  settingDesc: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 12,
  },
  academicCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  academicTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0a1e4a',
    marginBottom: 4,
  },
  academicBody: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});
