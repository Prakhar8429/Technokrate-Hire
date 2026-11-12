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
import CustomInput from '../../../../components/CustomInput';
import PrimaryButton from '../../../../components/PrimaryButton';
import { COLORS } from '../../../../constants/colors';
import employerService from '../../../../services/employerService';

const STATUS_OPTIONS = ['Active', 'Paused', 'Closed'];
const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Sales & Marketing',
  'Operations',
  'Human Resources',
  'Finance',
];
const JOB_TYPES = ['Full Time', 'Part Time', 'Internship', 'Contract'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];

export default function EmployerEditJobScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Active');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [type, setType] = useState(JOB_TYPES[0]);
  const [workMode, setWorkMode] = useState(WORK_MODES[0]);
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [salary, setSalary] = useState('');
  const [openings, setOpenings] = useState('1');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await employerService.getJobDetails(id);
      if (data) {
        setTitle(data.title || '');
        setStatus(data.status || 'Active');
        if (data.department) setDepartment(data.department);
        if (data.type) setType(data.type);
        if (data.workMode) setWorkMode(data.workMode);
        setLocation(data.location || '');
        setExperience(data.experience || '');
        setSalary(data.salary || '');
        setOpenings(String(data.openings || 1));
        setSkills(data.skills || []);
        setDescription(data.description || '');
        setResponsibilities(data.responsibilities || '');
        setRequirements(data.requirements || '');
      }
      setLoading(false);
    })();
  }, [id]);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
    if (!title.trim() || !location.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please fill in Title, Location, and Description.');
      return;
    }

    setSaving(true);
    const updatePayload = {
      title: title.trim(),
      status,
      department,
      type,
      workMode,
      location: location.trim(),
      experience: experience.trim(),
      salary: salary.trim(),
      openings: parseInt(openings, 10) || 1,
      skills,
      description: description.trim(),
      responsibilities: responsibilities.trim(),
      requirements: requirements.trim(),
    };

    const res = await employerService.updateJob(id, updatePayload);
    setSaving(false);

    if (res.success) {
      Alert.alert('Updated', 'Job posting details have been saved.', [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert('Error', 'Could not update job posting.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.topBarTitle}>Edit Job</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Status Switcher */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Job Status</Text>
            <View style={styles.chipsWrap}>
              {STATUS_OPTIONS.map((st) => {
                const selected = status === st;
                return (
                  <Pressable
                    key={st}
                    style={[
                      styles.chip,
                      selected &&
                        (st === 'Active'
                          ? styles.chipActiveGreen
                          : st === 'Paused'
                          ? styles.chipActiveOrange
                          : styles.chipActiveGray),
                    ]}
                    onPress={() => setStatus(st)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}
                    >
                      {st}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <CustomInput
            label="Job Title / Role *"
            placeholder="e.g. Senior React Native Developer"
            value={title}
            onChangeText={setTitle}
            icon="briefcase-outline"
          />

          {/* Department */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Department / Category</Text>
            <View style={styles.chipsWrap}>
              {DEPARTMENTS.map((dept) => {
                const selected = department === dept;
                return (
                  <Pressable
                    key={dept}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setDepartment(dept)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {dept}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Employment Type */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Employment Type</Text>
            <View style={styles.chipsWrap}>
              {JOB_TYPES.map((t) => {
                const selected = type === t;
                return (
                  <Pressable
                    key={t}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Work Mode */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Work Arrangement</Text>
            <View style={styles.chipsWrap}>
              {WORK_MODES.map((m) => {
                const selected = workMode === m;
                return (
                  <Pressable
                    key={m}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setWorkMode(m)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <CustomInput
            label="Location *"
            placeholder="City or Remote"
            value={location}
            onChangeText={setLocation}
            icon="location-outline"
          />

          <View style={styles.rowTwo}>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="Experience Range"
                placeholder="2 - 5 years"
                value={experience}
                onChangeText={setExperience}
                icon="time-outline"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ width: 100 }}>
              <CustomInput
                label="Openings"
                placeholder="1"
                value={openings}
                onChangeText={setOpenings}
                keyboardType="number-pad"
                icon="people-outline"
              />
            </View>
          </View>

          <CustomInput
            label="Salary / CTC Range"
            placeholder="e.g. ₹12,00,000 - ₹18,00,000 / year"
            value={salary}
            onChangeText={setSalary}
            icon="cash-outline"
          />

          {/* Skills Required */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Skills Required</Text>
            <View style={styles.addSkillRow}>
              <TextInput
                style={styles.addSkillInput}
                placeholder="Add skill"
                placeholderTextColor="#94A3B8"
                value={skillInput}
                onChangeText={setSkillInput}
                onSubmitEditing={handleAddSkill}
              />
              <Pressable style={styles.addSkillBtn} onPress={handleAddSkill}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.skillsChipsWrap}>
              {skills.map((s) => (
                <View key={s} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{s}</Text>
                  <Pressable onPress={() => handleRemoveSkill(s)} hitSlop={6}>
                    <Ionicons name="close-circle" size={16} color="#64748B" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Job Description *</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Responsibilities */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Responsibilities</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={responsibilities}
                onChangeText={setResponsibilities}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Requirements</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={requirements}
                onChangeText={setRequirements}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <PrimaryButton
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
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
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  fieldSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#F2E6F8',
    borderColor: COLORS.primary,
  },
  chipActiveGreen: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  chipActiveOrange: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  chipActiveGray: {
    backgroundColor: '#F1F5F9',
    borderColor: '#94A3B8',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#0F172A',
    fontWeight: '700',
  },
  rowTwo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSkillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  addSkillInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: '#FAFAFA',
    color: '#0F172A',
  },
  addSkillBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillsChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2E6F8',
  },
  skillPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  textAreaBox: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 70,
    fontSize: 14,
    color: '#0F172A',
  },
  actionContainer: {
    marginTop: 8,
  },
});