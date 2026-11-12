import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import preferenceService from '../../../services/preferenceService';
import PrimaryButton from '../../../components/PrimaryButton';

const COMMUTE_OPTIONS = [
  { label: 'Any commute time', value: null },
  { label: 'Up to 15 minutes', value: 15 },
  { label: 'Up to 25 minutes', value: 25 },
  { label: 'Up to 35 minutes', value: 35 },
  { label: 'Up to 45 minutes', value: 45 },
  { label: 'Up to 60 minutes', value: 60 },
  { label: 'Up to 90 minutes', value: 90 },
];

export default function CommutePreferenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState('Noida, Uttar Pradesh');
  const [maxMinutes, setMaxMinutes] = useState(35);
  const [editLocModal, setEditLocModal] = useState(false);
  const [tempLoc, setTempLoc] = useState('');

  useFocusEffect(
    useCallback(() => {
      const prefs = preferenceService.getPreferences();
      if (prefs.commute) {
        setLocation(prefs.commute.location || 'Noida, Uttar Pradesh');
        setMaxMinutes(prefs.commute.maxMinutes);
      }
    }, [])
  );

  const handleSave = async () => {
    await preferenceService.updateCommute({
      location,
      maxMinutes,
    });
    Alert.alert('Saved', 'Commute preference updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Preference',
      'Are you sure you want to clear your commute preferences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await preferenceService.deletePreferenceSection('commute');
            setLocation('');
            setMaxMinutes(null);
            router.back();
          },
        },
      ]
    );
  };

  const openEditLocation = () => {
    setTempLoc(location);
    setEditLocModal(true);
  };

  const confirmEditLocation = () => {
    if (tempLoc.trim()) {
      setLocation(tempLoc.trim());
    }
    setEditLocModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navigation Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit commute</Text>
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
          Choose the maximum time you're willing to spend commuting.
        </Text>

        {/* Location Card */}
        <View style={styles.sectionCard}>
          <View style={styles.locationHeaderRow}>
            <Text style={styles.sectionTitle}>Commute from</Text>
            <Pressable onPress={openEditLocation} hitSlop={8}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.locationText}>{location || 'Not specified'}</Text>
          </View>
        </View>

        {/* Commute Time Options */}
        <Text style={[styles.sectionTitle, { marginTop: 14, marginBottom: 12 }]}>
          Maximum commute time
        </Text>

        <View style={styles.optionsList}>
          {COMMUTE_OPTIONS.map((opt, idx) => {
            const isSelected = maxMinutes === opt.value;
            return (
              <Pressable
                key={idx}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setMaxMinutes(opt.value)}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit Location Modal */}
      <Modal
        visible={editLocModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditLocModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderTitle}>Edit commute location</Text>
            <TextInput
              style={styles.modalInput}
              value={tempLoc}
              onChangeText={setTempLoc}
              placeholder="Enter city or area"
              placeholderTextColor="#94A3B8"
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <Pressable
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setEditLocModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={confirmEditLocation}
              >
                <Text style={styles.modalSaveText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton title="Save" onPress={handleSave} style={styles.saveBtn} />
        {(maxMinutes !== null || location) && (
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
  sectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  editLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FBF8FF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionLabel: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#334155',
  },
  optionLabelSelected: {
    fontWeight: '700',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  modalCancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: COLORS.primary,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
