import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import {
  jobAlertService,
  AVAILABLE_JOB_TYPES,
  SALARY_DROPDOWN_OPTIONS,
} from '../../services/jobAlertService';

export default function JobFilterScreen() {
  const router = useRouter();

  // Filters State
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedMinSalary, setSelectedMinSalary] = useState(null);
  const [selectedMaxSalary, setSelectedMaxSalary] = useState(null);

  // Job Type search state
  const [showJobTypeSearch, setShowJobTypeSearch] = useState(false);
  const [jobTypeSearch, setJobTypeSearch] = useState('');

  // Available options
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);

  // Modals for selection
  const [activePicker, setActivePicker] = useState(null); // 'designation' | 'location' | 'minSalary' | 'maxSalary'
  const [pickerSearch, setPickerSearch] = useState('');

  // Load existing filters & dropdown options safely with isMounted check
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const filters = await jobAlertService.getFilters();
        if (isMounted && filters) {
          setSelectedJobTypes(Array.isArray(filters.jobTypes) ? filters.jobTypes : []);
          setSelectedDesignation(typeof filters.designation === 'string' ? filters.designation : '');
          setSelectedLocation(typeof filters.location === 'string' ? filters.location : '');
          setSelectedMinSalary(filters.salaryMin ?? null);
          setSelectedMaxSalary(filters.salaryMax ?? null);
        }

        const opts = await jobAlertService.getFilterDropdownOptions();
        if (isMounted && opts) {
          setDesignations(Array.isArray(opts.designations) ? opts.designations : []);
          setLocations(Array.isArray(opts.locations) ? opts.locations : []);
        }
      } catch (err) {
        console.warn('Error loading initial filter options:', err);
      }
    }

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  // Safe Toggle Job Type Checkbox
  const toggleJobType = (type) => {
    if (!type || typeof type !== 'string') return;
    setSelectedJobTypes((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(type)
        ? arr.filter((t) => t !== type)
        : [...arr, type];
    });
  };

  // Safe Navigation Back Helper
  const handleGoBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/alerts');
      }
    } catch {
      router.replace('/(tabs)/alerts');
    }
  };

  // Salary Validation: Min cannot be greater than Max
  const isSalaryInvalid =
    selectedMinSalary !== null &&
    selectedMaxSalary !== null &&
    Number(selectedMinSalary) > Number(selectedMaxSalary);

  // Clear / Reset all filters
  const handleReset = async () => {
    setSelectedJobTypes([]);
    setSelectedDesignation('');
    setSelectedLocation('');
    setSelectedMinSalary(null);
    setSelectedMaxSalary(null);
    setJobTypeSearch('');
    setShowJobTypeSearch(false);
    await jobAlertService.resetFilters();
  };

  // Save and Continue
  const handleSaveAndContinue = async () => {
    if (isSalaryInvalid) return;

    await jobAlertService.saveFilters({
      jobTypes: selectedJobTypes,
      designation: selectedDesignation,
      location: selectedLocation,
      salaryMin: selectedMinSalary,
      salaryMax: selectedMaxSalary,
    });

    handleGoBack();
  };

  // Helper for salary label
  const getSalaryLabel = (val) => {
    if (val === null || val === undefined) return 'Any';
    const match = SALARY_DROPDOWN_OPTIONS.find((o) => o.value === val);
    return match ? match.label : `$${val.toLocaleString()}`;
  };

  // Filtered Job Types based on optional search
  const cleanJtQuery = jobTypeSearch.toLowerCase().trim();
  const displayedJobTypes = AVAILABLE_JOB_TYPES.filter((t) =>
    !cleanJtQuery ? true : t.toLowerCase().includes(cleanJtQuery)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={handleGoBack}
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Filter</Text>
          <Pressable onPress={handleReset} hitSlop={12}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Container */}
          <View style={styles.filterCard}>
            {/* 1. Job Type Section Header with Search Toggle */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Job Type</Text>
              <Pressable
                onPress={() => {
                  setShowJobTypeSearch((prev) => !prev);
                  if (showJobTypeSearch) setJobTypeSearch('');
                }}
                hitSlop={8}
                style={styles.searchToggleBtn}
              >
                <Ionicons
                  name={showJobTypeSearch ? 'close-circle-outline' : 'search-outline'}
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.searchToggleText}>
                  {showJobTypeSearch ? 'Close' : 'Search'}
                </Text>
              </Pressable>
            </View>

            {/* Optional Job Type Search Input */}
            {showJobTypeSearch && (
              <View style={styles.jobTypeSearchBox}>
                <Ionicons name="search" size={15} color="#94A3B8" />
                <TextInput
                  style={styles.jobTypeSearchInput}
                  placeholder="Search job types (e.g. Full Time)..."
                  placeholderTextColor="#94A3B8"
                  value={jobTypeSearch}
                  onChangeText={setJobTypeSearch}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {jobTypeSearch.length > 0 && (
                  <Pressable onPress={() => setJobTypeSearch('')} hitSlop={6}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </Pressable>
                )}
              </View>
            )}

            {/* Checkbox Grid */}
            <View style={styles.checkboxGrid}>
              {displayedJobTypes.length > 0 ? (
                displayedJobTypes.map((type) => {
                  const checked =
                    Array.isArray(selectedJobTypes) &&
                    selectedJobTypes.includes(type);
                  return (
                    <Pressable
                      key={type}
                      style={styles.checkboxItem}
                      onPress={() => toggleJobType(type)}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          checked && styles.checkboxBoxChecked,
                        ]}
                      >
                        {checked && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{type}</Text>
                    </Pressable>
                  );
                })
              ) : (
                <View style={styles.noJobTypesFound}>
                  <Text style={styles.noJobTypesText}>
                    No job type matches "{jobTypeSearch}"
                  </Text>
                  <Pressable onPress={() => setJobTypeSearch('')}>
                    <Text style={styles.clearSearchLink}>Clear search</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* 2. Preferred Designation Section */}
            <View style={styles.inputGroup}>
              <Pressable
                style={styles.dropdownPickerBox}
                onPress={() => {
                  setPickerSearch('');
                  setActivePicker('designation');
                }}
              >
                <Text
                  style={[
                    styles.pickerValueText,
                    !selectedDesignation && styles.pickerPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {selectedDesignation || 'Preferred designation'}
                </Text>
                {selectedDesignation ? (
                  <Pressable
                    onPress={() => setSelectedDesignation('')}
                    hitSlop={8}
                    style={styles.clearIcon}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-down" size={18} color="#64748B" />
                )}
              </Pressable>
            </View>

            {/* 3. Preferred Location Section */}
            <View style={styles.inputGroup}>
              <Pressable
                style={styles.dropdownPickerBox}
                onPress={() => {
                  setPickerSearch('');
                  setActivePicker('location');
                }}
              >
                <Text
                  style={[
                    styles.pickerValueText,
                    !selectedLocation && styles.pickerPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {selectedLocation || 'Preferred location'}
                </Text>
                {selectedLocation ? (
                  <Pressable
                    onPress={() => setSelectedLocation('')}
                    hitSlop={8}
                    style={styles.clearIcon}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-down" size={18} color="#64748B" />
                )}
              </Pressable>
            </View>

            {/* 4. Desired Salary Range Section */}
            <Text style={[styles.sectionHeading, { marginTop: 14 }]}>
              Desired Salary Range
            </Text>
            <View style={styles.salaryRow}>
              {/* Min Salary Dropdown */}
              <View style={styles.salaryCol}>
                <Text style={styles.salaryInputSubLabel}>Min</Text>
                <Pressable
                  style={styles.salaryPickerBox}
                  onPress={() => setActivePicker('minSalary')}
                >
                  <Text style={styles.salaryValueText} numberOfLines={1}>
                    {getSalaryLabel(selectedMinSalary)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </Pressable>
              </View>

              {/* Max Salary Dropdown */}
              <View style={styles.salaryCol}>
                <Text style={styles.salaryInputSubLabel}>Max</Text>
                <Pressable
                  style={styles.salaryPickerBox}
                  onPress={() => setActivePicker('maxSalary')}
                >
                  <Text style={styles.salaryValueText} numberOfLines={1}>
                    {getSalaryLabel(selectedMaxSalary)}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </Pressable>
              </View>
            </View>

            {/* Validation Message */}
            {isSalaryInvalid && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>
                  Minimum salary cannot be greater than maximum salary.
                </Text>
              </View>
            )}

            {/* 5. Save and Continue Button */}
            <Pressable
              style={[
                styles.saveButton,
                isSalaryInvalid && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveAndContinue}
              disabled={isSalaryInvalid}
            >
              <Text style={styles.saveButtonText}>Save and Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selection Modal (Designation / Location / Min Salary / Max Salary) */}
      <Modal
        visible={activePicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePicker(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setActivePicker(null)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activePicker === 'designation' && 'Select Designation'}
                {activePicker === 'location' && 'Select Location'}
                {activePicker === 'minSalary' && 'Minimum Salary'}
                {activePicker === 'maxSalary' && 'Maximum Salary'}
              </Text>
              <Pressable
                onPress={() => setActivePicker(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#475569" />
              </Pressable>
            </View>

            {/* Search Input for designation/location */}
            {(activePicker === 'designation' || activePicker === 'location') && (
              <View style={styles.modalSearchBox}>
                <Ionicons name="search" size={18} color="#94A3B8" />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={`Search ${activePicker}...`}
                  placeholderTextColor="#94A3B8"
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                  autoCorrect={false}
                />
                {pickerSearch.length > 0 && (
                  <Pressable onPress={() => setPickerSearch('')}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </Pressable>
                )}
              </View>
            )}

            {/* Options List */}
            <ScrollView
              style={styles.modalOptionsScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Designation Options */}
              {activePicker === 'designation' && (
                <>
                  <Pressable
                    style={[
                      styles.modalOptionItem,
                      !selectedDesignation && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedDesignation('');
                      setActivePicker(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        !selectedDesignation && styles.modalOptionTextSelected,
                      ]}
                    >
                      All Designations (Any)
                    </Text>
                    {!selectedDesignation && (
                      <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                    )}
                  </Pressable>
                  {(() => {
                    const cleanQ = pickerSearch.toLowerCase().trim();
                    const filtered = designations
                      .map((d) => (typeof d === 'string' ? d : d?.name || d?.title || String(d || '')))
                      .filter((d) => Boolean(d) && d.toLowerCase().includes(cleanQ));

                    if (cleanQ.length > 0 && filtered.length === 0) {
                      return (
                        <View style={styles.modalEmptyBox}>
                          <Ionicons name="search-outline" size={24} color="#94A3B8" />
                          <Text style={styles.modalEmptyText}>
                            No designations found matching "{pickerSearch}"
                          </Text>
                        </View>
                      );
                    }

                    return filtered.map((item) => {
                      const isSel = selectedDesignation === item;
                      return (
                        <Pressable
                          key={item}
                          style={[
                            styles.modalOptionItem,
                            isSel && styles.modalOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedDesignation(item);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.modalOptionText,
                              isSel && styles.modalOptionTextSelected,
                            ]}
                          >
                            {item}
                          </Text>
                          {isSel && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color={COLORS.primary}
                            />
                          )}
                        </Pressable>
                      );
                    });
                  })()}
                </>
              )}

              {/* Location Options */}
              {activePicker === 'location' && (
                <>
                  <Pressable
                    style={[
                      styles.modalOptionItem,
                      !selectedLocation && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedLocation('');
                      setActivePicker(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        !selectedLocation && styles.modalOptionTextSelected,
                      ]}
                    >
                      All Locations (Any)
                    </Text>
                    {!selectedLocation && (
                      <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                    )}
                  </Pressable>
                  {(() => {
                    const cleanQ = pickerSearch.toLowerCase().trim();
                    const filtered = locations
                      .map((l) => (typeof l === 'string' ? l : l?.name || l?.city || String(l || '')))
                      .filter((l) => Boolean(l) && l.toLowerCase().includes(cleanQ));

                    if (cleanQ.length > 0 && filtered.length === 0) {
                      return (
                        <View style={styles.modalEmptyBox}>
                          <Ionicons name="search-outline" size={24} color="#94A3B8" />
                          <Text style={styles.modalEmptyText}>
                            No locations found matching "{pickerSearch}"
                          </Text>
                        </View>
                      );
                    }

                    return filtered.map((item) => {
                      const isSel = selectedLocation === item;
                      return (
                        <Pressable
                          key={item}
                          style={[
                            styles.modalOptionItem,
                            isSel && styles.modalOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedLocation(item);
                            setActivePicker(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.modalOptionText,
                              isSel && styles.modalOptionTextSelected,
                            ]}
                          >
                            {item}
                          </Text>
                          {isSel && (
                            <Ionicons
                              name="checkmark"
                              size={18}
                              color={COLORS.primary}
                            />
                          )}
                        </Pressable>
                      );
                    });
                  })()}
                </>
              )}

              {/* Min Salary Options */}
              {activePicker === 'minSalary' &&
                SALARY_DROPDOWN_OPTIONS.map((opt) => {
                  const isSel = selectedMinSalary === opt.value;
                  return (
                    <Pressable
                      key={String(opt.value)}
                      style={[
                        styles.modalOptionItem,
                        isSel && styles.modalOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedMinSalary(opt.value);
                        setActivePicker(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          isSel && styles.modalOptionTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isSel && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={COLORS.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}

              {/* Max Salary Options */}
              {activePicker === 'maxSalary' &&
                SALARY_DROPDOWN_OPTIONS.map((opt) => {
                  const isSel = selectedMaxSalary === opt.value;
                  return (
                    <Pressable
                      key={String(opt.value)}
                      style={[
                        styles.modalOptionItem,
                        isSel && styles.modalOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedMaxSalary(opt.value);
                        setActivePicker(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          isSel && styles.modalOptionTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isSel && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={COLORS.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6F5',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    padding: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
    gap: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '46%',
    paddingVertical: 6,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  inputGroup: {
    marginBottom: 14,
  },
  dropdownPickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  pickerValueText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    flex: 1,
  },
  pickerPlaceholder: {
    color: '#94A3B8',
  },
  clearIcon: {
    marginLeft: 6,
  },
  salaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  salaryCol: {
    flex: 1,
  },
  salaryInputSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  salaryPickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  salaryValueText: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 2,
  },
  modalOptionsScroll: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  modalOptionSelected: {
    backgroundColor: '#F5EEFC',
    borderRadius: 8,
  },
  modalOptionText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  searchToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  jobTypeSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    gap: 8,
  },
  jobTypeSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  noJobTypesFound: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noJobTypesText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  clearSearchLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalEmptyBox: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalEmptyText: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
  },
});
