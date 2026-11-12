import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function EmployerStepper({ currentStep = 1 }) {
  const router = useRouter();

  const steps = [
    { num: 1, label: 'Company\nDetails', route: '/employer/onboarding/company-details' },
    { num: 2, label: 'Business\nDetails', route: '/employer/onboarding/business-details' },
    { num: 3, label: 'Hiring\nPreferences', route: '/employer/onboarding/hiring-preferences' },
    { num: 4, label: 'Verification &\nDocumentation', route: '/employer/onboarding/verification' },
  ];

  const progressPercent = Math.min(100, Math.max(0, ((currentStep - 1) / 3) * 75));

  return (
    <View style={styles.container}>
      <View style={styles.stepperWrapper}>
        <View style={styles.trackLine} />
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
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  ) : isActive ? (
                    <View style={styles.innerDot} />
                  ) : null}
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
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  stepperWrapper: {
    position: 'relative',
    width: '100%',
  },
  trackLine: {
    position: 'absolute',
    top: 11,
    left: '12.5%',
    right: '12.5%',
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  activeTrackLine: {
    position: 'absolute',
    top: 11,
    left: '12.5%',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  circleCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  circleActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});