import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EmployerStepper from '../../../components/EmployerStepper';
import CustomInput from '../../../components/CustomInput';
import PrimaryButton from '../../../components/PrimaryButton';
import BrandLogo from '../../../components/BrandLogo';
import { COLORS } from '../../../constants/colors';
import employerService from '../../../services/employerService';

const ENTITY_TYPES = [
  'Private Limited',
  'LLP',
  'Public Limited',
  'Sole Proprietorship',
  'Partnership',
];

export default function EmployerBusinessDetailsScreen() {
  const router = useRouter();

  const [legalName, setLegalName] = useState('');
  const [entityType, setEntityType] = useState(ENTITY_TYPES[0]);
  const [gstin, setGstin] = useState('');
  const [cin, setCin] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const [aboutCompany, setAboutCompany] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const draft = await employerService.getOnboardingDraft();
      if (draft.companyName && !legalName) setLegalName(draft.companyName);
      if (draft.legalName) setLegalName(draft.legalName);
      if (draft.entityType) setEntityType(draft.entityType);
      if (draft.gstin) setGstin(draft.gstin);
      if (draft.cin) setCin(draft.cin);
      if (draft.yearEstablished) setYearEstablished(draft.yearEstablished);
      if (draft.aboutCompany) setAboutCompany(draft.aboutCompany);
    })();
  }, []);

  const handleNext = async () => {
    const newErrors = {};
    if (!legalName.trim()) newErrors.legalName = 'Legal entity name is required';
    if (!yearEstablished.trim()) newErrors.yearEstablished = 'Year established is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    await employerService.saveOnboardingDraft({
      legalName: legalName.trim(),
      entityType,
      gstin: gstin.trim().toUpperCase(),
      cin: cin.trim().toUpperCase(),
      yearEstablished: yearEstablished.trim(),
      aboutCompany: aboutCompany.trim(),
    });

    setLoading(false);
    router.push('/employer/onboarding/hiring-preferences');
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
      <EmployerStepper currentStep={2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>STEP 2 OF 4</Text>
          <Text style={styles.title}>Business Details</Text>
          <Text style={styles.subtitle}>
            Enter the registered legal details for corporate credibility & compliance.
          </Text>
        </View>

        <View style={styles.card}>
          <CustomInput
            label="Registered Legal Entity Name *"
            placeholder="e.g. Acme Tech Solutions Pvt Ltd"
            value={legalName}
            onChangeText={(t) => {
              setLegalName(t);
              if (errors.legalName) setErrors((prev) => ({ ...prev, legalName: null }));
            }}
            icon="shield-outline"
            error={errors.legalName}
          />

          {/* Entity Type Selection */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Business Entity Type *</Text>
            <View style={styles.chipsWrap}>
              {ENTITY_TYPES.map((type) => {
                const selected = entityType === type;
                return (
                  <Pressable
                    key={type}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setEntityType(type)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {type}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <CustomInput
            label="GSTIN / Tax ID Number"
            placeholder="e.g. 07AAAAA0000A1Z5"
            value={gstin}
            onChangeText={setGstin}
            autoCapitalize="characters"
            icon="receipt-outline"
          />

          <CustomInput
            label="CIN / Business Registration No."
            placeholder="e.g. U72200DL2020PTC123456"
            value={cin}
            onChangeText={setCin}
            autoCapitalize="characters"
            icon="document-text-outline"
          />

          <CustomInput
            label="Year Established *"
            placeholder="e.g. 2018"
            value={yearEstablished}
            onChangeText={(t) => {
              setYearEstablished(t);
              if (errors.yearEstablished) setErrors((prev) => ({ ...prev, yearEstablished: null }));
            }}
            keyboardType="number-pad"
            icon="calendar-outline"
            error={errors.yearEstablished}
          />

          {/* About Company TextArea */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Company Overview & Mission</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="Tell candidates about your company culture, mission, and vision..."
                placeholderTextColor="#94A3B8"
                value={aboutCompany}
                onChangeText={setAboutCompany}
                textAlignVertical="top"
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
  textAreaBox: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 80,
    fontSize: 14,
    color: '#0F172A',
  },
  actionContainer: {
    marginTop: 8,
  },
});