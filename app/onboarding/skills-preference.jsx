import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import ProfileStepper from '../../components/ProfileStepper';
import CustomDropdown from '../../components/CustomDropdown';
import PrimaryButton from '../../components/PrimaryButton';
import AddSkillModal from '../../components/AddSkillModal';
import candidateService from '../../services/candidateService';

export default function SkillsPreferenceStep() {
  const router = useRouter();

  // Skills state (Picture 3 shows: Python, DSA, PHP)
  const [skills, setSkills] = useState(['Python', 'DSA', 'PHP']);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);

  // Type Role (2x2 grid in Picture 3)
  const [typeRoles, setTypeRoles] = useState({
    fullTime: false,
    freelance: false,
    partTime: false,
    internship: false,
  });

  // Preferred Designation state - initialized with rich list immediately
  const [designations, setDesignations] = useState(() => candidateService.getFallbackDesignations?.() || []);
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [designationError, setDesignationError] = useState(null);

  // Preferred Location state - initialized with rich list immediately
  const [locations, setLocations] = useState(() => candidateService.getFallbackLocations?.() || []);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Currently Working Here & Skip
  const [currentlyWorking, setCurrentlyWorking] = useState(false);

  // Desired Salary Range (Max & Min) - initialized immediately
  const [salaryOptions, setSalaryOptions] = useState(() => candidateService.getSalaryOptions?.() || []);
  const [selectedMaxSalary, setSelectedMaxSalary] = useState('');
  const [selectedMinSalary, setSelectedMinSalary] = useState('');
  const [salaryError, setSalaryError] = useState(null);

  // Save loading state
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDesignations();
    fetchLocations();
  }, []);

  const fetchDesignations = async () => {
    setLoadingDesignations(true);
    setDesignationError(null);
    try {
      const data = await candidateService.getPreferredDesignations();
      if (data && data.length > 0) {
        setDesignations(data);
      }
    } catch (e) {
      console.log('fetchDesignations fallback active');
    } finally {
      setLoadingDesignations(false);
    }
  };

  const fetchLocations = async () => {
    setLoadingLocations(true);
    setLocationError(null);
    try {
      const data = await candidateService.getLocations();
      if (data && data.length > 0) {
        setLocations(data);
      }
    } catch (e) {
      console.log('fetchLocations fallback active');
    } finally {
      setLoadingLocations(false);
    }
  };

  const toggleTypeRole = (roleKey) => {
    setTypeRoles((prev) => ({
      ...prev,
      [roleKey]: !prev[roleKey],
    }));
  };

  const handleAddSkill = (newSkill) => {
    const trimmed = (newSkill || '').trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSelectDesignation = (item) => {
    setSelectedDesignation(item.id || item.name);
  };

  const handleSelectLocation = (item) => {
    setSelectedLocation(item.id || item.name);
  };

  const handleSelectMaxSalary = (item) => {
    const val = item.id || item.value;
    setSelectedMaxSalary(val);
    setSalaryError(null);

    // Validate if min is already selected and min > max
    if (selectedMinSalary && Number(selectedMinSalary) > Number(val)) {
      setSalaryError('Min salary cannot exceed Max salary');
    }
  };

  const handleSelectMinSalary = (item) => {
    const val = item.id || item.value;
    setSelectedMinSalary(val);
    setSalaryError(null);

    // Validate if max is already selected and min > max
    if (selectedMaxSalary && Number(val) > Number(selectedMaxSalary)) {
      setSalaryError('Min salary cannot exceed Max salary');
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/documents');
  };

  const handleSaveAndContinue = async () => {
    // Validate salary
    if (
      selectedMinSalary &&
      selectedMaxSalary &&
      Number(selectedMinSalary) > Number(selectedMaxSalary)
    ) {
      Alert.alert(
        'Invalid Salary Range',
        'Minimum desired salary cannot be greater than Maximum desired salary.'
      );
      return;
    }

    setSaving(true);
    try {
      const activeRoles = [];
      if (typeRoles.fullTime) activeRoles.push('Full Time');
      if (typeRoles.freelance) activeRoles.push('Freelance');
      if (typeRoles.partTime) activeRoles.push('Part Time');
      if (typeRoles.internship) activeRoles.push('Internship');

      const payload = {
        skills,
        typeRole: activeRoles,
        preferredDesignation: selectedDesignation,
        preferredLocation: selectedLocation,
        desiredSalary: {
          min: selectedMinSalary ? Number(selectedMinSalary) : null,
          max: selectedMaxSalary ? Number(selectedMaxSalary) : null,
        },
        currentlyWorking,
      };

      await candidateService.saveSkillsAndPreferences(payload);
      router.push('/onboarding/documents');
    } catch (e) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 6-step Profile Stepper (Step 5 active) */}
      <ProfileStepper currentStep={5} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        <View style={styles.card}>
          {/* Centered Title & Subtitle */}
          <Text style={styles.title}>Skills and Preference</Text>
          <Text style={styles.subtitle}>
            Highlight your Skills and Preference to stand out
          </Text>

          {/* Skills Container (media_1789806553843.png: Skills [Python] [DSA] [PHP] + [Add]) */}
          <View style={styles.skillsContainer}>
            <Text style={styles.skillsLabel}>Skills</Text>
            <View style={styles.skillsList}>
              {skills.map((skill) => (
                <View key={skill} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{skill}</Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() => handleRemoveSkill(skill)}
                    style={styles.pillRemove}
                  >
                    <Ionicons name="close" size={13} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}

              {/* Add Skill Button */}
              <Pressable
                style={styles.addSkillPillBtn}
                onPress={() => setShowAddSkillModal(true)}
                hitSlop={6}
              >
                <Ionicons name="add" size={16} color={COLORS.primary} />
                <Text style={styles.addSkillPillText}>Add</Text>
              </Pressable>
            </View>
          </View>

          {/* Type Role Section (Picture 3: 2x2 grid) */}
          <Text style={styles.sectionLabel}>Type Role</Text>
          <View style={styles.typeRoleGrid}>
            <View style={styles.typeRoleRow}>
              {/* Full Time */}
              <Pressable
                style={styles.checkboxItem}
                onPress={() => toggleTypeRole('fullTime')}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    typeRoles.fullTime && styles.checkboxActive,
                  ]}
                >
                  {typeRoles.fullTime && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Full Time</Text>
              </Pressable>

              {/* Freelance */}
              <Pressable
                style={styles.checkboxItem}
                onPress={() => toggleTypeRole('freelance')}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    typeRoles.freelance && styles.checkboxActive,
                  ]}
                >
                  {typeRoles.freelance && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Freelance</Text>
              </Pressable>
            </View>

            <View style={styles.typeRoleRow}>
              {/* Part Time */}
              <Pressable
                style={styles.checkboxItem}
                onPress={() => toggleTypeRole('partTime')}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    typeRoles.partTime && styles.checkboxActive,
                  ]}
                >
                  {typeRoles.partTime && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Part Time</Text>
              </Pressable>

              {/* Internship */}
              <Pressable
                style={styles.checkboxItem}
                onPress={() => toggleTypeRole('internship')}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    typeRoles.internship && styles.checkboxActive,
                  ]}
                >
                  {typeRoles.internship && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Internship</Text>
              </Pressable>
            </View>
          </View>

          {/* Preferred Designation Dropdown */}
          <CustomDropdown
            label="Prefered Designation"
            placeholder="Prefered Designation"
            options={designations}
            data={designations}
            selectedValue={selectedDesignation}
            value={selectedDesignation}
            onSelect={handleSelectDesignation}
            loading={loadingDesignations}
            error={designationError}
            searchable={true}
            searchPlaceholder="Search designations..."
            style={styles.dropdownMargin}
          />

          {/* Preferred Location Dropdown */}
          <CustomDropdown
            label="Prefered Location"
            placeholder="Prefered Location"
            options={locations}
            data={locations}
            selectedValue={selectedLocation}
            value={selectedLocation}
            onSelect={handleSelectLocation}
            loading={loadingLocations}
            error={locationError}
            searchable={true}
            searchPlaceholder="Search locations..."
            style={styles.dropdownMargin}
          />

          {/* Currently Working Here (Left) & Skip (Right) */}
          <View style={styles.workingSkipRow}>
            <Pressable
              style={styles.workingLeft}
              onPress={() => setCurrentlyWorking(!currentlyWorking)}
            >
              <View
                style={[
                  styles.plusBox,
                  currentlyWorking && styles.plusBoxActive,
                ]}
              >
                <Feather
                  name={currentlyWorking ? 'check' : 'plus'}
                  size={14}
                  color={currentlyWorking ? '#FFFFFF' : COLORS.primary}
                />
              </View>
              <Text style={styles.workingText}>Currently Working Here</Text>
            </Pressable>

            <Pressable onPress={handleSkip} hitSlop={10}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          {/* Desired Salary Range Section */}
          <Text style={styles.sectionLabel}>Desired Salary Range</Text>
          <View style={styles.salaryRow}>
            {/* Max Salary Dropdown */}
            <View style={styles.salaryCol}>
              <CustomDropdown
                label="Max"
                placeholder="Max"
                options={salaryOptions}
                data={salaryOptions}
                selectedValue={selectedMaxSalary}
                value={selectedMaxSalary}
                onSelect={handleSelectMaxSalary}
                searchable={false}
              />
            </View>

            {/* Min Salary Dropdown */}
            <View style={styles.salaryCol}>
              <CustomDropdown
                label="Min"
                placeholder="Min"
                options={salaryOptions}
                data={salaryOptions}
                selectedValue={selectedMinSalary}
                value={selectedMinSalary}
                onSelect={handleSelectMinSalary}
                searchable={false}
              />
            </View>
          </View>

          {/* Validation Error Message */}
          {salaryError && (
            <Text style={styles.salaryErrorText}>{salaryError}</Text>
          )}

          {/* Save and Continue Button */}
          <PrimaryButton
            title="Save and Continue"
            onPress={handleSaveAndContinue}
            loading={saving}
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>

      {/* Add Skill Interactive Modal */}
      <AddSkillModal
        visible={showAddSkillModal}
        onClose={() => setShowAddSkillModal(false)}
        initialSkills={skills}
        onSaveSkills={(updated) => setSkills(updated)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 140,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    marginTop: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '400',
  },
  skillsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    minHeight: 52,
    gap: 10,
  },
  skillsLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A5568',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  skillPillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  pillRemove: {
    marginLeft: 2,
    padding: 1,
  },
  addSkillPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 4,
  },
  addSkillPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  typeRoleGrid: {
    marginBottom: 16,
    gap: 10,
  },
  typeRoleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  dropdownMargin: {
    marginBottom: 16,
  },
  workingSkipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
  },
  workingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  plusBoxActive: {
    backgroundColor: COLORS.primary,
  },
  workingText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#334155',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  salaryCol: {
    flex: 1,
  },
  salaryErrorText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 12,
    fontWeight: '500',
  },
  saveBtn: {
    marginTop: 12,
  },
});
