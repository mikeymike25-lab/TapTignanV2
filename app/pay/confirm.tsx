import { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { DetailRow } from '@/components/taptignan/DetailRow';
import { COPY } from '@/data/copy';
import { usePaymentStore } from '@/features/payment/usePaymentStore';

export default function ConfirmScreen() {
  const router = useRouter();
  const { currentRequest, status, cancelPayment } = usePaymentStore();

  useEffect(() => {
    if (!currentRequest || status === 'idle') {
      router.replace('/(tabs)');
    }
  }, [currentRequest, status, router]);

  if (!currentRequest) return null;

  const handleContinue = () => {
    router.push('/pay/check');
  };

  const handleCancel = () => {
    cancelPayment();
    router.replace('/(tabs)');
  };

  // Mask middle digits of phone number
  const maskedNumber = currentRequest.recipientNumber.replace(
    /(\+63\s?\d{3})\s?(\d{3})\s?(\d{4})/,
    '$1 *** $3'
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header title={COPY.confirm.title} onBack={handleCancel} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pre-Payment Security Check Notice Banner (FR-05) */}
        <View style={styles.securityNotice}>
          <View style={styles.noticeIconWrap}>
            <Ionicons name="shield-checkmark" size={24} color="#0073f6" />
          </View>
          <View style={styles.noticeTextWrap}>
            <Text style={styles.noticeTitle}>{COPY.confirm.noticeHeader}</Text>
            <Text style={styles.noticeText}>{COPY.confirm.noticeText}</Text>
          </View>
        </View>

        {/* Amount Summary Hero */}
        <View style={styles.amountHero}>
          <Text style={styles.amountHeroLabel}>AMOUNT TO PAY</Text>
          <Text style={styles.amountHeroValue}>₱ {currentRequest.amount.toFixed(2)}</Text>
          <Text style={styles.amountHeroMethod}>Source: {currentRequest.method}</Text>
        </View>

        {/* Recipient & Payment Details Card (FR-04) */}
        <Card style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Payment Summary</Text>

          <DetailRow
            label={COPY.confirm.merchantLabel}
            value={currentRequest.merchantName}
            bold
          />
          <DetailRow
            label={COPY.confirm.recipientLabel}
            value={currentRequest.recipientName}
          />
          <DetailRow
            label={COPY.confirm.accountNumberLabel}
            value={maskedNumber}
          />
          <DetailRow
            label={COPY.confirm.amountLabel}
            value={`₱ ${currentRequest.amount.toFixed(2)}`}
          />
          <DetailRow
            label={COPY.confirm.feeLabel}
            value={`₱ ${currentRequest.fee.toFixed(2)}`}
          />
          <DetailRow
            label={COPY.confirm.totalLabel}
            value={`₱ ${(currentRequest.amount + currentRequest.fee).toFixed(2)}`}
            highlight
            bold
          />
        </Card>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <Button
          title={COPY.confirm.ctaCheck}
          variant="primary"
          size="lg"
          onPress={handleContinue}
          style={styles.ctaButton}
        />
        <Button
          title={COPY.confirm.ctaCancel}
          variant="ghost"
          size="md"
          onPress={handleCancel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8ff',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 24,
  },
  securityNotice: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#b9dbfd',
    marginBottom: 16,
    shadowColor: '#0073f6',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  noticeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eaf3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  noticeTextWrap: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  noticeText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
    lineHeight: 17,
  },
  amountHero: {
    backgroundColor: '#0073f6',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0073f6',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  amountHeroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d6e7ff',
    letterSpacing: 0.8,
  },
  amountHeroValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  amountHeroMethod: {
    fontSize: 12,
    color: '#e0efff',
    marginTop: 4,
  },
  detailsCard: {
    padding: 18,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0a1e4a',
    marginBottom: 8,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#eef3f8',
    gap: 8,
  },
  ctaButton: {
    width: '100%',
  },
});
