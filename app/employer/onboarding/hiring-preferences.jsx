import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EmployerStepper from '../../../components/EmployerStepper';
import PrimaryButton from '../../../components/PrimaryButton';
import BrandLogo from '../../../components/BrandLogo';
import { COLORS } from '../../../constants/colors';
import employerService from '../../../services/employerService';

const ROLES_DOMAINS = [
  'Engineering & Tech',
  'Product & UI/UX',
  'Sales & Marketing',
  'Finance & Accounts',
  'Human Resources',
  'Customer Support',
  'Operations & Logistics',
  'Data & Analytics',
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];
const WORK_MODES = ['On-site', 'Remote', 'Hybrid'];
const EXP_LEVELS = [
  'Fresher (0 - 1 yr)',
  'Mid-Level (2 - 5 yrs)',
  'Senior (5 - 8 yrs)',
  'Lead / Executive (8+ yrs)',
];

export default function EmployerHiringPreferencesScreen() {
  const router = useRouter();

  const [selectedDomains, setSelectedDomains] = useState(['Engineering & Tech']);
  const [selectedJobTypes, setSelectedJobTypes] = useState(['Full-time']);
  const [selectedWorkModes, setSelectedWorkModes] = useState(['Remote', 'Hybrid']);
  const [selectedExpLevels, setSelectedExpLevels] = useState(['Mid-Level (2 - 5 yrs)']);
  const [locations, setLocations] = useState('Bengaluru, Noida, Remote');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const draft = await employerService.getOnboardingDraft();
      if (draft.domains && draft.domains.length) setSelectedDomains(draft.domains);
      if (draft.jobTypes && draft.jobTypes.length) setSelectedJobTypes(draft.jobTypes);
      if (draft.workModes && draft.workModes.length) setSelectedWorkModes(draft.workModes);
      if (draft.expLevels && draft.expLevels.length) setSelectedExpLevels(draft.expLevels);
      if (draft.hiringLocations) setLocations(draft.hiringLocations);
    })();
  }, []);

  const toggleDomain = (item) => {
    if (selectedDomains.includes(item)) {
      if (selectedDomains.length > 1) {
        setSelectedDomains(selectedDomains.filter((d) => d !== item));
      }
    } else {
      setSelectedDomains([...selectedDomains, item]);
    }
  };

  const toggleJobType = (item) => {
    if (selectedJobTypes.includes(item)) {
      if (selectedJobTypes.length > 1) {
        setSelectedJobTypes(selectedJobTypes.filter((t) => t !== item));
      }
    } else {
      setSelectedJobTypes([...selectedJobTypes, item]);
    }
  };

  const toggleWorkMode = (item) => {
    if (selectedWorkModes.includes(item)) {
      if (selectedWorkModes.length > 1) {
        setSelectedWorkModes(selectedWorkModes.filter((m) => m !== item));
      }
    } else {
      setSelectedWorkModes([...selectedWorkModes, item]);
    }
  };

  const toggleExpLevel = (item) => {
    if (selectedExpLevels.includes(item)) {
      if (selectedExpLevels.length > 1) {
        setSelectedExpLevels(selectedExpLevels.filter((e) => e !== item));
      }
    } else {
      setSelectedExpLevels([...selectedExpLevels, item]);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    await employerService.saveOnboardingDraft({
      domains: selectedDomains,
      jobTypes: selectedJobTypes,
      workModes: selectedWorkModes,
      expLevels: selectedExpLevels,
      hiringLocations: locations.trim(),
    });
    setLoading(false);
    router.push('/employer/onboarding/verification');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <BrandLogo size="sm" />
        <View style={{ width: 36 }} />
      </View>

      {/* Stepper */}
      <EmployerStepper currentStep={3} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>STEP 3 OF 4</Text>
          <Text style={styles.title}>Hiring Preferences</Text>
          <Text style={styles.subtitle}>
            Select the domains, arrangements, and candidate experience levels you frequently hire for.
          </Text>
        </View>

        <View style={styles.card}>
          {/* Domains */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Primary Hiring Domains (Multi-select)</Text>
            <View style={styles.chipsWrap}>
              {ROLES_DOMAINS.map((domain) => {
                const active = selectedDomains.includes(domain);
                return (
                  <Pressable
                    key={domain}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleDomain(domain)}
                  >
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'add-circle-outline'}
                      size={15}
                      color={active ? COLORS.primary : '#64748B'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {domain}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Job Types */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Employment Types Offered</Text>
            <View style={styles.chipsWrap}>
              {JOB_TYPES.map((type) => {
                const active = selectedJobTypes.includes(type);
                return (
                  <Pressable
                    key={type}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleJobType(type)}
                  >
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={active ? COLORS.primary : '#94A3B8'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Work Modes */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Workplace Arrangements</Text>
            <View style={styles.chipsWrap}>
              {WORK_MODES.map((mode) => {
                const active = selectedWorkModes.includes(mode);
                return (
                  <Pressable
                    key={mode}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleWorkMode(mode)}
                  >
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={active ? COLORS.primary : '#94A3B8'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {mode}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Experience Levels */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Experience Levels Preferred</Text>
            <View style={styles.chipsWrap}>
              {EXP_LEVELS.map((exp) => {
                const active = selectedExpLevels.includes(exp);
                return (
                  <Pressable
                    key={exp}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => toggleExpLevel(exp)}
                  >
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={active ? COLORS.primary : '#94A3B8'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {exp}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Hiring Locations */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Target Hiring Locations</Text>
            <View style={styles.inputBox}>
              <Ionicons name="map-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Bengaluru, Mumbai, Delhi, Remote"
                placeholderTextColor="#94A3B8"
                value={locations}
                onChangeText={setLocations}
              />
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <PrimaryButton
            title="Save & Continue"
            onPress={handleNext}
            loading={loading}
          />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginVertical: 14,
  },
  stepIndicator: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  fieldSection: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#F2E6F8',
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#FAFAFA',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  actionContainer: {
    marginTop: 8,
  },
});