import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import PrimaryButton from '../../../components/PrimaryButton';
import applicationService from '../../../services/applicationService';

export default function ApplicationSuccessScreen() {
  const router = useRouter();
  const data = applicationService.getApplicationData();

  const jobTitle = data.jobTitle || 'Senior Product Designer';
  const companyName = data.companyName || 'Technokrate Hire';

  useEffect(() => {
    // Hardware back navigates to jobs tabs rather than looping back to submit
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)/jobs');
      return true;
    });

    return () => backHandler.remove();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Celebration / Success Icon with Confetti Accent */}
        <View style={styles.iconWrapper}>
          {/* Confetti dots */}
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
          <View style={[styles.dot, styles.dot4]} />
          <View style={[styles.dot, styles.dot5]} />
          <View style={[styles.dot, styles.dot6]} />

          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>
        </View>

        {/* Text Details */}
        <Text style={styles.title}>Application submitted!</Text>
        <Text style={styles.description}>
          Your application for <Text style={styles.boldText}>{jobTitle}</Text> at{' '}
          <Text style={styles.boldText}>{companyName}</Text> has been submitted successfully.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <PrimaryButton
            title="View Application"
            onPress={() => router.replace('/applied-jobs')}
            style={styles.viewBtn}
          />

          <Pressable
            style={styles.backJobsBtn}
            onPress={() => router.replace('/(tabs)/jobs')}
          >
            <Text style={styles.backJobsBtnText}>Back to Jobs</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#34D399', // Fresh mint teal green matching reference
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  dot: {
    position: 'absolute',
    borderRadius: 3,
  },
  dot1: {
    width: 6,
    height: 6,
    backgroundColor: '#F59E0B', // gold
    top: 15,
    left: 25,
  },
  dot2: {
    width: 8,
    height: 8,
    backgroundColor: '#60A5FA', // blue
    top: 20,
    right: 25,
  },
  dot3: {
    width: 6,
    height: 6,
    backgroundColor: '#EC4899', // pink
    bottom: 25,
    left: 20,
  },
  dot4: {
    width: 7,
    height: 7,
    backgroundColor: '#A855F7', // purple
    bottom: 20,
    right: 25,
  },
  dot5: {
    width: 5,
    height: 5,
    backgroundColor: '#10B981', // green
    top: 5,
    left: 70,
  },
  dot6: {
    width: 5,
    height: 5,
    backgroundColor: '#F97316', // orange
    bottom: 10,
    left: 65,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13.5,
    color: COLORS.textSecondaryColor,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.textDark,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  viewBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 50,
  },
  backJobsBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  backJobsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
