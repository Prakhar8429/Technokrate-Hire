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

export default function JobTitlesPreferenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [jobTitles, setJobTitles] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const prefs = preferenceService.getPreferences();
      setJobTitles(prefs.jobTitles || []);
    }, [])
  );

  const handleRemoveTitle = (titleToRemove) => {
    setJobTitles((prev) => prev.filter((t) => t !== titleToRemove));
  };

  const handleSave = async () => {
    await preferenceService.updateJobTitles(jobTitles);
    Alert.alert('Saved', 'Job titles updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Preference',
      'Are you sure you want to clear your desired job titles?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await preferenceService.deletePreferenceSection('jobTitles');
            setJobTitles([]);
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
        <Text style={styles.headerTitle}>Desired job titles</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.privacyNote}>
          <Ionicons name="eye-off-outline" size={14} color="#64748B" /> Employers can't see this preference
        </Text>

        <Text style={styles.description}>
          Add up to 10 job titles you'd like to work as. This helps us recommend relevant opportunities.
        </Text>

        {/* Saved Job Titles List */}
        <View style={styles.titlesList}>
          {jobTitles.map((title, idx) => (
            <View key={idx} style={styles.titleCard}>
              <View style={styles.titleLeft}>
                <Ionicons name="reorder-two-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                <Text style={styles.titleText}>{title}</Text>
              </View>
              <Pressable
                onPress={() => handleRemoveTitle(title)}
                hitSlop={10}
                style={styles.deleteIconBtn}
              >
                <Ionicons name="trash-outline" size={19} color="#EF4444" />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Add Another Button */}
        {jobTitles.length < 10 && (
          <Pressable
            style={styles.addAnotherBtn}
            onPress={() => router.push('/profile/preferences/add-job-title')}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} />
            <Text style={styles.addAnotherText}>Add another</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton title="Save" onPress={handleSave} style={styles.saveBtn} />
        {jobTitles.length > 0 && (
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
    marginBottom: 8,
  },
  description: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  titlesList: {
    marginBottom: 16,
  },
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  deleteIconBtn: {
    padding: 4,
  },
  addAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: '#FBF8FF',
    marginTop: 6,
  },
  addAnotherText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 6,
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
