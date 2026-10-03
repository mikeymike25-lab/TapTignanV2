import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { usePaymentStore } from '@/features/payment/usePaymentStore';
import { useReportStore } from '@/features/reports/useReportStore';

const FEEDBACK_OPTIONS = [
  'I know this merchant personally / frequent customer',
  'Official printed QR display at an established cashier counter',
  'Merchant recently changed business name or ownership',
  'Personal account was intentionally provided by seller',
];

export default function IncorrectScreen() {
  const router = useRouter();
  const { currentRequest, resetFlow } = usePaymentStore();
  const { createReport } = useReportStore();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitting(true);

    createReport({
      reason: 'unrecognized_qr',
      details: `[FALSE POSITIVE APPEAL] Reason: ${selectedOption}. Comments: ${comments}`,
      paymentId: currentRequest?.id,
      rawQr: currentRequest?.qr.raw,
      recipientName: currentRequest?.recipientName,
    });

    setIsSubmitting(false);
    Alert.alert(
      'Feedback Received',
      'Thank you! Your feedback will be used to calibrate TapTignan merchant verification.',
      [
        {
          text: 'Done',
          onPress: () => {
            resetFlow();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header title="Report Incorrect Flag" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color="#0073f6" />
            <Text style={styles.infoBannerText}>
              Help us improve TapTignan usability. Tell us why you believe this merchant
              or QR code is legitimate.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Why is this flag incorrect?</Text>

          <View style={styles.optionsList}>
            {FEEDBACK_OPTIONS.map((opt) => {
              const isSelected = selectedOption === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setSelectedOption(opt)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Card style={styles.commentCard}>
            <Text style={styles.commentLabel}>Additional Comments (Optional)</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder="Add any extra merchant details..."
              placeholderTextColor="#94a3b8"
              value={comments}
              onChangeText={setComments}
            />
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Submit Feedback"
            variant="primary"
            size="lg"
            disabled={!selectedOption}
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 18,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: '#0a1e4a',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a1e4a',
    marginBottom: 12,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  optionCardSelected: {
    borderColor: '#0073f6',
    backgroundColor: '#f0f7ff',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    borderColor: '#0073f6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0073f6',
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
  },
  optionTextSelected: {
    color: '#0a1e4a',
    fontWeight: '700',
  },
  commentCard: {
    padding: 16,
  },
  commentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0a1e4a',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: '#0a1e4a',
    minHeight: 80,
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
