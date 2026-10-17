import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
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
import { StatusBadge } from '@/components/taptignan/StatusBadge';
import { COPY } from '@/data/copy';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { usePaymentStore } from '@/features/payment/usePaymentStore';
import { useReportStore } from '@/features/reports/useReportStore';
import { Report } from '@/types';

const DECOY_TRANSACTIONS = [
  {
    id: 'TX-DCY-98214',
    merchant: '7-Eleven Convenience Store',
    amount: 35.0,
    time: 'Today, 2:15 PM',
    status: 'paid',
  },
  {
    id: 'TX-DCY-88412',
    merchant: 'Sari-Sari Store / Load',
    amount: 13.5,
    time: 'Yesterday, 8:40 AM',
    status: 'paid',
  },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reports' | 'payments'>('reports');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { isDuressMode } = useAuthStore();
  const { reports, resolveReport } = useReportStore();
  const { transactions } = usePaymentStore();

  const handleReportPress = (report: Report) => {
    setSelectedReport(report);
  };

  const handleResolveSelected = () => {
    if (!selectedReport) return;
    resolveReport(selectedReport.id);
    setSelectedReport({
      ...selectedReport,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    });
    Alert.alert(
      'Threat Blocked',
      `Report ${selectedReport.id} is now Resolved.\n\nThis QR/account is now permanently blocked on all TapTignan scanners!`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity & Transactions</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'reports' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('reports')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.segmentText, activeTab === 'reports' && styles.segmentTextActive]}
          >
            Safety Reports ({reports.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'payments' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.segmentText, activeTab === 'payments' && styles.segmentTextActive]}
          >
            Payments ({isDuressMode ? DECOY_TRANSACTIONS.length : transactions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'reports' ? (
          <>
            {/* Quick Action: File a Safety Report */}
            <View style={styles.fileReportHeaderRow}>
              <View style={styles.fileReportTextWrap}>
                <Text style={styles.fileReportSectionTitle}>Community Threat Intelligence</Text>
                <Text style={styles.fileReportSectionSubtitle}>
                  Reported rogue QR stickers are blocked for all commuters.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.fileReportActionBtn}
                onPress={() => router.push('/report/reason')}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={18} color="#ffffff" />
                <Text style={styles.fileReportActionBtnText}>File Report</Text>
              </TouchableOpacity>
            </View>

            {reports.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="shield-outline" size={44} color="#94a3b8" />
                </View>
                <Text style={styles.emptyTitle}>No Safety Reports Yet</Text>
                <Text style={styles.emptySubtitle}>
                  When you report a suspicious QR code or false flag, it will appear here with
                  live review tracking.
                </Text>
                <TouchableOpacity
                  style={styles.emptyReportBtn}
                  onPress={() => router.push('/report/reason')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#0073f6" />
                  <Text style={styles.emptyReportBtnText}>File First Safety Report</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.list}>
                {reports.map((report) => (
                  <TouchableOpacity
                    key={report.id}
                    activeOpacity={0.8}
                    onPress={() => handleReportPress(report)}
                  >
                    <Card style={styles.reportCard}>
                      <View style={styles.reportCardHeader}>
                        <Text style={styles.reportId}>{report.id}</Text>
                        <StatusBadge type={report.status} size="sm" />
                      </View>

                      <Text style={styles.reportReason}>
                        {COPY.report.reasons[report.reason] || report.reason}
                      </Text>

                      {report.recipientName && (
                        <Text style={styles.reportRecipient}>
                          Target: {report.recipientName}
                        </Text>
                      )}

                      {report.rawQr && (
                        <Text style={styles.reportRawQr} numberOfLines={1}>
                          QR: {report.rawQr}
                        </Text>
                      )}

                      {report.details && (
                        <Text style={styles.reportDetails} numberOfLines={2}>
                          {`"${report.details}"`}
                        </Text>
                      )}

                      <View style={styles.reportFooter}>
                        <Text style={styles.reportDate}>
                          {new Date(report.createdAt).toLocaleDateString('en-PH', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                        <Text style={styles.tapToResolve}>
                          {report.status === 'under_review'
                            ? 'Review Case →'
                            : 'View Resolution Details →'}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (isDuressMode ? DECOY_TRANSACTIONS.length === 0 : transactions.length === 0) ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={44} color="#0073f6" />
            </View>
            <Text style={styles.emptyTitle}>No Transactions Yet</Text>
            <Text style={styles.emptySubtitle}>
              Completed and protected QR payments will appear here in your transaction record.
            </Text>
            <TouchableOpacity
              style={styles.sampleReceiptBtn}
              onPress={() => router.push('/pay/receipt')}
              activeOpacity={0.8}
            >
              <Ionicons name="receipt-outline" size={16} color="#0073f6" />
              <Text style={styles.sampleReceiptBtnText}>View Sample GCash Receipt</Text>
            </TouchableOpacity>
          </View>
        ) : isDuressMode ? (
          <View style={styles.list}>
            {DECOY_TRANSACTIONS.map((tx) => (
              <View key={tx.id} style={styles.txCardWrapper}>
                <Card style={styles.txCard}>
                  <View style={styles.txTop}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txMerchant}>{tx.merchant}</Text>
                      <Text style={styles.txRef}>{tx.id}</Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={styles.txAmount}>₱ {tx.amount.toFixed(2)}</Text>
                      <Text style={[styles.txStatusBadge, styles.statusPaid]}>Completed</Text>
                    </View>
                  </View>
                  <View style={styles.txBottomRow}>
                    <Text style={styles.txDate}>{tx.time}</Text>
                  </View>
                </Card>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {transactions.map((tx) => {
              const isPaid = tx.outcome === 'paid';
              return (
                <TouchableOpacity
                  key={tx.id}
                  activeOpacity={0.8}
                  onPress={() => isPaid && router.push({ pathname: '/pay/receipt', params: { txId: tx.id } })}
                >
                  <Card style={styles.txCard}>
                    <View style={styles.txTop}>
                      <View style={styles.txLeft}>
                        <Text style={styles.txMerchant}>{tx.payment.merchantName}</Text>
                        <Text style={styles.txRef}>{tx.id}</Text>
                      </View>
                      <View style={styles.txRight}>
                        <Text style={[styles.txAmount, !isPaid && styles.txAmountCancelled]}>
                          ₱ {tx.payment.amount.toFixed(2)}
                        </Text>
                        <Text
                          style={[
                            styles.txStatusBadge,
                            isPaid ? styles.statusPaid : styles.statusCancelled,
                          ]}
                        >
                          {isPaid ? 'Completed' : 'Cancelled'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.txBottomRow}>
                      <Text style={styles.txDate}>
                        {new Date(tx.completedAt).toLocaleString('en-PH', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </Text>
                      {isPaid && (
                        <View style={styles.viewReceiptLink}>
                          <Text style={styles.viewReceiptLinkText}>View Receipt</Text>
                          <Ionicons name="chevron-forward" size={14} color="#0073f6" />
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Report Investigation & Lifecycle Detail Modal */}
      <Modal
        visible={Boolean(selectedReport)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReport(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.reportModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="shield-checkmark" size={24} color="#0073f6" />
                <Text style={styles.modalReportTitle}>Report Investigation</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedReport(null)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedReport && (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
                {/* ID & Status */}
                <View style={styles.modalRefBox}>
                  <View>
                    <Text style={styles.modalRefLabel}>CASE REFERENCE</Text>
                    <Text style={styles.modalRefValue}>{selectedReport.id}</Text>
                  </View>
                  <StatusBadge type={selectedReport.status} size="md" />
                </View>

                {/* Threat Target Details */}
                <View style={styles.modalSectionBox}>
                  <Text style={styles.modalSectionHeading}>REPORTED TARGET</Text>
                  <Text style={styles.modalTargetName}>
                    {selectedReport.recipientName || 'Unregistered Recipient'}
                  </Text>
                  {selectedReport.rawQr && (
                    <Text style={styles.modalTargetQr} numberOfLines={2}>
                      Payload: {selectedReport.rawQr}
                    </Text>
                  )}
                  <Text style={styles.modalReasonBadge}>
                    Violation: {COPY.report.reasons[selectedReport.reason] || selectedReport.reason}
                  </Text>
                  {selectedReport.details && (
                    <Text style={styles.modalUserNote}>
                      {`"${selectedReport.details}"`}
                    </Text>
                  )}
                </View>

                {/* Closed-Loop Community Protection Timeline */}
                <View style={styles.modalTimelineBox}>
                  <Text style={styles.modalSectionHeading}>COMMUNITY LIFECYCLE</Text>

                  <View style={styles.timelineRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStepTitle}>Report Submitted & Logged</Text>
                      <Text style={styles.timelineStepDesc}>
                        Recorded in local threat registry on {new Date(selectedReport.createdAt).toLocaleDateString('en-PH')}.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timelineRow}>
                    <Ionicons
                      name={selectedReport.status === 'resolved' ? 'checkmark-circle' : 'time'}
                      size={18}
                      color={selectedReport.status === 'resolved' ? '#16a34a' : '#d97706'}
                    />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStepTitle}>
                        {selectedReport.status === 'resolved'
                          ? 'Threat Verified & Permanently Blocked'
                          : 'Under Review in Community Threat Registry'}
                      </Text>
                      <Text style={styles.timelineStepDesc}>
                        {selectedReport.status === 'resolved'
                          ? 'This QR payload is automatically blocked with SUSPICIOUS verdict on all TapTignan scans.'
                          : 'Simulate resolving this case to verify and permanently add this rogue QR to the community blocklist.'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action button if under review */}
                {selectedReport.status === 'under_review' && (
                  <Button
                    title="Simulate Verify & Block QR"
                    variant="danger"
                    size="lg"
                    onPress={handleResolveSelected}
                    style={styles.modalActionBtn}
                  />
                )}

                <Button
                  title="Close Details"
                  variant="secondary"
                  size="md"
                  onPress={() => setSelectedReport(null)}
                  style={styles.modalSecondaryCloseBtn}
                />
              </ScrollView>
            )}
          </View>
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
  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eef3f8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eef3f8',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  segmentBtnActive: {
    backgroundColor: '#eaf3ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  segmentTextActive: {
    color: '#0073f6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  list: {
    gap: 12,
  },
  reportCard: {
    padding: 16,
    borderRadius: 16,
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0073f6',
  },
  reportReason: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0a1e4a',
    marginBottom: 4,
  },
  reportRecipient: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
  },
  reportDetails: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reportDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  tapToResolve: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0073f6',
  },
  txCard: {
    padding: 16,
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  txLeft: {
    flex: 1,
  },
  txMerchant: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0a1e4a',
  },
  txRef: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  txAmountCancelled: {
    color: '#64748b',
    textDecorationLine: 'line-through',
  },
  txStatusBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  statusCancelled: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  txDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  sampleReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eaf3ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  sampleReceiptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0073f6',
  },
  txBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  viewReceiptLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewReceiptLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0073f6',
  },
  fileReportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileReportTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  fileReportSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  fileReportSectionSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  fileReportActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  fileReportActionBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  emptyReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eaf3ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  emptyReportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0073f6',
  },
  reportRawQr: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  reportModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    paddingBottom: 32,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalReportTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    marginTop: 14,
  },
  modalRefBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  modalRefLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  modalRefValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  modalSectionBox: {
    backgroundColor: '#fff5f5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 14,
    marginBottom: 14,
  },
  modalSectionHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalTargetName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalTargetQr: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalReasonBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 8,
  },
  modalUserNote: {
    fontSize: 12.5,
    color: '#334155',
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 17,
  },
  modalTimelineBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  timelineStepDesc: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  modalActionBtn: {
    marginBottom: 10,
  },
  modalSecondaryCloseBtn: {
    marginBottom: 6,
  },
  txCardWrapper: {
    marginBottom: 10,
  },
});
