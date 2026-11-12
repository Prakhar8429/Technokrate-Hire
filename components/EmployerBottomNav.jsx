import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import employerService from '../services/employerService';

export default function EmployerBottomNav({ activeTab = 'dashboard' }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out from your employer account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await employerService.signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.navBar}>
      <Pressable
        style={styles.navItem}
        onPress={() => router.replace('/employer/dashboard')}
      >
        <Ionicons
          name={activeTab === 'dashboard' ? 'grid' : 'grid-outline'}
          size={20}
          color={activeTab === 'dashboard' ? COLORS.primary : '#64748B'}
        />
        <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>
          Dashboard
        </Text>
      </Pressable>

      <Pressable
        style={styles.navItem}
        onPress={() => router.replace('/employer/jobs')}
      >
        <Ionicons
          name={activeTab === 'jobs' ? 'briefcase' : 'briefcase-outline'}
          size={20}
          color={activeTab === 'jobs' ? COLORS.primary : '#64748B'}
        />
        <Text style={[styles.navText, activeTab === 'jobs' && styles.navTextActive]}>
          My Jobs
        </Text>
      </Pressable>

      <Pressable
        style={styles.postButtonWrap}
        onPress={() => router.push('/employer/jobs/post')}
      >
        <View style={styles.postButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.navTextPost}>Post Job</Text>
      </Pressable>

      <Pressable style={styles.navItem} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={[styles.navText, { color: '#EF4444' }]}>Exit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  navText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 3,
  },
  navTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  postButtonWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  postButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  navTextPost: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 3,
  },
});