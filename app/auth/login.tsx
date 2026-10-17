import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DEMO_ACCOUNTS, useAuthStore } from '@/features/auth/useAuthStore';
import { MpinDots } from '@/components/auth/MpinDots';
import { MpinKeypad } from '@/components/auth/MpinKeypad';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = Math.round(Math.min(SCREEN_HEIGHT * 0.48, SCREEN_WIDTH * 1.1));

export default function LoginScreen() {
  const router = useRouter();
  const {
    user,
    inputMpin,
    isLocked,
    biometricsEnabled,
    appendDigit,
    deleteDigit,
    clearInput,
    verifyMpin,
    authenticateWithBiometrics,
    resetLockout,
    switchAccount,
  } = useAuthStore();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isErrorShake, setIsErrorShake] = useState(false);

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [isLockDismissed, setIsLockDismissed] = useState(false);

  useEffect(() => {
    clearInput();
  }, [clearInput]);

  const handleDigitPress = (digit: string) => {
    if (isLocked) {
      setIsLockDismissed(false);
      return;
    }
    setErrorMessage(null);
    setIsErrorShake(false);

    const nextMpin = appendDigit(digit);

    // Auto-verify as soon as 4 digits are entered
    if (nextMpin.length === 4) {
      setTimeout(() => {
        const result = verifyMpin(nextMpin);

        if (result.success) {
          router.replace('/(tabs)');
        } else {
          if (Platform.OS !== 'web') {
            try {
              Vibration.vibrate([0, 80, 40, 80]);
            } catch {
              // ignore
            }
          }
          setIsErrorShake(true);

          if (result.isLocked) {
            setErrorMessage('Account locked for 24h (5 failed attempts).');
            setIsLockDismissed(false);
          } else {
            setErrorMessage(`Incorrect MPIN. (${result.attemptsLeft} attempts left)`);
          }
        }
      }, 120);
    }
  };

  const handleBiometricsPress = () => {
    if (isLocked) {
      setIsLockDismissed(false);
      return;
    }
    setShowBiometricModal(true);
    setBiometricSuccess(false);

    setTimeout(() => {
      setBiometricSuccess(true);
      setTimeout(() => {
        setShowBiometricModal(false);
        const success = authenticateWithBiometrics();
        if (success) {
          router.replace('/(tabs)');
        }
      }, 600);
    }, 800);
  };

  const handleResetLockout = () => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(30);
      } catch {
        // ignore
      }
    }
    resetLockout();
    clearInput();
    setIsLockDismissed(false);
    setErrorMessage(null);
    setIsErrorShake(false);
  };

  const handleForgotMpinReset = () => {
    resetLockout();
    clearInput();
    setShowForgotModal(false);
    setIsLockDismissed(false);
    setErrorMessage(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* TOP HALF: Clean Scenic Wallpaper (wp2506840.jpg) */}
      <View style={[styles.topBannerContainer, { height: BANNER_HEIGHT }]}>
        <ImageBackground
          source={require('../../assets/login-bg-portrait.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Subtle gradient overlay for text readability */}
          <View style={styles.gradientOverlay} />

          <SafeAreaView style={styles.bannerContent} edges={['top']}>
            {/* Top Header Bar with Centered GCash Logo and Minimal White Warning Reset Button */}
            <View style={styles.topHeaderRow}>
              <View style={styles.topHeaderSpacer} />
              <View style={styles.brandRow}>
                <Image
                  source={require('../../assets/gcash-logo.png')}
                  style={styles.gcashLogoIcon}
                  tintColor="#ffffff"
                  resizeMode="contain"
                />
                <Text style={styles.gcashBrandText}>GCash</Text>
              </View>
              <TouchableOpacity
                style={styles.topResetBtn}
                onPress={handleResetLockout}
                hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                activeOpacity={0.65}
                accessibilityRole="button"
                accessibilityLabel="Reset Lockout"
              >
                <Ionicons name="warning-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Center Interactive Elements: Phone Capsule, MPIN Prompt, 4 Dots */}
            <View style={styles.centerAuthSection}>
              {/* Phone Number Capsule Pill */}
              <TouchableOpacity
                style={styles.phonePill}
                onPress={() => setShowSwitchModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.phonePillText}>{user.phone}</Text>
                <Ionicons name="swap-horizontal" size={20} color="#ffffff" style={styles.swapIcon} />
              </TouchableOpacity>

              {/* Prompt: Enter your MPIN */}
              <Text style={styles.mpinPromptText}>Enter your MPIN</Text>

              {/* 4 Interactive MPIN Dots */}
              <View style={styles.dotsWrapper}>
                <MpinDots length={inputMpin.length} isError={isErrorShake} />
              </View>

              {/* Error Badge if wrong PIN entered */}
              {errorMessage ? (
                <View style={styles.errorFloatingBadge}>
                  <Ionicons name="alert-circle" size={14} color="#ffffff" />
                  <Text style={styles.errorFloatingText}>{errorMessage}</Text>
                </View>
              ) : (
                <View style={styles.errorPlaceholder} />
              )}
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      {/* BOTTOM HALF: Pure White Background with Frameless Keypad & Footer Links */}
      <View style={styles.bottomKeypadContainer}>
        <MpinKeypad
          onPressDigit={handleDigitPress}
          onPressBackspace={deleteDigit}
          onPressBiometrics={handleBiometricsPress}
          onPressHelp={() => setShowHelpModal(true)}
          onPressForgot={() => setShowForgotModal(true)}
          inputLength={inputMpin.length}
          biometricsEnabled={biometricsEnabled}
        />
      </View>

      {/* Help Center Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="help-circle" size={26} color="#0073f6" />
              <Text style={styles.modalTitle}>GCash Help Center</Text>
            </View>
            <Text style={styles.modalText}>
              Your 4-digit MPIN is your personal password to open your GCash account.
              Never share your MPIN or One-Time Password (OTP) with anyone.
            </Text>
            <View style={styles.tipBox}>
              <Ionicons name="information-circle" size={18} color="#0073f6" />
              <Text style={styles.tipText}>
                Official GCash representatives will NEVER ask for your MPIN or OTP.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => setShowHelpModal(false)}
            >
              <Text style={styles.modalPrimaryBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Switch Account Modal */}
      <Modal
        visible={showSwitchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSwitchModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="people-outline" size={26} color="#0073f6" />
              <Text style={styles.modalTitle}>Switch Account</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Select an account to test GCash login authentication:
            </Text>

            <View style={styles.accountList}>
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = acc.phone === user.phone;
                return (
                  <TouchableOpacity
                    key={acc.phone}
                    style={[styles.accountItem, isSelected && styles.accountItemSelected]}
                    onPress={() => {
                      switchAccount(acc);
                      setShowSwitchModal(false);
                      setErrorMessage(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.accountItemAvatar}>
                      <Text style={styles.accountItemAvatarText}>{acc.initials}</Text>
                    </View>
                    <View style={styles.accountItemInfo}>
                      <Text style={styles.accountItemName}>{acc.name}</Text>
                      <Text style={styles.accountItemPhone}>{acc.phone}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color="#0073f6" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => setShowSwitchModal(false)}
            >
              <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Forgot MPIN Modal */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="key-outline" size={26} color="#0073f6" />
              <Text style={styles.modalTitle}>Forgot MPIN?</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              In this academic prototype, you can reset your MPIN back to the default demo PIN:
            </Text>

            <View style={styles.defaultPinBox}>
              <Text style={styles.defaultPinLabel}>Primary Real MPIN</Text>
              <Text style={styles.defaultPinCode}>1 2 3 4</Text>
              <Text style={styles.pinRoleSubtext}>Opens Real Wallet (₱100,367.00)</Text>
            </View>

            <View style={[styles.defaultPinBox, styles.duressPinBox]}>
              <Text style={[styles.defaultPinLabel, styles.duressPinLabel]}>
                {"\"Bantay-Pera\" Duress MPIN"}
              </Text>
              <Text style={[styles.defaultPinCode, styles.duressPinCode]}>9 9 9 9</Text>
              <Text style={styles.pinRoleSubtext}>
                Opens Decoy Coercion Wallet (₱48.50)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={handleForgotMpinReset}
              activeOpacity={0.8}
            >
              <Text style={styles.modalPrimaryBtnText}>Reset to 1234 & Unlock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => setShowForgotModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Biometric Scan Simulation Modal */}
      <Modal
        visible={showBiometricModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBiometricModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.biometricCard}>
            <Ionicons
              name={biometricSuccess ? 'checkmark-circle' : 'finger-print'}
              size={56}
              color={biometricSuccess ? '#16a34a' : '#0073f6'}
            />
            <Text style={styles.biometricTitle}>
              {biometricSuccess ? 'Biometrics Verified!' : 'GCash Biometrics'}
            </Text>
            <Text style={styles.biometricSubtitle}>
              {biometricSuccess
                ? 'Welcome back!'
                : 'Touch the fingerprint sensor or face verification'}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Lockout Alert Modal */}
      <Modal
        visible={isLocked && !isLockDismissed}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLockDismissed(true)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="lock-closed" size={48} color="#ef4444" />
            <Text style={[styles.modalTitle, { marginTop: 12 }]}>Account Temporarily Locked</Text>
            <Text style={styles.modalSubtitle}>
              You have entered an incorrect MPIN 5 consecutive times. Your account is temporarily locked for 24 hours.
            </Text>

            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { backgroundColor: '#0073f6', marginTop: 8 }]}
              onPress={() => setIsLockDismissed(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalPrimaryBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBannerContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  bannerContent: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  topHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  topHeaderSpacer: {
    width: 36,
    height: 36,
  },
  topResetBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gcashLogoIcon: {
    width: 38,
    height: 38,
  },
  gcashBrandText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  centerAuthSection: {
    alignItems: 'center',
    width: '100%',
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0073f6', // Exact vibrant GCash blue capsule
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginBottom: 16,
    boxShadow: '0px 4px 12px rgba(0, 115, 246, 0.45)',
  },
  phonePillText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  swapIcon: {
    marginLeft: 8,
  },
  mpinPromptText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dotsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  errorFloatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  errorFloatingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  errorPlaceholder: {
    height: 24,
    marginTop: 8,
  },
  bottomKeypadContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-end',
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalText: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
    fontWeight: '500',
  },
  modalPrimaryBtn: {
    backgroundColor: '#0073f6',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  modalSecondaryBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  accountList: {
    width: '100%',
    gap: 10,
    marginBottom: 14,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  accountItemSelected: {
    borderColor: '#0073f6',
    backgroundColor: '#eff6ff',
  },
  accountItemAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountItemAvatarText: {
    color: '#0073f6',
    fontSize: 15,
    fontWeight: '700',
  },
  accountItemInfo: {
    flex: 1,
  },
  accountItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  accountItemPhone: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  defaultPinBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  defaultPinLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  defaultPinCode: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0073f6',
    letterSpacing: 6,
    marginTop: 6,
  },
  pinRoleSubtext: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  duressPinBox: {
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
  },
  duressPinLabel: {
    color: '#b45309',
  },
  duressPinCode: {
    color: '#d97706',
  },
  biometricCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  biometricTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 14,
  },
  biometricSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
