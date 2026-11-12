import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../../components/BrandLogo';
import OTPInput from '../../components/OTPInput';
import PrimaryButton from '../../components/PrimaryButton';
import employerService from '../../services/employerService';
import { AuthLayoutContext } from '../../components/AuthLayout';

export default function EmployerVerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email || '').trim().toLowerCase();
  const scrollViewRef = useRef(null);

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const scrollToInput = (offset = 50) => {
    scrollViewRef.current?.scrollTo({ y: offset, animated: true });
  };

  const restoreScroll = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        restoreScroll();
      }
    );
    return () => {
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [secondsLeft]);

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    const result = await employerService.requestPasswordReset(email);
    setLoading(false);
    if (result.success) {
      setSecondsLeft(60);
      setCanResend(false);
      setOtp('');
      Alert.alert('Code Sent', 'A fresh OTP has been sent to your email.');
    } else {
      setError(result.message || 'Failed to resend code');
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setError('');
    setLoading(true);

    const result = await employerService.verifyPasswordOtp(email, otp);
    setLoading(false);

    if (result.success) {
      router.push({
        pathname: '/employer/reset-password',
        params: { email, otp },
      });
    } else {
      setError(result.message || 'Invalid or expired verification code');
    }
  };

  const formatTimer = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <AuthLayoutContext.Provider value={{ scrollToInput, restoreScroll }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.card}>
            <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </Pressable>

            <View style={styles.header}>
              <BrandLogo size="md" />
              <View style={styles.badgeRow}>
                <View style={styles.employerBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#7000B0" />
                  <Text style={styles.employerBadgeText}>Employer Verification</Text>
                </View>
              </View>
              <Text style={styles.title}>Enter Verification Code</Text>
              <Text style={styles.subtitle}>
                We sent a 4-digit code to{' '}
                <Text style={styles.emailHighlight}>{email || 'your email'}</Text>
              </Text>
            </View>

            <View style={styles.otpWrapper}>
              <OTPInput value={otp} onChange={setOtp} hasError={!!error} />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.timerRow}>
              <Text style={styles.timerText}>
                Didn't receive code?{' '}
                {canResend ? (
                  <Text style={styles.resendActive} onPress={handleResend}>
                    Resend Code
                  </Text>
                ) : (
                  <Text style={styles.timerCount}>Resend in {formatTimer()}</Text>
                )}
              </Text>
            </View>

            <View style={styles.btnRow}>
              <PrimaryButton
                title="Verify & Continue"
                onPress={handleVerify}
                loading={loading}
                disabled={otp.length < 4}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthLayoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeRow: {
    marginTop: 12,
    marginBottom: 8,
  },
  employerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2E6F8',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  employerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7000B0',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  emailHighlight: {
    color: '#0F172A',
    fontWeight: '700',
  },
  otpWrapper: {
    marginVertical: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 13,
    color: '#64748B',
  },
  timerCount: {
    color: '#7000B0',
    fontWeight: '700',
  },
  resendActive: {
    color: '#7000B0',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  btnRow: {
    marginTop: 4,
  },
});