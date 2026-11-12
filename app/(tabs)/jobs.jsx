import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import JobCard from '../../components/JobCard';
import FilterSheet from '../../components/FilterSheet';
import { jobService } from '../../services/jobService';

export default function FindJobsScreen() {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState('suggested'); // 'suggested' | 'applied' | 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ jobLocations: [] });
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);

  // P1 Search Debounce: 350ms delay prevents redundant API requests on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Active pills state
  const [pills, setPills] = useState({
    remote: false,
    fullTime: false,
    highSalary: false,
  });

  // Modal filters state
  const [customFilters, setCustomFilters] = useState({
    jobType: 'All',
    location: 'All',
    salaryRange: 'all',
  });

  // Load filter dropdown options on mount
  useEffect(() => {
    jobService.getFilterOptions().then((opts) => setFilterOptions(opts));
  }, []);

  // Fetch / filter jobs
  const loadJobs = useCallback(async () => {
    // Only show full loading indicator when empty
    if (jobs.length === 0) {
      setLoading(true);
    }

    if (activeTab === 'saved') {
      const savedList = await jobService.getSavedJobs();
      setJobs(
        debouncedSearchQuery
          ? savedList.filter(
              (j) =>
                (j.jobTitle || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                (j.companyName || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            )
          : savedList
      );
      setLoading(false);
      return;
    }

    if (activeTab === 'applied') {
      const appliedList = await jobService.getAppliedJobs();
      setJobs(
        debouncedSearchQuery
          ? appliedList.filter(
              (j) =>
                (j.jobTitle || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                (j.companyName || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            )
          : appliedList
      );
      setLoading(false);
      return;
    }

    // Determine jobType filter
    let effJobType = customFilters.jobType;
    if (pills.remote) effJobType = 'Remote';
    else if (pills.fullTime) effJobType = 'Full-Time';

    // Determine salary filter
    let salaryMin = 0;
    let salaryMax = 999999;
    if (pills.highSalary) {
      salaryMin = 100000;
      salaryMax = 150000;
    } else if (customFilters.salaryRange === '50-80') {
      salaryMin = 50000;
      salaryMax = 80000;
    } else if (customFilters.salaryRange === '80-120') {
      salaryMin = 80000;
      salaryMax = 120000;
    } else if (customFilters.salaryRange === '120-160') {
      salaryMin = 120000;
      salaryMax = 160000;
    } else if (customFilters.salaryRange === '160+') {
      salaryMin = 160000;
    }

    const results = await jobService.searchJobs({
      keyword: debouncedSearchQuery,
      location: customFilters.location,
      jobType: effJobType,
      salaryMin,
      salaryMax,
    });

    setJobs(results);
    setLoading(false);
  }, [activeTab, debouncedSearchQuery, pills, customFilters]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleToggleSave = async (id) => {
    await jobService.toggleSaveJob(id);
    loadJobs();
  };

  const handleApply = async (id) => {
    await jobService.applyForJob(id);
    loadJobs();
  };

  const handleTogglePill = (key) => {
    setPills((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Active filters count
  let filterCount = 0;
  if (pills.remote) filterCount++;
  if (pills.fullTime) filterCount++;
  if (pills.highSalary) filterCount++;
  if (customFilters.jobType !== 'All') filterCount++;
  if (customFilters.location !== 'All') filterCount++;
  if (customFilters.salaryRange !== 'all') filterCount++;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader showNotification />
      <View style={styles.container}>

        {/* Complete Search Bar with Filter Pills */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          onOpenFilters={() => setIsFilterSheetVisible(true)}
          activeFilterCount={filterCount}
          activePills={pills}
          onTogglePill={handleTogglePill}
        />

        {/* Three Tabs: Suggested Jobs | Applied Jobs | Saved Jobs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'suggested' && styles.tabActive]}
            onPress={() => setActiveTab('suggested')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'suggested' && styles.tabTextActive,
              ]}
            >
              Suggested Jobs
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === 'applied' && styles.tabActive]}
            onPress={() => setActiveTab('applied')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'applied' && styles.tabTextActive,
              ]}
            >
              Applied Jobs
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'saved' && styles.tabTextActive,
              ]}
            >
              Saved Jobs
            </Text>
          </Pressable>
        </View>

        {/* Jobs List */}
        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Finding best matches...</Text>
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item, index) => item._id || String(index)}
            renderItem={({ item }) => (
              <JobCard
                job={item}
                onToggleSave={handleToggleSave}
                onApply={handleApply}
              />
            )}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={7}
            removeClippedSubviews={Platform.OS === 'android'}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <View style={styles.emptyWrapper}>
                <Ionicons name="briefcase-outline" size={48} color={COLORS.mutedText} />
                <Text style={styles.emptyTitle}>
                  {activeTab === 'saved'
                    ? 'No saved jobs yet'
                    : activeTab === 'applied'
                    ? 'No applications yet'
                    : 'No matching jobs found'}
                </Text>
                <Text style={styles.emptyDesc}>
                  {activeTab === 'saved'
                    ? 'Tap the bookmark icon on any job card to save it here.'
                    : activeTab === 'applied'
                    ? 'Jobs you apply for will appear here for tracking.'
                    : 'Try adjusting your search query or removing filters.'}
                </Text>
                {(searchQuery || filterCount > 0) && (
                  <Pressable
                    style={styles.clearFiltersBtn}
                    onPress={() => {
                      setSearchQuery('');
                      setPills({ remote: false, fullTime: false, highSalary: false });
                      setCustomFilters({ jobType: 'All', location: 'All', salaryRange: 'all' });
                    }}
                  >
                    <Text style={styles.clearFiltersText}>Reset All Filters</Text>
                  </Pressable>
                )}
              </View>
            }
          />
        )}

        {/* Filter Sheet Modal */}
        <FilterSheet
          visible={isFilterSheetVisible}
          onClose={() => setIsFilterSheetVisible(false)}
          locations={filterOptions.jobLocations || []}
          initialFilters={customFilters}
          onApplyFilters={(f) => setCustomFilters(f)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 4,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedText,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 90,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 10,
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.mutedText,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  clearFiltersBtn: {
    marginTop: 16,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearFiltersText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
