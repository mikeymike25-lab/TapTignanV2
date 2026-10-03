import { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/taptignan/StatusBadge';
import { COPY } from '@/data/copy';
import { usePaymentStore } from '@/features/payment/usePaymentStore';
import { useReportStore } from '@/features/reports/useReportStore';

export default function SubmittedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { reports } = useReportStore();
  const { resetFlow } = usePaymentStore();
  const [currentTimestamp] = useState(() => Date.now());

  const reportId = params.id || reports[0]?.id || 'TT-2026-00124';
  const report = reports.find((r) => r.id === reportId) || reports[0];
  const formattedDate = new Date(report?.createdAt || currentTimestamp).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleDone = () => {
    resetFlow();
    router.replace('/(tabs)/transactions');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0073f6" />

      {/* Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={44} color="#0073f6" />
        </View>
        <Text style={styles.heroTitle}>{COPY.submitted.title}</Text>
        <Text style={styles.heroSubtitle}>{COPY.submitted.subtitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Report ID & Status Card (FR-14) */}
        <Card style={styles.idCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.idLabel}>{COPY.submitted.reportIdLabel}</Text>
            <StatusBadge type="under_review" size="md" />
          </View>

          <Text style={styles.reportIdValue}>{reportId}</Text>
          <Text style={styles.timestamp}>
            Submitted on {formattedDate}
          </Text>
        </Card>

        {/* What Happens Next Timeline (DF-03) */}
        <Card style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>{COPY.submitted.timelineTitle}</Text>

          <View style={styles.timelineItem}>
            <View style={styles.timelineBadge}>
              <Text style={styles.timelineNum}>1</Text>
            </View>
            <View style={styles.timelineTextWrap}>
              <Text style={styles.timelineHeading}>Automated Verification</Text>
              <Text style={styles.timelineDesc}>{COPY.submitted.step1}</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineBadge}>
              <Text style={styles.timelineNum}>2</Text>
            </View>
            <View style={styles.timelineTextWrap}>
              <Text style={styles.timelineHeading}>Community Protection</Text>
              <Text style={styles.timelineDesc}>{COPY.submitted.step2}</Text>
            </View>
          </View>

          <View style={[styles.timelineItem, styles.timelineItemLast]}>
            <View style={styles.timelineBadge}>
              <Text style={styles.timelineNum}>3</Text>
            </View>
            <View style={styles.timelineTextWrap}>
              <Text style={styles.timelineHeading}>Track Your Report</Text>
              <Text style={styles.timelineDesc}>{COPY.submitted.step3}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Done Footer */}
      <View style={styles.footer}>
        <Button
          title={COPY.submitted.ctaDone}
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
  heroHeader: {
    backgroundColor: '#0073f6',
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#dbeafe',
    marginTop: 4,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 28,
  },
  idCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  idLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  reportIdValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0073f6',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 4,
  },
  timelineCard: {
    padding: 18,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0a1e4a',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineItemLast: {
    marginBottom: 0,
  },
  timelineBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0073f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  timelineNum: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  timelineTextWrap: {
    flex: 1,
  },
  timelineHeading: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0a1e4a',
  },
  timelineDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
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
