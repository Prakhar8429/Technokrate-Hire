import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function PlanPurchaseSuccess({ planName = 'Basic Plan (60 Days)' }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const navigatedRef = useRef(false);

  // Exact confirmation messages as specified in PRD
  const getSuccessMessage = () => {
    const nameLower = (planName || '').toLowerCase();
    if (nameLower.includes('basic')) {
      return `Congratulations! You have successfully purchased ${planName}.`;
    }
    if (nameLower.includes('advance')) {
      return `Congratulations! You have successfully purchased ${planName}.`;
    }
    if (nameLower.includes('professional') || nameLower.includes('pro')) {
      return `Congratulations! You have successfully purchased ${planName}.`;
    }
    return `Congratulations! You have successfully purchased ${planName}.`;
  };

  const handleNavigateDashboard = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    try {
      router.replace('/(tabs)/dashboard');
    } catch {
      try {
        router.replace('/(tabs)');
      } catch {
        try {
          router.navigate('/(tabs)/dashboard');
        } catch {
          // Ignore
        }
      }
    }
  }, [router]);

  // Clean countdown: side effect is executed in effect body, NEVER inside state updater!
  useEffect(() => {
    if (countdown <= 0) {
      handleNavigateDashboard();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, handleNavigateDashboard]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={44} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>{getSuccessMessage()}</Text>

          {/* Visible countdown / redirect indicator */}
          <View style={styles.countdownBadge}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            <Text style={styles.countdownText}>
              Redirecting to Dashboard in{' '}
              <Text style={styles.countdownSeconds}>{countdown}s</Text>
            </Text>
          </View>

          {/* Direct 1-tap manual action button */}
          <Pressable
            style={styles.actionBtn}
            onPress={handleNavigateDashboard}
            hitSlop={8}
          >
            <Text style={styles.actionBtnText}>Go to Dashboard Now</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 20,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  countdownSeconds: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
