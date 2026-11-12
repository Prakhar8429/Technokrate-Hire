import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  BackHandler,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { jobService } from '../services/jobService';

export default function ApplicationStatusScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/(tabs)/dashboard');
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

  const [applicationData, setApplicationData] = useState(() =>
    jobService.getApplicationTimeline(jobId)
  );
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadTimeline() {
      if (!jobId) return;
      setLoading(true);
      try {
        const liveData = await jobService.fetchApplicationTimeline(jobId);
        if (isMounted && liveData) {
          setApplicationData(liveData);
        }
      } catch (e) {
        console.log('Error loading application timeline:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTimeline();
    return () => {
      isMounted = false;
    };
  }, [jobId]);

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            setWithdrawing(true);
            try {
              const res = await jobService.withdrawApplication(
                jobId,
                'Candidate withdrew application from app'
              );
              if (res.success) {
                Alert.alert('Application Withdrawn', res.message || 'Your application was withdrawn successfully.', [
                  { text: 'OK', onPress: () => handleGoBack() },
                ]);
              } else {
                Alert.alert('Cannot Withdraw', res.message || 'Failed to withdraw application.');
              }
            } catch (e) {
              Alert.alert('Error', e.message || 'Something went wrong.');
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ]
    );
  };

  const job = applicationData?.job || null;
  const timeline = Array.isArray(applicationData?.timeline) ? applicationData.timeline : [];

  const renderTimelineNode = (step, index) => {
    const isCompleted = step.state === 'completed';
    const isCurrent = step.state === 'current';
    const isLast = index === timeline.length - 1;

    // Line color: if current is reached, next connecting line transitions
    const lineColor = isCompleted ? '#10B981' : isCurrent ? '#6C47FF' : '#E2E8F0';

    return (
      <View key={step.id || index} style={styles.stepContainer}>
        {/* Left Indicator Column */}
        <View style={styles.indicatorCol}>
          {isCompleted ? (
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={13} color="#FFFFFF" />
            </View>
          ) : isCurrent ? (
            <View style={styles.currentRing}>
              <View style={styles.currentDot} />
            </View>
          ) : (
            <View style={styles.pendingRing} />
          )}

          {!isLast && <View style={[styles.connectorLine, { backgroundColor: lineColor }]} />}
        </View>

        {/* Right Content Column */}
        <View style={[styles.stepContent, !isLast && { paddingBottom: 28 }]}>
          <View style={styles.stepHeaderRow}>
            <Text style={[styles.stepTitle, isCurrent && styles.stepTitleCurrent]}>
              {step.title}
            </Text>
            {Boolean(step.date) && <Text style={styles.stepDate}>{step.date}</Text>}
          </View>
          <Text style={styles.stepRemark}>{step.remark}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.backBtn} onPress={handleGoBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Application Status</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Job Context Card (if available) */}
        {job && (
          <View style={styles.jobContextCard}>
            <View style={styles.contextAvatar}>
              <Text style={styles.contextAvatarText}>
                {(job.companyName || 'TH').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.contextInfoCol}>
              <Text style={styles.contextJobTitle} numberOfLines={1}>{job.jobTitle}</Text>
              <Text style={styles.contextCompany} numberOfLines={1}>{job.companyName} • {job.locationCity || 'Remote'}</Text>
            </View>
            <View style={styles.statusPillSmall}>
              <Text style={styles.statusPillText}>{job.statusLabel || 'In Progress'}</Text>
            </View>
          </View>
        )}

        {/* Timeline Container Card */}
        <View style={styles.timelineCard}>
          {timeline.length > 0 ? (
            timeline.map((step, idx) => renderTimelineNode(step, idx))
          ) : (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Ionicons name="time-outline" size={36} color="#94A3B8" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 10 }}>
                Application Under Review
              </Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, paddingHorizontal: 16 }}>
                Your application has been received and is being processed by the employer.
              </Text>
            </View>
          )}
        </View>

        {/* Neo Auto-Apply Promo Card */}
        <View style={styles.neoCard}>
          <View style={styles.neoLeftRow}>
            <View style={styles.neoIconBox}>
              <Ionicons name="trophy" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.neoTitle}>
              Let Neo auto-apply to jobs that fit you best
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.knowMoreBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Text style={styles.knowMoreText}>Know more</Text>
          </Pressable>
        </View>

        {/* Withdraw Application Option (PDF Item 16) */}
        <Pressable
          style={({ pressed }) => [
            styles.withdrawBtn,
            pressed && { opacity: 0.8 },
            withdrawing && { opacity: 0.6 },
          ]}
          onPress={handleWithdraw}
          disabled={withdrawing}
        >
          {withdrawing ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.withdrawBtnText}>Withdraw Application</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 14,
  },
  withdrawBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6FC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6F5',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  jobContextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
  },
  contextAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contextAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6C47FF',
  },
  contextInfoCol: {
    flex: 1,
  },
  contextJobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  contextCompany: {
    fontSize: 12,
    color: '#64748B',
  },
  statusPillSmall: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C47FF',
  },

  /* Timeline Card */
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
  },
  indicatorCol: {
    width: 26,
    alignItems: 'center',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  currentRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#6C47FF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6C47FF',
  },
  pendingRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 3,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 1,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepTitleCurrent: {
    color: '#6C47FF',
    fontWeight: '800',
  },
  stepDate: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  stepRemark: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },

  /* Neo Card */
  neoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  neoLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  neoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  neoTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: 17,
  },
  knowMoreBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#6C47FF',
  },
  knowMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C47FF',
  },
});
