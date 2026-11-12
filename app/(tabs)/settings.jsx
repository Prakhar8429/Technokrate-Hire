import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';

export default function SettingsScreen() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    try {
      const { clearAuth } = require('../../src/storage/authStorage');
      await clearAuth();
    } catch {}
    router.replace('/auth/login');
  };

  const MenuItem = ({ icon, title, onPress }) => (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIconBox}>
          <Ionicons name={icon} size={18} color={COLORS.primary} />
        </View>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.mutedText} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader showNotification={false} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and app preferences</Text>

        {/* Section: General Settings */}
        <Text style={styles.sectionHeader}>GENERAL SETTINGS</Text>
        <View style={styles.cardGroup}>
          <MenuItem
            icon="person-outline"
            title="Profile"
            onPress={() => router.push('/profile')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            onPress={() => router.push('/notifications')}
          />
        </View>

        {/* Section: Support */}
        <Text style={styles.sectionHeader}>SUPPORT</Text>
        <View style={styles.cardGroup}>
          <MenuItem
            icon="help-circle-outline"
            title="FAQ"
            onPress={() => router.push('/settings/faq')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="chatbubbles-outline"
            title="Support Chat"
            onPress={() => router.push('/settings/support')}
          />
        </View>

        {/* Section: Terms & Privacy */}
        <Text style={styles.sectionHeader}>TERMS & PRIVACY</Text>
        <View style={styles.cardGroup}>
          <MenuItem
            icon="document-text-outline"
            title="User Agreement & Terms"
            onPress={() => router.push('/settings/terms')}
          />
        </View>

        {/* Sign Out Button */}
        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutBtnPressed]}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.versionText}>Technokrate Hire v1.0.0 (Expo Router)</Text>
      </ScrollView>

      {/* Logout Overlay Modal (Screen 16) */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMsg}>Are you sure you want to Signout?</Text>

            <View style={styles.modalBtnRow}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.confirmSignoutBtn} onPress={handleLogout}>
                <Text style={styles.confirmSignoutText}>Signout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 95,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 2,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.mutedText,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    backgroundColor: '#FAF5FC',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8F6FC',
    marginLeft: 58,
  },
  signOutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutBtnPressed: {
    opacity: 0.8,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11.5,
    color: COLORS.mutedText,
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 21, 26, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  modalMsg: {
    fontSize: 13.5,
    color: COLORS.mutedText,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmSignoutBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmSignoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
