import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { DetailRow } from '@/components/taptignan/DetailRow';
import { StatusBadge } from '@/components/taptignan/StatusBadge';
import { COPY } from '@/data/copy';
import { usePaymentStore } from '@/features/payment/usePaymentStore';

export default function ReceiptScreen() {
  const router = useRouter();
  const { currentRequest, transactions, resetFlow } = usePaymentStore();
  const [currentTimestamp] = useState(() => Date.now());

  const tx = transactions[0];
  const formattedDate = new Date(tx?.completedAt || currentTimestamp).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleDone = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header title={COPY.receipt.title} onBack={handleDone} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Receipt Paper Card */}
        <Card style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View style={styles.brandRow}>
              <View style={styles.gcashDot}>
                <Text style={styles.gcashDotText}>G</Text>
              </View>
              <Text style={styles.brandTitle}>GCash Receipt</Text>
            </View>
            <StatusBadge type="safe" size="sm" />
          </View>

          <View style={styles.divider} />

          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>TOTAL AMOUNT PAID</Text>
            <Text style={styles.amountValue}>
              ₱ {(tx?.payment.amount || currentRequest?.amount || 850.0).toFixed(2)}
            </Text>
            <Text style={styles.paymentMethod}>Paid via GCash Wallet</Text>
          </View>

          <View style={styles.divider} />

          {/* Details list */}
          <DetailRow
            label={COPY.receipt.refNo}
            value={tx?.id || 'REF-891240182'}
            bold
          />
          <DetailRow
            label={COPY.receipt.dateTime}
            value={formattedDate}
          />
          <DetailRow
            label={COPY.receipt.paidTo}
            value={tx?.payment.recipientName || currentRequest?.recipientName || 'Cafe Manila Inc.'}
            bold
          />
          <DetailRow
            label="Merchant Business"
            value={tx?.payment.merchantName || currentRequest?.merchantName || 'Cafe Manila'}
          />
          <DetailRow
            label={COPY.receipt.fee}
            value="₱ 0.00"
          />

          <View style={styles.divider} />

          {/* Security Verification Seal */}
          <View style={styles.sealContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#0073f6" />
            <View style={styles.sealTextWrap}>
              <Text style={styles.sealTitle}>TapTignan Usable Security</Text>
              <Text style={styles.sealDesc}>
                This transaction completed pre-payment verification against official registry records.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Done Footer */}
      <View style={styles.footer}>
        <Button
          title="Done"
          variant="primary"
          size="lg"
          onPress={handleDone}
          style={styles.fullBtn}
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
    paddingBottom: 28,
  },
  receiptCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gcashDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0073f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gcashDotText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  amountBlock: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0a1e4a',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#0073f6',
    fontWeight: '600',
    marginTop: 4,
  },
  sealContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  sealTextWrap: {
    flex: 1,
  },
  sealTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0073f6',
  },
  sealDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    lineHeight: 15,
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#eef3f8',
  },
  fullBtn: {
    width: '100%',
  },
});
