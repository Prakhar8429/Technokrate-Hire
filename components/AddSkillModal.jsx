import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const SUGGESTED_SKILLS = [
  'React',
  'React Native',
  'Node.js',
  'Python',
  'Java',
  'JavaScript',
  'TypeScript',
  'SQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Figma',
  'UI/UX',
  'Git',
  'PHP',
  'DSA',
  'Express.js',
  'Next.js',
];

export default function AddSkillModal({
  visible,
  onClose,
  initialSkills = [],
  onSaveSkills,
}) {
  const [selectedSkills, setSelectedSkills] = useState(initialSkills);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (visible) {
      setSelectedSkills(initialSkills);
      setInputText('');
    }
  }, [visible, initialSkills]);

  const handleAddCustom = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (selectedSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Notice', `"${trimmed}" is already added.`);
      return;
    }

    setSelectedSkills((prev) => [...prev, trimmed]);
    setInputText('');
  };

  const handleToggleSuggestion = (skill) => {
    setSelectedSkills((prev) => {
      if (prev.includes(skill)) {
        return prev.filter((s) => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleDone = () => {
    if (onSaveSkills) {
      onSaveSkills(selectedSkills);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Skills</Text>
            <Pressable hitSlop={10} onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Custom Skill Input */}
            <Text style={styles.inputLabel}>Enter Custom Skill</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type skill (e.g. Flutter, GraphQL)..."
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleAddCustom}
                returnKeyType="done"
              />
              <Pressable
                style={[
                  styles.addBtn,
                  !inputText.trim() && styles.addBtnDisabled,
                ]}
                onPress={handleAddCustom}
                disabled={!inputText.trim()}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>

            {/* Selected Skills Chips */}
            <Text style={styles.sectionLabel}>
              Selected Skills ({selectedSkills.length})
            </Text>
            <View style={styles.selectedContainer}>
              {selectedSkills.length === 0 ? (
                <Text style={styles.emptyText}>No skills selected yet.</Text>
              ) : (
                selectedSkills.map((skill) => (
                  <View key={skill} style={styles.selectedPill}>
                    <Text style={styles.selectedPillText}>{skill}</Text>
                    <Pressable
                      hitSlop={6}
                      onPress={() => handleRemoveSkill(skill)}
                      style={styles.pillClose}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))
              )}
            </View>

            {/* Popular Suggestions */}
            <Text style={styles.sectionLabel}>Popular Suggestions</Text>
            <View style={styles.suggestionsGrid}>
              {SUGGESTED_SKILLS.map((item) => {
                const isSelected = selectedSkills.includes(item);
                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.suggestionChip,
                      isSelected && styles.suggestionChipActive,
                    ]}
                    onPress={() => handleToggleSuggestion(item)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark' : 'add'}
                      size={14}
                      color={isSelected ? '#FFFFFF' : COLORS.primary}
                    />
                    <Text
                      style={[
                        styles.suggestionChipText,
                        isSelected && styles.suggestionChipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Done Button */}
          <View style={styles.footer}>
            <Pressable style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>
                Done ({selectedSkills.length} Selected)
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingVertical: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 18,
  },
  textInput: {
    flex: 1,
    height: 46,
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  addBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 6,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 40,
    backgroundColor: '#FAF5FC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 18,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    padding: 4,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4A5568',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectedPillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  pillClose: {
    padding: 2,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  suggestionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  suggestionChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  suggestionChipTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  doneBtn: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
