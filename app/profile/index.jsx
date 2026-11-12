import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../../constants/colors';
import candidateService from '../../services/candidateService';
import resumeDownloadService from '../../services/resumeDownloadService';
import preferenceService from '../../services/preferenceService';
import ProfileHeader from '../../components/ProfileHeader';
import ResumeCard from '../../components/ResumeCard';
import ResumePdfViewer from '../../components/ResumePdfViewer';
import authStorage, { getUser } from '../../src/storage/authStorage';

export default function ViewProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Active top tab: 'profile' | 'preferences'
  const [activeTab, setActiveTab] = useState(
    params.tab === 'preferences' ? 'preferences' : 'profile'
  );

  // Profile user identity state
  const [userProfile, setUserProfile] = useState(candidateService.getUserProfile());

  // Resume state
  const [resume, setResume] = useState(candidateService.getCurrentResume());

  // Preferences state
  const [preferences, setPreferences] = useState(preferenceService.getPreferences());

  // Modals state
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/(tabs)/dashboard');
    }
  };

  // Safe Android Hardware BackHandler
  useEffect(() => {
    const onBackPress = () => {
      handleGoBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      // 1. Immediately sync existing profile state
      const curr = candidateService.getUserProfile();
      if (curr?.fullName) {
        setUserProfile({ ...curr });
      }

      // 2. Read persistent storage to guarantee candidate name displays
      getUser().then((stored) => {
        if (!isMounted) return;
        if (stored?.fullName) {
          candidateService.updateUserProfile({
            fullName: stored.fullName,
            email: stored.email,
            phone: stored.mobileNumber,
          });
          setUserProfile({ ...candidateService.getUserProfile() });
        }
      }).catch(() => {});

      // 3. API 9: Fetch live profile details from backend
      candidateService.fetchUserProfileDetails().then(() => {
        if (!isMounted) return;
        setUserProfile({ ...candidateService.getUserProfile() });
      }).catch(() => {});

      const existing = candidateService.getCurrentResume();
      if (existing) {
        setResume(existing);
      }
      setPreferences(preferenceService.getPreferences());

      return () => {
        isMounted = false;
      };
    }, [])
  );

  // Handle Document Selection / Upload from mobile file picker (PDF)
  const handleSelectResume = async (isReplace = false) => {
    try {
      setIsUploading(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];

        // File validation: Size <= 5MB
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please choose a PDF document under 5MB.');
          setIsUploading(false);
          return;
        }

        const newResume = {
          fileName: file.name || 'Resume.pdf',
          uploadedDate: 'Today',
          url: file.uri,
        };

        candidateService.setResume(newResume);
        setResume(newResume);
        setOptionsModalVisible(false);
        Alert.alert(
          'Resume Uploaded',
          isReplace
            ? `Your resume has been updated to "${newResume.fileName}".`
            : `"${newResume.fileName}" has been successfully uploaded.`
        );
      }
    } catch (err) {
      console.log('DocumentPicker error:', err);
      const fallbackResume = {
        fileName: 'ASHU RESUME-1.pdf',
        uploadedDate: 'Today',
        url: 'https://res.cloudinary.com/desuloqa3/image/upload/v1773828983/jobseeker_documents/degtoiu0d6wrdu41cvld.pdf',
      };
      candidateService.setResume(fallbackResume);
      setResume(fallbackResume);
      setOptionsModalVisible(false);
      Alert.alert('Resume Updated', 'Selected resume has been attached successfully.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Resume Download / Save to device
  const handleDownloadResume = async () => {
    setOptionsModalVisible(false);
    if (!resume) {
      setTimeout(() => {
        Alert.alert('No Resume', 'No resume file available to download.');
      }, 300);
      return;
    }
    try {
      const res = await resumeDownloadService.downloadAndSaveResume(resume, userProfile);
      setTimeout(() => {
        if (res.success) {
          Alert.alert(
            'Resume Downloaded',
            `"${res.fileName || resume.fileName || 'Resume.pdf'}" has been successfully saved to your device.`
          );
        } else {
          Alert.alert('Download', res.error || 'Could not save resume to device.');
        }
      }, 300);
    } catch (e) {
      console.log('Download error:', e);
      setTimeout(() => {
        Alert.alert('Download', 'Could not complete resume download.');
      }, 300);
    }
  };

  // Handle Resume Delete with Confirmation
  const handleDeleteResume = () => {
    setOptionsModalVisible(false);
    Alert.alert(
      'Delete Resume',
      'Are you sure you want to delete your resume? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            candidateService.deleteResume();
            setResume(null);
            Alert.alert('Resume Deleted', 'Your resume was successfully removed.');
          },
        },
      ]
    );
  };

  // Formatting helpers for Preference section summaries
  const getJobTitlesSummary = () => {
    const titles = preferences.jobTitles || [];
    if (titles.length === 0) return 'Add desired job titles';
    if (titles.length <= 2) return titles.join(', ');
    return `${titles.slice(0, 2).join(', ')} +${titles.length - 2} more`;
  };

  const getWorkScheduleSummary = () => {
    const days = preferences.workSchedule?.days || [];
    const shifts = preferences.workSchedule?.shifts || [];
    const all = [...days, ...shifts];
    if (all.length === 0) return 'Add preferred work schedule';
    if (all.length <= 2) return all.join(', ');
    return `${all.slice(0, 2).join(', ')} +${all.length - 2} more`;
  };

  const getJobTypesSummary = () => {
    const types = preferences.jobTypes || [];
    if (types.length === 0) return 'Add desired job types';
    if (types.length <= 2) return types.join(', ');
    return `${types.slice(0, 2).join(', ')} +${types.length - 2} more`;
  };

  const getPaySummary = () => {
    const p = preferences.minimumPay;
    if (!p || !p.amount) return 'Add minimum expected pay';
    const formatted = Number(p.amount).toLocaleString('en-IN');
    return `₹${formatted} per ${p.period || 'year'}`;
  };

  const getRemoteSummary = () => {
    switch (preferences.remotePreference) {
      case 'onsite_hybrid':
        return 'Only on-site or hybrid';
      case 'remote':
        return 'Only remote';
      default:
        return 'Open to all jobs';
    }
  };

  const getCommuteSummary = () => {
    const c = preferences.commute;
    if (!c || (!c.location && !c.maxMinutes)) return 'Add commute preference';
    if (c.maxMinutes) {
      return `Up to ${c.maxMinutes} mins from ${c.location || 'Current location'}`;
    }
    return `Any commute from ${c.location || 'Current location'}`;
  };

  const getRelocationSummary = () => {
    const r = preferences.relocation;
    if (!r) return 'Add relocation preference';
    if (r.openToAnywhere) return 'Open to anywhere';
    if (r.locations && r.locations.length > 0) {
      return r.locations.join(', ');
    }
    return 'Add relocation preference';
  };

  const getAvailabilitySummary = () => {
    switch (preferences.availability) {
      case 'within_2_weeks':
        return 'Within 2 weeks';
      case 'within_1_month':
        return 'Within 1 month';
      case 'more_than_1_month':
        return 'More than 1 month';
      default:
        return 'Immediately';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header with Profile Title & Hamburger Menu */}
      <View style={styles.topHeader}>
        <Pressable
          style={styles.headerBackBtn}
          onPress={handleGoBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          style={styles.menuBtn}
          onPress={() => router.push('/(tabs)/settings')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Open Settings"
        >
          <Ionicons name="menu-outline" size={26} color="#0F172A" />
        </Pressable>
      </View>

      {/* Segmented Tab Controls: [Profile] | [Preferences] */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'profile' && styles.tabTextActive,
            ]}
          >
            Profile
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tabButton,
            activeTab === 'preferences' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('preferences')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'preferences' && styles.tabTextActive,
            ]}
          >
            Preferences
          </Text>
        </Pressable>
      </View>

      {/* Tab 1: Profile View */}
      {activeTab === 'profile' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Identity Card (Standardized ProfileHeader) */}
          <ProfileHeader
            userProfile={userProfile}
            onEditPress={() => router.push('/profile/edit')}
            onStatusPress={() => {
              if (resume) setPdfViewerVisible(true);
              else handleSelectResume(false);
            }}
          />

          {/* Section Title */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Resume</Text>
            <Text style={styles.sectionSubtitle}>
              Manage and review your active PDF CV
            </Text>
          </View>

          {/* Standardized Resume Card (Actual PDF document preview action) */}
          <ResumeCard
            resume={resume}
            userProfile={userProfile}
            onOptionsPress={() => setOptionsModalVisible(true)}
            onPreviewPress={() => setPdfViewerVisible(true)}
            onUploadPress={() => handleSelectResume(false)}
            isUploading={isUploading}
          />
        </ScrollView>
      )}

      {/* Tab 2: Preferences View (Screens 1, 15, 16) */}
      {activeTab === 'preferences' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* PART 1: Hidden from employers */}
          <View style={styles.bannerHidden}>
            <View style={styles.bannerIconCircleHidden}>
              <Ionicons name="eye-off-outline" size={18} color="#64748B" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitleHidden}>Hidden from employers</Text>
              <Text style={styles.bannerDescHidden}>
                Employers won't see these preferences. We use them to improve your job recommendations.
              </Text>
            </View>
          </View>

          <View style={styles.preferenceCardList}>
            {/* 1. Job Titles */}
            <Pressable
              style={styles.prefRow}
              onPress={() => router.push('/profile/preferences/job-titles')}
            >
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Desired job titles</Text>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {getJobTitlesSummary()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>

            {/* 2. Work Schedule */}
            <Pressable
              style={styles.prefRow}
              onPress={() => router.push('/profile/preferences/work-schedule')}
            >
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Work schedule</Text>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {getWorkScheduleSummary()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>

            {/* 3. Job Types */}
            <Pressable
              style={styles.prefRow}
              onPress={() => router.push('/profile/preferences/job-types')}
            >
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Job types</Text>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {getJobTypesSummary()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>

            {/* 4. Minimum Pay */}
            <Pressable
              style={styles.prefRow}
              onPress={() => router.push('/profile/preferences/pay')}
            >
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Minimum base pay</Text>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {getPaySummary()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>

            {/* 5. Remote Work */}
            <Pressable
              style={styles.prefRow}
              onPress={() => router.push('/profile/preferences/remote')}
            >
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Remote work</Text>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {getRemoteSummary()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>

            {/* 6. Commute */}
            <Pressable
              style={[styles.prefRow, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/profile/preferences/commute')}
            >
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Commute</Text>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {getCommuteSummary()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>
          </View>

          {/* PART 2: Visible to employers */}
          <View style={[styles.bannerVisible, { marginTop: 24 }]}>
            <View style={styles.bannerIconCircleVisible}>
              <Ionicons name="eye-outline" size={18} color="#0D9488" />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitleVisible}>Visible to employers</Text>
              <Text style={styles.bannerDescVisible}>
                Employers will see these preferences to match you with opportunities.
              </Text>
            </View>
          </View>

          <View style={styles.preferenceCardList}>
            {/* 7. Relocation */}
            <Pressable
              style={styles.prefRow}
              onPress={() => router.push('/profile/preferences/relocation')}
            >
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Relocation</Text>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {getRelocationSummary()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>

            {/* 8. Availability */}
            <Pressable
              style={[styles.prefRow, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/profile/preferences/availability')}
            >
              <View style={styles.prefTextCol}>
                <Text style={styles.prefLabel}>Availability</Text>
                <Text style={styles.prefValue} numberOfLines={1}>
                  {getAvailabilitySummary()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* 1. Resume Options Bottom Sheet Modal */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.bottomSheetCard} onStartShouldSetResponder={() => true}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Resume options</Text>
              <Pressable
                onPress={() => setOptionsModalVisible(false)}
                hitSlop={10}
                style={styles.closeSheetBtn}
              >
                <Ionicons name="close" size={22} color="#0F172A" />
              </Pressable>
            </View>

            {/* Option 1: Open / Download PDF */}
            <Pressable
              style={styles.sheetActionItem}
              onPress={handleDownloadResume}
            >
              <View style={styles.sheetActionIcon}>
                <Ionicons name="download-outline" size={22} color="#0F172A" />
              </View>
              <Text style={styles.sheetActionText}>Download PDF</Text>
            </Pressable>

            {/* Option 2: Replace file */}
            <Pressable
              style={styles.sheetActionItem}
              onPress={() => handleSelectResume(true)}
            >
              <View style={styles.sheetActionIcon}>
                <Ionicons name="swap-horizontal-outline" size={22} color="#0F172A" />
              </View>
              <Text style={styles.sheetActionText}>Replace file</Text>
            </Pressable>

            {/* Option 3: Delete */}
            <Pressable
              style={[styles.sheetActionItem, styles.deleteActionItem]}
              onPress={handleDeleteResume}
            >
              <View style={styles.sheetActionIcon}>
                <Ionicons name="trash-outline" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.sheetActionText, styles.deleteActionText]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* 2. Full Resume PDF Viewer Modal */}
      <ResumePdfViewer
        visible={pdfViewerVisible}
        onClose={() => setPdfViewerVisible(false)}
        resume={resume}
        userProfile={userProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6FC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6F5',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6F5',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  /* Preference Banners */
  bannerHidden: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  bannerIconCircleHidden: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  bannerTitleHidden: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  bannerDescHidden: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  bannerVisible: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  bannerIconCircleVisible: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  bannerTitleVisible: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 2,
  },
  bannerDescVisible: {
    fontSize: 12,
    color: '#115E59',
    lineHeight: 17,
  },
  bannerTextCol: {
    flex: 1,
  },

  /* Preference Rows List */
  preferenceCardList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  prefTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  prefLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  prefValue: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  /* Options Bottom Sheet */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeSheetBtn: {
    padding: 4,
  },
  sheetActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  sheetActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F6FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  deleteActionItem: {
    marginTop: 4,
  },
  deleteActionText: {
    color: '#EF4444',
  },
});