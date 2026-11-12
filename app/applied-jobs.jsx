import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { jobService } from '../services/jobService';
import { formatJobLocation } from '../utils/jobFormatters';

export default function AppliedJobsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [tracking, setTracking] = useState(jobService.getTrackingSummary());
  const [refreshing, setRefreshing] = useState(false);

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

  const loadData = useCallback(async () => {
    const list = await jobService.getAppliedJobsWithStatus(activeTab);
    setAppliedJobs(list);
    setTracking(jobService.getTrackingSummary());
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleSave = async (id) => {
    await jobService.toggleSaveJob(id);
    loadData();
  };

  const tabs = [
    { key: 'All', label: `All (${tracking.applied.total})` },
    { key: 'In Progress', label: `In Progress (${tracking.applied.inProgress})` },
    { key: 'Shortlisted', label: `Shortlisted (${tracking.applied.shortlisted})` },
    { key: 'Interview', label: `Interview (${tracking.applied.interview})` },
  ];

  const getCompanyInitials = (name) => {
    if (!name) return 'TH';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const renderStatusChip = (job) => {
    const label = job.statusLabel || 'Applied';
    if (label === 'Interview') {
      return (
        <View style={[styles.statusChip, { backgroundColor: '#F3E8FF' }]}>
          <Ionicons name="calendar-outline" size={11} color="#7E22CE" style={{ marginRight: 3 }} />
          <Text style={[styles.statusChipText, { color: '#7E22CE' }]}>Interview</Text>
        </View>
      );
    }
    if (label === 'Viewed') {
      return (
        <View style={[styles.statusChip, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="eye-outline" size={11} color="#2563EB" style={{ marginRight: 3 }} />
          <Text style={[styles.statusChipText, { color: '#2563EB' }]}>Viewed</Text>
        </View>
      );
    }
    if (label === 'Shortlisted') {
      return (
        <View style={[styles.statusChip, { backgroundColor: '#FAF5FF' }]}>
          <Ionicons name="star-outline" size={11} color="#9333EA" style={{ marginRight: 3 }} />
          <Text style={[styles.statusChipText, { color: '#9333EA' }]}>Shortlisted</Text>
        </View>
      );
    }
    if (label === 'Rejected') {
      return (
        <View style={[styles.statusChip, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="close-circle-outline" size={11} color="#EF4444" style={{ marginRight: 3 }} />
          <Text style={[styles.statusChipText, { color: '#EF4444' }]}>Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusChip, { backgroundColor: '#E8F8F0' }]}>
        <Ionicons name="checkmark" size={11} color="#10B981" style={{ marginRight: 3 }} />
        <Text style={[styles.statusChipText, { color: '#10B981' }]}>Applied</Text>
      </View>
    );
  };

  const renderJobCard = ({ item }) => {
    const initials = getCompanyInitials(item.companyName);

    return (
      <Pressable
        style={({ pressed }) => [styles.jobCard, pressed && styles.cardPressed]}
        onPress={() => router.push(`/application-status?jobId=${item._id}`)}
      >
        {/* Card Header */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.companyRow}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.titleCol}>
              <Text style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</Text>
              <Text style={styles.companyLocation} numberOfLines={1}>
                {item.companyName || 'Technokrate Partner'} • {formatJobLocation(item.locationCity || item.jobLocation)}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.bookmarkBtn}
            onPress={(e) => {
              e?.stopPropagation?.();
              handleToggleSave(item._id);
            }}
            hitSlop={10}
          >
            <Ionicons
              name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={19}
              color={item.isSaved ? COLORS.primary : '#94A3B8'}
            />
          </Pressable>
        </View>

        {/* Pills / Tags Row */}
        <View style={styles.pillsRow}>
          <View style={styles.salaryPill}>
            <Text style={styles.salaryPillText}>{item.salaryFormatted || '$120k - $150k'}</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>{item.jobType || 'Full-Time'}</Text>
          </View>
          {Boolean(item.category) && (
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{item.category}</Text>
            </View>
          )}
        </View>

        {/* Footer Row */}
        <View style={styles.footerRow}>
          <View style={styles.appliedDateRow}>
            <Ionicons name="time-outline" size={13} color="#64748B" />
            <Text style={styles.appliedDateText}>
              Applied: {item.appliedDate || 'Recently'}
            </Text>
          </View>
          {renderStatusChip(item)}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable style={styles.backBtn} onPress={handleGoBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Applied Jobs</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(t) => t.key}
          contentContainerStyle={styles.tabsList}
          renderItem={({ item }) => {
            const isActive = activeTab === item.key;
            return (
              <Pressable
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setActiveTab(item.key)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Applied Jobs List */}
      <FlatList
        data={appliedJobs}
        keyExtractor={(item) => item._id}
        renderItem={renderJobCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No applications in this category</Text>
            <Text style={styles.emptySubtitle}>
              Applications matching your filter will appear here.
            </Text>
          </View>
        }
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
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6F5',
    paddingVertical: 10,
  },
  tabsList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#6C47FF',
    borderColor: '#6C47FF',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  jobCard: {
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
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6C47FF',
  },
  titleCol: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  companyLocation: {
    fontSize: 12,
    color: '#64748B',
  },
  bookmarkBtn: {
    padding: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  salaryPill: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  salaryPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6C47FF',
  },
  metaPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  metaPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  appliedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  appliedDateText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
