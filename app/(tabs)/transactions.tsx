import React, { useState } from 'react';
import {
  Alert,
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
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/taptignan/StatusBadge';
import { COPY } from '@/data/copy';
import { usePaymentStore } from '@/features/payment/usePaymentStore';
import { useReportStore } from '@/features/reports/useReportStore';
import { Report } from '@/types';

export default function TransactionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reports' | 'payments'>('reports');
  const { reports, resolveReport } = useReportStore();
  const { transactions } = usePaymentStore();

  const handleReportPress = (report: Report) => {
    if (report.status === 'under_review') {
      Alert.alert(
        'Simulate Report Lifecycle',
        `Report ${report.id} is currently Under Review.\n\nWould you like to simulate resolving this case?`,
        [
          { text: 'Keep Under Review', style: 'cancel' },
          {
            text: 'Mark as Resolved',
            onPress: () => resolveReport(report.id),
          },
        ]
      );
    }
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
            Payments ({transactions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'reports' ? (
          reports.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="shield-outline" size={44} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>No Safety Reports Yet</Text>
              <Text style={styles.emptySubtitle}>
                When you report a suspicious QR code or false flag, it will appear here with
                live review tracking.
              </Text>
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
                      {report.status === 'under_review' && (
                        <Text style={styles.tapToResolve}>Tap to simulate resolve →</Text>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : transactions.length === 0 ? (
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
});
