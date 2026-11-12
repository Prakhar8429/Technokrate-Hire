import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';
import { jobAlertService } from '../../services/jobAlertService';

export default function JobAlertsScreen() {
  const router = useRouter();

  // Screen Tabs: 'active' | 'history'
  const [activeTab, setActiveTab] = useState('active');

  // Alerts State
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadData() {
        if (activeAlerts.length === 0) {
          setLoading(true);
        }
        try {
          const [act, hist, currentFilters] = await Promise.all([
            jobAlertService.getActiveAlerts(),
            jobAlertService.getAlertHistory(),
            jobAlertService.getFilters(),
          ]);

          if (isMounted) {
            setActiveAlerts(act);
            setHistoryAlerts(hist);
            setFilters(currentFilters);
          }
        } catch (e) {
          console.warn('Error loading alerts:', e);
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      loadData();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  // Toggle Alert (Switch Active <-> History)
  const handleToggleAlert = async (id) => {
    const updated = await jobAlertService.toggleAlert(id);
    if (updated) {
      setActiveAlerts(updated.active);
      setHistoryAlerts(updated.history);
    }
  };

  // Delete Alert (PDF Item 10)
  const handleDeleteAlert = (id) => {
    Alert.alert(
      'Delete Job Alert',
      'Are you sure you want to delete this job alert?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await jobAlertService.deleteAlert(id);
            setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
            setHistoryAlerts((prev) => prev.filter((a) => a.id !== id));
          },
        },
      ]
    );
  };

  // Remove individual filter chip
  const removeFilterType = async (typeToRemove) => {
    if (!filters) return;
    const updatedTypes = (filters.jobTypes || []).filter((t) => t !== typeToRemove);
    const updated = await jobAlertService.saveFilters({
      ...filters,
      jobTypes: updatedTypes,
    });
    setFilters(updated);
  };

  const removeDesignationFilter = async () => {
    if (!filters) return;
    const updated = await jobAlertService.saveFilters({
      ...filters,
      designation: '',
    });
    setFilters(updated);
  };

  const removeLocationFilter = async () => {
    if (!filters) return;
    const updated = await jobAlertService.saveFilters({
      ...filters,
      location: '',
    });
    setFilters(updated);
  };

  const removeSalaryFilter = async () => {
    if (!filters) return;
    const updated = await jobAlertService.saveFilters({
      ...filters,
      salaryMin: null,
      salaryMax: null,
    });
    setFilters(updated);
  };

  const handleClearAllFilters = async () => {
    const reset = await jobAlertService.resetFilters();
    setFilters(reset);
  };

  // Check if salary filter is active
  const hasSalaryFilter =
    Boolean(filters) &&
    ((filters.salaryMin !== null && filters.salaryMin !== undefined && Number(filters.salaryMin) > 0) ||
     (filters.salaryMax !== null && filters.salaryMax !== undefined && Number(filters.salaryMax) > 0));

  // Count active filters accurately
  const activeFilterCount =
    (Array.isArray(filters?.jobTypes) ? filters.jobTypes.length : 0) +
    (filters?.designation && String(filters.designation).trim() ? 1 : 0) +
    (filters?.location && String(filters.location).trim() ? 1 : 0) +
    (hasSalaryFilter ? 1 : 0);

  // Filtered alerts list based on current tab and filters (guaranteed array)
  const currentList = activeTab === 'active' ? activeAlerts : historyAlerts;
  const displayedAlerts = jobAlertService.filterAlerts(currentList, filters) || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader showNotification />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Discovery Header (No Create button) */}
        <View style={styles.titleCard}>
          <View style={styles.titleTextContainer}>
            <Text style={styles.pageTitle}>Job Alerts</Text>
            <Text style={styles.pageSubtitle}>
              Stay updated with {activeAlerts.length + 5} new matches today
            </Text>
          </View>
        </View>

        {/* Action / Tabs Bar: Active Alerts | Alert History | Filter */}
        <View style={styles.tabBarRow}>
          <View style={styles.pillsContainer}>
            {/* Active Alerts Pill */}
            <Pressable
              style={[
                styles.tabPill,
                activeTab === 'active' && styles.tabPillActive,
              ]}
              onPress={() => setActiveTab('active')}
            >
              <Text
                style={[
                  styles.tabPillText,
                  activeTab === 'active' && styles.tabPillTextActive,
                ]}
              >
                Active Alerts
              </Text>
              {activeAlerts.length > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    activeTab === 'active'
                      ? styles.countBadgeActive
                      : styles.countBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countBadgeText,
                      activeTab === 'active'
                        ? styles.countBadgeTextActive
                        : styles.countBadgeTextInactive,
                    ]}
                  >
                    {activeAlerts.length}
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Alert History Pill */}
            <Pressable
              style={[
                styles.tabPill,
                activeTab === 'history' && styles.tabPillActive,
              ]}
              onPress={() => setActiveTab('history')}
            >
              <Text
                style={[
                  styles.tabPillText,
                  activeTab === 'history' && styles.tabPillTextActive,
                ]}
              >
                Alert History
              </Text>
              {historyAlerts.length > 0 && (
                <View
                  style={[
                    styles.countBadge,
                    activeTab === 'history'
                      ? styles.countBadgeActive
                      : styles.countBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countBadgeText,
                      activeTab === 'history'
                        ? styles.countBadgeTextActive
                        : styles.countBadgeTextInactive,
                    ]}
                  >
                    {historyAlerts.length}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Filter Action Button */}
          <Pressable
            style={[
              styles.filterBtn,
              activeFilterCount > 0 && styles.filterBtnActive,
            ]}
            onPress={() => router.push('/jobs/filter')}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color={activeFilterCount > 0 ? '#FFFFFF' : COLORS.text}
            />
            <Text
              style={[
                styles.filterBtnText,
                activeFilterCount > 0 && styles.filterBtnTextActive,
              ]}
            >
              Filter
            </Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterDot}>
                <Text style={styles.filterDotText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Active Filter Chips (if any filters are applied) */}
        {activeFilterCount > 0 && (
          <View style={styles.chipsRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {(filters?.jobTypes || []).map((jt) => {
                const jtLabel = typeof jt === 'string' ? jt : (jt?.name || String(jt));
                return (
                  <Pressable
                    key={jtLabel}
                    style={styles.activeChip}
                    onPress={() => removeFilterType(jt)}
                  >
                    <Text style={styles.activeChipText}>{jtLabel}</Text>
                    <Ionicons name="close" size={14} color={COLORS.primary} />
                  </Pressable>
                );
              })}

              {filters?.designation && String(filters.designation).trim() ? (
                <Pressable
                  style={styles.activeChip}
                  onPress={removeDesignationFilter}
                >
                  <Text style={styles.activeChipText}>{String(filters.designation)}</Text>
                  <Ionicons name="close" size={14} color={COLORS.primary} />
                </Pressable>
              ) : null}

              {filters?.location && String(filters.location).trim() ? (
                <Pressable
                  style={styles.activeChip}
                  onPress={removeLocationFilter}
                >
                  <Text style={styles.activeChipText}>{String(filters.location)}</Text>
                  <Ionicons name="close" size={14} color={COLORS.primary} />
                </Pressable>
              ) : null}

              {hasSalaryFilter ? (
                <Pressable
                  style={styles.activeChip}
                  onPress={removeSalaryFilter}
                >
                  <Text style={styles.activeChipText}>
                    ${filters?.salaryMin ? `${Math.round(filters.salaryMin / 1000)}k` : '0'} -{' '}
                    ${filters?.salaryMax ? `${Math.round(filters.salaryMax / 1000)}k` : 'Max'}
                  </Text>
                  <Ionicons name="close" size={14} color={COLORS.primary} />
                </Pressable>
              ) : null}

              <Pressable
                style={styles.clearAllBtn}
                onPress={handleClearAllFilters}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
            </ScrollView>
          </View>
        )}

        {/* Section Subheading */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>
            {activeTab === 'active' ? 'Your Active Alerts' : 'Alert History & Paused Alerts'}
          </Text>
          <Text style={styles.sectionCountText}>
            {displayedAlerts.length} {displayedAlerts.length === 1 ? 'alert' : 'alerts'}
          </Text>
        </View>

        {/* Loading Spinner */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}

        {/* Empty State */}
        {!loading && displayedAlerts.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name={
                  activeFilterCount > 0
                    ? 'filter-outline'
                    : activeTab === 'active'
                    ? 'notifications-off-outline'
                    : 'time-outline'
                }
                size={28}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeFilterCount > 0
                ? 'No alerts match your filter criteria'
                : activeTab === 'active'
                ? 'No active alerts'
                : 'No alert history yet'}
            </Text>
            <Text style={styles.emptySub}>
              {activeFilterCount > 0
                ? 'Try adjusting or clearing your filters to see more results.'
                : activeTab === 'active'
                ? 'Resume alerts from history or browse popular jobs below.'
                : 'Paused alerts will appear here for you to reactivate anytime.'}
            </Text>
            {activeFilterCount > 0 && (
              <Pressable
                style={styles.emptyResetBtn}
                onPress={handleClearAllFilters}
              >
                <Text style={styles.emptyResetBtnText}>Reset Filters</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Alerts Cards List */}
        {!loading &&
          displayedAlerts.map((item) => {
            const isActive = activeTab === 'active' && item.enabled;
            return (
              <View key={item.id} style={styles.alertCard}>
                <View style={styles.cardTop}>
                  {/* Left Icon */}
                  <View
                    style={[
                      styles.alertIconBox,
                      !isActive && styles.alertIconBoxPaused,
                    ]}
                  >
                    <Ionicons
                      name={item.icon || (isActive ? 'notifications' : 'notifications-off')}
                      size={20}
                      color={isActive ? COLORS.primary : '#94A3B8'}
                    />
                  </View>

                  {/* Info Column */}
                  <View style={styles.alertInfoCol}>
                    <Text style={styles.alertTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.alertTags} numberOfLines={1}>
                      {item.subtitle || item.tags || `${item.location} • ${item.jobType}`}
                    </Text>
                  </View>

                  {/* Status Badge & Toggle Switch */}
                  <View style={styles.rightActionCol}>
                    <View
                      style={[
                        styles.statusBadge,
                        isActive
                          ? styles.statusBadgeActive
                          : styles.statusBadgePaused,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isActive
                            ? styles.statusBadgeTextActive
                            : styles.statusBadgeTextPaused,
                        ]}
                      >
                        {isActive ? 'Active' : 'Paused'}
                      </Text>
                    </View>
                    <Switch
                      value={item.enabled}
                      onValueChange={() => handleToggleAlert(item.id)}
                      trackColor={{ false: '#E2E8F0', true: COLORS.primaryLight }}
                      thumbColor={item.enabled ? COLORS.primary : '#94A3B8'}
                    />
                  </View>
                </View>

                {/* Bottom Meta Row */}
                <View style={styles.cardBottom}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 }}>
                    <Ionicons
                      name={isActive ? 'flash-outline' : 'time-outline'}
                      size={14}
                      color={isActive ? COLORS.teal : COLORS.mutedText}
                    />
                    <Text
                      style={[
                        styles.matchesText,
                        !isActive && { color: COLORS.mutedText },
                      ]}
                      numberOfLines={1}
                    >
                      {item.matchesText}
                    </Text>
                  </View>

                  <Pressable
                    hitSlop={10}
                    onPress={() => handleDeleteAlert(item.id)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            );
          })}

        {/* Popular in your field (Discovery Section) */}
        <Text style={[styles.sectionHeading, { marginTop: 24, marginBottom: 12 }]}>
          Popular in your field
        </Text>

        <Pressable
          style={styles.popularCard}
          onPress={() => router.push('/(tabs)/jobs')}
        >
          <View style={styles.popularHeader}>
            <Text style={styles.popularRole}>UI/UX Systems Specialist</Text>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>14 Openings</Text>
            </View>
          </View>
          <Text style={styles.popularMeta}>
            Average Salary: $135,000 / year • 84% Match
          </Text>
          <Text style={styles.exploreLink}>Explore matches in Find Jobs →</Text>
        </Pressable>

        {/* Category Discovery Cards */}
        <View style={styles.categoryGrid}>
          <Pressable
            style={styles.categoryCard}
            onPress={() => router.push('/(tabs)/jobs')}
          >
            <View style={styles.categoryIconWrap}>
              <Ionicons name="laptop-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.categoryName}>Frontend Eng</Text>
            <Text style={styles.categoryCount}>28 Jobs</Text>
          </Pressable>

          <Pressable
            style={styles.categoryCard}
            onPress={() => router.push('/(tabs)/jobs')}
          >
            <View style={styles.categoryIconWrap}>
              <Ionicons name="analytics-outline" size={20} color={COLORS.teal} />
            </View>
            <Text style={styles.categoryName}>Data Science</Text>
            <Text style={styles.categoryCount}>19 Jobs</Text>
          </Pressable>

          <Pressable
            style={styles.categoryCard}
            onPress={() => router.push('/(tabs)/jobs')}
          >
            <View style={styles.categoryIconWrap}>
              <Ionicons name="phone-portrait-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.categoryName}>Mobile Apps</Text>
            <Text style={styles.categoryCount}>15 Jobs</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 95,
  },
  titleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6F5',
    marginBottom: 14,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  titleTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: COLORS.mutedText,
    marginTop: 2,
  },

  // Tab Bar & Filter Row
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  countBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  countBadgeTextActive: {
    color: COLORS.primary,
  },
  countBadgeTextInactive: {
    color: '#64748B',
  },

  // Filter Button
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterBtnTextActive: {
    color: '#FFFFFF',
  },
  filterDot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // Active Chips Row
  chipsRow: {
    marginBottom: 12,
  },
  chipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EEFC',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  activeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionCountText: {
    fontSize: 12,
    color: COLORS.mutedText,
    fontWeight: '600',
  },

  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // Alert Card
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertIconBoxPaused: {
    backgroundColor: '#F1F5F9',
  },
  alertInfoCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  alertTags: {
    fontSize: 12,
    color: COLORS.mutedText,
    marginTop: 2,
  },
  rightActionCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#E6FBF7',
  },
  statusBadgePaused: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusBadgeTextActive: {
    color: COLORS.teal,
  },
  statusBadgeTextPaused: {
    color: '#DC2626',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3E8FF',
    paddingTop: 8,
  },
  matchesText: {
    fontSize: 12,
    color: COLORS.teal,
    fontWeight: '600',
  },

  // Empty State
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6F5',
    marginBottom: 12,
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12.5,
    color: COLORS.mutedText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  emptyResetBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Popular in your field
  popularCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12,
  },
  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  popularRole: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  activePill: {
    backgroundColor: '#E6FBF7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.teal,
  },
  popularMeta: {
    fontSize: 12.5,
    color: COLORS.mutedText,
    marginBottom: 10,
  },
  exploreLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6F5',
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 11,
    color: COLORS.mutedText,
    marginTop: 2,
  },
});
