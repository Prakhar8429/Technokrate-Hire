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

const REMOTE_OPTIONS = [
  {
    id: 'all',
    title: 'Open to all jobs',
    subtitle: 'In-person, hybrid, and remote work opportunities',
  },
  {
    id: 'onsite_hybrid',
    title: 'Only on-site or hybrid',
    subtitle: 'Prefer working at least partially from the company office',
  },
  {
    id: 'remote',
    title: 'Only remote',
    subtitle: 'Looking strictly for 100% work from home / remote roles',
  },
];

export default function RemotePreferenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = useState('all');

  useFocusEffect(
    useCallback(() => {
      const prefs = preferenceService.getPreferences();
      setSelectedOption(prefs.remotePreference || 'all');
    }, [])
  );

  const handleSave = async () => {
    await preferenceService.updateRemotePreference(selectedOption);
    Alert.alert('Saved', 'Remote work preference updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Preference',
      'Are you sure you want to reset your remote preference?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await preferenceService.deletePreferenceSection('remotePreference');
            setSelectedOption('all');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navigation Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit remote work</Text>
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

        <Text style={styles.description}>
          Choose your remote work preferences. You can update this at any time.
        </Text>

        <View style={styles.optionsList}>
          {REMOTE_OPTIONS.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedOption(opt.id)}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.textCol}>
                  <Text
                    style={[
                      styles.optionTitle,
                      isSelected && styles.optionTitleSelected,
                    ]}
                  >
                    {opt.title}
                  </Text>
                  <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton title="Save" onPress={handleSave} style={styles.saveBtn} />
        {selectedOption !== 'all' && (
          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Reset to default</Text>
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
    marginBottom: 8,
  },
  description: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FBF8FF',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  textCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
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
