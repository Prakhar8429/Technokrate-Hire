import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import preferenceService from '../../../services/preferenceService';
import PrimaryButton from '../../../components/PrimaryButton';

const SUGGESTED_JOB_TITLES = [
  'Node.js Developer',
  'Node.js Backend Developer',
  'Node.js Developer Intern',
  'Node.js Intern',
  'Senior Node.js Developer',
  'Backend Developer (Node.js)',
  'Sr. Node.js Developer',
  'React.JS Developer',
  'Frontend Developer',
  'Full-Stack Developer',
  'Java Programmer',
  'Python Developer',
  'UI/UX Designer',
  'Software Engineer',
  'DevOps Engineer',
  'Data Analyst',
];

export default function AddJobTitleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState('');

  const filteredTitles = useMemo(() => {
    if (!query.trim()) return SUGGESTED_JOB_TITLES;
    const lower = query.toLowerCase();
    return SUGGESTED_JOB_TITLES.filter((item) =>
      item.toLowerCase().includes(lower)
    );
  }, [query]);

  const handleSelect = (title) => {
    setSelectedTitle(title);
    setQuery(title);
  };

  const handleDone = async () => {
    const titleToAdd = selectedTitle || query.trim();
    if (titleToAdd) {
      await preferenceService.addJobTitle(titleToAdd);
    }
    Keyboard.dismiss();
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Navigation Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Add desired job titles</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Start typing for suggested job titles"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setSelectedTitle('');
            }}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setSelectedTitle(''); }} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          )}
        </View>

        {/* Suggestion Results */}
        <ScrollView
          style={styles.resultsList}
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {filteredTitles.map((title, idx) => {
            const isChosen = (selectedTitle === title) || (query.toLowerCase() === title.toLowerCase());
            return (
              <Pressable
                key={idx}
                style={[styles.resultItem, isChosen && styles.resultItemActive]}
                onPress={() => handleSelect(title)}
              >
                <Text style={[styles.resultText, isChosen && styles.resultTextActive]}>
                  {title}
                </Text>
                {isChosen && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Done Button Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton
          title="Done"
          onPress={handleDone}
          disabled={!query.trim() && !selectedTitle}
        />
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    borderRadius: 10,
  },
  resultItemActive: {
    backgroundColor: '#FBF8FF',
  },
  resultText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  resultTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
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
});
