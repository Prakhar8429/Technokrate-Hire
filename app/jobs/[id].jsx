import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import PrimaryButton from '../../components/PrimaryButton';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { formatJobLocation } from '../../utils/jobFormatters';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showApplySuccess, setShowApplySuccess] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/(tabs)/jobs');
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      handleGoBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      jobService
        .getJobById(id)
        .then((data) => {
          if (!isMounted) return;
          setJob(data);
          setIsSaved(Boolean(data?.isSaved));
          setIsApplied(Boolean(data?.isApplied));
          setLoading(false);
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleToggleSave = async () => {
    const saved = await jobService.toggleSaveJob(id);
    setIsSaved(saved);
  };

  const handleApply = async () => {
    if (isApplied || applying) return;
    setApplying(true);
    const result = await jobService.applyForJob(id);
    setApplying(false);

    if (result.success) {
      setIsApplied(true);
      setShowApplySuccess(true);
    } else if (result.alreadyApplied) {
      setIsApplied(true);
      Alert.alert(
        'Already Applied',
        result.message || 'You have already submitted an application for this position.'
      );
    } else {
      Alert.alert(
        'Notice',
        result.message || 'Unable to submit application at this moment. Please try again.'
      );
    }
  };

  const handleButtonPress = () => {
    if (isApplied) {
      setShowStatusModal(true);
    } else {
      applicationService.initForJob(job);
      router.push('/jobs/apply/contact');
    }
  };

  const handleWithdraw = async () => {
    await jobService.withdrawApplication(id);
    setIsApplied(false);
    setShowStatusModal(false);
    Alert.alert('Application Reset', 'You can now submit a fresh application for this job.');
  };

  if (loading || !job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading job specifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <Pressable
          style={styles.backBtn}
          onPress={handleGoBack}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          <Text style={styles.backText}>Jobs</Text>
        </Pressable>

        <Pressable style={styles.iconCircle} onPress={handleToggleSave} hitSlop={10}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? COLORS.primary : COLORS.mutedText}
          />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Company & Role Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.companyBadge}>
            <Text style={styles.companyBadgeText}>
              {(job.companyName || 'TH')
                .split(' ')
                .filter(Boolean)
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </Text>
          </View>

          <Text style={styles.jobTitle}>{job.jobTitle || 'Job Opening'}</Text>
          <Text style={styles.companyName}>
            {job.companyName || 'Technokrate Hire'} •{' '}
            {job.jobRole && !/^[0-9a-fA-F]{24}$/.test(job.jobRole) ? job.jobRole : 'Engineering Team'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.mutedText} />
              <Text style={styles.metaText}>{formatJobLocation(job.jobLocation)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={14} color={COLORS.mutedText} />
              <Text style={styles.metaText}>{typeof job.jobType === 'string' ? job.jobType : 'Full-time'}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.mutedText} />
              <Text style={styles.metaText}>{typeof job.postedTime === 'string' ? job.postedTime : 'Posted recently'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={COLORS.mutedText} />
              <Text style={styles.metaText}>10+ Applicants</Text>
            </View>
          </View>

          {/* Salary Banner matching Figma */}
          <View style={styles.salaryBanner}>
            <View style={styles.salaryCol}>
              <Text style={styles.salaryBannerLabel}>MONTHLY SALARY RANGE</Text>
              <Text style={styles.salaryBannerAmount}>
                {job.salaryFormatted ||
                  (job.salaryRange && (job.salaryRange.minSalary || job.salaryRange.maxSalary)
                    ? `₹${Number(job.salaryRange.minSalary || 0).toLocaleString()} - ₹${Number(job.salaryRange.maxSalary || 0).toLocaleString()} / month`
                    : '$120,000 - $150,000 / year')}
              </Text>
            </View>
            <View style={styles.salaryIconCircle}>
              <Ionicons name="cash" size={18} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Job Description Section */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionHeader}>Job Description —</Text>
          <Text style={styles.descriptionText}>
            {typeof job.jobDescription === 'string' ? job.jobDescription : 'No description provided.'}
          </Text>
        </View>

        {/* Responsibilities */}
        {Boolean(job.jobResponsibilities) && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionHeader}>Responsibilities —</Text>
            <Text style={styles.descriptionText}>
              {typeof job.jobResponsibilities === 'string' ? job.jobResponsibilities : ''}
            </Text>
          </View>
        )}

        {/* Skills Required */}
        {job.skillsRequired && Array.isArray(job.skillsRequired) && job.skillsRequired.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionHeader}>Required Skills —</Text>
            <View style={styles.skillsWrapper}>
              {job.skillsRequired.map((skill, index) => {
                const skillLabel = typeof skill === 'string' ? skill : (skill?.name || skill?.skill || String(skill));
                return (
                  <View key={index} style={styles.skillPill}>
                    <Text style={styles.skillText}>{skillLabel}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Persistent Bottom Bar with Apply Now CTA (Screen 13) */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 8) }]}>
        <PrimaryButton
          title={isApplied ? 'Application Submitted ✓' : 'Apply now'}
          onPress={handleButtonPress}
          loading={applying}
          style={[styles.applyNowBtn, isApplied && { backgroundColor: COLORS.teal }]}
        />
        <Pressable
          style={styles.shareBtn}
          onPress={handleToggleSave}
          hitSlop={8}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={COLORS.primary}
          />
        </Pressable>
      </View>

      {/* Success Modal */}
      <Modal visible={showApplySuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>Application Submitted!</Text>
            <Text style={styles.successMsg}>
              Your profile and resume were delivered to {job.companyName || 'the employer'}. You can track your status in Applied Jobs.
            </Text>
            <PrimaryButton
              title="View Applied Jobs"
              onPress={() => {
                setShowApplySuccess(false);
                router.replace('/(tabs)/jobs');
              }}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>

      {/* Application Status Details Modal */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.successIconCircle, { backgroundColor: COLORS.teal }]}>
              <Ionicons name="checkmark-done" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>Application Status</Text>
            <Text style={styles.successMsg}>
              Your application for {job.jobTitle || 'this role'} at {job.companyName || 'Technokrate Hire'} is in review.
            </Text>

            <View style={styles.statusBox}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Current Status:</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Submitted ✓</Text>
                </View>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Date Applied:</Text>
                <Text style={styles.statusVal}>{job.appliedDate || 'Recently'}</Text>
              </View>
            </View>

            <PrimaryButton
              title="View in Applied Jobs"
              onPress={() => {
                setShowStatusModal(false);
                router.replace('/(tabs)/jobs');
              }}
              style={{ width: '100%', marginBottom: 10 }}
            />

            <Pressable
              style={styles.reapplyBtn}
              onPress={handleWithdraw}
            >
              <Text style={styles.reapplyBtnText}>Withdraw & Re-Apply</Text>
            </Pressable>

            <Pressable
              style={styles.closeBtn}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBg,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 10,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  companyBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyBadgeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 13.5,
    color: COLORS.mutedText,
    marginTop: 4,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12.5,
    color: COLORS.mutedText,
  },
  salaryBanner: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E8D4F2',
  },
  salaryCol: {
    flex: 1,
  },
  salaryBannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  salaryBannerAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  salaryIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8D4F2',
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  applyNowBtn: {
    flex: 1,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 21, 26, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  successMsg: {
    fontSize: 13,
    color: COLORS.mutedText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  statusBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: '500',
  },
  statusVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.teal,
  },
  reapplyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignSelf: 'center',
    marginBottom: 8,
  },
  reapplyBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeBtnText: {
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: '600',
  },
});