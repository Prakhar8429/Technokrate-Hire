import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard, Platform, BackHandler, ToastAndroid, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AuthLayout from '../../components/AuthLayout';
import CustomInput from '../../components/CustomInput';
import PasswordInput from '../../components/PasswordInput';
import PrimaryButton from '../../components/PrimaryButton';
import CustomCheckbox from '../../components/CustomCheckbox';
import LoginIllustration from '../../components/illustrations/LoginIllustration';
import { COLORS } from '../../constants/colors';
import { validateEmail, validatePassword } from '../../utils/validation';
import { setAuthToken } from '../../services/jobService';
import candidateService from '../../services/candidateService';
import { loginJobseeker } from '../../src/api/authApi';
import authStorage from '../../src/storage/authStorage';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Inputs are ALWAYS empty by default until user types or enters after signing up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-populate email if passed from Sign Up screen
  useEffect(() => {
    if (params?.email || params?.registeredEmail) {
      setEmail(String(params?.email || params?.registeredEmail).trim().toLowerCase());
    }
  }, [params]);

  // Safe Android Hardware BackHandler - prevent accidental app closure
  useEffect(() => {
    let lastBackPress = 0;
    const handleBackPress = () => {
      const now = Date.now();
      if (now - lastBackPress < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPress = now;
      if (Platform.OS === 'android') {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      }
      return true;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backSub.remove();
  }, []);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setAuthError('');
    const emailErr = validateEmail(email);
    const passErr = !password ? 'Password is required' : (password.length < 6 ? 'Password must be at least 6 characters' : null);

    if (emailErr || passErr) {
      setErrors({
        email: emailErr,
        password: passErr,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const data = await loginJobseeker({
        email: cleanEmail,
        password,
      });

      if (data?.token) {
        setAuthToken(data.token);
        await authStorage.saveToken(data.token);
      }
      const u = data?.user || data;
      if (u) {
        const parts = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
        const finalName = u.fullName || (parts.length > 0 ? parts : null);
        candidateService.updateUserProfile({
          fullName: finalName || candidateService.getUserProfile()?.fullName || 'User',
          email: u.email || cleanEmail,
          phone: u.mobileNumber || '',
        });
      }
      setLoading(false);
      router.replace('/(tabs)/dashboard');
      return;
    } catch (err) {
      setLoading(false);
      const status = err.status || err.response?.status;
      const msg = err.message || err.response?.data?.message || '';

      // Check if backend returned invalid credentials / wrong password (401)
      if (status === 401 || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('credential')) {
        setAuthError(msg || 'Invalid email or password. Please try again.');
        return;
      }

      // If user is truly not registered / not found (404)
      if (status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no user')) {
        setAuthError(msg || 'Account not found. Please sign up to create your account first.');

        Alert.alert(
          'Account Not Found',
          msg || 'No account found with this email. Please sign up first to create your account.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign Up',
              onPress: () => router.push({
                pathname: '/auth/register',
                params: { email: cleanEmail },
              }),
            },
          ]
        );
        return;
      }

      // Other network / generic error
      setAuthError(msg || 'Unable to sign in. Please check your internet connection.');
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Sign in to your account"
      illustration={<LoginIllustration width={380} height={380} />}
      showBack={false}
    >
      {Boolean(authError) && (
        <View style={styles.authErrorContainer}>
          <Text style={styles.authErrorText}>{authError}</Text>
        </View>
      )}

      {/* Email input */}
      <CustomInput
        label="Enter E-mail"
        placeholder="example@mail.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
          if (authError) setAuthError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      {/* Password input */}
      <PasswordInput
        label="Password"
        placeholder="••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
          if (authError) setAuthError('');
        }}
        error={errors.password}
      />

      {/* Row: Remember Me & Forgot Password */}
      <View style={styles.optionsRow}>
        <CustomCheckbox
          label="Remember Me"
          checked={rememberMe}
          onChange={setRememberMe}
        />
        <Pressable
          onPress={() => router.push('/auth/forgot-password')}
          hitSlop={8}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>
      </View>

      {/* Sign In CTA */}
      <PrimaryButton
        title="Sign In"
        onPress={handleLogin}
        loading={loading}
        style={styles.signInButton}
      />

      {/* Sign Up Link */}
      <View style={styles.signUpRow}>
        <Text style={styles.signUpQuestion}>Don't Have An Account? </Text>
        <Pressable onPress={() => router.push('/auth/register')}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  authErrorContainer: {
    backgroundColor: COLORS.errorBg,
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  authErrorText: {
    color: COLORS.error,
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D49B00', // Halka dark yellow
  },
  signInButton: {
    marginBottom: 18,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signUpQuestion: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D49B00', // Halka dark yellow
  },
});
