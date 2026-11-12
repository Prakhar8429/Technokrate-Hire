import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import preferenceService from '../../../services/preferenceService';

const SUGGESTED_LOCATIONS = [
  'Noida, Uttar Pradesh',
  'Delhi, Delhi',
  'Bengaluru, Karnataka',
  'Gurugram, Haryana',
  'Hyderabad, Telangana',
  'Mumbai, Maharashtra',
  'Pune, Maharashtra',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan',
  'Chandigarh, Punjab',
  'Indore, Madhya Pradesh',
  'Kochi, Kerala',
  'Lucknow, Uttar Pradesh',
];

export default function LocationSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredLocations = SUGGESTED_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectLocation = async (location) => {
    await preferenceService.addRelocationLocation(location);
    router.back();
  };

  const handleCustomAdd = async () => {
    if (query.trim()) {
      await preferenceService.addRelocationLocation(query.trim());
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Search Input */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, state..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCustomAdd}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          query.trim() && !filteredLocations.includes(query.trim()) ? (
            <Pressable style={styles.customAddRow} onPress={handleCustomAdd}>
              <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
              <Text style={styles.customAddText}>Add "{query.trim()}"</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.locationItem}
            onPress={() => handleSelectLocation(item)}
          >
            <Ionicons name="location-outline" size={20} color="#64748B" style={{ marginRight: 12 }} />
            <Text style={styles.locationText}>{item}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={44} color="#CBD5E1" />
            <Text style={styles.emptyText}>No matching locations found</Text>
            {query.trim().length > 0 && (
              <Pressable style={styles.emptyAddBtn} onPress={handleCustomAdd}>
                <Text style={styles.emptyAddBtnText}>Use "{query.trim()}"</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 0,
  },
  listContent: {
    paddingVertical: 8,
  },
  customAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FBF8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  customAddText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  locationText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 12,
  },
  emptyAddBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
