import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import PrimaryButton from './PrimaryButton';

export default function FilterSheet({
  visible,
  onClose,
  locations = [],
  initialFilters = {},
  onApplyFilters,
}) {
  const [jobType, setJobType] = useState(initialFilters.jobType || 'All');
  const [location, setLocation] = useState(initialFilters.location || 'All');
  const [salaryRange, setSalaryRange] = useState(initialFilters.salaryRange || 'all');

  const handleReset = () => {
    setJobType('All');
    setLocation('All');
    setSalaryRange('all');
  };

  const handleApply = () => {
    onApplyFilters({
      jobType,
      location,
      salaryRange,
    });
    onClose();
  };

  const jobTypes = ['All', 'Full-Time', 'Part-Time', 'Remote', 'Internship'];
  const salaryOptions = [
    { id: 'all', label: 'Any Salary' },
    { id: '50-80', label: '$50k - $80k', min: 50000, max: 80000 },
    { id: '80-120', label: '$80k - $120k', min: 80000, max: 120000 },
    { id: '120-160', label: '$120k - $160k', min: 120000, max: 160000 },
    { id: '160+', label: '$160k+', min: 160000, max: 999999 },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filter</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Job Type Section */}
            <Text style={styles.sectionTitle}>Job Type</Text>
            <View style={styles.chipsRow}>
              {jobTypes.map((type, idx) => {
                const typeStr = typeof type === 'string' ? type : (type?.name || type?.label || String(type));
                const isSelected = jobType === typeStr;
                return (
                  <Pressable
                    key={`${typeStr}_${idx}`}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setJobType(typeStr)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {typeStr}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Location Section */}
            <Text style={styles.sectionTitle}>Preferred Location</Text>
            <View style={styles.chipsRow}>
              {locations.map((loc, idx) => {
                const locStr = typeof loc === 'string' ? loc : (loc?.name || loc?.city || loc?.state || String(loc));
                const isSelected = location === locStr;
                return (
                  <Pressable
                    key={`${locStr}_${idx}`}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setLocation(locStr)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {locStr}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Desired Salary Range Section */}
            <Text style={styles.sectionTitle}>Desired Salary Range</Text>
            <View style={styles.chipsRow}>
              {salaryOptions.map((sal) => {
                const isSelected = salaryRange === sal.id;
                return (
                  <Pressable
                    key={sal.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSalaryRange(sal.id)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {sal.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <Pressable style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <PrimaryButton
              title="Save and Continue"
              onPress={handleApply}
              style={styles.applyBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 21, 26, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E6F8',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  body: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12.5,
    color: COLORS.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2E6F8',
  },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    color: COLORS.mutedText,
    fontSize: 14,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1,
  },
});
