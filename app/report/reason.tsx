import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { COPY } from '@/data/copy';
import { usePaymentStore } from '@/features/payment/usePaymentStore';
import { useReportStore } from '@/features/reports/useReportStore';
import { ReportReason } from '@/types';

const REPORT_REASONS: { id: ReportReason; label: string; icon: string }[] = [
  {
    id: 'wrong_recipient_name',
    label: COPY.report.reasons.wrong_recipient_name,
    icon: 'person-remove-outline',
  },
  {
    id: 'suspicious_link',
    label: COPY.report.reasons.suspicious_link,
    icon: 'globe-outline',
  },
  {
    id: 'forced_to_pay',
    label: COPY.report.reasons.forced_to_pay,
    icon: 'warning-outline',
  },
  {
    id: 'unrecognized_qr',
    label: COPY.report.reasons.unrecognized_qr,
    icon: 'help-circle-outline',
  },
];

export default function ReportReasonScreen() {
  const router = useRouter();
  const { currentRequest } = usePaymentStore();
  const { createReport } = useReportStore();

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) return;
    setIsSubmitting(true);

    const report = createReport({
      reason: selectedReason,
      details: details.trim() || undefined,
      paymentId: currentRequest?.id,
      rawQr: currentRequest?.qr.raw,
      recipientName: currentRequest?.recipientName || currentRequest?.merchantName,
    });

    setIsSubmitting(false);
    router.replace(`/report/submitted?id=${report.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header title={COPY.report.title} onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header instructions */}
          <Text style={styles.subtitle}>{COPY.report.subtitle}</Text>
          <Text style={styles.questionTitle}>{COPY.report.reasonQuestion}</Text>

          {/* 4 Predefined Reasons Radio Selection (FR-13) */}
          <View style={styles.reasonsList}>
            {REPORT_REASONS.map((item) => {
              const isSelected = selectedReason === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.reasonCard, isSelected && styles.reasonCardSelected]}
                  onPress={() => setSelectedReason(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={isSelected ? '#0073f6' : '#64748b'}
                    style={{ marginRight: 10 }}
                  />
                  <View style={styles.reasonTextWrap}>
                    <Text
                      style={[
                        styles.reasonLabel,
                        isSelected && styles.reasonLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Optional Details (FR-13) */}
          <Card style={styles.detailsCard}>
            <Text style={styles.detailsLabel}>{COPY.report.detailsLabel}</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder={COPY.report.detailsPlaceholder}
              placeholderTextColor="#94a3b8"
              value={details}
              onChangeText={setDetails}
            />
          </Card>
        </ScrollView>

        {/* Submit Footer (disabled until reason is picked - FR-13) */}
        <View style={styles.footer}>
          <Button
            title={COPY.report.ctaSubmit}
            variant="danger"
            size="lg"
            disabled={!selectedReason}
            loading={isSubmitting}
            onPress={handleSubmit}
            style={styles.fullBtn}
          />
        </View>
      </KeyboardAvoidingView>
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
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  questionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0a1e4a',
    marginBottom: 16,
  },
  reasonsList: {
    gap: 10,
    marginBottom: 16,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  reasonCardSelected: {
    borderColor: '#dc2626',
    backgroundColor: '#fff5f5',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: '#dc2626',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#dc2626',
  },
  reasonTextWrap: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 19,
  },
  reasonLabelSelected: {
    color: '#0a1e4a',
    fontWeight: '700',
  },
  detailsCard: {
    padding: 16,
  },
  detailsLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0a1e4a',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    fontSize: 13.5,
    color: '#0a1e4a',
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
