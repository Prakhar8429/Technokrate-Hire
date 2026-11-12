import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ProfileStepper from '../../components/ProfileStepper';
import CustomInput from '../../components/CustomInput';
import CustomDropdown from '../../components/CustomDropdown';
import PrimaryButton from '../../components/PrimaryButton';
import candidateService from '../../services/candidateService';

export default function BasicDetailsStep() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Dropdown options state
  const [categories, setCategories] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [locations, setLocations] = useState([]);
  const genderOptions = candidateService.getGenderOptions();

  // Selected values (holding backend IDs internally)
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedJobRoleId, setSelectedJobRoleId] = useState('');
  const [selectedSpecializationId, setSelectedSpecializationId] = useState('');
  const [email, setEmail] = useState(() => {
    const prof = candidateService.getUserProfile();
    return params?.email || prof?.email || '';
  });
  const [dob, setDob] = useState('1998-05-15');
  const [selectedGender, setSelectedGender] = useState('Male');
  const [selectedLocation, setSelectedLocation] = useState('Nagpur');

  // Loading and error states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const [categoryError, setCategoryError] = useState(null);
  const [roleError, setRoleError] = useState(null);
  const [specError, setSpecError] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const [saving, setSaving] = useState(false);

  // 1. Initial fetch: Categories & Locations on mount
  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setCategoryError(null);
    try {
      const data = await candidateService.getCategories();
      setCategories(data);
      // If we already have a default selected category (e.g. IT), load it
      if (data.length > 0 && !selectedCategoryId) {
        const defaultCat = data.find((c) => c.name === 'IT') || data[0];
        setSelectedCategoryId(defaultCat.id);
      }
    } catch (err) {
      setCategoryError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchLocations = async () => {
    setLoadingLocations(true);
    setLocationError(null);
    try {
      const data = await candidateService.getLocations();
      setLocations(data);
    } catch (err) {
      setLocationError('Failed to load locations');
    } finally {
      setLoadingLocations(false);
    }
  };

  // 2. Cascading: Fetch Job Roles whenever Category ID changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setJobRoles([]);
      setSelectedJobRoleId('');
      setSpecializations([]);
      setSelectedSpecializationId('');
      return;
    }

    const fetchRoles = async () => {
      setLoadingRoles(true);
      setRoleError(null);
      try {
        const roles = await candidateService.getSubCategories(selectedCategoryId);
        setJobRoles(roles);

        // Auto-select first or matching role if present
        if (roles.length > 0) {
          const defaultRole =
            roles.find((r) => r.name === 'Software Developer') || roles[0];
          setSelectedJobRoleId(defaultRole.id);
        } else {
          setSelectedJobRoleId('');
        }
      } catch (err) {
        setRoleError('Failed to load job roles');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [selectedCategoryId]);

  // 3. Cascading: Fetch Specializations whenever Job Role ID changes
  useEffect(() => {
    if (!selectedJobRoleId) {
      setSpecializations([]);
      setSelectedSpecializationId('');
      return;
    }

    const fetchSpecs = async () => {
      setLoadingSpecializations(true);
      setSpecError(null);
      try {
        const specs = await candidateService.getDesignations(selectedJobRoleId);
        setSpecializations(specs);

        // Auto-select first or matching specialization
        if (specs.length > 0) {
          const defaultSpec =
            specs.find((s) => s.name === 'React Js Developer') || specs[0];
          setSelectedSpecializationId(defaultSpec.id);
        } else {
          setSelectedSpecializationId('');
        }
      } catch (err) {
        setSpecError('Failed to load specializations');
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecs();
  }, [selectedJobRoleId]);

  // Handler for category selection
  const handleCategorySelect = (item) => {
    if (item.id !== selectedCategoryId) {
      setSelectedCategoryId(item.id);
      setSelectedJobRoleId('');
      setSelectedSpecializationId('');
    }
  };

  // Handler for job role selection
  const handleRoleSelect = (item) => {
    if (item.id !== selectedJobRoleId) {
      setSelectedJobRoleId(item.id);
      setSelectedSpecializationId('');
    }
  };

  // Handler for specialization selection
  const handleSpecializationSelect = (item) => {
    setSelectedSpecializationId(item.id);
  };

  // Handler for Save and Continue
  const handleSaveAndContinue = async () => {
    if (!selectedCategoryId) {
      Alert.alert('Required Field', 'Please select a Job Category.');
      return;
    }
    if (!selectedJobRoleId) {
      Alert.alert('Required Field', 'Please select a Job Role.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter your Email Address.');
      return;
    }

    setSaving(true);
    try {
      await candidateService.saveBasicDetails({
        jobCategory: selectedCategoryId,
        jobRole: selectedJobRoleId,
        specialization: selectedSpecializationId,
        email: email.trim(),
        dateOfBirth: dob.trim(),
        gender: selectedGender,
        location: selectedLocation,
      });

      router.push('/onboarding/education');
    } catch (e) {
      Alert.alert('Error', 'Unable to save basic details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 6-step horizontal progress tracker */}
      <ProfileStepper currentStep={1} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        <View style={styles.card}>
          {/* Centered Title & Subtitle matching Picture 3 */}
          <Text style={styles.title}>Basic Details</Text>
          <Text style={styles.subtitle}>Lets Start with basics</Text>

          {/* 1. Job Category Dropdown */}
          <CustomDropdown
            label="Job Category"
            placeholder="Select Job Category"
            selectedValue={selectedCategoryId}
            onSelect={handleCategorySelect}
            options={categories}
            loading={loadingCategories}
            error={categoryError}
            onRetry={fetchCategories}
          />

          {/* 2. Job Role Dropdown (Cascading from Category) */}
          <CustomDropdown
            label="Job Role"
            placeholder="Select Job Role"
            selectedValue={selectedJobRoleId}
            onSelect={handleRoleSelect}
            options={jobRoles}
            loading={loadingRoles}
            disabled={!selectedCategoryId}
            disabledReason="Select a category first"
            error={roleError}
            onRetry={() => {
              if (selectedCategoryId) {
                candidateService.getSubCategories(selectedCategoryId).then(setJobRoles);
              }
            }}
          />

          {/* 3. Specialization Dropdown (Cascading from Job Role) */}
          <CustomDropdown
            label="Specialization"
            placeholder="Select Specialization"
            selectedValue={selectedSpecializationId}
            onSelect={handleSpecializationSelect}
            options={specializations}
            loading={loadingSpecializations}
            disabled={!selectedJobRoleId}
            disabledReason="Select a job role first"
            error={specError}
            onRetry={() => {
              if (selectedJobRoleId) {
                candidateService.getDesignations(selectedJobRoleId).then(setSpecializations);
              }
            }}
          />

          {/* 4. Email Address */}
          <CustomInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* 5. Date of Birth */}
          <CustomInput
            label="Date of Birth"
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
          />

          {/* 6. Gender Dropdown */}
          <CustomDropdown
            label="Gender"
            placeholder="Select Gender"
            selectedValue={selectedGender}
            onSelect={(item) => setSelectedGender(item.id)}
            options={genderOptions}
          />

          {/* 7. Location Dropdown */}
          <CustomDropdown
            label="Location"
            placeholder="Select Location"
            selectedValue={selectedLocation}
            onSelect={(item) => setSelectedLocation(item.name)}
            options={locations}
            loading={loadingLocations}
            error={locationError}
            onRetry={fetchLocations}
          />

          {/* Save and Continue Button */}
          <PrimaryButton
            title="Save and Continue"
            onPress={handleSaveAndContinue}
            loading={saving}
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
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
    paddingBottom: 120,
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
  saveBtn: {
    marginTop: 14,
  },
});
