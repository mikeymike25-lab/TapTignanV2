import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePaymentStore } from '@/features/payment/usePaymentStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TICKET_WIDTH = Math.min(SCREEN_WIDTH - 36, 360);
const TRIANGLE_WIDTH = 14;
const NUM_TRIANGLES = Math.ceil(TICKET_WIDTH / TRIANGLE_WIDTH) + 2;

function formatMaskedRecipient(name?: string): string {
  if (!name) return 'MI....A J.. J.';
  if (name.includes('..') || name.includes('**')) return name;

  const words = name.trim().split(/\s+/);
  return words
    .map((w) => {
      if (w.length <= 2) return w.toUpperCase();
      if (w.length === 3) return `${w[0]}..${w[2]}`.toUpperCase();
      return `${w.slice(0, 2)}....${w.slice(-1)}`.toUpperCase();
    })
    .join(' ');
}

function formatReceiptDate(timestamp?: string | number): string {
  const d = timestamp ? new Date(timestamp) : new Date();
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
}

export default function ReceiptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ txId?: string }>();
  const { currentRequest, transactions, resetFlow } = usePaymentStore();
  const [saved, setSaved] = useState(false);

  // Find targeted transaction or latest, or fallback to mock scenario
  const tx = transactions.find((t) => t.id === params.txId) || transactions[0];

  const amountNumber = tx?.payment.amount || currentRequest?.amount || 550.0;
  const formattedAmount = amountNumber.toFixed(2);
  const formattedTotal = (amountNumber + (tx?.payment.fee || currentRequest?.fee || 0)).toFixed(2);

  const recipientName = tx?.payment.recipientName || currentRequest?.recipientName || 'MI....A J.. J.';
  const displayedRecipient = formatMaskedRecipient(recipientName);

  const nickname = tx?.payment.merchantName || currentRequest?.merchantName || 'Mika';

  // As requested: the black paint is the number, so replaced with actual phone number
  const phoneNumber = tx?.payment.recipientNumber || currentRequest?.recipientNumber || '+63 917 123 4567';

  const refNumber = tx?.id
    ? tx.id.replace(/[^\d]/g, '').slice(0, 12).replace(/(\d{4})(\d{3})(\d{5})/, '$1 $2 $3') || tx.id
    : '2045 667 982375';

  const receiptDate = tx?.completedAt
    ? formatReceiptDate(tx.completedAt)
    : 'Jul 28, 2025 4:32 PM';

  const handleDone = () => {
    resetFlow();
    router.replace('/(tabs)');
  };

  const handleSaveImage = () => {
    setSaved(true);
    Alert.alert('Receipt Saved', 'Receipt has been saved to your photo gallery.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0073f6" />

      {/* Blue Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={handleDone}
          style={styles.navBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.navTitle}>Receipt</Text>

        <TouchableOpacity
          onPress={handleSaveImage}
          style={styles.navBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="share-outline" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ticket Paper Wrapper */}
        <View style={styles.ticketWrapper}>
          {/* Main White Ticket Card */}
          <View style={styles.ticketCard}>
            {/* Top Semicircular Notch */}
            <View style={styles.topNotch} />

            {/* Recipient Header */}
            <View style={styles.recipientHeader}>
              <Text style={styles.recipientNameText}>{displayedRecipient}</Text>

              {/* Contact Pill (Person icon + Nickname + Phone number replacing black paint) */}
              <View style={styles.contactPill}>
                <View style={styles.pillContactWrap}>
                  <Ionicons name="id-card-outline" size={16} color="#0073f6" />
                  <Text style={styles.pillNickname}>{nickname}</Text>
                </View>
                <Text style={styles.pillPhone}>{phoneNumber}</Text>
              </View>

              <Text style={styles.sentViaText}>Sent via GCash</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Amount Row */}
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountValue}>{formattedAmount}</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Total Amount Sent Row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount Sent</Text>
              <Text style={styles.totalValue}>₱{formattedTotal}</Text>
            </View>

            {/* Ref No. and Date Row */}
            <View style={styles.refDateRow}>
              <Text style={styles.refText}>
                Ref No. <Text style={styles.refDigits}>{refNumber}</Text>
              </Text>
              <Text style={styles.dateText}>{receiptDate}</Text>
            </View>

            {/* GForest Carbon Footprint Box */}
            <View style={styles.carbonCard}>
              <View style={styles.carbonHeader}>
                <Ionicons name="leaf-outline" size={18} color="#00442f" />
                <Text style={styles.carbonTitle}>
                  <Text style={styles.carbonGrams}>131g</Text> (gCO2e)
                </Text>
              </View>
              <Text style={styles.carbonText}>
                By going digital, you reduce your carbon footprint from transportation, paper, and plastic.
              </Text>
            </View>

            {/* TapTignan Security Guarantee Footer */}
            <View style={styles.securitySeal}>
              <Ionicons name="shield-checkmark" size={15} color="#0073f6" />
              <Text style={styles.securitySealText}>
                Verified by TapTignan Usable Security
              </Text>
            </View>
          </View>

          {/* Serrated / Sawtooth Torn Paper Bottom Edge */}
          <View style={styles.sawtoothContainer}>
            {Array.from({ length: NUM_TRIANGLES }).map((_, index) => (
              <View key={index} style={styles.triangle} />
            ))}
          </View>
        </View>

        {/* Action Buttons Below the Receipt on Blue Canvas */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveImage}
            activeOpacity={0.8}
          >
            <Ionicons
              name={saved ? 'checkmark-circle' : 'download-outline'}
              size={18}
              color="#ffffff"
            />
            <Text style={styles.saveBtnText}>
              {saved ? 'Saved to Gallery' : 'Save Image'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0073f6', // Solid GCash Blue Canvas
  },
  topNav: {
    height: 48,
    backgroundColor: '#0073f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  navBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
    alignItems: 'center',
  },
  ticketWrapper: {
    width: '100%',
    maxWidth: TICKET_WIDTH,
    alignItems: 'center',
    shadowColor: '#001a66',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  topNotch: {
    position: 'absolute',
    top: -18,
    left: '50%',
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0073f6',
    zIndex: 10,
  },
  recipientHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  recipientNameText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#002570',
    letterSpacing: 1,
    textAlign: 'center',
  },
  contactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
    gap: 8,
  },
  pillContactWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillNickname: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  pillPhone: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  sentViaText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#718096',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#002570',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#002570',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#002570',
  },
  totalValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#002570',
  },
  refDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 4,
  },
  refText: {
    fontSize: 12.5,
    color: '#718096',
  },
  refDigits: {
    fontWeight: '700',
    color: '#002570',
  },
  dateText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#002570',
  },
  carbonCard: {
    backgroundColor: '#9fe3c9',
    borderLeftWidth: 5,
    borderLeftColor: '#2bb682',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 20,
  },
  carbonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  carbonTitle: {
    fontSize: 14,
    color: '#00442f',
    fontWeight: '500',
  },
  carbonGrams: {
    fontWeight: '800',
  },
  carbonText: {
    fontSize: 11.5,
    color: '#00442f',
    lineHeight: 16,
    marginTop: 4,
  },
  securitySeal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  securitySealText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  sawtoothContainer: {
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
    height: 9,
    alignItems: 'flex-start',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
  },
  bottomActions: {
    width: '100%',
    maxWidth: TICKET_WIDTH,
    marginTop: 24,
    gap: 12,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  doneBtnText: {
    color: '#0073f6',
    fontSize: 16,
    fontWeight: '800',
  },
});
