import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import preferenceService from '../../../services/preferenceService';
import PrimaryButton from '../../../components/PrimaryButton';

const DAYS_OPTIONS = [
  'Weekend only',
  'Weekend availability',
  'Monday to Friday',
];

const SHIFTS_OPTIONS = [
  'Overnight shift',
  'Morning shift',
  'Night shift',
  'Rotational shift',
  'Evening shift',
  'US shift',
  'Day shift',
  'UK shift',
  'Fixed shift',
  'Shift system',
];

export default function WorkSchedulePreferenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedShifts, setSelectedShifts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const prefs = preferenceService.getPreferences();
      setSelectedDays(prefs.workSchedule?.days || []);
      setSelectedShifts(prefs.workSchedule?.shifts || []);
    }, [])
  );

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleShift = (shift) => {
    setSelectedShifts((prev) =>
      prev.includes(shift) ? prev.filter((s) => s !== shift) : [...prev, shift]
    );
  };

  const handleSave = async () => {
    await preferenceService.updateWorkSchedule({
      days: selectedDays,
      shifts: selectedShifts,
    });
    Alert.alert('Saved', 'Work schedule preferences updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Preference',
      'Are you sure you want to clear your work schedule preferences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await preferenceService.deletePreferenceSection('workSchedule');
            setSelectedDays([]);
            setSelectedShifts([]);
            router.back();
          },
        },
      ]
    );
  };

  const hasAnySelection = selectedDays.length > 0 || selectedShifts.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navigation Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit work schedule</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.privacyNote}>
          <Ionicons name="eye-off-outline" size={14} color="#64748B" /> Employers can't see this preference
        </Text>

        {/* Days Group */}
        <Text style={styles.sectionHeading}>Days</Text>
        <View style={styles.chipsContainer}>
          {DAYS_OPTIONS.map((day, idx) => {
            const isSelected = selectedDays.includes(day);
            return (
              <Pressable
                key={idx}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleDay(day)}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                )}
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Shifts Group */}
        <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Shifts</Text>
        <View style={styles.chipsContainer}>
          {SHIFTS_OPTIONS.map((shift, idx) => {
            const isSelected = selectedShifts.includes(shift);
            return (
              <Pressable
                key={idx}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleShift(shift)}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                )}
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {shift}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton title="Save" onPress={handleSave} style={styles.saveBtn} />
        {hasAnySelection && (
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  privacyNote: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FBF8FF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextSelected: {
    color: COLORS.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveBtn: {
    marginBottom: 10,
  },
  deleteBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
