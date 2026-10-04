import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { DEMO_SCENARIOS } from '@/data/mock/scenarios';
import { usePaymentStore } from '@/features/payment/usePaymentStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = Math.min(SCREEN_WIDTH * 0.64, 240);

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Modals for GCash scanner actions
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { startPaymentFromQr } = usePaymentStore();

  const handleBarcodeScanned = (data: string) => {
    if (scanned || !data) return;
    setScanned(true);
    startPaymentFromQr(data);
    router.push('/pay/confirm');
  };

  const handleSimulateScan = (rawQr: string) => {
    setScanned(true);
    setShowUploadModal(false);
    startPaymentFromQr(rawQr);
    router.push('/pay/confirm');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0073f6" />

      {/* GCash Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setTorchEnabled((prev) => !prev)}
          style={[styles.headerBtn, torchEnabled && styles.headerBtnActive]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={torchEnabled ? 'flash' : 'flash-outline'}
            size={22}
            color="#ffffff"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>QR Reader</Text>

        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={styles.headerBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Scanner Viewport */}
      <View style={styles.scannerBody}>
        {/* Camera View or Dark Fallback */}
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              enableTorch={torchEnabled}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => handleBarcodeScanned(data)}
            />
          ) : (
            <View style={styles.permissionFallback}>
              <Ionicons name="camera-outline" size={48} color="#64748b" />
              <Text style={styles.permissionTitle}>Camera Access</Text>
              <Text style={styles.permissionText}>
                Allow camera access to scan physical codes, or tap any scenario icon below to simulate.
              </Text>
              <TouchableOpacity
                style={styles.enableCamBtn}
                onPress={requestPermission}
                activeOpacity={0.85}
              >
                <Text style={styles.enableCamText}>Enable Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Centered Framing Overlay with Blue Corners */}
          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>
        </View>

        {/* Powered by TapTignan Pre-Payment Security Badge */}
        <TouchableOpacity
          style={styles.poweredByPill}
          onPress={() => setShowInfoModal(true)}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/logos/taptignan-inspect-qr.png')}
            style={styles.poweredByLogo}
            resizeMode="contain"
          />
          <View style={styles.poweredByTextGroup}>
            <Text style={styles.poweredByTitle}>POWERED BY TAPTIGNAN</Text>
            <Text style={styles.poweredBySubtitle}>Active Pre-Payment Verification</Text>
          </View>
          <Ionicons name="information-circle-outline" size={16} color="#93c5fd" />
        </TouchableOpacity>

        {/* Simulate Scan Icons (No big container - just sleek clickable icons) */}
        <View style={styles.simulateIconsRow}>
          <TouchableOpacity
            style={styles.simIconItem}
            onPress={() => handleSimulateScan(DEMO_SCENARIOS[0].rawQr)}
            activeOpacity={0.7}
          >
            <View style={[styles.simIconCircle, styles.simIconCircleSafe]}>
              <Ionicons name="shield-checkmark" size={18} color="#22c55e" />
            </View>
            <Text style={styles.simIconLabel}>Safe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.simIconItem}
            onPress={() => handleSimulateScan(DEMO_SCENARIOS[1].rawQr)}
            activeOpacity={0.7}
          >
            <View style={[styles.simIconCircle, styles.simIconCircleMismatch]}>
              <Ionicons name="warning" size={18} color="#f59e0b" />
            </View>
            <Text style={styles.simIconLabel}>Mismatch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.simIconItem}
            onPress={() => handleSimulateScan(DEMO_SCENARIOS[2].rawQr)}
            activeOpacity={0.7}
          >
            <View style={[styles.simIconCircle, styles.simIconCirclePhish]}>
              <Ionicons name="globe-outline" size={18} color="#ef4444" />
            </View>
            <Text style={styles.simIconLabel}>Phishing</Text>
          </TouchableOpacity>
        </View>

        {/* Generate QR & Upload QR Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setShowGenerateModal(true)}
            activeOpacity={0.75}
          >
            <Image
              source={require('../../assets/scan-icon-generate.png')}
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.actionLabel}>Generate QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => setShowUploadModal(true)}
            activeOpacity={0.75}
          >
            <Image
              source={require('../../assets/scan-icon-upload.png')}
              style={styles.actionIcon}
              resizeMode="contain"
            />
            <Text style={styles.actionLabel}>Upload QR</Text>
          </TouchableOpacity>
        </View>

        {/* Alipay+ Section & Country Flags */}
        <View style={styles.alipaySection}>
          <Image
            source={require('../../assets/scan-alipay-section.png')}
            style={styles.alipayImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Image
                source={require('../../assets/logos/taptignan-inspect-qr.png')}
                style={styles.modalHeaderLogo}
                resizeMode="contain"
              />
              <Text style={styles.modalTitle}>TapTignan QR Reader</Text>
            </View>
            <Text style={styles.modalText}>
              All scanned QR codes are verified before funds can be transferred.
              TapTignan checks for deceptive recipient names, unaccredited accounts,
              and malicious phishing links in real-time.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setShowInfoModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Generate QR Modal */}
      <Modal
        visible={showGenerateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="qr-code-outline" size={28} color="#0073f6" />
              <Text style={styles.modalTitle}>My GCash QR</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Show this code to receive money securely into your GCash wallet.
            </Text>

            <View style={styles.mockQrBox}>
              <Ionicons name="qr-code" size={160} color="#0a1e4a" />
              <Text style={styles.mockQrName}>Juan Dela Cruz</Text>
              <Text style={styles.mockQrNumber}>+63 917 123 4567</Text>
            </View>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setShowGenerateModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Upload QR / Simulate Scan Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.uploadModalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="image-outline" size={26} color="#0073f6" />
              <Text style={styles.modalTitle}>Upload QR from Photos</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Select a simulated QR image to test security verification:
            </Text>

            <View style={styles.scenarioOptionsList}>
              {DEMO_SCENARIOS.map((scenario) => {
                const isSafe = scenario.expectedVerdict === 'safe';
                return (
                  <TouchableOpacity
                    key={scenario.id}
                    style={styles.scenarioOptionItem}
                    onPress={() => handleSimulateScan(scenario.rawQr)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.scenarioIconWrap,
                        isSafe ? styles.scenarioIconSafe : styles.scenarioIconSuspicious,
                      ]}
                    >
                      <Ionicons
                        name={isSafe ? 'shield-checkmark' : 'warning'}
                        size={20}
                        color={isSafe ? '#16a34a' : '#ea580c'}
                      />
                    </View>
                    <View style={styles.scenarioOptionText}>
                      <Text style={styles.scenarioOptionTitle}>{scenario.name}</Text>
                      <Text style={styles.scenarioOptionDesc} numberOfLines={1}>
                        {scenario.description}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => setShowUploadModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0073f6',
  },
  header: {
    height: 52,
    backgroundColor: '#0073f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  scannerBody: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  cameraContainer: {
    width: '100%',
    height: 310,
    backgroundColor: '#000000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionFallback: {
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  permissionText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  enableCamBtn: {
    backgroundColor: '#0073f6',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 14,
  },
  enableCamText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#0073f6',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 4,
  },

  /* Powered by TapTignan Badge */
  poweredByPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 115, 246, 0.35)',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 6,
    marginBottom: 6,
    gap: 10,
  },
  poweredByLogo: {
    width: 26,
    height: 26,
    borderRadius: 6,
  },
  poweredByTextGroup: {
    justifyContent: 'center',
  },
  poweredByTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  poweredBySubtitle: {
    color: '#93c5fd',
    fontSize: 9.5,
    fontWeight: '600',
  },

  /* Simulate Scan Icons (No big container) */
  simulateIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 8,
  },
  simIconItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  simIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simIconCircleSafe: {
    borderColor: 'rgba(34, 197, 94, 0.6)',
  },
  simIconCircleMismatch: {
    borderColor: 'rgba(245, 158, 11, 0.6)',
  },
  simIconCirclePhish: {
    borderColor: 'rgba(239, 68, 68, 0.6)',
  },
  simIconLabel: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },

  /* Generate QR / Upload QR Actions */
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 48,
    marginTop: 4,
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  actionIcon: {
    width: 46,
    height: 44,
  },
  actionLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.2,
  },

  /* Alipay Section */
  alipaySection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  alipayImage: {
    width: 290,
    height: 115,
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalHeaderLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: '#0073f6',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  mockQrBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mockQrName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 10,
  },
  mockQrNumber: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  uploadModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
  },
  scenarioOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  scenarioOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scenarioIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scenarioIconSafe: {
    backgroundColor: '#dcfce7',
  },
  scenarioIconSuspicious: {
    backgroundColor: '#ffedd5',
  },
  scenarioOptionText: {
    flex: 1,
  },
  scenarioOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  scenarioOptionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  modalSecondaryBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
});
