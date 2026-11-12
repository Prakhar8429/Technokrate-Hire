import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AuthLayout from '../../components/AuthLayout';
import OTPInput from '../../components/OTPInput';
import PrimaryButton from '../../components/PrimaryButton';
import ForgotPasswordIllustration from '../../components/illustrations/ForgotPasswordIllustration';
import { COLORS } from '../../constants/colors';
import { validateOTP } from '../../utils/validation';
import { sendForgotPasswordOtp, verifyPasswordOtp } from '../../src/api/authApi';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recoveryEmail = params.email || 'your email';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval = null;
    if (secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((sec) => sec - 1);
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
    setSecondsLeft(60);
    setCanResend(false);
    setError(null);
    setOtp('');

    try {
      const data = await sendForgotPasswordOtp({ email: recoveryEmail });
      if (data && data.otp) {
        Alert.alert('New OTP Sent', `A new code was sent.\n\nCode: ${data.otp}`);
      } else {
        Alert.alert('OTP Sent', 'A new verification code was sent to your email.');
      }
    } catch (e) {
      Alert.alert('OTP Sent', 'A verification code was dispatched.');
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const err = validateOTP(otp);
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await verifyPasswordOtp({
        email: recoveryEmail,
        otp: otp.trim(),
      });
      setLoading(false);

      if (data?.success || data?.message?.toLowerCase().includes('success')) {
        router.push({
          pathname: '/auth/reset-password',
          params: { email: recoveryEmail },
        });
      } else {
        setError(data?.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (e) {
      setLoading(false);
      const msg = e.response?.data?.message || e.message;
      setError(msg || 'Invalid or expired OTP. Please try again.');
    }
  };

  const formatTimer = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <AuthLayout
      title="Enter OTP"
      description={`Your OTP was sent to ${recoveryEmail}`}
      illustration={<ForgotPasswordIllustration width={380} height={380} />}
      showBack={true}
    >
      {/* OTP Input Component */}
      <OTPInput
        value={otp}
        onChange={(val) => {
          setOtp(val);
          if (error) setError(null);
        }}
        hasError={Boolean(error)}
      />

      {Boolean(error) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Timer & Resend Row */}
      <View style={styles.timerRow}>
        {canResend ? (
          <Pressable onPress={handleResend} hitSlop={8}>
            <Text style={styles.resendActiveText}>Resend Code</Text>
          </Pressable>
        ) : (
          <Text style={styles.timerText}>
            Resend Code in <Text style={styles.timerHighlight}>{formatTimer()}</Text>
          </Text>
        )}
      </View>

      {/* Back to Sign In Link */}
      <View style={styles.backRow}>
        <Pressable onPress={() => router.push('/auth/login')} hitSlop={8}>
          <Text style={styles.backLink}>Back to Sign In</Text>
        </Pressable>
      </View>

      {/* Verify Button */}
      <PrimaryButton
        title="Verify OTP"
        onPress={handleVerify}
        loading={loading}
        style={styles.verifyButton}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 8,
    marginBottom: 14,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 14,
  },
  timerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  timerHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  resendActiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  backRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  backLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D49B00', // Halka dark yellow
  },
  verifyButton: {
    marginBottom: 10,
  },
  mockOtpBtn: {
    backgroundColor: '#F3E8FF',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginTop: 2,
    marginBottom: 10,
  },
  mockOtpText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
