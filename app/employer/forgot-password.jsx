import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../../components/BrandLogo';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { validateEmail } from '../../utils/validation';
import employerService from '../../services/employerService';
import { AuthLayoutContext } from '../../components/AuthLayout';

export default function EmployerForgotPasswordScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToInput = (offset = 60) => {
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

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setError('');
    setLoading(true);

    const result = await employerService.requestPasswordReset(email);
    setLoading(false);

    if (result.success) {
      Alert.alert('OTP Sent', result.message || 'Password reset OTP has been sent to your email.');
      router.push({
        pathname: '/employer/verify-otp',
        params: { email: email.trim().toLowerCase() },
      });
    } else {
      setError(result.message || 'Unable to send OTP. Please try again.');
    }
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

            <BrandLogo size="medium" align="center" />

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your work email to receive a recovery OTP</Text>

            {Boolean(error) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            <CustomInput
              label="Employer Email"
              placeholder="employer@company.com"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PrimaryButton
              title="Send OTP"
              onPress={handleSendOtp}
              loading={loading}
              style={styles.btn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthLayoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBg,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  backBtn: {
    marginBottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  btn: {
    marginTop: 12,
  },
});