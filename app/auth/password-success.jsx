import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import AuthLayout from '../../components/AuthLayout';
import PrimaryButton from '../../components/PrimaryButton';
import SuccessIllustration from '../../components/illustrations/SuccessIllustration';

export default function PasswordSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  const handleSignIn = () => {
    Keyboard.dismiss();
    router.replace('/auth/login');
  };

  return (
    <AuthLayout
      illustration={<SuccessIllustration width={380} height={380} />}
      showBack={false}
    >
      <View style={styles.content}>
        {/* Rosette Flower Checkmark Badge matching Figma media_1789599255956 */}
        <View style={styles.badgeContainer}>
          <Image
            source={require('../../assets/images/success_badge.png')}
            style={styles.badgeImage}
            resizeMode="contain"
          />
        </View>

        {/* 2-line title matching media_1789599299876 */}
        <Text style={styles.title}>Reset</Text>
        <Text style={styles.title}>Password</Text>

        <Text style={styles.successMessage}>Password Reset Successfull</Text>

        <PrimaryButton
          title="Sign In"
          onPress={handleSignIn}
          style={styles.signInButton}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  badgeContainer: {
    marginBottom: 20,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: {
    width: 88,
    height: 88,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7000B0', // Exact vibrant purple from Figma
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(112, 0, 176, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  successMessage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginTop: 20,
    marginBottom: 28,
    textAlign: 'center',
  },
  signInButton: {
    width: '100%',
  },
});
