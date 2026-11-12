import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import BrandLogo from './BrandLogo';
import candidateService, { getInitials } from '../services/candidateService';
import { getUser } from '../src/storage/authStorage';

export default function AppHeader({
  showNotification = true,
  showProfile = false,
  profileInitials,
  onNotificationPress,
  onProfilePress,
  hasUnreadNotifications = true,
}) {
  const router = useRouter();

  const getResolvedInitials = () => {
    if (profileInitials) return profileInitials;
    const name = candidateService.getUserProfile()?.fullName;
    return getInitials(name || 'Ashu');
  };

  const [initials, setInitials] = useState(getResolvedInitials());

  useEffect(() => {
    if (profileInitials) {
      setInitials(profileInitials);
      return;
    }
    const currentName = candidateService.getUserProfile()?.fullName;
    if (currentName) {
      setInitials(getInitials(currentName));
    } else {
      getUser().then((stored) => {
        if (stored?.fullName) {
          candidateService.updateUserProfile({ fullName: stored.fullName });
          setInitials(getInitials(stored.fullName));
        } else {
          setInitials('A');
        }
      }).catch(() => {
        setInitials('A');
      });
    }
  }, [profileInitials]);

  const displayInitials = initials || getResolvedInitials();

  const handleNotification = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/notifications');
    }
  };

  const handleProfile = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/profile');
    }
  };

  return (
    <View style={styles.header}>
      {/* Brand logo left-aligned as requested in UI-02 */}
      <View style={styles.headerLeft}>
        <BrandLogo size="medium" align="left" />
      </View>

      {/* Right controls with safe-area spacing as requested in UI-01 */}
      <View style={styles.headerRight}>
        {showNotification && (
          <Pressable
            style={styles.iconBtn}
            onPress={handleNotification}
            hitSlop={8}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={21} color={COLORS.text} />
            {hasUnreadNotifications && <View style={styles.bellDot} />}
          </Pressable>
        )}

        {showProfile && (
          <Pressable
            style={styles.profileAvatar}
            onPress={handleProfile}
            hitSlop={8}
            accessibilityLabel="Profile"
          >
            <Text style={styles.avatarLetter}>{displayInitials}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
