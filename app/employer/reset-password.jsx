import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView, Keyboard, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../../components/BrandLogo';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import { validatePassword } from '../../utils/validation';
import employerService from '../../services/employerService';
import { AuthLayoutContext } from '../../components/AuthLayout';

export default function EmployerResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email || '').trim().toLowerCase();
  const scrollViewRef = useRef(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
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

  const handleResetPassword = async () => {
    const newErrors = {};
    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const result = await employerService.resetPassword(email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Password Reset Successful',
        'Your password has been changed successfully. You can now sign in with your new credentials.',
        [
          {
            text: 'Sign In Now',
            onPress: () => router.replace('/employer/login'),
          },
        ]
      );
    } else {
      Alert.alert('Reset Failed', result.message || 'Unable to reset password. Please try again.');
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

            <View style={styles.header}>
              <BrandLogo size="md" />
              <View style={styles.badgeRow}>
                <View style={styles.employerBadge}>
                  <Ionicons name="key" size={14} color="#7000B0" />
                  <Text style={styles.employerBadgeText}>Security Update</Text>
                </View>
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Create a strong new password for your employer account
              </Text>
            </View>

            <View style={styles.form}>
              <CustomInput
                label="New Password"
                placeholder="Enter new password (min. 6 chars)"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                secureTextEntry
                icon="lock-closed-outline"
                error={errors.password}
              />

              <CustomInput
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }}
                secureTextEntry
                icon="shield-checkmark-outline"
                error={errors.confirmPassword}
              />

              <View style={styles.buttonWrapper}>
                <PrimaryButton
                  title="Save & Sign In"
                  onPress={handleResetPassword}
                  loading={loading}
                />
              </View>
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
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginTop: 8,
  },
  buttonWrapper: {
    marginTop: 16,
  },
});