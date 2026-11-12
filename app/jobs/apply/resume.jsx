import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../../../constants/colors';
import ApplicationHeader from '../../../components/application/ApplicationHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import applicationService from '../../../services/applicationService';
import resumeDownloadService from '../../../services/resumeDownloadService';
import candidateService from '../../../services/candidateService';

export default function ResumeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const initialData = applicationService.getApplicationData();

  const [currentResume, setCurrentResume] = useState(initialData.resume || null);

  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        const newResume = {
          fileName: file.name,
          updatedDate: 'Today',
          candidateName: initialData.firstName + ' ' + initialData.lastName,
          fileSize: `${Math.round((file.size || 150000) / 1024)} KB`,
          uri: file.uri,
        };
        setCurrentResume(newResume);
        applicationService.updateApplicationData({ resume: newResume });

        // Connect standalone resume upload API (PDF Item 17)
        candidateService.uploadResumeToBackend(file).catch((e) => {
          console.log('Background resume sync notice:', e);
        });
      }
    } catch (e) {
      console.log('Document picker error:', e);
      Alert.alert('Error', 'Unable to pick document. Please try again.');
    }
  };

  const handleRemove = () => {
    Alert.alert('Remove Resume', 'Do you want to remove this resume?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setCurrentResume(null);
          applicationService.updateApplicationData({ resume: null });
          // Connect standalone resume delete API (PDF Item 18)
          candidateService.deleteResumeFromBackend().catch(() => {});
        },
      },
    ]);
  };

  const handleContinue = () => {
    if (!currentResume) {
      Alert.alert('Resume Required', 'Please select or upload a resume to continue.');
      return;
    }

    applicationService.updateApplicationData({ resume: currentResume });

    if (initialData.returnToReview) {
      applicationService.updateApplicationData({ returnToReview: false });
      router.push('/jobs/apply/review');
    } else {
      router.push('/jobs/apply/documents');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ApplicationHeader progress={75} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Add your resume</Text>
        <Text style={styles.subheading}>
          Upload a resume to apply for this job.{'\n'}Accepted file types: PDF, DOC, DOCX
        </Text>

        <Text style={styles.sectionLabel}>Current resume</Text>

        {currentResume ? (
          /* Selected Resume Card matching Reference 4 */
          <View style={styles.resumeCard}>
            {/* Header info row */}
            <View style={styles.resumeTopRow}>
              <View style={styles.resumeMetaLeft}>
                <View style={styles.docIconBox}>
                  <Ionicons name="document-text" size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.resumeFileName}>{currentResume.fileName}</Text>
                  <Text style={styles.resumeUpdateText}>
                    Updated on {currentResume.updatedDate}
                  </Text>
                </View>
              </View>

              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            </View>

            {/* Embedded Resume Preview Box */}
            <View style={styles.previewBox}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewName}>
                  {currentResume.candidateName || (initialData.firstName ? `${initialData.firstName} ${initialData.lastName}`.trim() : 'Candidate Profile')}
                </Text>
                <Text style={styles.previewContact}>
                  {[initialData.cityState, initialData.phoneNumber ? `${initialData.phoneCountryCode || '+91'} ${initialData.phoneNumber}` : initialData.email].filter(Boolean).join(' • ') || 'Verified Applicant'}
                </Text>
              </View>
              <View style={styles.previewDivider} />
              <Text style={styles.previewSnippetTitle}>EXPERIENCE & DESIGN LEADERSHIP</Text>
              <Text style={styles.previewSnippet}>
                • Lead UX/UI systems, wireframing, and interactive design prototypes{'\n'}
                • Coordinated with cross-functional product and engineering teams{'\n'}
                • Scaled design components across cross-platform applications
              </Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.actionRow}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => setShowPreviewModal(true)}
                hitSlop={8}
              >
                <Ionicons name="eye-outline" size={16} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Preview</Text>
              </Pressable>

              <View style={styles.actionDivider} />

              <Pressable style={styles.actionBtn} onPress={handleRemove} hitSlop={8}>
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.emptyResumeBox}>
            <Ionicons name="document-outline" size={32} color={COLORS.textSecondaryColor} />
            <Text style={styles.emptyText}>No resume selected yet</Text>
          </View>
        )}

        {/* Upload Another Resume Card */}
        <Pressable style={styles.uploadCard} onPress={handlePickDocument}>
          <View style={styles.uploadIconCircle}>
            <Ionicons name="arrow-up" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.uploadTitle}>Upload another resume</Text>
          <Text style={styles.uploadSubtitle}>PDF, DOC, DOCX (Max 5 MB)</Text>
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
          title="Continue"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>

      {/* Resume In-App Full Preview Modal */}
      <Modal visible={showPreviewModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentResume?.fileName || 'Resume Preview'}</Text>
              <Pressable onPress={() => setShowPreviewModal(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.resumeFullText}>
                {resumeDownloadService.getFormattedResumeText('Senior Product Designer')}
              </Text>
            </ScrollView>
            <View style={styles.modalFooter}>
              <PrimaryButton title="Done" onPress={() => setShowPreviewModal(false)} />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
    lineHeight: 18,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  resumeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  resumeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resumeMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  docIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeFileName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  resumeUpdateText: {
    fontSize: 11.5,
    color: COLORS.textSecondaryColor,
    marginTop: 2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBox: {
    backgroundColor: '#FAF8FC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 12,
    marginBottom: 14,
  },
  previewHeaderRow: {
    marginBottom: 6,
  },
  previewName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  previewContact: {
    fontSize: 10.5,
    color: COLORS.textSecondaryColor,
    marginTop: 1,
  },
  previewDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 6,
  },
  previewSnippetTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  previewSnippet: {
    fontSize: 10.5,
    color: '#4B5563',
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.borderLight,
  },
  emptyResumeBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondaryColor,
    fontWeight: '500',
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 3,
  },
  uploadSubtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondaryColor,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalBody: {
    paddingVertical: 16,
  },
  resumeFullText: {
    fontSize: 12.5,
    color: COLORS.textDark,
    lineHeight: 19,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
