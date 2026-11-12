import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

const DEFAULT_TABS = [
  { name: 'dashboard', title: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid', route: '/(tabs)/dashboard' },
  { name: 'alerts', title: 'Alerts', icon: 'notifications-outline', activeIcon: 'notifications', route: '/(tabs)/alerts' },
  { name: 'jobs', title: 'Find Jobs', icon: 'search-outline', activeIcon: 'search', route: '/(tabs)/jobs' },
  { name: 'plans', title: 'Plans', icon: 'sparkles-outline', activeIcon: 'sparkles', route: '/(tabs)/plans' },
  { name: 'settings', title: 'Settings', icon: 'settings-outline', activeIcon: 'settings', route: '/(tabs)/settings' },
];

export default function BottomTabBar({
  state,
  descriptors,
  navigation,
  tabs = DEFAULT_TABS,
  activeRouteName,
  onTabPress,
}) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 0);

  return (
    <View style={[styles.tabBar, { paddingBottom: bottomInset + 4, height: 60 + bottomInset }]}>
      {tabs.map((tab, index) => {
        const isFocused =
          activeRouteName
            ? activeRouteName === tab.name
            : state
            ? state.index === index
            : false;

        const handlePress = () => {
          if (onTabPress) {
            onTabPress(tab);
          } else if (navigation) {
            const event = navigation.emit({
              type: 'tabPress',
              target: tab.key || tab.name,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          }
        };

        const color = isFocused ? COLORS.primary : COLORS.mutedText;

        return (
          <Pressable
            key={tab.name}
            style={styles.tabItem}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={tab.title}
          >
            <Ionicons
              name={isFocused ? tab.activeIcon || tab.icon : tab.icon}
              size={22}
              color={color}
            />
            <Text style={[styles.tabLabel, { color }]}>{tab.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#ECE6F5',
    borderTopWidth: 1,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
});
