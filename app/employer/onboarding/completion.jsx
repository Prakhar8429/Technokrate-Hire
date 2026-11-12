import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../../../components/BrandLogo';
import PrimaryButton from '../../../components/PrimaryButton';
import { COLORS } from '../../../constants/colors';

const PERKS = [
  {
    icon: 'briefcase',
    title: 'Post Unlimited Openings',
    desc: 'Reach thousands of qualified job seekers instantly.',
  },
  {
    icon: 'sparkles',
    title: 'AI Smart Matches',
    desc: 'Access pre-screened talent recommendations tailored to your stack.',
  },
  {
    icon: 'people',
    title: 'Pipeline Management',
    desc: 'Shortlist, interview, and hire candidates with end-to-end tracking.',
  },
];

export default function EmployerCompletionScreen() {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.replace('/employer/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topLogo}>
          <BrandLogo size="md" />
        </View>

        <View style={styles.card}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <Ionicons name="checkmark-sharp" size={38} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Your employer profile has been submitted and verified. You are now equipped to discover and hire top talent with Technokrate Hire.
          </Text>

          <View style={styles.perksList}>
            {PERKS.map((perk, index) => (
              <View key={index} style={styles.perkItem}>
                <View style={styles.perkIconBox}>
                  <Ionicons name={perk.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={styles.perkInfo}>
                  <Text style={styles.perkTitle}>{perk.title}</Text>
                  <Text style={styles.perkDesc}>{perk.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actionBtn}>
            <PrimaryButton
              title="Go to Employer Dashboard"
              onPress={handleGoToDashboard}
            />
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 36,
  },
  topLogo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: 'center',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  successIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2E6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  successIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  perksList: {
    width: '100%',
    marginVertical: 24,
    gap: 12,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  perkIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FAF5FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  perkInfo: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  perkDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  actionBtn: {
    width: '100%',
    marginTop: 6,
  },
});