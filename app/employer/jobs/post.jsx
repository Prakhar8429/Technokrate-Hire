import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../../components/CustomInput';
import PrimaryButton from '../../../components/PrimaryButton';
import { COLORS } from '../../../constants/colors';
import employerService from '../../../services/employerService';

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

export default function EmployerPostJobScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [type, setType] = useState(JOB_TYPES[0]);
  const [workMode, setWorkMode] = useState(WORK_MODES[0]);
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('2 - 5 years');
  const [salary, setSalary] = useState('₹12,00,000 - ₹18,00,000 / year');
  const [openings, setOpenings] = useState('1');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['React Native', 'JavaScript', 'REST APIs']);
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handlePublish = async () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Job title is required';
    if (!location.trim()) newErrors.location = 'Job location is required';
    if (!description.trim()) newErrors.description = 'Job description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const payload = {
      title: title.trim(),
      role: title.trim(),
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

    const res = await employerService.createJob(payload);
    setLoading(false);

    if (res.success) {
      Alert.alert(
        'Job Published Successfully! 🎉',
        'Your job listing is live. Candidates can now discover and apply for this role.',
        [
          {
            text: 'View Postings',
            onPress: () => router.replace('/employer/jobs'),
          },
        ]
      );
    } else {
      Alert.alert('Publish Failed', res.message || 'Unable to post job');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.topBarTitle}>Post a Job</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create New Job Opening</Text>
          <Text style={styles.subtitle}>
            Fill out the job specifications to reach thousands of matched job seekers.
          </Text>
        </View>

        <View style={styles.card}>
          <CustomInput
            label="Job Title / Role *"
            placeholder="e.g. Senior React Native Developer"
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            icon="briefcase-outline"
            error={errors.title}
          />

          {/* Department */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Department / Category *</Text>
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
            <Text style={styles.fieldLabel}>Employment Type *</Text>
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
            <Text style={styles.fieldLabel}>Work Arrangement *</Text>
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
            label="Location / Base City *"
            placeholder="e.g. Bengaluru, Karnataka or Remote"
            value={location}
            onChangeText={(t) => {
              setLocation(t);
              if (errors.location) setErrors((prev) => ({ ...prev, location: null }));
            }}
            icon="location-outline"
            error={errors.location}
          />

          <View style={styles.rowTwo}>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="Experience Range"
                placeholder="e.g. 2 - 5 years"
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
            <Text style={styles.fieldLabel}>Required Skills & Technologies</Text>
            <View style={styles.addSkillRow}>
              <TextInput
                style={styles.addSkillInput}
                placeholder="Add skill (e.g. TypeScript, GraphQL)"
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
                placeholder="Describe the role, day-to-day work, and impact..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={(t) => {
                  setDescription(t);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                }}
                textAlignVertical="top"
              />
            </View>
            {errors.description ? (
              <Text style={styles.errorText}>{errors.description}</Text>
            ) : null}
          </View>

          {/* Responsibilities */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Key Responsibilities</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                placeholder="• Lead architecture of core apps&#10;• Collaborate with cross-functional teams..."
                placeholderTextColor="#94A3B8"
                value={responsibilities}
                onChangeText={setResponsibilities}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Requirements */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Candidate Requirements</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                placeholder="• Bachelor's degree in CS or equivalent&#10;• Experience with modern frameworks..."
                placeholderTextColor="#94A3B8"
                value={requirements}
                onChangeText={setRequirements}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <PrimaryButton
            title="Publish Job Posting"
            onPress={handlePublish}
            loading={loading}
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
  header: {
    marginVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
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
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  chipTextActive: {
    color: COLORS.primary,
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  actionContainer: {
    marginTop: 8,
  },
});