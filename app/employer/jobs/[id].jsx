import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import employerService from '../../../services/employerService';

export default function EmployerJobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await employerService.getJobDetails(id);
      setJob(data);
      setLoading(false);
    })();
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Hiring: ${job?.title} at Technokrate Hire! Apply now.`,
      });
    } catch (e) {
      // ignore
    }
  };

  if (!job && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Job Not Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.topBarTitle}>Job Details</Text>
        <View style={styles.topBarActions}>
          <Pressable onPress={handleShare} style={styles.iconBtn} hitSlop={10}>
            <Ionicons name="share-social-outline" size={20} color="#0F172A" />
          </Pressable>
          <Pressable
            onPress={() => router.push(`/employer/jobs/edit/${job?._id}`)}
            style={styles.iconBtn}
            hitSlop={10}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header Card */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{job?.title}</Text>
              <Text style={styles.subtitle}>
                {job?.department || 'Engineering'} • {job?.type || 'Full Time'} • {job?.workMode || 'Remote'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                job?.status === 'Active'
                  ? styles.statusActive
                  : job?.status === 'Paused'
                  ? styles.statusPaused
                  : styles.statusClosed,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  job?.status === 'Active'
                    ? styles.statusTextActive
                    : job?.status === 'Paused'
                    ? styles.statusTextPaused
                    : styles.statusTextClosed,
                ]}
              >
                {job?.status || 'Active'}
              </Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{job?.location || 'Remote'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{job?.salary || '₹12-18 LPA'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{job?.experience || '2 - 5 years'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{job?.openings || 1} Opening(s)</Text>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <Pressable
              style={styles.metricBox}
              onPress={() => router.push(`/employer/jobs/applicants/${job?._id}`)}
            >
              <Text style={styles.metricVal}>{job?.applicationsCount || 0}</Text>
              <Text style={styles.metricLab}>Applicants</Text>
              <View style={styles.metricLink}>
                <Text style={styles.metricLinkText}>View All</Text>
                <Ionicons name="arrow-forward" size={11} color={COLORS.primary} />
              </View>
            </Pressable>

            <Pressable
              style={[styles.metricBox, { borderColor: '#FEF3C7', backgroundColor: '#FFFDF5' }]}
              onPress={() => router.push(`/employer/jobs/matches/${job?._id}`)}
            >
              <Text style={[styles.metricVal, { color: '#D97706' }]}>
                {job?.matchesCount || 0}
              </Text>
              <Text style={styles.metricLab}>Smart Matches</Text>
              <View style={styles.metricLink}>
                <Text style={[styles.metricLinkText, { color: '#D97706' }]}>Explore</Text>
                <Ionicons name="arrow-forward" size={11} color="#D97706" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Skills Required */}
        {job?.skills && job.skills.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Required Skills</Text>
            <View style={styles.chipsWrap}>
              {job.skills.map((s, idx) => (
                <View key={idx} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Job Description</Text>
          <Text style={styles.bodyText}>
            {job?.description || 'No description provided.'}
          </Text>
        </View>

        {/* Responsibilities */}
        {job?.responsibilities && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Key Responsibilities</Text>
            <Text style={styles.bodyText}>{job.responsibilities}</Text>
          </View>
        )}

        {/* Requirements */}
        {job?.requirements && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Qualifications & Requirements</Text>
            <Text style={styles.bodyText}>{job.requirements}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.editBtn}
          onPress={() => router.push(`/employer/jobs/edit/${job?._id}`)}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          <Text style={styles.editBtnText}>Edit Job</Text>
        </Pressable>

        <Pressable
          style={styles.applicantsCta}
          onPress={() => router.push(`/employer/jobs/applicants/${job?._id}`)}
        >
          <Ionicons name="people" size={18} color="#FFFFFF" />
          <Text style={styles.applicantsCtaText}>
            View Applicants ({job?.applicationsCount || 0})
          </Text>
        </Pressable>
      </View>
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
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusPaused: {
    backgroundColor: '#FEF3C7',
  },
  statusClosed: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextPaused: {
    color: '#D97706',
  },
  statusTextClosed: {
    color: '#64748B',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '46%',
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FAF5FC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F2E6F8',
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  metricLab: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  metricLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
  },
  metricLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#F2E6F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bodyText: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  applicantsCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  applicantsCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
});