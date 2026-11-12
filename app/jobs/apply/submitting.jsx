import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import applicationService from '../../../services/applicationService';
import { jobService } from '../../../services/jobService';

export default function SubmittingApplicationScreen() {
  const router = useRouter();
  const submittedRef = useRef(false);

  useEffect(() => {
    // Disable Android back button during submission
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

    const submit = async () => {
      if (submittedRef.current) return;
      submittedRef.current = true;

      const data = applicationService.getApplicationData();

      try {
        await jobService.applyForJob(data.jobId, data);
      } catch (e) {
        console.log('Submission fallback:', e);
      }

      // Small delay for smooth transition as per PRD
      setTimeout(() => {
        router.replace('/jobs/apply/success');
      }, 1400);
    };

    submit();

    return () => backHandler.remove();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Purple Progress Circle Illustration */}
        <View style={styles.illustrationWrap}>
          <View style={styles.outerCircle}>
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
            <View style={styles.innerDocBox}>
              <Ionicons name="document-text" size={32} color={COLORS.primary} />
            </View>
          </View>
        </View>

        {/* Status Messages */}
        <Text style={styles.title}>Submitting application...</Text>
        <Text style={styles.subtitle}>Please wait while we submit your application.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.appBg,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  illustrationWrap: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    position: 'absolute',
    width: 120,
    height: 120,
    transform: [{ scale: 2.2 }],
  },
  innerDocBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondaryColor,
    textAlign: 'center',
    lineHeight: 20,
  },
});
