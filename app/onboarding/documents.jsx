import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import ProfileStepper from '../../components/ProfileStepper';
import PrimaryButton from '../../components/PrimaryButton';
import candidateService from '../../services/candidateService';

export default function DocumentsStep() {
  const router = useRouter();

  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [additionalUploaded, setAdditionalUploaded] = useState(false);

  const handleSelectPhoto = () => {
    setPhotoUploaded(!photoUploaded);
    Alert.alert('Photo Selected', photoUploaded ? 'Photo removed' : 'Profile photo selected successfully.');
  };

  const handleSelectResume = () => {
    setResumeUploaded(!resumeUploaded);
    Alert.alert('Resume Selected', resumeUploaded ? 'Resume removed' : 'Resume document selected successfully.');
  };

  const handleSelectAdditional = () => {
    setAdditionalUploaded(!additionalUploaded);
    Alert.alert('Additional Document', additionalUploaded ? 'Document removed' : 'Additional document attached.');
  };

  const handleNext = () => {
    candidateService.setProfileCompleted(true);
    candidateService.saveFullProfileDetails({
      profileCompleted: true,
      hasDocuments: Boolean(photoUploaded || resumeUploaded || additionalUploaded),
    }).catch(() => {});
    router.push('/onboarding/completion');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 6-step Profile Stepper (Step 6 active) */}
      <ProfileStepper currentStep={6} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        <View style={styles.card}>
          {/* Centered Title & Subtitle (Picture 4) */}
          <Text style={styles.title}>Upload Documents</Text>
          <Text style={styles.subtitle}>Upload Supporting Documents</Text>

          {/* Upload a photo Card */}
          <Pressable style={styles.uploadCard} onPress={handleSelectPhoto}>
            <Text style={styles.uploadCardText}>
              {photoUploaded ? 'Photo Attached (profile.jpg)' : 'Upload a photo'}
            </Text>
            <Feather
              name={photoUploaded ? 'check-circle' : 'upload-cloud'}
              size={22}
              color={COLORS.primary}
            />
          </Pressable>

          {/* Upload a Resume Card */}
          <Pressable style={styles.uploadCard} onPress={handleSelectResume}>
            <Text style={styles.uploadCardText}>
              {resumeUploaded ? 'Resume Attached (resume.pdf)' : 'Upload a Resume'}
            </Text>
            <Feather
              name={resumeUploaded ? 'check-circle' : 'upload-cloud'}
              size={22}
              color={COLORS.primary}
            />
          </Pressable>

          {/* Additional Documents(Optional) Card */}
          <Pressable style={styles.uploadCard} onPress={handleSelectAdditional}>
            <Text style={styles.uploadCardText}>
              {additionalUploaded
                ? 'Document Attached (portfolio.pdf)'
                : 'Additional Documents(Optional)'}
            </Text>
            <Feather
              name={additionalUploaded ? 'check-circle' : 'upload-cloud'}
              size={22}
              color={COLORS.primary}
            />
          </Pressable>

          {/* Complete Button */}
          <PrimaryButton
            title="Complete"
            onPress={handleNext}
            style={styles.btn}
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
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
  },
  uploadCardText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  btn: {
    marginTop: 8,
  },
});