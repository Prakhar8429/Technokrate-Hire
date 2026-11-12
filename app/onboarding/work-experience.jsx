import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import ProfileStepper from '../../components/ProfileStepper';
import PrimaryButton from '../../components/PrimaryButton';
import CustomDatePickerModal from '../../components/CustomDatePickerModal';
import candidateService from '../../services/candidateService';

export default function WorkExperienceStep() {
  const router = useRouter();
  const scrollRef = useRef(null);

  const [isFresher, setIsFresher] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dynamic list of job experiences (moveable, expandable)
  const [experiences, setExperiences] = useState(() => {
    const existing = candidateService.getWorkExperience?.();
    if (Array.isArray(existing) && existing.length > 0) {
      return existing;
    }
    return [
      {
        id: '1',
        jobTitle: 'Software Engineer',
        company: 'Tech Solutions',
        startDate: '2022-01-15',
        endDate: '2024-05-30',
        currentlyWorking: false,
        responsibilities: 'Developing scalable full-stack applications.',
      },
    ];
  });

  // Date picker modal state: { index: number, field: 'startDate' | 'endDate', title: string, initialDate: string } | null
  const [activeDatePicker, setActiveDatePicker] = useState(null);

  const handleUpdateField = (index, field, value) => {
    setExperiences((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddJob = () => {
    setExperiences((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        responsibilities: '',
      },
    ]);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const handleRemoveJob = (index) => {
    if (experiences.length <= 1) return;
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenDatePicker = (index, field, title) => {
    const currentVal = experiences[index]?.[field] || '';
    setActiveDatePicker({
      index,
      field,
      title,
      initialDate: currentVal,
    });
  };

  const handleDateSelected = (dateStr) => {
    if (activeDatePicker) {
      const { index, field } = activeDatePicker;
      handleUpdateField(index, field, dateStr);
      setActiveDatePicker(null);
    }
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      if (isFresher) {
        await candidateService.saveWorkExperience([{ isFresher: true }]);
      } else {
        await candidateService.saveWorkExperience(experiences);
      }
      router.push('/onboarding/certification');
    } catch (e) {
      console.log('Error saving work experience:', e.message);
      router.push('/onboarding/certification');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/certification');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfileStepper currentStep={3} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={true}
          overScrollMode="always"
        >
          <View style={styles.card}>
            {/* Centered Title & Subtitle */}
            <Text style={styles.title}>Work Experience</Text>
            <Text style={styles.subtitle}>Tell us about your work</Text>

            {/* I am a Fresher Checkbox */}
            <Pressable
              style={styles.fresherRow}
              onPress={() => setIsFresher(!isFresher)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isFresher }}
            >
              <View style={[styles.fresherCheckbox, isFresher && styles.fresherCheckboxActive]}>
                {isFresher && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.fresherText}>I am a Fresher</Text>
            </Pressable>

            {isFresher ? (
              <View style={styles.fresherBanner}>
                <Ionicons name="school-outline" size={24} color={COLORS.primary} />
                <Text style={styles.fresherBannerText}>
                  Fresher profile selected. You can proceed directly to certifications and skills!
                </Text>
              </View>
            ) : (
              experiences.map((job, index) => {
                const isSecondary = index > 0;
                return (
                  <View
                    key={job.id || index}
                    style={isSecondary ? styles.additionalJobBox : null}
                  >
                    {isSecondary && (
                      <View style={styles.jobHeaderRow}>
                        <Text style={styles.jobHeaderTitle}>Job #{index + 1}</Text>
                        <Pressable
                          style={styles.removeJobBtn}
                          onPress={() => handleRemoveJob(index)}
                          hitSlop={8}
                          accessibilityLabel={`Remove Job #${index + 1}`}
                        >
                          <Ionicons name="trash-outline" size={15} color="#EF4444" />
                          <Text style={styles.removeJobText}>Remove</Text>
                        </Pressable>
                      </View>
                    )}

                    {/* Job Title */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={job.jobTitle !== undefined && job.jobTitle !== null ? String(job.jobTitle) : ''}
                        onChangeText={(val) => handleUpdateField(index, 'jobTitle', val)}
                        placeholder="Job Title"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>

                    {/* Company Name */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={job.company !== undefined && job.company !== null ? String(job.company) : ''}
                        onChangeText={(val) => handleUpdateField(index, 'company', val)}
                        placeholder="Company Name"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>

                    {/* Start Date with Interactive Calendar Picker */}
                    <Pressable
                      style={styles.dateInputContainer}
                      onPress={() => handleOpenDatePicker(index, 'startDate', 'Select Start Date')}
                    >
                      <Text
                        style={[
                          styles.dateInputText,
                          !job.startDate && styles.placeholderText,
                        ]}
                      >
                        {job.startDate || 'Start Date'}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                    </Pressable>

                    {/* End Date with Interactive Calendar Picker */}
                    <Pressable
                      style={[
                        styles.dateInputContainer,
                        job.currentlyWorking && styles.dateInputDisabled,
                      ]}
                      onPress={() => {
                        if (!job.currentlyWorking) {
                          handleOpenDatePicker(index, 'endDate', 'Select End Date');
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.dateInputText,
                          !job.endDate && styles.placeholderText,
                          job.currentlyWorking && styles.dateDisabledText,
                        ]}
                      >
                        {job.currentlyWorking
                          ? 'Present (Currently Working)'
                          : job.endDate || 'End Date'}
                      </Text>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={job.currentlyWorking ? '#94A3B8' : COLORS.primary}
                      />
                    </Pressable>

                    {/* Currently Working Here (Left) & Skip (Right) */}
                    <View style={styles.workingSkipRow}>
                      <Pressable
                        style={styles.workingLeft}
                        onPress={() =>
                          handleUpdateField(index, 'currentlyWorking', !job.currentlyWorking)
                        }
                      >
                        <View
                          style={[
                            styles.plusBox,
                            job.currentlyWorking && styles.plusBoxActive,
                          ]}
                        >
                          <Feather
                            name={job.currentlyWorking ? 'check' : 'plus'}
                            size={14}
                            color={job.currentlyWorking ? '#FFFFFF' : COLORS.primary}
                          />
                        </View>
                        <Text style={styles.workingText}>Currently Working Here</Text>
                      </Pressable>

                      <Pressable onPress={handleSkip} hitSlop={10}>
                        <Text style={styles.skipText}>Skip</Text>
                      </Pressable>
                    </View>

                    {/* Responsibilities */}
                    <View style={styles.textAreaContainer}>
                      <TextInput
                        style={styles.textArea}
                        value={job.responsibilities !== undefined && job.responsibilities !== null ? String(job.responsibilities) : ''}
                        onChangeText={(val) => handleUpdateField(index, 'responsibilities', val)}
                        placeholder="Responsibilities"
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                );
              })
            )}

            {!isFresher && (
              /* [+] Add Another Job */
              <Pressable
                style={styles.addJobRow}
                onPress={handleAddJob}
                hitSlop={6}
              >
                <View style={styles.plusBox}>
                  <Feather name="plus" size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.addJobText}>Add Another Job</Text>
              </Pressable>
            )}

            <PrimaryButton
              title="Save and Continue"
              onPress={handleNext}
              loading={saving}
              style={styles.btn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Interactive Calendar Modal */}
      {activeDatePicker && (
        <CustomDatePickerModal
          visible={Boolean(activeDatePicker)}
          onClose={() => setActiveDatePicker(null)}
          initialDate={activeDatePicker.initialDate}
          onSelectDate={handleDateSelected}
          title={activeDatePicker.title}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 140, // Generous padding so content can be freely scrolled/moved up even with keyboard open
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
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
    marginBottom: 12,
    fontWeight: '400',
  },
  fresherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  fresherCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  fresherCheckboxActive: {
    backgroundColor: COLORS.primary,
  },
  fresherText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  fresherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  fresherBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#6B21A8',
    fontWeight: '500',
    lineHeight: 18,
  },
  additionalJobBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  jobHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  removeJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  removeJobText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
  },
  input: {
    fontSize: 14,
    color: '#1E293B',
    height: '100%',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  dateInputDisabled: {
    backgroundColor: '#F8FAFC',
  },
  dateInputText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  dateDisabledText: {
    color: '#94A3B8',
  },
  workingSkipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  workingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusBox: {
    width: 20,
    height: 20,
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
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  skipText: {
    fontSize: 13.5,
    color: COLORS.primary,
    fontWeight: '700',
  },
  textAreaContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    minHeight: 74,
    marginBottom: 14,
  },
  textArea: {
    fontSize: 14,
    color: '#1E293B',
    minHeight: 50,
  },
  addJobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
    paddingVertical: 4,
  },
  addJobText: {
    fontSize: 13.5,
    color: '#334155',
    fontWeight: '600',
  },
  btn: {
    marginTop: 6,
  },
});