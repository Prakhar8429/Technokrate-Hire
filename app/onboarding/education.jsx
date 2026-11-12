import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import ProfileStepper from '../../components/ProfileStepper';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import candidateService from '../../services/candidateService';

export default function EducationStep() {
  const router = useRouter();

  const [educations, setEducations] = useState(() => {
    const existing = candidateService.getEducations?.();
    if (Array.isArray(existing) && existing.length > 0) {
      return existing;
    }
    return [
      {
        id: '1',
        degree: 'B.Tech',
        institution: 'ABC Institute',
        year: '2021',
        specialization: 'Computer Science',
      },
    ];
  });

  const [saving, setSaving] = useState(false);

  const handleUpdateField = (index, field, value) => {
    setEducations((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        degree: '',
        institution: '',
        year: '',
        specialization: '',
      },
    ]);
  };

  const handleRemoveEducation = (index) => {
    if (educations.length <= 1) return;
    setEducations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAndContinue = async () => {
    // Validate first/primary entry
    const primary = educations[0] || {};
    if (!primary.degree?.trim()) {
      Alert.alert('Required Field', 'Please enter your Highest Degree.');
      return;
    }
    if (!primary.institution?.trim()) {
      Alert.alert('Required Field', 'Please enter your Institution Name.');
      return;
    }
    if (!primary.year?.trim()) {
      Alert.alert('Required Field', 'Please enter your Year of Graduation.');
      return;
    }

    // Validate any additional entries that have partial data
    for (let i = 1; i < educations.length; i++) {
      const entry = educations[i];
      const hasAny = entry.degree?.trim() || entry.institution?.trim() || entry.year?.trim() || entry.specialization?.trim();
      if (hasAny) {
        if (!entry.degree?.trim() || !entry.institution?.trim()) {
          Alert.alert('Incomplete Entry', `Please complete the Degree and Institution Name for Education #${i + 1}.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      await candidateService.saveEducation(educations);
      router.push('/onboarding/work-experience');
    } catch (e) {
      Alert.alert('Error', 'Unable to save education details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ProfileStepper currentStep={2} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        <View style={styles.card}>
          {/* Centered Title & Subtitle matching Reference 3 */}
          <Text style={styles.title}>Education Details</Text>
          <Text style={styles.subtitle}>Your educational background</Text>

          {educations.map((item, index) => {
            const isSecondary = index > 0;
            return (
              <View key={item.id || index} style={isSecondary ? styles.additionalCardBox : null}>
                {isSecondary && (
                  <View style={styles.entryHeaderRow}>
                    <Text style={styles.entryHeaderTitle}>Education #{index + 1}</Text>
                    <Pressable
                      style={styles.deleteBtn}
                      hitSlop={8}
                      onPress={() => handleRemoveEducation(index)}
                      accessibilityLabel="Remove education entry"
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </Pressable>
                  </View>
                )}

                <CustomInput
                  label="Highest Degree"
                  value={item.degree}
                  onChangeText={(val) => handleUpdateField(index, 'degree', val)}
                  placeholder="Highest Degree"
                />

                <CustomInput
                  label="Institution Name"
                  value={item.institution}
                  onChangeText={(val) => handleUpdateField(index, 'institution', val)}
                  placeholder="Institution Name"
                />

                <CustomInput
                  label="Year of Graduation"
                  value={item.year}
                  onChangeText={(val) => handleUpdateField(index, 'year', val)}
                  placeholder="Year of Graduation"
                  keyboardType="numeric"
                />

                <CustomInput
                  label="Specialization (Optional)"
                  value={item.specialization}
                  onChangeText={(val) => handleUpdateField(index, 'specialization', val)}
                  placeholder="Specialization (Optional)"
                />
              </View>
            );
          })}

          {/* [+] Add Another Education button (Reference 3) */}
          <Pressable
            style={({ pressed }) => [styles.addEducationRow, pressed && styles.rowPressed]}
            onPress={handleAddEducation}
            accessibilityRole="button"
            accessibilityLabel="Add another education"
          >
            <View style={styles.plusBox}>
              <Feather name="plus" size={14} color={COLORS.primary} />
            </View>
            <Text style={styles.addEducationText}>Add Another Education</Text>
          </Pressable>

          {/* Save and Continue Button */}
          <PrimaryButton
            title="Save and Continue"
            onPress={handleSaveAndContinue}
            loading={saving}
            style={styles.btn}
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
  additionalCardBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  entryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  deleteBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#EF4444',
  },
  addEducationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 14,
  },
  rowPressed: {
    opacity: 0.7,
  },
  plusBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addEducationText: {
    fontSize: 13.5,
    color: '#334155',
    fontWeight: '600',
  },
  btn: {
    marginTop: 14,
  },
});
