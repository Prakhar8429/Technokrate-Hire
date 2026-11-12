import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../../components/BrandLogo';
import EmployerBottomNav from '../../components/EmployerBottomNav';
import { COLORS } from '../../constants/colors';
import employerService from '../../services/employerService';

export default function EmployerDashboardScreen() {
  const router = useRouter();

  const [stats, setStats] = useState({
    activeJobs: 3,
    totalApplications: 67,
    shortlistedCandidates: 18,
    databaseMatches: 84,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [employerUser, setEmployerUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const user = employerService.getUser();
    setEmployerUser(user);

    const [st, jobs] = await Promise.all([
      employerService.getDashboardStats(),
      employerService.getEmployerJobs(),
    ]);

    if (st) setStats(st);
    if (jobs) setRecentJobs(jobs.slice(0, 5));
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BrandLogo size="sm" />
          <View style={styles.companyMeta}>
            <Text style={styles.companyName} numberOfLines={1}>
              {employerUser?.companyName || 'Technokrate Partner'}
            </Text>
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
              <Text style={styles.verifiedText}>Verified Recruiter</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.postJobTopBtn}
          onPress={() => router.push('/employer/jobs/post')}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.postJobTopBtnText}>Post Job</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerGreeting}>
              Welcome back, {employerUser?.name ? employerUser.name.split(' ')[0] : 'Recruiter'} 👋
            </Text>
            <Text style={styles.bannerSub}>
              Here is what is happening with your job postings today.
            </Text>
          </View>
        </View>

        {/* 4 Stat Cards (2x2 Grid) */}
        <View style={styles.statsGrid}>
          {/* Active Jobs */}
          <Pressable
            style={[styles.statCard, { borderLeftColor: '#7000B0' }]}
            onPress={() => router.push('/employer/jobs')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#F2E6F8' }]}>
              <Ionicons name="briefcase" size={20} color="#7000B0" />
            </View>
            <Text style={styles.statValue}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </Pressable>

          {/* Total Applications */}
          <Pressable
            style={[styles.statCard, { borderLeftColor: '#2563EB' }]}
            onPress={() => router.push('/employer/jobs')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{stats.totalApplications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </Pressable>

          {/* Shortlisted */}
          <Pressable
            style={[styles.statCard, { borderLeftColor: '#16A34A' }]}
            onPress={() => router.push('/employer/jobs')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="ribbon" size={20} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>{stats.shortlistedCandidates}</Text>
            <Text style={styles.statLabel}>Shortlisted</Text>
          </Pressable>

          {/* Database Matches */}
          <Pressable
            style={[styles.statCard, { borderLeftColor: '#D97706' }]}
            onPress={() => router.push('/employer/jobs')}
          >
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="sparkles" size={20} color="#D97706" />
            </View>
            <Text style={styles.statValue}>{stats.databaseMatches}</Text>
            <Text style={styles.statLabel}>Smart Matches</Text>
          </Pressable>
        </View>

        {/* Quick Post CTA */}
        <View style={styles.quickCtaCard}>
          <View style={styles.quickCtaContent}>
            <Text style={styles.quickCtaTitle}>Need to hire faster?</Text>
            <Text style={styles.quickCtaSub}>
              Post a new job requirement and get matched candidates within 24 hours.
            </Text>
            <Pressable
              style={styles.quickCtaBtn}
              onPress={() => router.push('/employer/jobs/post')}
            >
              <Text style={styles.quickCtaBtnText}>+ Create New Posting</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Jobs Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Job Postings</Text>
          <Pressable onPress={() => router.push('/employer/jobs')}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        {recentJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No job postings yet</Text>
            <Text style={styles.emptySub}>Post your first job to start reviewing applications</Text>
          </View>
        ) : (
          recentJobs.map((job) => (
            <Pressable
              key={job._id}
              style={styles.jobCard}
              onPress={() => router.push(`/employer/jobs/${job._id}`)}
            >
              <View style={styles.jobTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.jobDept}>
                    {job.department || 'Engineering'} • {job.type || 'Full Time'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    job.status === 'Active'
                      ? styles.statusActive
                      : job.status === 'Paused'
                      ? styles.statusPaused
                      : styles.statusClosed,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      job.status === 'Active'
                        ? styles.statusTextActive
                        : job.status === 'Paused'
                        ? styles.statusTextPaused
                        : styles.statusTextClosed,
                    ]}
                  >
                    {job.status || 'Active'}
                  </Text>
                </View>
              </View>

              <View style={styles.jobMetaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{job.location || 'Remote'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="cash-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{job.salary || '₹12-18 LPA'}</Text>
                </View>
              </View>

              <View style={styles.jobFooterRow}>
                <Pressable
                  style={styles.pillStat}
                  onPress={() => router.push(`/employer/jobs/applicants/${job._id}`)}
                >
                  <Ionicons name="people-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.pillStatText}>
                    {job.applicationsCount || 0} Applicants
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.pillStat}
                  onPress={() => router.push(`/employer/jobs/matches/${job._id}`)}
                >
                  <Ionicons name="sparkles-outline" size={14} color="#D97706" />
                  <Text style={[styles.pillStatText, { color: '#D97706' }]}>
                    {job.matchesCount || 0} Matches
                  </Text>
                </Pressable>

                <View style={styles.manageBtn}>
                  <Text style={styles.manageBtnText}>Manage</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <EmployerBottomNav activeTab="dashboard" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  companyMeta: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
  },
  postJobTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  postJobTopBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  welcomeBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bannerGreeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  bannerSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  quickCtaCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  quickCtaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickCtaSub: {
    fontSize: 12,
    color: '#F2E6F8',
    marginTop: 4,
    lineHeight: 16,
  },
  quickCtaBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  quickCtaBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  jobDept: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontSize: 10,
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
  jobMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginVertical: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  jobFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  pillStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5FC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
});