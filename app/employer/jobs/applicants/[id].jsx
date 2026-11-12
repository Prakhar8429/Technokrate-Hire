import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import employerService from '../../../../services/employerService';

const APPLICANT_TABS = ['All', 'Applied', 'Reviewed', 'Shortlisted', 'Rejected'];

export default function EmployerApplicantsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [jobData, candData] = await Promise.all([
        employerService.getJobDetails(id),
        employerService.getApplicants(id),
      ]);
      setJob(jobData);
      setApplicants(candData || []);
      setLoading(false);
    })();
  }, [id]);

  const handleUpdateStatus = (candId, newStatus) => {
    setApplicants((prev) =>
      prev.map((c) => (c._id === candId ? { ...c, status: newStatus } : c))
    );
    Alert.alert('Status Updated', `Candidate marked as ${newStatus}`);
  };

  const filteredApplicants = applicants.filter((c) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : c.status?.toLowerCase() === activeTab.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query
      ? (c.name || '').toLowerCase().includes(query) ||
        (c.role || '').toLowerCase().includes(query) ||
        (c.location || '').toLowerCase().includes(query)
      : true;
    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {job?.title || 'Applicants'}
          </Text>
          <Text style={styles.topBarSub}>
            {applicants.length} Total Applicants
          </Text>
        </View>
        <Pressable
          onPress={() => router.push(`/employer/jobs/matches/${id}`)}
          style={styles.matchesShortcutBtn}
        >
          <Ionicons name="sparkles" size={14} color="#D97706" />
          <Text style={styles.matchesShortcutText}>Matches</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search candidate name or skill..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {APPLICANT_TABS.map((tab) => {
          const isSelected = activeTab === tab;
          const count =
            tab === 'All'
              ? applicants.length
              : applicants.filter((a) => a.status?.toLowerCase() === tab.toLowerCase()).length;
          return (
            <Pressable
              key={tab}
              style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {tab} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredApplicants.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Candidates in this view</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filter or search query
            </Text>
          </View>
        ) : (
          filteredApplicants.map((cand) => (
            <View key={cand._id} style={styles.card}>
              <Pressable
                style={styles.candHeader}
                onPress={() => router.push(`/employer/candidates/${cand._id}`)}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{cand.initials || 'A'}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.candName}>{cand.name}</Text>
                  <Text style={styles.candRole}>{cand.role}</Text>
                  <Text style={styles.candExp}>{cand.experience}</Text>
                </View>

                <View
                  style={[
                    styles.statusTag,
                    cand.status === 'Shortlisted'
                      ? styles.statusShortlisted
                      : cand.status === 'Reviewed'
                      ? styles.statusReviewed
                      : cand.status === 'Rejected'
                      ? styles.statusRejected
                      : styles.statusApplied,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      cand.status === 'Shortlisted'
                        ? styles.statusTagTextGreen
                        : cand.status === 'Reviewed'
                        ? styles.statusTagTextAmber
                        : cand.status === 'Rejected'
                        ? styles.statusTagTextRed
                        : styles.statusTagTextPurple,
                    ]}
                  >
                    {cand.status}
                  </Text>
                </View>
              </Pressable>

              <View style={styles.candDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="school-outline" size={13} color="#64748B" />
                  <Text style={styles.detailText}>{cand.education}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={13} color="#64748B" />
                  <Text style={styles.detailText}>{cand.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={13} color="#64748B" />
                  <Text style={styles.detailText}>Applied {cand.appliedDate}</Text>
                </View>
              </View>

              {/* Skills */}
              <View style={styles.skillsRow}>
                {cand.skills?.map((s, idx) => (
                  <View key={idx} style={styles.skillPill}>
                    <Text style={styles.skillPillText}>{s}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                <Pressable
                  style={styles.viewProfileBtn}
                  onPress={() => router.push(`/employer/candidates/${cand._id}`)}
                >
                  <Text style={styles.viewProfileBtnText}>View Full Profile</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
                </Pressable>

                <View style={styles.statusButtons}>
                  <Pressable
                    style={[styles.actionIconBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleUpdateStatus(cand._id, 'Rejected')}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={16} color="#EF4444" />
                  </Pressable>

                  <Pressable
                    style={[styles.actionIconBtn, { backgroundColor: '#DCFCE7' }]}
                    onPress={() => handleUpdateStatus(cand._id, 'Shortlisted')}
                    hitSlop={8}
                  >
                    <Ionicons name="checkmark" size={16} color="#16A34A" />
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  topBarCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  topBarSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  matchesShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  matchesShortcutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  tabBtnActive: {
    backgroundColor: '#F2E6F8',
  },
  tabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  candHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2E6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  candName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  candRole: {
    fontSize: 12,
    color: '#475569',
    marginTop: 1,
  },
  candExp: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusApplied: {
    backgroundColor: '#F2E6F8',
  },
  statusReviewed: {
    backgroundColor: '#FEF3C7',
  },
  statusShortlisted: {
    backgroundColor: '#DCFCE7',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusTagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusTagTextPurple: {
    color: COLORS.primary,
  },
  statusTagTextAmber: {
    color: '#D97706',
  },
  statusTagTextGreen: {
    color: '#16A34A',
  },
  statusTagTextRed: {
    color: '#EF4444',
  },
  candDetails: {
    gap: 4,
    marginVertical: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillPill: {
    backgroundColor: '#FAF5FC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  skillPillText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});