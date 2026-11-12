import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OTPInput from '../../components/OTPInput';
import { sendVerificationOtp, verifyAccountOtp } from '../../src/api/authApi';
import candidateService from '../../services/candidateService';
import { AuthLayoutContext } from '../../components/AuthLayout';

export default function VerifyAccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rawMobile = params?.mobileNumber || params?.phone || '';
  const mobileNumber = rawMobile ? (rawMobile.startsWith('+') ? rawMobile : `+${rawMobile.trim()}`) : '';
  const email = params.email || '';
  const displayTarget = email || mobileNumber || 'your registered contact';
  const isEmail = Boolean(email && email.includes('@'));

  const [otpSent, setOtpSent] = useState(Boolean(params?.otp));
  const [otp, setOtp] = useState(params?.otp ? String(params.otp) : '');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const scrollToInput = (offset = 80) => {
    scrollViewRef.current?.scrollTo({ y: offset, animated: true });
  };

  const restoreScroll = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    if (params?.otp) {
      Alert.alert(
        'Verification Code Sent',
        `A 4-digit verification code was sent to ${displayTarget}.\n\nOTP Code: ${params.otp}`
      );
    }
  }, []);

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
    const handleBack = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/auth/login');
      }
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => sub.remove();
  }, [router]);

  const handleSendOtp = async () => {
    if (!email && !mobileNumber) {
      Alert.alert('Notice', 'No email or mobile number available for verification. Please register first.');
      return;
    }
    setSendingOtp(true);
    try {
      const data = await sendVerificationOtp({
        email: email.trim().toLowerCase(),
        method: isEmail ? 'email' : 'phone',
      });
      setSendingOtp(false);
      setOtpSent(true);

      if (data && data.otp) {
        setOtp(String(data.otp));
        Alert.alert(
          'Verification Code Sent',
          `A 4-digit verification code was sent to ${displayTarget}.\n\nOTP Code: ${data.otp}`
        );
      } else {
        Alert.alert(
          'Verification Code Sent',
          `A 4-digit verification code was sent to ${displayTarget}. Please check your inbox.`
        );
      }
    } catch (e) {
      setSendingOtp(false);
      const msg = e.response?.data?.message || e.message;
      Alert.alert('Send OTP Failed', msg || 'Could not send verification OTP. Please try again.');
    }
  };

  const handleContinue = async () => {
    if (!otpSent) {
      Alert.alert('Send OTP First', 'Please tap "Send OTP" to receive your verification code.');
      return;
    }
    if (otp.length !== 4) {
      Alert.alert('Incomplete OTP', 'Please enter the 4-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyAccountOtp({
        email: email.trim().toLowerCase(),
        mobileNumber: mobileNumber.replace(/\s+/g, ''),
        otp: otp.trim(),
      });
      setLoading(false);

      const verifiedName = data?.fullName || data?.user?.fullName || params?.fullName;
      candidateService.updateUserProfile({
        ...(verifiedName ? { fullName: verifiedName } : {}),
        email: data?.email || data?.user?.email || email.trim().toLowerCase(),
        phone: mobileNumber,
      });

      router.replace('/onboarding');
    } catch (e) {
      setLoading(false);
      const msg = e.response?.data?.message || e.message;
      Alert.alert('Verification Failed', msg || 'Could not verify code. Please try again.');
    }
  };

  return (
    <AuthLayoutContext.Provider value={{ scrollToInput, restoreScroll }}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
          >
            <View style={styles.card}>
            {/* Centered Title & Subtitle */}
            {/* Centered Title & Subtitle (Reference 2) */}
            <Text style={styles.title}>Verify Your Account</Text>
            <Text style={styles.subtitle}>
              Where should we send your verification{'\n'}code?
            </Text>

            {/* Mobile Phone Verification Box (Reference 2) */}
            <View style={styles.phoneCard}>
              <Ionicons name="call-outline" size={30} color="#1E1B4B" style={styles.phoneIcon} />
              <Text style={styles.phoneNumberText}>{mobileNumber}</Text>
              <Pressable
                style={({ pressed }) => [styles.editBtn, pressed && styles.btnPressed]}
                hitSlop={8}
                onPress={() => router.push('/auth/register')}
                accessibilityRole="button"
                accessibilityLabel="Edit phone number"
              >
                <Ionicons name="pencil" size={13} color="#6B11B2" />
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            </View>

            {/* Send OTP Full-width Button directly below card (Reference 2) */}
            <Pressable
              style={({ pressed }) => [styles.sendOtpBtn, pressed && styles.btnPressed]}
              onPress={handleSendOtp}
              disabled={sendingOtp}
              accessibilityRole="button"
              accessibilityLabel={otpSent ? 'Resend OTP' : 'Send OTP'}
            >
              {sendingOtp ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.sendOtpText}>{otpSent ? 'Resend OTP' : 'Send OTP'}</Text>
              )}
            </Pressable>

            {/* 4-Box OTP Input section */}
            {otpSent && (
              <View style={styles.otpContainer}>
                <Text style={styles.otpPrompt}>
                  Enter 4-digit code sent to {mobileNumber}
                </Text>
                <OTPInput
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    if (val.length === 4) {
                      Keyboard.dismiss();
                    }
                  }}
                  autoFocus
                />
              </View>
            )}

            {/* Go back to Sign Up link (Reference 2) */}
            <View style={styles.backRow}>
              <Text style={styles.backText}>Go back to </Text>
              <Pressable onPress={() => router.push('/auth/register')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </Pressable>
            </View>

            {/* Continue Button (Reference 2) */}
            <Pressable
              style={({ pressed }) => [styles.continueBtn, pressed && styles.btnPressed]}
              onPress={handleContinue}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.continueBtnText}>Continue</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </AuthLayoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FC',
  },
  scrollContent: {
    padding: 16,
    paddingVertical: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: '#F1EEF8',
    shadowColor: '#6B11B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#581C87',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  phoneCard: {
    backgroundColor: '#FAF7FE',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E9D5FF',
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1.5,
    marginBottom: 16,
  },
  phoneIcon: {
    marginBottom: 10,
  },
  phoneNumberText: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  editText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#6B11B2',
  },
  sendOtpBtn: {
    backgroundColor: '#6B11B2',
    borderRadius: 12,
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B11B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendOtpText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  otpContainer: {
    marginTop: 18,
    marginBottom: 6,
    alignItems: 'center',
  },
  otpPrompt: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    color: '#64748B',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  continueBtn: {
    backgroundColor: '#6B11B2',
    borderRadius: 12,
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B11B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});