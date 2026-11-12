import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BrandLogo from '../../components/BrandLogo';
import CustomInput from '../../components/CustomInput';
import PasswordInput from '../../components/PasswordInput';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { validateEmail, validatePassword } from '../../utils/validation';
import employerService from '../../services/employerService';
import { AuthLayoutContext } from '../../components/AuthLayout';

export default function EmployerRegisterScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollToInput = (offset = 80) => {
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

  const handleRegister = async () => {
    setAuthError('');
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Company / Representative name is required.';
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    if (!mobileNumber.trim() || mobileNumber.trim().length < 10) newErrors.mobileNumber = 'Enter a valid 10-digit mobile number.';
    const passErr = validatePassword(password, 6);
    if (passErr) newErrors.password = passErr;
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await employerService.signUp({
      name,
      email,
      password,
      mobileNumber,
    });
    setLoading(false);

    if (result.success) {
      router.replace('/employer/onboarding/company-details');
    } else {
      setAuthError(result.message || 'Registration failed. Please try again.');
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
            <BrandLogo size="medium" align="center" />

            <Text style={styles.title}>Register as Employer</Text>
            <Text style={styles.subtitle}>Create your hiring account to start posting jobs</Text>

            {Boolean(authError) && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{authError}</Text>
              </View>
            )}

            <CustomInput
              label="Company / Recruiter Name"
              placeholder="e.g. Acme Tech"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              error={errors.name}
            />

            <CustomInput
              label="Work Email Address"
              placeholder="recruiter@acmetech.com"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <CustomInput
              label="Mobile Number"
              placeholder="10-digit mobile number"
              value={mobileNumber}
              onChangeText={(val) => {
                setMobileNumber(val);
                if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: null }));
              }}
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.mobileNumber}
            />

            <PasswordInput
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              error={errors.password}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              error={errors.confirmPassword}
            />

            <PrimaryButton
              title="Create Account & Continue"
              onPress={handleRegister}
              loading={loading}
              style={styles.btn}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already registered? </Text>
              <Pressable onPress={() => router.push('/employer/login')} hitSlop={8}>
                <Text style={styles.loginLink}>Sign In</Text>
              </Pressable>
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: -0.5,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  loginText: {
    fontSize: 13.5,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 13.5,
    color: COLORS.primary,
    fontWeight: '700',
  },
});