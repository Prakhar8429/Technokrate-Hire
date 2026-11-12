import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import AuthLayout from '../../components/AuthLayout';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import ForgotPasswordIllustration from '../../components/illustrations/ForgotPasswordIllustration';
import { validateEmail } from '../../utils/validation';
import { sendForgotPasswordOtp } from '../../src/api/authApi';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const data = await sendForgotPasswordOtp({ email: email.trim().toLowerCase() });
      setLoading(false);

      if (data && data.otp) {
        Alert.alert(
          'OTP Sent',
          `A verification code has been sent to ${email.trim()}.\n\nCode: ${data.otp}`
        );
      } else {
        Alert.alert(
          'OTP Sent',
          `A verification code has been sent to ${email.trim()}.`
        );
      }

      router.push({
        pathname: '/auth/verify-otp',
        params: { email: email.trim() },
      });
    } catch (e) {
      setLoading(false);
      const status = e.status || e.response?.status;
      const msg = e.response?.data?.message || e.message;

      if (status === 404 || (msg && msg.toLowerCase().includes('not found'))) {
        setError(msg || 'No account found with this email.');
        return;
      }

      setError(msg || 'Failed to send OTP. Please check your network and try again.');
    }
  };

  return (
    <AuthLayout
      title={'Forgot\nPassword'}
      description="Please enter your email address"
      illustration={<ForgotPasswordIllustration width={380} height={380} />}
      showBack={true}
    >
      <CustomInput
        label="Enter E-mail"
        placeholder="example@mail.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
      />

      <View style={styles.backRow}>
        <Pressable onPress={() => router.push('/auth/login')} hitSlop={8}>
          <Text style={styles.backLink}>Back to Sign In</Text>
        </Pressable>
      </View>

      <PrimaryButton
        title="Reset Password"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  backRow: {
    alignItems: 'flex-end',
    marginBottom: 24,
    marginTop: -6,
  },
  backLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D49B00', // Halka dark yellow
  },
  submitButton: {
    marginBottom: 12,
  },
});
