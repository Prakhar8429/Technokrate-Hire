import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AuthLayout from '../../components/AuthLayout';
import PasswordInput from '../../components/PasswordInput';
import PrimaryButton from '../../components/PrimaryButton';
import LoginIllustration from '../../components/illustrations/LoginIllustration';
import { validatePassword, validateConfirmPassword } from '../../utils/validation';
import { resetPassword } from '../../src/api/authApi';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const passErr = validatePassword(password, 6);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    if (passErr || confirmErr) {
      setErrors({
        password: passErr,
        confirmPassword: confirmErr,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        newPassword: password,
      });

      setLoading(false);
      Keyboard.dismiss();
      router.push('/auth/password-success');
    } catch (e) {
      setLoading(false);
      const msg = e.response?.data?.message || e.message;
      Alert.alert('Reset Password Failed', msg || 'Could not reset password. Please try again.');
    }
  };

  const handleSkip = () => {
    Keyboard.dismiss();
    router.replace('/auth/login');
  };

  return (
    <AuthLayout
      title="Reset Password"
      description={`Your OTP was sent to ${email}`}
      illustration={<LoginIllustration width={380} height={380} />}
      showBack={true}
      topRightText="Skip >"
      onTopRightPress={handleSkip}
    >
      {/* New Password */}
      <PasswordInput
        label="Enter New Password"
        placeholder="••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
        }}
        error={errors.password}
      />

      {/* Confirm New Password */}
      <PasswordInput
        label="Confirm New Password"
        placeholder="••••••"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (errors.confirmPassword)
            setErrors((prev) => ({ ...prev, confirmPassword: null }));
        }}
        error={errors.confirmPassword}
      />

      {/* Back to Sign In */}
      <View style={styles.backRow}>
        <Pressable onPress={() => router.push('/auth/login')} hitSlop={8}>
          <Text style={styles.backLink}>Back to Sign In</Text>
        </Pressable>
      </View>

      {/* Submit Button */}
      <PrimaryButton
        title="Reset Password"
        onPress={handleReset}
        loading={loading}
        style={styles.resetButton}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignItems: 'flex-end',
    marginBottom: 22,
    marginTop: -6,
  },
  backLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D49B00', // Halka dark yellow
  },
  resetButton: {
    marginBottom: 12,
  },
});
