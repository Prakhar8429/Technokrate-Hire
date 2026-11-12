import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../../components/BrandLogo';
import PasswordInput from '../../components/PasswordInput';
import PrimaryButton from '../../components/PrimaryButton';
import { COLORS } from '../../constants/colors';
import { validateEmail, validatePassword, validateConfirmPassword, validateMobileNumber } from '../../utils/validation';
import candidateService from '../../services/candidateService';
import infoService from '../../services/infoService';
import { registerJobseeker } from '../../src/api/authApi';

import { AuthLayoutContext } from '../../components/AuthLayout';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const activeFieldRef = useRef(null);

  const getFieldOffset = (field) => {
    switch (field) {
      case 'fullName':
        return 0;
      case 'mobileNumber':
        return 60;
      case 'email':
        return 120;
      case 'password':
        return 200;
      case 'confirmPassword':
        return 380;
      default:
        return 0;
    }
  };

  const scrollToField = (offset = 0) => {
    scrollRef.current?.scrollTo({ y: offset, animated: true });
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: offset, animated: true });
    }, 100);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: offset, animated: true });
    }, 250);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: offset, animated: true });
    }, 450);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: offset, animated: true });
    }, 700);
  };

  const handleFieldFocus = (fieldName, offset) => {
    const targetOffset = offset !== undefined ? offset : getFieldOffset(fieldName);
    activeFieldRef.current = fieldName;
    setIsKeyboardVisible(true);
    scrollToField(targetOffset);
  };

  const scrollToInput = (offset = 80) => {
    scrollToField(offset);
  };

  const restoreScroll = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setIsKeyboardVisible(true);
      const kh = e?.endCoordinates?.height || 0;
      if (kh > 0) setKeyboardHeight(kh);

      // Auto-scroll to currently focused input when keyboard becomes fully visible
      if (activeFieldRef.current) {
        const offset = getFieldOffset(activeFieldRef.current);
        scrollToField(offset);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
      restoreScroll();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Auto-populate email if passed from Sign In
  useEffect(() => {
    if (params?.email) {
      setEmail(String(params.email).trim().toLowerCase());
    }
  }, [params]);

  // Safe Android Hardware BackHandler
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

  const handlePasswordFocus = () => {
    handleFieldFocus('password', getFieldOffset('password'));
  };

  const handleConfirmPasswordFocus = () => {
    handleFieldFocus('confirmPassword', getFieldOffset('confirmPassword'));
  };

  // Criteria validation checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const handleRegister = async () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required';
    const mobileErr = validateMobileNumber(mobileNumber);
    if (mobileErr) errs.mobileNumber = mobileErr;
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    const passErr = validatePassword(password, 8);
    if (passErr) errs.password = passErr;
    const confirmErr = validateConfirmPassword(password, confirmPassword);
    if (confirmErr) errs.confirmPassword = confirmErr;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = `${countryCode}${mobileNumber.trim()}`;

    try {
      const data = await registerJobseeker({
        fullName: fullName.trim(),
        mobileNumber: cleanPhone,
        email: cleanEmail,
        password,
      });

      // Synchronize canonical Full Name to user profile & storage
      candidateService.updateUserProfile({
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
      });

      setLoading(false);

      // Navigate only upon confirmed success
      router.push({
        pathname: '/auth/verify-account',
        params: {
          email: cleanEmail,
          mobileNumber: cleanPhone,
          otp: data?.otp ? String(data.otp) : '',
        },
      });
    } catch (e) {
      setLoading(false);
      const serverMessage = e.response?.data?.message || e.message;

      // Handle duplicate email/phone cleanly
      if (e.response?.status === 400 || e.response?.status === 409) {
        Alert.alert(
          'Registration Notice',
          serverMessage || 'An account with this email or mobile number already exists.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign In',
              onPress: () => router.replace({
                pathname: '/auth/login',
                params: { email: cleanEmail },
              }),
            },
          ]
        );
        return;
      }

      Alert.alert(
        'Registration Failed',
        serverMessage || 'Unable to complete registration. Please check your network and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowTerms = async () => {
    try {
      const data = await infoService.getTermsAndService();
      const rawText = data?.content ? data.content.replace(/<[^>]+>/g, '').trim() : '';
      Alert.alert(
        data?.title || 'Terms of Use',
        rawText ? (rawText.length > 300 ? rawText.slice(0, 300) + '...' : rawText) : 'By creating an account, you agree to Technokrate Hire policies, user verification terms, and standard community guidelines.',
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Terms of Use', 'By creating an account, you agree to Technokrate Hire terms and policies.');
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
            ref={scrollRef}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: isKeyboardVisible ? (Platform.OS === 'ios' ? keyboardHeight + 40 : 320) : 24 }
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
          >
          <View style={styles.card}>
          {/* Centered Brand Logo */}
          <View style={styles.logoContainer}>
            <BrandLogo />
          </View>

          {/* Title: Welcome to Technokrate Hire */}
          <Text style={styles.titleText}>
            Welcome to <Text style={styles.brandHighlight}>Technokrate Hire</Text>
          </Text>

          {/* Full Name Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Full Name"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onFocus={() => handleFieldFocus('fullName')}
              onTouchStart={() => handleFieldFocus('fullName')}
              onChangeText={(t) => {
                setFullName(t);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
              }}
            />
          </View>
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          {/* Phone input with +91 selector */}
          <View style={styles.phoneInputRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
              <Ionicons name="chevron-down" size={14} color="#64748B" />
            </View>
            <View style={styles.phoneDivider} />
            <TextInput
              style={styles.phoneNumberInput}
              placeholder="9932323434"
              placeholderTextColor="#94A3B8"
              value={mobileNumber}
              onFocus={() => handleFieldFocus('mobileNumber')}
              onTouchStart={() => handleFieldFocus('mobileNumber')}
              onChangeText={(t) => {
                setMobileNumber(t);
                if (errors.mobileNumber) setErrors((prev) => ({ ...prev, mobileNumber: null }));
              }}
              keyboardType="phone-pad"
            />
          </View>
          {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

          {/* Email Address */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Email Address"
              placeholderTextColor="#94A3B8"
              value={email}
              onFocus={() => handleFieldFocus('email')}
              onTouchStart={() => handleFieldFocus('email')}
              onChangeText={(t) => {
                setEmail(t);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <PasswordInput
            placeholder="Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
            }}
            onFocus={handlePasswordFocus}
            error={errors.password}
          />

          {/* Password Requirements 5-point Checklist */}
          <View style={styles.checklistContainer}>
            <View style={styles.checkColumn}>
              <View style={styles.bulletRow}>
                <View style={[styles.bulletDot, hasMinLength && styles.bulletDotActive]} />
                <Text style={[styles.bulletText, hasMinLength && styles.bulletTextActive]}>
                  Use 8 or more characters
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={[styles.bulletDot, hasLowerCase && styles.bulletDotActive]} />
                <Text style={[styles.bulletText, hasLowerCase && styles.bulletTextActive]}>
                  One lowercase character
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={[styles.bulletDot, hasSpecial && styles.bulletDotActive]} />
                <Text style={[styles.bulletText, hasSpecial && styles.bulletTextActive]}>
                  One special character
                </Text>
              </View>
            </View>

            <View style={styles.checkColumn}>
              <View style={styles.bulletRow}>
                <View style={[styles.bulletDot, hasUpperCase && styles.bulletDotActive]} />
                <Text style={[styles.bulletText, hasUpperCase && styles.bulletTextActive]}>
                  One Uppercase character
                </Text>
              </View>
              <View style={styles.bulletRow}>
                <View style={[styles.bulletDot, hasNumber && styles.bulletDotActive]} />
                <Text style={[styles.bulletText, hasNumber && styles.bulletTextActive]}>
                  One number
                </Text>
              </View>
            </View>
          </View>

          {/* Confirm Password */}
          <PasswordInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
            }}
            onFocus={handleConfirmPasswordFocus}
            error={errors.confirmPassword}
          />

          {/* Terms and Privacy Text */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsNormalText}>
              By creating an account, you agree to the{' '}
            </Text>
            <Pressable onPress={handleShowTerms}>
              <Text style={styles.termsLinkText}>Terms of use</Text>
            </Pressable>
            <Text style={styles.termsNormalText}> and </Text>
            <Pressable onPress={() => Alert.alert('Privacy Policy', 'Privacy policy displayed.')}>
              <Text style={styles.termsLinkText}>Privacy Policy.</Text>
            </Pressable>
          </View>

          {/* Create an account button */}
          <PrimaryButton
            title="Create an account"
            onPress={handleRegister}
            loading={loading}
            style={styles.createBtn}
          />

          {/* Already have an account? Sign In */}
          <View style={styles.signInRow}>
            <Text style={styles.signInQuestion}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/auth/login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </Pressable>
          </View>
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
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: COLORS.primary,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
  },
  textInput: {
    fontSize: 14,
    color: '#1E293B',
    height: '100%',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 6,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  phoneNumberInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    height: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11.5,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  checklistContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  checkColumn: {
    flex: 1,
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  bulletDotActive: {
    backgroundColor: COLORS.primary,
  },
  bulletText: {
    fontSize: 10.5,
    color: '#64748B',
  },
  bulletTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  termsNormalText: {
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
  },
  termsLinkText: {
    fontSize: 12,
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  createBtn: {
    marginBottom: 16,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  signInQuestion: {
    fontSize: 13,
    color: '#334155',
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.darkYellow,
  },
});
