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

export default function SavedJobsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [savedJobs, setSavedJobs] = useState([]);
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
    const list = await jobService.getSavedJobsWithStatus(activeTab);
    setSavedJobs(list);
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
    await loadData();
  };

  const tabs = [
    { key: 'All', label: `All (${tracking.saved.total})` },
    { key: 'Active', label: `Active (${tracking.saved.active})` },
    { key: 'Expiring Soon', label: `Expiring Soon (${tracking.saved.expiringSoon})` },
  ];

  const getCompanyInitials = (name) => {
    if (!name) return 'TH';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const renderJobCard = ({ item }) => {
    const initials = getCompanyInitials(item.companyName);

    return (
      <Pressable
        style={({ pressed }) => [styles.jobCard, pressed && styles.cardPressed]}
        onPress={() => router.push(`/jobs/${item._id}`)}
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
              size={20}
              color={item.isSaved ? '#6C47FF' : '#94A3B8'}
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
          <View style={styles.savedDateRow}>
            <Ionicons name="time-outline" size={13} color="#64748B" />
            <Text style={styles.savedDateText}>
              Saved: {item.savedDate || 'Recently'}
            </Text>
          </View>

          {item.expiringBadge ? (
            <View style={styles.expiringBadge}>
              <Ionicons name="time-outline" size={11} color="#D97706" style={{ marginRight: 3 }} />
              <Text style={styles.expiringBadgeText}>{item.expiringBadge}</Text>
            </View>
          ) : null}
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
        <Text style={styles.headerTitle}>Saved Jobs</Text>
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

      {/* Saved Jobs List */}
      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item._id}
        renderItem={renderJobCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No saved jobs found</Text>
            <Text style={styles.emptySubtitle}>
              Tap the bookmark icon on any job to save it for later review.
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
  savedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  savedDateText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  expiringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  expiringBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
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
