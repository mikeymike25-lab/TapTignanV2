import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { DetailRow } from '@/components/taptignan/DetailRow';
import { FindingItem } from '@/components/taptignan/FindingItem';
import { usePaymentStore } from '@/features/payment/usePaymentStore';

export default function ReportDetailsScreen() {
  const router = useRouter();
  const { currentRequest, checkResult } = usePaymentStore();

  const failedFindings = checkResult?.findings.filter((f) => !f.passed) || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header title="Report Pre-Check" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Ionicons name="shield-outline" size={24} color="#dc2626" />
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>Transaction Flag Review</Text>
            <Text style={styles.bannerDesc}>
              Review the captured details before submitting your fraud report.
            </Text>
          </View>
        </View>

        {currentRequest && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Captured Payment Data</Text>
            <DetailRow
              label="Merchant"
              value={currentRequest.merchantName}
              bold
            />
            <DetailRow
              label="Recipient Name"
              value={currentRequest.recipientName}
            />
            <DetailRow
              label="Account / Phone"
              value={currentRequest.recipientNumber}
            />
            <DetailRow
              label="Amount"
              value={`₱ ${currentRequest.amount.toFixed(2)}`}
            />
            <DetailRow
              label="Raw QR / Target"
              value={currentRequest.qr.raw}
              subtext={currentRequest.qr.containsUrl ? 'Contains external link' : undefined}
            />
          </Card>
        )}

        {failedFindings.length > 0 && (
          <View style={styles.findingsSection}>
            <Text style={styles.findingsTitle}>Triggered Risk Flags</Text>
            {failedFindings.map((f) => (
              <FindingItem key={f.ruleId} finding={f} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue to Select Reason"
          variant="danger"
          size="lg"
          onPress={() => router.push('/report/reason')}
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fca5a5',
    marginBottom: 16,
    gap: 12,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#dc2626',
  },
  bannerDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0a1e4a',
    marginBottom: 8,
  },
  findingsSection: {
    marginBottom: 16,
  },
  findingsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0a1e4a',
    marginBottom: 10,
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
