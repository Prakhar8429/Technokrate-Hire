import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import preferenceService from '../../../services/preferenceService';
import PrimaryButton from '../../../components/PrimaryButton';

export default function RelocationPreferenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [locations, setLocations] = useState([]);
  const [openToAnywhere, setOpenToAnywhere] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const prefs = preferenceService.getPreferences();
      if (prefs.relocation) {
        setLocations(prefs.relocation.locations || []);
        setOpenToAnywhere(!!prefs.relocation.openToAnywhere);
      }
    }, [])
  );

  const handleRemoveLocation = async (locToRemove) => {
    const updated = locations.filter((l) => l !== locToRemove);
    setLocations(updated);
    await preferenceService.removeRelocationLocation(locToRemove);
  };

  const handleSave = async () => {
    await preferenceService.updateRelocation({
      locations,
      openToAnywhere,
    });
    Alert.alert('Saved', 'Relocation preferences updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Preference',
      'Are you sure you want to clear your relocation preferences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await preferenceService.deletePreferenceSection('relocation');
            setLocations([]);
            setOpenToAnywhere(false);
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
        <Text style={styles.headerTitle}>Edit relocation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 130 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.visibilityNote}>
          <Ionicons name="eye-outline" size={14} color="#0D9488" /> Employers can see this preference
        </Text>

        <Text style={styles.description}>
          Where are you willing to relocate? You can add up to 3 locations or indicate if you're open to relocating anywhere.
        </Text>

        {/* Selected Locations List */}
        <View style={styles.locationsList}>
          {locations.map((loc, idx) => (
            <View key={idx} style={styles.locationCard}>
              <View style={styles.locationLeft}>
                <Ionicons name="location" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
                <Text style={styles.locationName}>{loc}</Text>
              </View>
              <Pressable
                onPress={() => handleRemoveLocation(loc)}
                hitSlop={10}
                style={styles.removeBtn}
              >
                <Ionicons name="close" size={20} color="#94A3B8" />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Add Location Button */}
        {locations.length < 3 && (
          <Pressable
            style={styles.addBtn}
            onPress={() => router.push('/profile/preferences/location-search')}
          >
            <Ionicons name="add" size={20} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>
              {locations.length === 0 ? 'Add a location' : 'Add another location'}
            </Text>
          </Pressable>
        )}

        {/* Open to Anywhere Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleTitle}>Open to anywhere</Text>
            <Text style={styles.toggleSubtitle}>
              I'm open to relocating anywhere in India or abroad
            </Text>
          </View>
          <Switch
            value={openToAnywhere}
            onValueChange={setOpenToAnywhere}
            trackColor={{ false: '#CBD5E1', true: COLORS.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton title="Save" onPress={handleSave} style={styles.saveBtn} />
        {(locations.length > 0 || openToAnywhere) && (
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
  visibilityNote: {
    fontSize: 12.5,
    color: '#0D9488',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  locationsList: {
    gap: 10,
    marginBottom: 14,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  removeBtn: {
    padding: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: '#FBF8FF',
    marginBottom: 20,
  },
  addBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 12.5,
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
