import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { FindingItem } from '@/components/taptignan/FindingItem';
import { COPY } from '@/data/copy';
import { usePaymentStore } from '@/features/payment/usePaymentStore';

export default function CancelledScreen() {
  const router = useRouter();
  const { checkResult, resetFlow } = usePaymentStore();

  const handleHome = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  const handleReport = () => {
    router.push('/report/reason');
  };

  const failedFindings = checkResult?.findings.filter((f) => !f.passed) || [];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header title={COPY.cancelled.title} showBack={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cancelled Hero */}
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Ionicons name="close-circle" size={56} color="#64748b" />
          </View>
          <Text style={styles.heroTitle}>{COPY.cancelled.title}</Text>
          <Text style={styles.heroSubtitle}>{COPY.cancelled.subtitle}</Text>
        </View>

        {/* Why was this flagged? (FR-12) */}
        {failedFindings.length > 0 && (
          <Card style={styles.flaggedCard}>
            <View style={styles.flaggedHeader}>
              <Ionicons name="information-circle" size={20} color="#dc2626" />
              <Text style={styles.flaggedTitle}>{COPY.cancelled.reasonHeader}</Text>
            </View>
            <Text style={styles.flaggedSubtitle}>
              TapTignan blocked or warned against this transaction due to:
            </Text>

            <View style={styles.findingsList}>
              {failedFindings.map((finding) => (
                <FindingItem key={finding.ruleId} finding={finding} />
              ))}
            </View>
          </Card>
        )}

        {/* Community Warning Card */}
        <Card style={styles.communityCard}>
          <Text style={styles.communityTitle}>Help Protect Others</Text>
          <Text style={styles.communityText}>
            Submitting a report adds this QR code to the community review queue, protecting
            fellow Filipino users from fake merchant codes.
          </Text>
        </Card>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <Button
          title={COPY.cancelled.ctaReport}
          variant="danger"
          size="lg"
          onPress={handleReport}
          style={styles.fullBtn}
        />
        <Button
          title={COPY.cancelled.ctaHome}
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
  scrollContent: {
    padding: 18,
    paddingBottom: 28,
  },
  hero: {
    alignItems: 'center',
    marginVertical: 18,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  flaggedCard: {
    padding: 16,
    marginBottom: 14,
    borderColor: '#fed7d7',
    borderWidth: 1.5,
  },
  flaggedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flaggedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#dc2626',
  },
  flaggedSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 10,
  },
  findingsList: {
    marginTop: 6,
  },
  communityCard: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  communityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a1e4a',
  },
  communityText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 17,
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
