import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0073f6',
        tabBarInactiveTintColor: '#7c8b9e',
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#eef3f8',
          shadowColor: '#000000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, { color: focused ? '#0073f6' : '#7c8b9e' }]}>
              Home
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => (
            <View style={styles.inboxIconContainer}>
              <Ionicons name="mail-outline" size={24} color={color} />
              <View style={styles.redBadge} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, { color: focused ? '#0073f6' : '#7c8b9e' }]}>
              Inbox
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'QR',
          tabBarIcon: () => (
            <View style={styles.qrElevatedContainer}>
              <View style={styles.qrCircle}>
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={26}
                  color="#0073f6"
                />
              </View>
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={[
                styles.tabLabel,
                styles.qrLabelText,
                { color: focused ? '#0073f6' : '#7c8b9e' },
              ]}
            >
              QR
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="receipt-text-clock-outline"
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, { color: focused ? '#0073f6' : '#7c8b9e' }]}>
              Transactions
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={25}
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[styles.tabLabel, { color: focused ? '#0073f6' : '#7c8b9e' }]}>
              Profile
            </Text>
          ),
        }}
      />

      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  inboxIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redBadge: {
    position: 'absolute',
    top: -1,
    left: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff2442',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  qrElevatedContainer: {
    position: 'absolute',
    top: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#0084f8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0073f6',
    shadowOpacity: 0.26,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  qrLabelText: {
    marginTop: 18,
  },
});
