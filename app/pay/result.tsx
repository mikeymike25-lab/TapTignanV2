import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { DetailRow } from '@/components/taptignan/DetailRow';
import { FindingItem } from '@/components/taptignan/FindingItem';
import { StatusBadge } from '@/components/taptignan/StatusBadge';
import { COPY } from '@/data/copy';
import { usePaymentStore } from '@/features/payment/usePaymentStore';

export default function ResultScreen() {
  const router = useRouter();
  const { currentRequest, checkResult, status, completePayment, cancelPayment } =
    usePaymentStore();
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  // Gate enforcement (FR-05) - run inside effect to avoid navigating during render
  useEffect(() => {
    if (!currentRequest || !checkResult || status !== 'checked') {
      router.replace('/(tabs)');
    }
  }, [currentRequest, checkResult, status, router]);

  if (!currentRequest || !checkResult || status !== 'checked') {
    return null;
  }

  const isSafe = checkResult.verdict === 'safe';
  const isCaution = checkResult.verdict === 'caution';
  const isSuspicious = checkResult.verdict === 'suspicious';

  const handleContinuePayment = () => {
    const tx = completePayment();
    router.replace(tx ? { pathname: '/pay/receipt', params: { txId: tx.id } } : '/pay/receipt');
  };

  const handleCancelPayment = () => {
    cancelPayment();
    router.replace('/pay/cancelled');
  };

  const handleReport = () => {
    router.push('/report/reason');
  };

  const handleProceedOverride = () => {
    setShowOverrideModal(false);
    const tx = completePayment();
    router.replace(tx ? { pathname: '/pay/receipt', params: { txId: tx.id } } : '/pay/receipt');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Header
        title="Verification Result"
        onBack={!isSuspicious ? handleCancelPayment : undefined}
        showBack={!isSuspicious}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verdict Hero Banner (FR-07: icon + color + text, never color alone) */}
        <View
          style={[
            styles.verdictHero,
            isSafe
              ? styles.heroSafe
              : isCaution
                ? styles.heroCaution
                : styles.heroSuspicious,
          ]}
        >
          <View style={styles.verdictTopRow}>
            <View
              style={[
                styles.verdictIconWrap,
                isSafe
                  ? styles.iconWrapSafe
                  : isCaution
                    ? styles.iconWrapCaution
                    : styles.iconWrapSuspicious,
              ]}
            >
              <Ionicons
                name={
                  isSafe
                    ? 'shield-checkmark'
                    : isCaution
                      ? 'warning'
                      : 'alert-circle'
                }
                size={34}
                color={
                  isSafe
                    ? '#16a34a'
                    : isCaution
                      ? '#d97706'
                      : '#dc2626'
                }
              />
            </View>
            <View style={styles.verdictHeaderWrap}>
              <StatusBadge
                type={isSafe ? 'safe' : isCaution ? 'caution' : 'suspicious'}
                size="lg"
              />
              <Text style={styles.verdictTitle}>
                {isSafe
                  ? COPY.result.safeTitle
                  : isCaution
                    ? COPY.result.cautionTitle
                    : COPY.result.suspiciousTitle}
              </Text>
            </View>
          </View>

          <Text style={styles.verdictSubtitle}>
            {isSafe
              ? COPY.result.safeSubtitle
              : isCaution
                ? COPY.result.cautionSubtitle
                : COPY.result.suspiciousSubtitle}
          </Text>

          <Text style={styles.verdictNotice}>
            {isSafe
              ? COPY.result.safeNotice
              : isCaution
                ? COPY.result.cautionNotice
                : COPY.result.suspiciousNotice}
          </Text>
        </View>

        {/* Usable Security Verbal Check Nudge for Caution / Micro-Merchants */}
        {isCaution && (
          <View style={styles.verbalNudgeCard}>
            <View style={styles.verbalNudgeHeader}>
              <Ionicons name="chatbubbles-outline" size={20} color="#b45309" />
              <Text style={styles.verbalNudgeTitle}>Usable Security Verbal Check</Text>
            </View>
            <Text style={styles.verbalNudgeDesc}>
              {COPY.result.cautionVerbalPrompt}
            </Text>
            <View style={styles.verbalQuoteBox}>
              <Text style={styles.verbalQuoteText}>
                {COPY.result.cautionVerbalQuestion.replace(
                  '{name}',
                  currentRequest.recipientName
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Transaction Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.cardSectionTitle}>Transaction Details</Text>
          <DetailRow
            label="Intended Merchant"
            value={currentRequest.merchantName}
            bold
          />
          <DetailRow
            label="Actual Recipient"
            value={currentRequest.recipientName}
            valueColor={
              isSuspicious &&
              currentRequest.merchantName.toLowerCase() !==
                currentRequest.recipientName.toLowerCase()
                ? '#dc2626'
                : undefined
            }
            bold
          />
          <DetailRow
            label="Amount"
            value={`₱ ${currentRequest.amount.toFixed(2)}`}
            highlight
          />
        </Card>

        {/* Findings Section (FR-08) */}
        <View style={styles.findingsSection}>
          <Text style={styles.findingsHeader}>
            {COPY.result.findingsHeader} ({checkResult.findings.length})
          </Text>
          <Text style={styles.findingsSubheader}>
            Plain-language verification breakdown:
          </Text>

          {checkResult.findings.map((finding) => (
            <FindingItem key={finding.ruleId} finding={finding} />
          ))}
        </View>

        {/* False positive option (FR-16) */}
        {!isSafe && (
          <TouchableOpacity
            style={styles.incorrectFlagLink}
            onPress={() => router.push('/report/incorrect')}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={16} color="#64748b" />
            <Text style={styles.incorrectFlagText}>
              {isCaution
                ? 'Is this an accredited business merchant? Report incorrect flagging'
                : 'Is this a legitimate merchant? Report incorrect flagging'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Action Footer (FR-09 / FR-10) */}
      <View style={styles.footer}>
        {isSafe ? (
          <>
            <Button
              title={COPY.result.ctaPay}
              variant="primary"
              size="lg"
              onPress={handleContinuePayment}
              style={styles.fullBtn}
            />
            <Button
              title="Report Transaction"
              variant="ghost"
              size="md"
              onPress={handleReport}
            />
          </>
        ) : isCaution ? (
          <>
            <Button
              title={`${COPY.result.ctaCautionPay} ₱${currentRequest.amount.toFixed(2)}`}
              variant="primary"
              size="lg"
              onPress={handleContinuePayment}
              style={styles.fullBtn}
            />
            <View style={styles.suspiciousSecondaryRow}>
              <Button
                title={COPY.result.ctaCancel}
                variant="outline"
                size="md"
                onPress={handleCancelPayment}
                style={styles.halfBtn}
              />
              <Button
                title={COPY.result.ctaReport}
                variant="ghost"
                size="md"
                onPress={handleReport}
                style={styles.halfBtn}
              />
            </View>
          </>
        ) : (
          <>
            {/* The secure path is the prominent path (Principle 4) */}
            <Button
              title={COPY.result.ctaCancel}
              variant="danger"
              size="lg"
              onPress={handleCancelPayment}
              style={styles.fullBtn}
            />
            <View style={styles.suspiciousSecondaryRow}>
              <Button
                title={COPY.result.ctaReport}
                variant="outline"
                size="md"
                onPress={handleReport}
                style={styles.halfBtn}
              />
              <Button
                title="Proceed Anyway"
                variant="ghost"
                size="md"
                onPress={() => setShowOverrideModal(true)}
                style={styles.halfBtn}
              />
            </View>
          </>
        )}
      </View>

      {/* Decision D-1: Extra confirmation modal before proceeding with Suspicious */}
      <Modal
        visible={showOverrideModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOverrideModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="warning" size={40} color="#dc2626" />
            </View>
            <Text style={styles.modalTitle}>{COPY.result.proceedWarningTitle}</Text>
            <Text style={styles.modalBody}>{COPY.result.proceedWarningText}</Text>
            <Text style={styles.modalHighlight}>
              Recipient: {currentRequest.recipientName} (
              {currentRequest.merchantName})
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="Cancel & Keep Funds Safe"
                variant="secondary"
                size="md"
                onPress={() => setShowOverrideModal(false)}
                style={styles.fullBtn}
              />
              <Button
                title={COPY.result.proceedConfirm}
                variant="danger"
                size="md"
                onPress={handleProceedOverride}
                style={[styles.fullBtn, { marginTop: 8 }]}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8ff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  verdictHero: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  heroSafe: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  heroCaution: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  heroSuspicious: {
    backgroundColor: '#fff5f5',
    borderColor: '#fca5a5',
  },
  verdictTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verdictIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSafe: {
    backgroundColor: '#dcfce7',
  },
  iconWrapCaution: {
    backgroundColor: '#fef3c7',
  },
  iconWrapSuspicious: {
    backgroundColor: '#fee2e2',
  },
  verbalNudgeCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fde68a',
    padding: 14,
    marginBottom: 16,
  },
  verbalNudgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  verbalNudgeTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#b45309',
  },
  verbalNudgeDesc: {
    fontSize: 12,
    color: '#78350f',
    marginBottom: 8,
  },
  verbalQuoteBox: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
  },
  verbalQuoteText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400e',
    fontStyle: 'italic',
  },
  verdictHeaderWrap: {
    flex: 1,
    gap: 4,
  },
  verdictTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  verdictSubtitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 10,
  },
  verdictNotice: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0a1e4a',
    marginBottom: 6,
  },
  findingsSection: {
    marginBottom: 14,
  },
  findingsHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  findingsSubheader: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    marginTop: 2,
  },
  incorrectFlagLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  incorrectFlagText: {
    fontSize: 12,
    color: '#64748b',
    textDecorationLine: 'underline',
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
  suspiciousSecondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfBtn: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 30, 74, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    padding: 22,
    alignItems: 'center',
    borderRadius: 20,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#dc2626',
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  modalHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0a1e4a',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    textAlign: 'center',
  },
  modalActions: {
    width: '100%',
    marginTop: 18,
  },
});
