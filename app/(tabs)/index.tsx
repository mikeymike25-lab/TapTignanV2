import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProtectionBanner } from '@/components/taptignan/ProtectionBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 340);
const CARD_HEIGHT = CARD_WIDTH * (322 / 588);
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

type ServiceItem = {
  id: string;
  label: string;
  icon: any;
};

const SERVICES: ServiceItem[] = [
  { id: 'send', label: 'Send', icon: require('@/../assets/services/send.png') },
  { id: 'load', label: 'Load', icon: require('@/../assets/services/load.png') },
  { id: 'transfer', label: 'Transfer', icon: require('@/../assets/services/transfer.png') },
  { id: 'bills', label: 'Bills', icon: require('@/../assets/services/bills.png') },
  { id: 'borrow', label: 'Borrow', icon: require('@/../assets/services/borrow.png') },
  { id: 'gsave', label: 'GSave', icon: require('@/../assets/services/gsave.png') },
  { id: 'ginsure', label: 'GInsure', icon: require('@/../assets/services/ginsure.png') },
  { id: 'ginvest', label: 'GInvest', icon: require('@/../assets/services/ginvest.png') },
  { id: 'glife', label: 'GLife', icon: require('@/../assets/services/glife.png') },
  { id: 'rewards', label: 'A+ Rewards', icon: require('@/../assets/services/rewards.png') },
  { id: 'gforest', label: 'GForest', icon: require('@/../assets/services/gforest.png') },
  { id: 'viewall', label: 'View All', icon: require('@/../assets/services/viewall.png') },
];

export default function HomeScreen() {
  const router = useRouter();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);

  // Auto-sliding banner carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIndex((prevIndex) => {
        const nextIndex = prevIndex === 0 ? 1 : 0;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * SNAP_INTERVAL,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleBannerScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / SNAP_INTERVAL);
    if (index >= 0 && index <= 1 && index !== activeBannerIndex) {
      setActiveBannerIndex(index);
    }
  };

  const scrollToBanner = (index: number) => {
    setActiveBannerIndex(index);
    bannerScrollRef.current?.scrollTo({
      x: index * SNAP_INTERVAL,
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f8ff" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting Row: Logo + Hello! + HELP */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingLeft}>
            <Image
              source={require('@/../assets/gcash-logo.png')}
              style={styles.gcashLogo}
              resizeMode="contain"
            />
            <Text style={styles.greetingTitle}>Hello!</Text>
          </View>

          <TouchableOpacity style={styles.helpButton} activeOpacity={0.85}>
            <Text style={styles.helpText}>HELP</Text>
          </TouchableOpacity>
        </View>

        {/* Available Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <TouchableOpacity
              onPress={() => setIsBalanceVisible(!isBalanceVisible)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.eyeIconWrap}
            >
              <Ionicons
                name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceBody}>
            <View style={styles.balanceAmountRow}>
              <Text style={styles.pesoSymbol}>₱</Text>
              <Text style={styles.balanceNumber}>
                {isBalanceVisible ? '50.13' : '••••••'}
              </Text>
            </View>

            <TouchableOpacity style={styles.cashInButton} activeOpacity={0.88}>
              <Text style={styles.cashInText}>+ Cash In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TapTignan Protection Status Banner (FR-01) */}
        <ProtectionBanner />

        {/* 12 Services Grid (3 rows x 4 columns) */}
        <View style={styles.gridContainer}>
          {SERVICES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              activeOpacity={0.75}
              onPress={() => router.push('/(tabs)/scan')}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={item.icon}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.itemLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mega Deals Sliding Section */}
        <View style={styles.dealsSection}>
          <Text style={styles.dealsTitle}>Mega Deals</Text>

          <ScrollView
            ref={bannerScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dealsScroll}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            onMomentumScrollEnd={handleBannerScroll}
            scrollEventThrottle={16}
          >
            {/* Card 1: Official Card for All Promo */}
            <TouchableOpacity
              activeOpacity={0.94}
              style={styles.promoCardContainer}
            >
              <Image
                source={require('@/../assets/promo-banner.png')}
                style={styles.promoCardImage}
                resizeMode="cover"
              />
            </TouchableOpacity>

            {/* Card 2: Custom Real Ad Featuring You */}
            <TouchableOpacity
              activeOpacity={0.94}
              style={styles.promoCardContainer}
            >
              <Image
                source={require('@/../assets/promo-banner-me.png')}
                style={styles.promoCardImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </ScrollView>

          {/* Carousel Pagination Dots */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              onPress={() => scrollToBanner(0)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View
                style={[
                  styles.paginationDot,
                  activeBannerIndex === 0
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                ]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => scrollToBanner(1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View
                style={[
                  styles.paginationDot,
                  activeBannerIndex === 1
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f8ff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Greeting Header
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 16,
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gcashLogo: {
    width: 34,
    height: 34,
  },
  greetingTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0a1e4a',
    letterSpacing: -0.5,
  },
  helpButton: {
    backgroundColor: '#0073f6',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  helpText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: '#0073f6',
    borderRadius: 16,
    marginHorizontal: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#0073f6',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    color: '#d6e7ff',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  eyeIconWrap: {
    padding: 2,
  },
  balanceBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pesoSymbol: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '800',
    marginRight: 6,
  },
  balanceNumber: {
    color: '#ffffff',
    fontSize: 37,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  cashInButton: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cashInText: {
    color: '#0073f6',
    fontSize: 14,
    fontWeight: '700',
  },

  // Services Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginTop: 18,
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 46,
    height: 46,
  },
  itemLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0a1e4a',
    textAlign: 'center',
    marginTop: 6,
  },

  // Mega Deals Section
  dealsSection: {
    marginTop: 4,
  },
  dealsTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0a1e4a',
    marginHorizontal: 20,
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  dealsScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: CARD_MARGIN,
  },
  promoCardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0a1e4a',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    backgroundColor: '#042678',
  },
  promoCardImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#0073f6',
  },
  paginationDotInactive: {
    width: 6,
    backgroundColor: '#b9d5f7',
  },
});
