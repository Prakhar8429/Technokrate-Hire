import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AppHeader from '../../components/AppHeader';
import JobCard from '../../components/JobCard';
import DashboardFeatureCard from '../../components/DashboardFeatureCard';
import { jobService } from '../../services/jobService';
import candidateService from '../../services/candidateService';
import infoService from '../../services/infoService';
import { getUser } from '../../src/storage/authStorage';

export default function CandidateDashboardScreen() {
  const router = useRouter();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [metrics, setMetrics] = useState(jobService.getDashboardMetrics());
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    jobService.searchJobs()
      .then((jobs) => {
        if (Array.isArray(jobs)) setRecommendedJobs(jobs.slice(0, 3));
      })
      .catch(() => {});
    infoService.getStats().then((st) => setLiveStats(st)).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const updateCandidateName = (name) => {
        if (!name || !name.trim()) return;
        setMetrics((prev) => ({
          ...prev,
          candidateName: name.trim(),
        }));
      };

      // 1. Immediately read profile from memory
      const currentProfile = candidateService.getUserProfile();
      if (currentProfile?.fullName) {
        updateCandidateName(currentProfile.fullName);
      }

      // 2. Read persistent storage
      getUser().then((stored) => {
        if (!isMounted) return;
        if (stored?.fullName) {
          candidateService.updateUserProfile({
            fullName: stored.fullName,
            email: stored.email,
            phone: stored.mobileNumber,
          });
          updateCandidateName(stored.fullName);
        }
      }).catch(() => {});

      // 3. Live profile details (API 9)
      candidateService.fetchUserProfileDetails().then((profData) => {
        if (!isMounted) return;
        const u = profData?.user || profData?.data?.user || profData;
        const liveName = u?.fullName || u?.name || candidateService.getUserProfile()?.fullName;
        if (liveName) {
          updateCandidateName(liveName);
        }
      }).catch(() => {});

      // 4. Connect API 31: Get Jobseeker Dashboard for STATS ONLY (applied & saved counts)
      candidateService.getJobseekerDashboard().then((liveDash) => {
        if (!isMounted || !liveDash) return;
        setMetrics((prev) => {
          const appliedCount = liveDash.stats?.appliedJobsCount ?? prev.tracking?.applied?.total ?? 0;
          const savedCount = liveDash.stats?.savedJobsCount ?? prev.tracking?.saved?.total ?? 0;
          const realName = candidateService.getUserProfile()?.fullName || prev.candidateName || 'Candidate';
          return {
            ...prev,
            candidateName: realName,
            tracking: {
              ...prev.tracking,
              applied: {
                ...prev.tracking?.applied,
                total: appliedCount,
              },
              saved: {
                ...prev.tracking?.saved,
                total: savedCount,
              },
            },
          };
        });
      }).catch(() => {});

      // Connect API 26: Get Stats
      infoService.getStats().then((st) => {
        if (isMounted && st) setLiveStats(st);
      }).catch(() => {});

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleToggleSave = async (id) => {
    try {
      await jobService.toggleSaveJob(id);
      const updated = await jobService.searchJobs();
      if (Array.isArray(updated)) {
        setRecommendedJobs(updated.slice(0, 3));
      }
      setMetrics(jobService.getDashboardMetrics());
    } catch (e) {
      console.log('Error toggling save in dashboard:', e);
    }
  };

  const handleApply = async (id) => {
    try {
      await jobService.applyForJob(id);
      const updated = await jobService.searchJobs();
      if (Array.isArray(updated)) {
        setRecommendedJobs(updated.slice(0, 3));
      }
      setMetrics(jobService.getDashboardMetrics());
    } catch (e) {
      console.log('Error applying in dashboard:', e);
    }
  };

  const tracking = metrics.tracking || {
    applied: { total: 0, thisWeek: 0, inProgress: 0, shortlisted: 0, interview: 0, others: 0 },
    saved: { total: 0, expiringSoon: 0, active: 0, expired: 0 },
    status: { applied: 0, viewed: 0, shortlisted: 0, interview: 0, selected: 0, rejected: 0 },
    hr: { interviewRequests: 0, messages: 0, statusUpdates: 0, offers: 0 },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader showNotification showProfile />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Hero Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextCol}>
            <Text style={styles.welcomeTag}>WELCOME BACK</Text>
            <Text style={styles.candidateName}>{metrics.candidateName}</Text>
            <Text style={styles.welcomeSubtitle}>
              {liveStats?.activeJobsCount
                ? `Explore ${liveStats.activeJobsCount} active openings across ${liveStats.totalEmployersCount || 130}+ hiring employers.`
                : 'Track your applications and get notified about latest updates.'}
            </Text>
          </View>
          <View style={styles.dashboardHeroContainer}>
            <Image
              source={require('../../assets/images/dashboard_hero.png')}
              style={styles.dashboardHeroImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Four Clean Tracking Cards (Reference 1) */}
        <View style={styles.trackingGrid}>
          {/* Row 1: Applied Jobs & Saved Jobs */}
          <View style={styles.gridRow}>
            <DashboardFeatureCard
              title="Applied Jobs"
              iconName="paper-plane"
              iconColor="#6C47FF"
              iconBg="#F0EAFF"
              onPress={() => router.push('/applied-jobs')}
            />
            <DashboardFeatureCard
              title="Saved Jobs"
              iconName="bookmark"
              iconColor="#F59E0B"
              iconBg="#FFF6E5"
              onPress={() => router.push('/saved-jobs')}
            />
          </View>

          {/* Row 2: Application Status & HR Updates */}
          <View style={styles.gridRow}>
            <DashboardFeatureCard
              title="Application Status"
              iconName="bar-chart"
              iconColor="#10B981"
              iconBg="#E6F8F3"
              onPress={() => router.push('/application-status')}
            />
            <DashboardFeatureCard
              title="HR Updates"
              iconName="people"
              iconColor="#3B82F6"
              iconBg="#E8F1FF"
              onPress={() => router.push('/hr-updates')}
            />
          </View>
        </View>

        {/* Recommended Jobs Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <Pressable onPress={() => router.push('/(tabs)/jobs')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </Pressable>
        </View>

        {/* Job Cards */}
        {recommendedJobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onToggleSave={handleToggleSave}
            onApply={handleApply}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6FC',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 95,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  welcomeTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#6C47FF',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  candidateName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  dashboardHeroContainer: {
    width: 95,
    height: 95,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardHeroImage: {
    width: 95,
    height: 95,
  },

  /* Four Clean Tracking Cards (Reference 1) */
  trackingGrid: {
    marginBottom: 16,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cleanCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 124,
    justifyContent: 'space-between',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  cleanIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  cleanCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Recommended Section */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C47FF',
  },
});
