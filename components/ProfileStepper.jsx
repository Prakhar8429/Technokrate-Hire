import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import candidateService from '../services/candidateService';

export default function ProfileStepper({ currentStep = 1, onSkip, showSkip = true }) {
  const router = useRouter();

  const steps = [
    { num: 1, label: 'Basic Details', icon: 'person', route: '/onboarding' },
    { num: 2, label: 'Education', icon: 'school', route: '/onboarding/education' },
    { num: 3, label: 'Work Exp.', icon: 'briefcase', route: '/onboarding/work-experience' },
    { num: 4, label: 'Certif.', icon: 'ribbon', route: '/onboarding/certification' },
    { num: 5, label: 'Skills/Pref.', icon: 'sparkles', route: '/onboarding/skills-preference' },
    { num: 6, label: 'Documents', icon: 'document-text', route: '/onboarding/documents' },
  ];

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      return;
    }
    if (currentStep < 6) {
      const nextStep = steps.find((s) => s.num === currentStep + 1);
      if (nextStep) {
        router.push(nextStep.route);
        return;
      }
    }
    candidateService.setProfileCompleted(true);
    router.replace('/(tabs)/dashboard');
  };

  const completedSegments = Math.min(5, Math.max(0, currentStep - 1));
  const progressPercent = (completedSegments / 5) * 83.34;

  return (
    <View style={styles.container}>
      {/* Top Header Row with Skip Action (Screenshot 10) */}
      <View style={styles.headerRow}>
        <Text style={styles.stepCounterText}>
          {currentStep <= 6 ? `STEP ${currentStep} OF 6` : 'PROFILE COMPLETED'}
        </Text>
        {showSkip && currentStep <= 6 && (
          <Pressable
            style={({ pressed }) => [styles.skipBtn, pressed && styles.skipBtnPressed]}
            onPress={handleSkip}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Skip profile completion"
          >
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
          </Pressable>
        )}
      </View>

      <View style={styles.stepperWrapper}>
        {/* Inactive connector line behind circles */}
        <View style={styles.trackLine} />
        {/* Active connector line */}
        {currentStep > 1 && (
          <View
            style={[
              styles.activeTrackLine,
              { width: `${progressPercent}%` },
            ]}
          />
        )}

        <View style={styles.stepperRow}>
          {steps.map((step) => {
            const isCompleted = step.num < currentStep;
            const isActive = step.num === currentStep;

            return (
              <Pressable
                key={step.num}
                style={styles.stepCol}
                onPress={() => router.push(step.route)}
                hitSlop={8}
              >
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isActive && styles.circleActive,
                  ]}
                >
                  <Ionicons
                    name={isCompleted ? 'checkmark' : step.icon}
                    size={isCompleted ? 14 : 12}
                    color={isCompleted || isActive ? '#FFFFFF' : '#94A3B8'}
                  />
                </View>

                <Text
                  style={[
                    styles.label,
                    (isActive || isCompleted) && styles.labelActive,
                  ]}
                  numberOfLines={2}
                >
                  {step.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderRadius: 14,
    gap: 3,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  skipBtnPressed: {
    opacity: 0.7,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepperWrapper: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  trackLine: {
    position: 'absolute',
    top: 13,
    left: '8.33%',
    width: '83.34%',
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  activeTrackLine: {
    position: 'absolute',
    top: 13,
    left: '8.33%',
    height: 2,
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 2,
  },
  stepCol: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  circleCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  circleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 8.5,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 11,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
