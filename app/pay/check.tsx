import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { COPY } from '@/data/copy';
import { MOCK_REGISTRY } from '@/data/mock/registry';
import { usePaymentStore } from '@/features/payment/usePaymentStore';
import { useReportStore } from '@/features/reports/useReportStore';
import { evaluatePayment } from '@/features/security/evaluatePayment';

export default function CheckScreen() {
  const router = useRouter();
  const { currentRequest, setChecking, setResult } = usePaymentStore();
  const { getReportedQrs } = useReportStore();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // Gate check
  useEffect(() => {
    if (!currentRequest) {
      router.replace('/(tabs)');
      return;
    }
    setChecking();
  }, [currentRequest, router, setChecking]);

  // Shield pulsing animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Execute verification sequence with animated progress (FR-06, NFR-01)
  useEffect(() => {
    if (!currentRequest) return;

    // Step 1: QR Information (0ms -> 700ms)
    const t1 = setTimeout(() => {
      setActiveStep(2);
    }, 700);

    // Step 2: Recipient Details (700ms -> 1400ms)
    const t2 = setTimeout(() => {
      setActiveStep(3);
    }, 1400);

    // Step 3: Security Indicators (1400ms -> 2200ms)
    const t3 = setTimeout(() => {
      setActiveStep(4); // All done
      // Evaluate pure security engine
      const reportedQrs = getReportedQrs();
      const evalResult = evaluatePayment(currentRequest, {
        registry: MOCK_REGISTRY,
        reportedQrs,
      });

      setResult(evalResult);
      router.replace('/pay/result');
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentRequest, getReportedQrs, router, setResult]);

  if (!currentRequest) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f8ff" />

      <View style={styles.content}>
        {/* Pulsing Shield Icon Animation */}
        <Animated.View
          style={[styles.shieldOuter, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={styles.shieldInner}>
            <Image
              source={require('@/../assets/logos/taptignan-inspect-qr.png')}
              style={styles.shieldLogo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Text style={styles.title}>{COPY.checking.title}</Text>
        <Text style={styles.subtitle}>{COPY.checking.subtitle}</Text>

        {/* 3 Progress Verification Steps (FR-06) */}
        <Card style={styles.stepsCard}>
          {/* Step 1 */}
          <View style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              {activeStep > 1 ? (
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              ) : (
                <ActivityIndicator size="small" color="#0073f6" />
              )}
            </View>
            <View style={styles.stepTextWrap}>
              <Text
                style={[
                  styles.stepTitle,
                  activeStep >= 1 && styles.stepTitleActive,
                ]}
              >
                1. QR Code Information
              </Text>
              <Text style={styles.stepDesc}>{COPY.checking.step1}</Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.stepRow}>
            <View style={styles.stepIconWrap}>
              {activeStep > 2 ? (
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              ) : activeStep === 2 ? (
                <ActivityIndicator size="small" color="#0073f6" />
              ) : (
                <Ionicons name="ellipse-outline" size={20} color="#cbd5e1" />
              )}
            </View>
            <View style={styles.stepTextWrap}>
              <Text
                style={[
                  styles.stepTitle,
                  activeStep >= 2 && styles.stepTitleActive,
                ]}
              >
                2. Recipient & Merchant Details
              </Text>
              <Text style={styles.stepDesc}>{COPY.checking.step2}</Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={[styles.stepRow, styles.stepRowLast]}>
            <View style={styles.stepIconWrap}>
              {activeStep > 3 ? (
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              ) : activeStep === 3 ? (
                <ActivityIndicator size="small" color="#0073f6" />
              ) : (
                <Ionicons name="ellipse-outline" size={20} color="#cbd5e1" />
              )}
            </View>
            <View style={styles.stepTextWrap}>
              <Text
                style={[
                  styles.stepTitle,
                  activeStep >= 3 && styles.stepTitleActive,
                ]}
              >
                3. Security Risk Indicators
              </Text>
              <Text style={styles.stepDesc}>{COPY.checking.step3}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.footerNoteRow}>
          <Image
            source={require('@/../assets/logos/taptignan-inspect-qr.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.securityFooterNote}>
            Powered by TapTignan Usable Security Engine
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8ff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  shieldInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0073f6',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  shieldLogo: {
    width: 52,
    height: 52,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748b',
    marginTop: 6,
    marginBottom: 24,
    textAlign: 'center',
  },
  stepsCard: {
    width: '100%',
    padding: 18,
    borderRadius: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stepRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  stepIconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepTextWrap: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
  },
  stepTitleActive: {
    color: '#0a1e4a',
  },
  stepDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  securityFooterNote: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 24,
    fontWeight: '600',
  },
});
