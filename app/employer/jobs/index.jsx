import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BrandLogo from '../../../components/BrandLogo';
import EmployerBottomNav from '../../../components/EmployerBottomNav';
import { COLORS } from '../../../constants/colors';
import employerService from '../../../services/employerService';

const FILTER_TABS = ['All', 'Active', 'Paused', 'Closed'];

export default function EmployerMyJobsScreen() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Action Menu modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // Delete Confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobs = async () => {
    const list = await employerService.getEmployerJobs();
    setJobs(list || []);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  // Filter jobs based on activeTab & searchQuery
  const filteredJobs = jobs.filter((job) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : job.status?.toLowerCase() === activeTab.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query
      ? (job.title || '').toLowerCase().includes(query) ||
        (job.department || '').toLowerCase().includes(query) ||
        (job.location || '').toLowerCase().includes(query)
      : true;
    return matchesTab && matchesSearch;
  });

  const handleOpenAction = (job) => {
    setSelectedJob(job);
    setShowActionModal(true);
  };

  const handleRepost = async () => {
    setShowActionModal(false);
    if (!selectedJob) return;
    const res = await employerService.repostJob(selectedJob._id);
    if (res.success) {
      Alert.alert('Job Reposted', res.message || 'Job is now active.');
      fetchJobs();
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedJob) return;
    setIsDeleting(true);
    const res = await employerService.deleteJob(selectedJob._id);
    setIsDeleting(false);
    setShowDeleteModal(false);
    setSelectedJob(null);
    if (res.success) {
      Alert.alert('Deleted', 'Job posting has been removed.');
      fetchJobs();
    } else {
      Alert.alert('Error', 'Could not delete job.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BrandLogo size="sm" />
          <Text style={styles.headerTitle}>My Job Postings</Text>
        </View>

        <Pressable
          style={styles.postJobBtn}
          onPress={() => router.push('/employer/jobs/post')}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.postJobBtnText}>Post a Job</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by role, department, location..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsRow}>
        {FILTER_TABS.map((tab) => {
          const isSelected = activeTab === tab;
          const count =
            tab === 'All'
              ? jobs.length
              : jobs.filter((j) => j.status?.toLowerCase() === tab.toLowerCase()).length;
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Jobs Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No jobs match "${searchQuery}"`
                : `You don't have any ${activeTab.toLowerCase()} jobs at this moment.`}
            </Text>
            <Pressable
              style={styles.emptyCta}
              onPress={() => router.push('/employer/jobs/post')}
            >
              <Text style={styles.emptyCtaText}>+ Post New Job</Text>
            </Pressable>
          </View>
        ) : (
          filteredJobs.map((job) => (
            <View key={job._id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobSub}>
                    {job.department || 'Tech'} • {job.type || 'Full Time'} • {job.workMode || 'Hybrid'}
                  </Text>
                </View>

                {/* Status Badge & 3-dots */}
                <View style={styles.topRightArea}>
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

                  <Pressable
                    style={styles.menuDotsBtn}
                    onPress={() => handleOpenAction(job)}
                    hitSlop={10}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color="#64748B" />
                  </Pressable>
                </View>
              </View>

              {/* Meta details */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{job.location || 'Remote'}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Ionicons name="cash-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{job.salary || '₹10-18 LPA'}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{job.expireDate || '30 Days Left'}</Text>
                </View>
              </View>

              {/* Interactive Applicant & Matches Bar */}
              <View style={styles.statsBar}>
                <Pressable
                  style={styles.statButton}
                  onPress={() => router.push(`/employer/jobs/applicants/${job._id}`)}
                >
                  <Ionicons name="people" size={15} color={COLORS.primary} />
                  <Text style={styles.statButtonText}>
                    {job.applicationsCount || 0} Applicants
                  </Text>
                  <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
                </Pressable>

                <Pressable
                  style={[styles.statButton, styles.statButtonMatches]}
                  onPress={() => router.push(`/employer/jobs/matches/${job._id}`)}
                >
                  <Ionicons name="sparkles" size={15} color="#D97706" />
                  <Text style={[styles.statButtonText, { color: '#D97706' }]}>
                    {job.matchesCount || 0} Smart Matches
                  </Text>
                  <Ionicons name="chevron-forward" size={12} color="#D97706" />
                </Pressable>
              </View>

              {/* Card Footer Actions */}
              <View style={styles.cardFooter}>
                <Pressable
                  style={styles.cardFooterBtn}
                  onPress={() => router.push(`/employer/jobs/${job._id}`)}
                >
                  <Ionicons name="eye-outline" size={14} color="#475569" />
                  <Text style={styles.cardFooterBtnText}>View Details</Text>
                </Pressable>

                <Pressable
                  style={styles.cardFooterBtn}
                  onPress={() => router.push(`/employer/jobs/edit/${job._id}`)}
                >
                  <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                  <Text style={[styles.cardFooterBtnText, { color: COLORS.primary }]}>
                    Edit
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Action Menu Modal */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowActionModal(false)}
        >
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle} numberOfLines={1}>
              {selectedJob?.title}
            </Text>

            <Pressable
              style={styles.actionOption}
              onPress={() => {
                setShowActionModal(false);
                router.push(`/employer/jobs/${selectedJob?._id}`);
              }}
            >
              <Ionicons name="eye-outline" size={20} color="#0F172A" />
              <Text style={styles.actionOptionText}>View Job Details</Text>
            </Pressable>

            <Pressable
              style={styles.actionOption}
              onPress={() => {
                setShowActionModal(false);
                router.push(`/employer/jobs/edit/${selectedJob?._id}`);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#0F172A" />
              <Text style={styles.actionOptionText}>Edit Job Posting</Text>
            </Pressable>

            <Pressable
              style={styles.actionOption}
              onPress={() => {
                setShowActionModal(false);
                router.push(`/employer/jobs/applicants/${selectedJob?._id}`);
              }}
            >
              <Ionicons name="people-outline" size={20} color="#0F172A" />
              <Text style={styles.actionOptionText}>View Applicants ({selectedJob?.applicationsCount || 0})</Text>
            </Pressable>

            <Pressable
              style={styles.actionOption}
              onPress={() => {
                setShowActionModal(false);
                router.push(`/employer/jobs/matches/${selectedJob?._id}`);
              }}
            >
              <Ionicons name="sparkles-outline" size={20} color="#0F172A" />
              <Text style={styles.actionOptionText}>View Smart Matches ({selectedJob?.matchesCount || 0})</Text>
            </Pressable>

            <Pressable style={styles.actionOption} onPress={handleRepost}>
              <Ionicons name="refresh-outline" size={20} color="#16A34A" />
              <Text style={[styles.actionOptionText, { color: '#16A34A' }]}>
                Repost / Activate
              </Text>
            </Pressable>

            <Pressable
              style={[styles.actionOption, styles.actionDeleteOption]}
              onPress={() => {
                setShowActionModal(false);
                setShowDeleteModal(true);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.actionOptionText, { color: '#EF4444' }]}>
                Delete Job Posting
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal (PRD Requirement) */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteIconBox}>
              <Ionicons name="alert-circle" size={32} color="#EF4444" />
            </View>

            <Text style={styles.deleteTitle}>Delete Job Posting?</Text>
            <Text style={styles.deleteDesc}>
              Are you sure you want to permanently delete "{selectedJob?.title}"? Candidates will no longer be able to find or apply for this role. This action cannot be undone.
            </Text>

            <View style={styles.deleteActionsRow}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
              >
                <Text style={styles.confirmDeleteBtnText}>
                  {isDeleting ? 'Deleting...' : 'Delete Posting'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <EmployerBottomNav activeTab="jobs" />
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
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  postJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  postJobBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  tabBtnActive: {
    backgroundColor: '#F2E6F8',
  },
  tabText: {
    fontSize: 12,
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  jobSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  topRightArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  menuDotsBtn: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 10,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  statsBar: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FAF5FC',
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  statButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F2E6F8',
  },
  statButtonMatches: {
    borderColor: '#FEF3C7',
  },
  statButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  cardFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardFooterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyCta: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  actionSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  actionDeleteOption: {
    borderBottomWidth: 0,
    marginTop: 6,
  },
  deleteModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 'auto',
    marginTop: 'auto',
    alignItems: 'center',
  },
  deleteIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  deleteDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  deleteActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});