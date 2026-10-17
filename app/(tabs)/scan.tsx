import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'qrcode';
import { DEMO_SCENARIOS } from '@/data/mock/scenarios';
import { DEMO_ACCOUNTS, useAuthStore } from '@/features/auth/useAuthStore';
import { usePaymentStore } from '@/features/payment/usePaymentStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = Math.min(SCREEN_WIDTH * 0.68, 250);
const TOP_MASK_HEIGHT = 22;
const MASK_COLOR = 'rgba(0, 0, 0, 0.58)';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Modals for GCash scanner actions
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);

  // Multi-user & dynamic QR generation
  const { user, switchAccount } = useAuthStore();
  const [generateTab, setGenerateTab] = useState<'personal' | 'flags'>('personal');
  const [personalQrDataUrl, setPersonalQrDataUrl] = useState<string | null>(null);

  // Generate real dynamic QR for active user
  useEffect(() => {
    const isMaria = user.name.toLowerCase().includes('maria');
    const accountId = isMaria ? 'MS-88341' : 'JD-11029';
    const payload = `TAPTIGNAN:PAY:${accountId}:${user.name}:100.00`;

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0a1e4a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setPersonalQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate personal QR code:', err);
      });
  }, [user]);

  // Re-arm camera scanning whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

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

      {/* Scanner Viewport with Full-Bleed Camera & Cutout Overlay */}
      <View style={styles.scannerBody}>
        {/* Full-bleed Camera Feed or Permission Fallback Background */}
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            enableTorch={torchEnabled}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => handleBarcodeScanned(data)}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.permissionBackground]} />
        )}

        {/* 3-Row Cutout Mask: dark translucent overlay outside, completely clear square inside */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Top mask */}
          <View style={styles.maskTop} />

          {/* Middle row: left mask, clear square viewfinder, right mask */}
          <View style={styles.maskMiddleRow}>
            <View style={styles.maskSide} />
            <View style={styles.clearFrameWindow}>
              {/* 4 Blue GCash Corner Brackets */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.maskSide} />
          </View>

          {/* Bottom mask covering remaining camera area */}
          <View style={styles.maskBottom} />
        </View>

        {/* Foreground Controls Layer */}
        <View style={styles.foregroundContainer} pointerEvents="box-none">
          {/* Viewfinder Target Area */}
          <View style={styles.viewfinderSpacer} pointerEvents="box-none">
            <View style={styles.viewfinderWindow} pointerEvents="box-none">
              {!permission?.granted && (
                <View style={styles.permissionFallback}>
                  <Ionicons name="camera-outline" size={44} color="#94a3b8" />
                  <Text style={styles.permissionTitle}>Camera Access</Text>
                  <Text style={styles.permissionText}>
                    Allow camera access to scan physical QR codes.
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
            </View>
          </View>

          {/* Bottom Controls Area Layered Over Dark Overlay */}
          <View style={styles.bottomControls} pointerEvents="box-none">
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
            <View style={styles.modalAcademicBox}>
              <Text style={styles.modalAcademicText}>
                Academic prototype only. TapTignan is an educational research project for IT 021 Usable Security at TIP Quezon City. It is not affiliated with, sponsored by, or endorsed by Mynt, Globe Telecom, or G-Xchange Inc. All data and transactions are simulated.
              </Text>
            </View>
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

      {/* Generate QR Modal (Real Scannable QR for Both Users + Threat Flags Deck) */}
      <Modal
        visible={showGenerateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.deckModalCard}>
            {/* Top Modal Header */}
            <View style={styles.modalHeader}>
              <Ionicons name="qr-code-outline" size={24} color="#0073f6" />
              <Text style={styles.modalTitle}>Generate GCash QR</Text>
            </View>

            {/* Mode Switcher: My Personal QR vs Threat Flags Deck */}
            <View style={styles.generateTabRow}>
              <TouchableOpacity
                style={[
                  styles.generateTabBtn,
                  generateTab === 'personal' && styles.generateTabBtnActive,
                ]}
                onPress={() => setGenerateTab('personal')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={16}
                  color={generateTab === 'personal' ? '#ffffff' : '#64748b'}
                />
                <Text
                  style={[
                    styles.generateTabText,
                    generateTab === 'personal' && styles.generateTabTextActive,
                  ]}
                >
                  Personal QR ({user.name.split(' ')[0]})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.generateTabBtn,
                  generateTab === 'flags' && styles.generateTabBtnActive,
                ]}
                onPress={() => setGenerateTab('flags')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="shield-outline"
                  size={16}
                  color={generateTab === 'flags' ? '#ffffff' : '#64748b'}
                />
                <Text
                  style={[
                    styles.generateTabText,
                    generateTab === 'flags' && styles.generateTabTextActive,
                  ]}
                >
                  Threat Flags (5)
                </Text>
              </TouchableOpacity>
            </View>

            {generateTab === 'personal' ? (
              /* TAB 1: REAL PERSONAL QR CODE FOR BOTH USERS */
              <View style={styles.personalQrContainer}>
                {/* 2-User Switcher Row */}
                <View style={styles.userSwitchRow}>
                  <Text style={styles.userSwitchLabel}>Active Account:</Text>
                  <View style={styles.userSwitchButtons}>
                    {DEMO_ACCOUNTS.map((acc) => {
                      const isActive = user.name === acc.name;
                      return (
                        <TouchableOpacity
                          key={acc.name}
                          style={[
                            styles.userSwitchBtn,
                            isActive && styles.userSwitchBtnActive,
                          ]}
                          onPress={() => switchAccount(acc)}
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.userSwitchBtnText,
                              isActive && styles.userSwitchBtnTextActive,
                            ]}
                          >
                            {acc.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* User Identity Card */}
                <View style={styles.userIdentityRow}>
                  <View
                    style={[
                      styles.userAvatarWrap,
                      user.name.toLowerCase().includes('maria') &&
                        styles.userAvatarWrapMaria,
                    ]}
                  >
                    <Text style={styles.userAvatarText}>{user.initials}</Text>
                  </View>
                  <View style={styles.userIdentityTextWrap}>
                    <Text style={styles.userNameText}>{user.name}</Text>
                    <Text style={styles.userPhoneText}>{user.phone}</Text>
                  </View>
                  <View style={styles.userAccountBadge}>
                    <Text style={styles.userAccountBadgeText}>
                      {user.name.toLowerCase().includes('maria')
                        ? 'MS-88341'
                        : 'JD-11029'}
                    </Text>
                  </View>
                </View>

                {/* Real Scannable QR Frame */}
                <View style={styles.deckQrImageWrap}>
                  {personalQrDataUrl ? (
                    <Image
                      source={{ uri: personalQrDataUrl }}
                      style={styles.deckQrImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Image
                      source={
                        user.name.toLowerCase().includes('maria')
                          ? require('../../assets/presentation-qrs/0B_My_GCash_QR_MariaSantos_qr_only.png')
                          : require('../../assets/presentation-qrs/0_My_GCash_QR_JuanDelaCruz_qr_only.png')
                      }
                      style={styles.deckQrImage}
                      resizeMode="contain"
                    />
                  )}
                </View>

                {/* Live Scan Notification */}
                <View style={styles.qrVerifiedBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
                  <Text style={styles.qrVerifiedText}>
                    REAL CAMERA-SCANNABLE QR CODE
                  </Text>
                </View>

                {/* Payload Pill */}
                <View style={styles.deckPayloadPill}>
                  <Text style={styles.deckPayloadLabel}>PAYLOAD:</Text>
                  <Text style={styles.deckPayloadText} numberOfLines={1}>
                    {`TAPTIGNAN:PAY:${user.name.toLowerCase().includes('maria') ? 'MS-88341' : 'JD-11029'}:${user.name}:100.00`}
                  </Text>
                </View>

                {/* Action Row */}
                <View style={styles.deckActionRow}>
                  <TouchableOpacity
                    style={styles.deckSimulateBtn}
                    onPress={() => {
                      const accountId = user.name.toLowerCase().includes('maria')
                        ? 'MS-88341'
                        : 'JD-11029';
                      setShowGenerateModal(false);
                      handleSimulateScan(
                        `TAPTIGNAN:PAY:${accountId}:${user.name}:100.00`
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="scan-outline" size={16} color="#ffffff" />
                    <Text style={styles.deckSimulateBtnText}>
                      Test Scan in App
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deckCloseBtn}
                    onPress={() => setShowGenerateModal(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deckCloseBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* TAB 2: PRESENTATION THREAT FLAGS DECK */
              <View style={styles.flagsDeckContainer}>
                {/* Flag Selector Tabs */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.deckTabsContainer}
                >
                  {DEMO_SCENARIOS.filter((s) => s.id !== 'my_personal_qr').map(
                    (scenario, index) => {
                      const isSelected = selectedScenarioIndex === index;
                      const isSafe = scenario.expectedVerdict === 'safe';
                      const isCaution = scenario.expectedVerdict === 'caution';
                      return (
                        <TouchableOpacity
                          key={scenario.id}
                          style={[
                            styles.deckTabItem,
                            isSelected && styles.deckTabItemActive,
                            isSelected &&
                              (isSafe
                                ? styles.deckTabSafeActive
                                : isCaution
                                  ? styles.deckTabCautionActive
                                  : styles.deckTabSuspiciousActive),
                          ]}
                          onPress={() => setSelectedScenarioIndex(index)}
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.deckTabText,
                              isSelected && styles.deckTabTextActive,
                            ]}
                          >
                            {scenario.flagBadge}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </ScrollView>

                {/* Active Selected Scenario Display */}
                {(() => {
                  const filteredScenarios = DEMO_SCENARIOS.filter(
                    (s) => s.id !== 'my_personal_qr'
                  );
                  const currentScenario =
                    filteredScenarios[selectedScenarioIndex] ||
                    filteredScenarios[0];
                  const isSafe = currentScenario.expectedVerdict === 'safe';
                  const isCaution = currentScenario.expectedVerdict === 'caution';
                  return (
                    <View style={styles.deckDisplayCard}>
                      <View
                        style={[
                          styles.deckFlagPill,
                          isSafe
                            ? styles.deckPillSafe
                            : isCaution
                              ? styles.deckPillCaution
                              : styles.deckPillSuspicious,
                        ]}
                      >
                        <Text
                          style={[
                            styles.deckFlagPillText,
                            isSafe
                              ? styles.deckPillTextSafe
                              : isCaution
                                ? styles.deckPillTextCaution
                                : styles.deckPillTextSuspicious,
                          ]}
                        >
                          {currentScenario.flagTitle}
                        </Text>
                      </View>

                      <View style={styles.deckQrImageWrap}>
                        <Image
                          source={currentScenario.qrImage}
                          style={styles.deckQrImage}
                          resizeMode="contain"
                        />
                      </View>

                      <Text style={styles.deckScenarioName}>
                        {currentScenario.name}
                      </Text>
                      <Text style={styles.deckScenarioDesc} numberOfLines={2}>
                        {currentScenario.presentationTip}
                      </Text>

                      <View style={styles.deckPayloadPill}>
                        <Text style={styles.deckPayloadLabel}>PAYLOAD:</Text>
                        <Text style={styles.deckPayloadText} numberOfLines={1}>
                          {currentScenario.rawQr}
                        </Text>
                      </View>

                      <View style={styles.deckActionRow}>
                        <TouchableOpacity
                          style={styles.deckSimulateBtn}
                          onPress={() => {
                            setShowGenerateModal(false);
                            handleSimulateScan(currentScenario.rawQr);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="scan-outline"
                            size={16}
                            color="#ffffff"
                          />
                          <Text style={styles.deckSimulateBtnText}>
                            Test in TapTignan
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deckCloseBtn}
                          onPress={() => setShowGenerateModal(false)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.deckCloseBtnText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })()}
              </View>
            )}
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
              <Text style={styles.modalTitle}>Upload QR / Test Scenarios</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Select any of the 5 defense presentation flags to evaluate:
            </Text>

            <View style={styles.scenarioOptionsList}>
              {DEMO_SCENARIOS.map((scenario) => {
                const isSafe = scenario.expectedVerdict === 'safe';
                const isCaution = scenario.expectedVerdict === 'caution';
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
                        isSafe
                          ? styles.scenarioIconSafe
                          : isCaution
                            ? styles.scenarioIconCaution
                            : styles.scenarioIconSuspicious,
                      ]}
                    >
                      <Ionicons
                        name={
                          isSafe
                            ? 'shield-checkmark'
                            : isCaution
                              ? 'storefront-outline'
                              : 'warning'
                        }
                        size={20}
                        color={
                          isSafe
                            ? '#16a34a'
                            : isCaution
                              ? '#d97706'
                              : '#ea580c'
                        }
                      />
                    </View>
                    <View style={styles.scenarioOptionText}>
                      <View style={styles.scenarioTitleRow}>
                        <Text style={styles.scenarioOptionTitle}>
                          {scenario.name}
                        </Text>
                        <View
                          style={[
                            styles.scenarioMiniBadge,
                            isSafe
                              ? styles.deckPillSafe
                              : isCaution
                                ? styles.deckPillCaution
                                : styles.deckPillSuspicious,
                          ]}
                        >
                          <Text
                            style={[
                              styles.scenarioMiniBadgeText,
                              isSafe
                                ? styles.deckPillTextSafe
                                : isCaution
                                  ? styles.deckPillTextCaution
                                  : styles.deckPillTextSuspicious,
                            ]}
                          >
                            {scenario.flagBadge}
                          </Text>
                        </View>
                      </View>
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
    backgroundColor: '#0a0f1d',
    position: 'relative',
    overflow: 'hidden',
  },
  permissionBackground: {
    backgroundColor: '#0b1120',
  },

  /* 3-Row Cutout Mask */
  maskTop: {
    width: '100%',
    height: TOP_MASK_HEIGHT,
    backgroundColor: MASK_COLOR,
  },
  maskMiddleRow: {
    width: '100%',
    height: FRAME_SIZE,
    flexDirection: 'row',
  },
  maskSide: {
    flex: 1,
    backgroundColor: MASK_COLOR,
  },
  clearFrameWindow: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  maskBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: MASK_COLOR,
  },

  /* Viewfinder Corners */
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#0073f6',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 6,
  },

  /* Foreground Controls Layer */
  foregroundContainer: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'column',
    pointerEvents: 'box-none',
  },
  viewfinderSpacer: {
    height: TOP_MASK_HEIGHT + FRAME_SIZE,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  viewfinderWindow: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  permissionFallback: {
    width: FRAME_SIZE - 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  permissionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  permissionText: {
    color: '#94a3b8',
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  enableCamBtn: {
    backgroundColor: '#0073f6',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginTop: 10,
  },
  enableCamText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomControls: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
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
    marginBottom: 14,
  },
  modalAcademicBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginBottom: 18,
  },
  modalAcademicText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
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

  /* Mode Switcher Tabs */
  generateTabRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 12,
    width: '100%',
  },
  generateTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 12,
    gap: 6,
  },
  generateTabBtnActive: {
    backgroundColor: '#0073f6',
  },
  generateTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  generateTabTextActive: {
    color: '#ffffff',
  },

  /* Personal QR Layout */
  personalQrContainer: {
    width: '100%',
    alignItems: 'center',
  },
  userSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userSwitchLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  userSwitchButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  userSwitchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  userSwitchBtnActive: {
    backgroundColor: '#0073f6',
  },
  userSwitchBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  userSwitchBtnTextActive: {
    color: '#ffffff',
  },

  userIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8ff',
    borderRadius: 12,
    padding: 10,
    width: '100%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  userAvatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0073f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userAvatarWrapMaria: {
    backgroundColor: '#7c3aed',
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  userIdentityTextWrap: {
    flex: 1,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0a1e4a',
  },
  userPhoneText: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  userAccountBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  userAccountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d4ed8',
  },

  qrVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  qrVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
  },
  flagsDeckContainer: {
    width: '100%',
    alignItems: 'center',
  },

  deckModalCard: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
  },
  deckTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  deckTabItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deckTabItemActive: {
    borderWidth: 1.5,
  },
  deckTabSafeActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  deckTabCautionActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#d97706',
  },
  deckTabSuspiciousActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#dc2626',
  },
  deckTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  deckTabTextActive: {
    color: '#0f172a',
  },
  deckDisplayCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 4,
  },
  deckBadgeRow: {
    marginBottom: 8,
  },
  deckFlagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  deckPillSafe: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  deckPillCaution: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  deckPillSuspicious: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  deckFlagPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  deckPillTextSafe: {
    color: '#15803d',
  },
  deckPillTextCaution: {
    color: '#b45309',
  },
  deckPillTextSuspicious: {
    color: '#b91c1c',
  },
  deckQrImageWrap: {
    width: 170,
    height: 170,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginVertical: 6,
  },
  deckQrImage: {
    width: '100%',
    height: '100%',
  },
  deckScenarioName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
    textAlign: 'center',
  },
  deckScenarioDesc: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 16,
    paddingHorizontal: 8,
  },
  deckPayloadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
    maxWidth: '100%',
    gap: 6,
  },
  deckPayloadLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#475569',
  },
  deckPayloadText: {
    fontSize: 10,
    color: '#0f172a',
    flexShrink: 1,
  },
  deckActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    width: '100%',
  },
  deckSimulateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0073f6',
    borderRadius: 18,
    paddingVertical: 10,
    gap: 6,
  },
  deckSimulateBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  deckCloseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckCloseBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
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
  scenarioIconCaution: {
    backgroundColor: '#fef3c7',
  },
  scenarioIconSuspicious: {
    backgroundColor: '#ffedd5',
  },
  scenarioOptionText: {
    flex: 1,
  },
  scenarioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  scenarioMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  scenarioMiniBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  scenarioOptionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  scenarioOptionDesc: {
    fontSize: 11.5,
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
