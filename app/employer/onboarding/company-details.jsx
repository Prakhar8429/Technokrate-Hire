import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EmployerStepper from '../../../components/EmployerStepper';
import CustomInput from '../../../components/CustomInput';
import PrimaryButton from '../../../components/PrimaryButton';
import BrandLogo from '../../../components/BrandLogo';
import { COLORS } from '../../../constants/colors';
import employerService from '../../../services/employerService';

const INDUSTRIES = [
  'IT & Software',
  'Banking & Finance',
  'Healthcare',
  'E-Commerce & Retail',
  'Education / EdTech',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
];

const COMPANY_SIZES = ['1 - 10', '11 - 50', '51 - 200', '201 - 500', '500+'];

export default function EmployerCompanyDetailsScreen() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [companySize, setCompanySize] = useState(COMPANY_SIZES[1]);
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const user = employerService.getUser();
      if (user?.email) setEmail(user.email);
      if (user?.companyName) setCompanyName(user.companyName);
      if (user?.phone) setPhone(user.phone);

      const draft = await employerService.getOnboardingDraft();
      if (draft.companyName) setCompanyName(draft.companyName);
      if (draft.email) setEmail(draft.email);
      if (draft.phone) setPhone(draft.phone);
      if (draft.website) setWebsite(draft.website);
      if (draft.industry) setIndustry(draft.industry);
      if (draft.companySize) setCompanySize(draft.companySize);
      if (draft.location) setLocation(draft.location);
    })();
  }, []);

  const handleNext = async () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!location.trim()) newErrors.location = 'City / Location is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    await employerService.saveOnboardingDraft({
      companyName: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      website: website.trim(),
      industry,
      companySize,
      location: location.trim(),
    });

    setLoading(false);
    router.push('/employer/onboarding/business-details');
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
      <EmployerStepper currentStep={1} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>STEP 1 OF 4</Text>
          <Text style={styles.title}>Company Details</Text>
          <Text style={styles.subtitle}>
            Provide basic information about your organization to setup your hiring profile.
          </Text>
        </View>

        <View style={styles.card}>
          <CustomInput
            label="Company Name *"
            placeholder="e.g. Acme Technologies Inc."
            value={companyName}
            onChangeText={(t) => {
              setCompanyName(t);
              if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: null }));
            }}
            icon="business-outline"
            error={errors.companyName}
          />

          <CustomInput
            label="Official Contact Email *"
            placeholder="hr@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />

          <CustomInput
            label="Contact / Phone Number *"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
            }}
            keyboardType="phone-pad"
            icon="call-outline"
            error={errors.phone}
          />

          <CustomInput
            label="Company Website"
            placeholder="https://company.com"
            value={website}
            onChangeText={setWebsite}
            autoCapitalize="none"
            icon="globe-outline"
          />

          {/* Industry Selection */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Industry / Sector *</Text>
            <View style={styles.chipsWrap}>
              {INDUSTRIES.map((item) => {
                const selected = industry === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setIndustry(item)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Company Size Selection */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Company Size (Employees) *</Text>
            <View style={styles.chipsWrap}>
              {COMPANY_SIZES.map((size) => {
                const selected = companySize === size;
                return (
                  <Pressable
                    key={size}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setCompanySize(size)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {size}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <CustomInput
            label="Headquarters Location / City *"
            placeholder="e.g. Bengaluru, Karnataka"
            value={location}
            onChangeText={(t) => {
              setLocation(t);
              if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
            }}
            icon="location-outline"
            error={errors.location}
          />
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
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
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
  actionContainer: {
    marginTop: 8,
  },
});