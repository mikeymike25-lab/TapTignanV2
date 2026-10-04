import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DetailRow } from '@/components/taptignan/DetailRow';
import { COPY } from '@/data/copy';
import { usePaymentStore } from '@/features/payment/usePaymentStore';

export default function SuccessScreen() {
  const router = useRouter();
  const { currentRequest, transactions, resetFlow } = usePaymentStore();
  const [currentTimestamp] = useState(() => Date.now());

  const latestTx = transactions[0];
  const formattedDate = new Date(latestTx?.completedAt || currentTimestamp).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleHome = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  const handleReceipt = () => {
    router.push('/pay/receipt');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />

      {/* Success Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={44} color="#16a34a" />
        </View>
        <Text style={styles.heroTitle}>{COPY.success.title}</Text>
        <Text style={styles.heroAmount}>
          ₱ {(currentRequest?.amount || 850.0).toFixed(2)}
        </Text>
        <Text style={styles.heroSubtitle}>
          Sent to {currentRequest?.recipientName || 'Cafe Manila Inc.'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Verification Guarantee Card */}
        <View style={styles.verifiedCard}>
          <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
          <Text style={styles.verifiedText}>Verified Safe by TapTignan Usable Security</Text>
        </View>

        {/* Transaction Summary Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Transaction Information</Text>

          <DetailRow
            label="Reference No."
            value={latestTx?.id || 'REF-891240182'}
            bold
          />
          <DetailRow
            label="Date & Time"
            value={formattedDate}
          />
          <DetailRow
            label="Merchant"
            value={currentRequest?.merchantName || 'Cafe Manila'}
          />
          <DetailRow
            label="Payment Method"
            value="GCash Wallet"
          />
          <DetailRow
            label="Security Status"
            value="Safe (All Checks Passed)"
            valueColor="#16a34a"
            bold
          />
        </Card>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <Button
          title={COPY.success.ctaReceipt}
          variant="primary"
          size="lg"
          onPress={handleReceipt}
          style={styles.fullBtn}
        />
        <Button
          title={COPY.success.ctaHome}
          variant="secondary"
          size="md"
          onPress={handleHome}
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
  heroHeader: {
    backgroundColor: '#16a34a',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#dcfce7',
    marginTop: 4,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 28,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
    gap: 8,
  },
  verifiedText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#16a34a',
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
  fullBtn: {
    width: '100%',
  },
});
