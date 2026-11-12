import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { formatJobLocation } from '../../../utils/jobFormatters';
import ApplicationHeader from '../../../components/application/ApplicationHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import applicationService from '../../../services/applicationService';

export default function ReviewApplicationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const data = applicationService.getApplicationData();

  const [getAlerts, setGetAlerts] = useState(data.getAlerts !== undefined ? data.getAlerts : true);
  const [submitting, setSubmitting] = useState(false);

  const handleEditSection = (route) => {
    applicationService.updateApplicationData({ returnToReview: true });
    router.push(route);
  };

  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);

    applicationService.updateApplicationData({
      getAlerts,
      consent: true,
    });

    router.replace('/jobs/apply/submitting');
  };

  const coverLetterPreview =
    data.coverLetterOption === 'write' && data.coverLetter
      ? data.coverLetter
      : 'No cover letter provided';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ApplicationHeader progress={100} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Review your application</Text>
        <Text style={styles.subheading}>
          You will not be able to edit your application after you submit.
        </Text>

        {/* 1. Contact Information Card */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Contact information</Text>
            <Pressable
              onPress={() => handleEditSection('/jobs/apply/contact')}
              hitSlop={8}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full name</Text>
            <Text style={styles.infoValue}>
              {data.firstName} {data.lastName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{data.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone number</Text>
            <Text style={styles.infoValue}>
              {data.phoneCountryCode} {data.phoneNumber}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City, state/territory</Text>
            <Text style={styles.infoValue}>{data.cityState}</Text>
          </View>
        </View>

        {/* 2. Resume Card */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Resume</Text>
            <Pressable
              onPress={() => handleEditSection('/jobs/apply/resume')}
              hitSlop={8}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>

          <View style={styles.resumeDisplayRow}>
            <View style={styles.resumeIconBox}>
              <Ionicons name="document-text" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeFileName}>{data.resume?.fileName || 'Resume.pdf'}</Text>
              <Text style={styles.resumeUpdatedDate}>
                Updated on {data.resume?.updatedDate || '12 Aug 2025'}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Cover Letter Card */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Cover letter</Text>
            <Pressable
              onPress={() => handleEditSection('/jobs/apply/documents')}
              hitSlop={8}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>

          <Text style={styles.coverLetterSnippet} numberOfLines={3}>
            {coverLetterPreview}
          </Text>
        </View>

        {/* 4. Additional Documents Card */}
        <View style={styles.reviewCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderTitle}>Additional documents</Text>
            <Pressable
              onPress={() => handleEditSection('/jobs/apply/documents')}
              hitSlop={8}
            >
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>

          {data.additionalDocuments && data.additionalDocuments.length > 0 ? (
            data.additionalDocuments.map((doc) => (
              <View key={doc.id || doc.fileName} style={styles.additionalDocRow}>
                <View style={styles.docMiniIcon}>
                  <Ionicons name="document-attach" size={16} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.docItemName}>{doc.fileName}</Text>
                  <Text style={styles.docItemSize}>{doc.fileSize}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noneText}>None added</Text>
          )}
        </View>

        {/* 5. Alerts Toggle Section */}
        <View style={styles.alertToggleCard}>
          <View style={styles.alertHeaderRow}>
            <Text style={styles.alertTitle}>Get email updates for similar jobs</Text>
            <Switch
              value={getAlerts}
              onValueChange={setGetAlerts}
              trackColor={{ false: '#E2E8F0', true: COLORS.primaryLight }}
              thumbColor={getAlerts ? COLORS.primary : '#FFFFFF'}
            />
          </View>
          <Text style={styles.alertDesc}>
            Get notified about new {data.jobTitle || 'similar'} jobs in {formatJobLocation(data.jobLocation || 'Remote')}.
            By creating a job alert, you agree to our Terms. You can change your consent settings at any time.
          </Text>
        </View>

        {/* 6. Consent Banner */}
        <View style={styles.consentCard}>
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={COLORS.primary}
            style={{ marginTop: 2 }}
          />
          <Text style={styles.consentText}>
            By submitting your application, you agree to our{' '}
            <Text style={styles.linkText}>Terms, Cookie & Privacy Policies</Text>, and consent to
            your application being transmitted to the employer.
          </Text>
        </View>

        {/* Preview Link */}
        <Pressable
          style={styles.previewLinkWrap}
          onPress={() =>
            Alert.alert(
              'Employer View',
              `The employer will receive your verified profile (${data.firstName} ${data.lastName}), contact information, attached resume (${data.resume?.fileName}), and cover letter.`
            )
          }
        >
          <Text style={styles.employerPreviewText}>Preview what the employer sees</Text>
        </Pressable>

        {/* Report link */}
        <Pressable
          style={styles.reportWrap}
          onPress={() => Alert.alert('Report', 'Thank you for your feedback. We will review this job post.')}
        >
          <Ionicons name="flag-outline" size={14} color="#6B7280" />
          <Text style={styles.reportText}>Report an issue</Text>
        </Pressable>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 10) },
        ]}
      >
        <PrimaryButton
          title="Submit your application"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.continueBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.appBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.textSecondaryColor,
    marginBottom: 20,
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: COLORS.borderLight,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 11.5,
    color: COLORS.textSecondaryColor,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  resumeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resumeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeFileName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  resumeUpdatedDate: {
    fontSize: 11.5,
    color: COLORS.textSecondaryColor,
    marginTop: 2,
  },
  coverLetterSnippet: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  additionalDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  docMiniIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  docItemSize: {
    fontSize: 11,
    color: COLORS.textSecondaryColor,
  },
  noneText: {
    fontSize: 13,
    color: COLORS.textSecondaryColor,
    fontStyle: 'italic',
  },
  alertToggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: COLORS.borderLight,
    marginBottom: 14,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
    marginRight: 10,
  },
  alertDesc: {
    fontSize: 11.5,
    color: COLORS.textSecondaryColor,
    lineHeight: 16,
  },
  consentCard: {
    flexDirection: 'row',
    backgroundColor: '#FAF5FC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 10,
    marginBottom: 14,
  },
  consentText: {
    flex: 1,
    fontSize: 11.5,
    color: COLORS.textDark,
    lineHeight: 16,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  previewLinkWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  employerPreviewText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  reportWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  reportText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  continueBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 50,
  },
});
