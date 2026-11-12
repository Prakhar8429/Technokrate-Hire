import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EmployerStepper from '../../../components/EmployerStepper';
import CustomInput from '../../../components/CustomInput';
import PrimaryButton from '../../../components/PrimaryButton';
import BrandLogo from '../../../components/BrandLogo';
import { COLORS } from '../../../constants/colors';
import employerService from '../../../services/employerService';

const DOC_TYPES = [
  'Certificate of Incorporation',
  'GST Registration Certificate',
  'Company PAN Card',
  'MSME / Udyam Registration',
];

export default function EmployerVerificationScreen() {
  const router = useRouter();

  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [docNumber, setDocNumber] = useState('');
  const [uploadedFile, setUploadedFile] = useState('Certificate_of_Incorporation.pdf');
  const [authorizedName, setAuthorizedName] = useState('');
  const [designation, setDesignation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const user = employerService.getUser();
      if (user?.name && !authorizedName) setAuthorizedName(user.name);

      const draft = await employerService.getOnboardingDraft();
      if (draft.authorizedName) setAuthorizedName(draft.authorizedName);
      if (draft.designation) setDesignation(draft.designation);
      if (draft.docType) setDocType(draft.docType);
      if (draft.docNumber) setDocNumber(draft.docNumber);
      if (draft.linkedinUrl) setLinkedinUrl(draft.linkedinUrl);
    })();
  }, []);

  const handleSimulateUpload = () => {
    Alert.alert(
      'Document Selected',
      `${docType.replace(/\s+/g, '_')}_verified.pdf has been attached successfully.`
    );
    setUploadedFile(`${docType.replace(/\s+/g, '_')}_verified.pdf`);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!authorizedName.trim()) newErrors.authorizedName = 'Authorized person name is required';
    if (!designation.trim()) newErrors.designation = 'Designation / role is required';
    if (!acceptedTerms) newErrors.terms = 'Please accept the declaration to proceed';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const draft = await employerService.getOnboardingDraft();
    const payload = {
      ...draft,
      docType,
      docNumber: docNumber.trim(),
      uploadedFile,
      authorizedName: authorizedName.trim(),
      designation: designation.trim(),
      linkedinUrl: linkedinUrl.trim(),
      verifiedAt: new Date().toISOString(),
    };

    const result = await employerService.completeOnboarding(payload);
    setLoading(false);

    if (result.success) {
      router.replace('/employer/onboarding/completion');
    } else {
      Alert.alert('Submission Error', result.message || 'Failed to complete onboarding');
    }
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
      <EmployerStepper currentStep={4} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>STEP 4 OF 4</Text>
          <Text style={styles.title}>Verification & Docs</Text>
          <Text style={styles.subtitle}>
            Authenticate your corporate presence to start receiving verified applications.
          </Text>
        </View>

        <View style={styles.card}>
          {/* Document Type Selection */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Select Verification Document *</Text>
            <View style={styles.chipsWrap}>
              {DOC_TYPES.map((type) => {
                const selected = docType === type;
                return (
                  <Pressable
                    key={type}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setDocType(type)}
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
            label="Document / Registration Number"
            placeholder="e.g. U72200DL2020PTC123456 / GSTIN"
            value={docNumber}
            onChangeText={setDocNumber}
            autoCapitalize="characters"
            icon="key-outline"
          />

          {/* Upload Box */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Upload Document (PDF or Image) *</Text>
            <Pressable style={styles.uploadArea} onPress={handleSimulateUpload}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload-outline" size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.uploadMainText}>
                {uploadedFile ? uploadedFile : 'Tap to select document from files'}
              </Text>
              <Text style={styles.uploadSubText}>
                Supported formats: PDF, PNG, JPG (Max 10MB)
              </Text>
              {uploadedFile ? (
                <View style={styles.uploadedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.uploadedBadgeText}>Attached & Ready</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          <CustomInput
            label="Authorized Person / Recruiter Name *"
            placeholder="e.g. Ravi Sharma"
            value={authorizedName}
            onChangeText={(t) => {
              setAuthorizedName(t);
              if (errors.authorizedName) setErrors((prev) => ({ ...prev, authorizedName: null }));
            }}
            icon="person-outline"
            error={errors.authorizedName}
          />

          <CustomInput
            label="Designation / Official Role *"
            placeholder="e.g. Head of Talent Acquisition / HR Manager"
            value={designation}
            onChangeText={(t) => {
              setDesignation(t);
              if (errors.designation) setErrors((prev) => ({ ...prev, designation: null }));
            }}
            icon="briefcase-outline"
            error={errors.designation}
          />

          <CustomInput
            label="Corporate / LinkedIn Profile"
            placeholder="https://linkedin.com/in/username"
            value={linkedinUrl}
            onChangeText={setLinkedinUrl}
            autoCapitalize="none"
            icon="logo-linkedin"
          />

          {/* Declaration Checkbox */}
          <Pressable
            style={styles.termsRow}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <Ionicons
              name={acceptedTerms ? 'checkbox' : 'square-outline'}
              size={22}
              color={acceptedTerms ? COLORS.primary : '#94A3B8'}
            />
            <Text style={styles.termsText}>
              I declare and confirm that all corporate details and documents provided are genuine, authorized, and accurate.
            </Text>
          </Pressable>
          {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}
        </View>

        <View style={styles.actionContainer}>
          <PrimaryButton
            title="Complete & Submit Verification"
            onPress={handleSubmit}
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
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: '#FAF5FC',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2E6F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadMainText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  uploadSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  uploadedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
  },
  actionContainer: {
    marginTop: 8,
  },
});