import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';
import ProfileStepper from '../../components/ProfileStepper';
import candidateService from '../../services/candidateService';

export default function OnboardingCompletionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 6-step Profile Stepper - All 6 steps completed */}
      <ProfileStepper currentStep={7} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Centered Title & Welcome Text (media_1789809805337.png) */}
          <Text style={styles.mainTitle}>You're All Set</Text>
          <Text style={styles.welcomeText}>
            <Text style={styles.welcomePurple}>Welcome</Text> to Technokrate Hire
          </Text>

          {/* Exact Lady at Desk Illustration from user image */}
          <View style={styles.illustrationBox}>
            <Image
              source={require('../../assets/images/completion_lady.png')}
              style={styles.ladyImage}
              resizeMode="contain"
            />
          </View>

          {/* Profile Completion Text */}
          <Text style={styles.completionStatus}>
            Your profile is now{' '}
            <Text style={styles.percentHighlight}>90%</Text> complete
          </Text>
          <Text style={styles.subMessage}>
            Start exploring job opportunities tailored for you.
          </Text>

          {/* Action Buttons Row (Go to My Profile & Save and Continue) */}
          <View style={styles.btnRow}>
            {/* Go to My Profile Button */}
            <Pressable
              style={styles.profileBtn}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.profileBtnText}>Go to My Profile</Text>
            </Pressable>

            {/* Save and Continue Button */}
            <Pressable
              style={styles.saveBtn}
              onPress={() => {
                candidateService.setProfileCompleted(true);
                router.replace('/(tabs)/jobs');
              }}
            >
              <Text style={styles.saveBtnText}>Save and Continue</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FC',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  welcomePurple: {
    color: COLORS.primary,
  },
  illustrationBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  ladyImage: {
    width: 190,
    height: 160,
  },
  completionStatus: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  percentHighlight: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  subMessage: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  profileBtnText: {
    color: COLORS.primary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});