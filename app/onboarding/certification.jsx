import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import ProfileStepper from '../../components/ProfileStepper';
import PrimaryButton from '../../components/PrimaryButton';
import CustomDatePickerModal from '../../components/CustomDatePickerModal';
import candidateService from '../../services/candidateService';

export default function CertificationStep() {
  const router = useRouter();

  const [certName, setCertName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [dateOfCompletion, setDateOfCompletion] = useState('2023-04-12');
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [saving, setSaving] = useState(false);

  // Date picker modal state
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleNext = async () => {
    if (certName.trim()) {
      setSaving(true);
      try {
        await candidateService.saveCertifications({
          certificationName: certName.trim(),
          issuingOrganization: issuer.trim(),
          credentialId: credentialId.trim(),
          dateOfCompletion: dateOfCompletion.trim(),
          currentlyWorking,
        });
      } catch (e) {
        console.log('Error saving certification:', e.message);
      } finally {
        setSaving(false);
      }
    }
    router.push('/onboarding/skills-preference');
  };

  const handleSkip = () => {
    router.push('/onboarding/skills-preference');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 6-step Profile Stepper (Step 4 active) */}
      <ProfileStepper currentStep={4} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        <View style={styles.card}>
          {/* Centered Title & Subtitle (Picture 2 Right) */}
          <Text style={styles.title}>Certification</Text>
          <Text style={styles.subtitle}>Do you have certifications?</Text>

          {/* Certification Name */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={certName !== undefined && certName !== null ? String(certName) : ''}
              onChangeText={setCertName}
              placeholder="Certification Name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Issuing Organization */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={issuer !== undefined && issuer !== null ? String(issuer) : ''}
              onChangeText={setIssuer}
              placeholder="Issuing Organization"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Credentials Id */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={credentialId !== undefined && credentialId !== null ? String(credentialId) : ''}
              onChangeText={setCredentialId}
              placeholder="Credentials Id"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Date of Completion with Interactive Calendar Picker */}
          <Pressable
            style={styles.dateInputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[
                styles.dateInputText,
                !dateOfCompletion && styles.placeholderText,
              ]}
            >
              {dateOfCompletion || 'Date of Completion'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          </Pressable>

          {/* Currently Working Here (Left) & Skip (Right) */}
          <View style={styles.workingSkipRow}>
            <Pressable
              style={styles.workingLeft}
              onPress={() => setCurrentlyWorking(!currentlyWorking)}
            >
              <View
                style={[
                  styles.plusBox,
                  currentlyWorking && styles.plusBoxActive,
                ]}
              >
                <Feather
                  name={currentlyWorking ? 'check' : 'plus'}
                  size={14}
                  color={currentlyWorking ? '#FFFFFF' : COLORS.primary}
                />
              </View>
              <Text style={styles.workingText}>Currently Working Here</Text>
            </Pressable>

            <Pressable onPress={handleSkip} hitSlop={10}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          {/* Save and Continue Button */}
          <PrimaryButton
            title="Save and Continue"
            onPress={handleNext}
            loading={saving}
            style={styles.btn}
          />
        </View>
      </ScrollView>

      {/* Date of Completion Calendar Modal */}
      <CustomDatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initialDate={dateOfCompletion}
        onSelectDate={setDateOfCompletion}
        title="Date of Completion"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '400',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
  },
  input: {
    fontSize: 14,
    color: '#1E293B',
    height: '100%',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  dateInputText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  workingSkipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 18,
  },
  workingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  plusBoxActive: {
    backgroundColor: COLORS.primary,
  },
  workingText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  skipText: {
    fontSize: 13.5,
    color: COLORS.primary,
    fontWeight: '700',
  },
  btn: {
    marginTop: 4,
  },
});