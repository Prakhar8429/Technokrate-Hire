import React, { useRef } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  onSubmit,
  onOpenFilters,
  activeFilterCount = 0,
  activePills = {},
  onTogglePill,
}) {
  const inputRef = useRef(null);

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      {/* Primary Search Controls Row: Independent Search Box + Independent Filter Button */}
      <View style={styles.searchRow}>
        <Pressable style={styles.inputWrapper} onPress={handleContainerPress}>
          <Pressable onPress={handleContainerPress} style={styles.searchIconBtn} hitSlop={10}>
            <Ionicons name="search" size={20} color={COLORS.primary} />
          </Pressable>

          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search for jobs, skills, or companies"
            placeholderTextColor="#94A3B8"
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            blurOnSubmit={false}
            editable={true}
            multiline={false}
            numberOfLines={1}
          />

          {Boolean(value) && (
            <Pressable onPress={onClear} hitSlop={12} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={19} color="#94A3B8" />
            </Pressable>
          )}
        </Pressable>

        {/* Independent Filter Button Control */}
        <Pressable
          onPress={onOpenFilters}
          style={({ pressed }) => [
            styles.filterSquareBtn,
            pressed && styles.filterSquareBtnPressed,
            activeFilterCount > 0 && styles.filterSquareBtnActive,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={activeFilterCount > 0 ? '#FFFFFF' : COLORS.primary}
          />
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Quick Filter Pills Row (Screen 12) */}
      <View style={styles.pillsRow}>
        <Pressable
          style={[styles.pill, activePills.remote && styles.pillActive]}
          onPress={() => onTogglePill?.('remote')}
        >
          <Ionicons
            name="globe-outline"
            size={13}
            color={activePills.remote ? '#FFFFFF' : COLORS.text}
          />
          <Text style={[styles.pillText, activePills.remote && styles.pillTextActive]}>
            Remote
          </Text>
        </Pressable>

        <Pressable
          style={[styles.pill, activePills.fullTime && styles.pillActive]}
          onPress={() => onTogglePill?.('fullTime')}
        >
          <Ionicons
            name="briefcase-outline"
            size={13}
            color={activePills.fullTime ? '#FFFFFF' : COLORS.text}
          />
          <Text style={[styles.pillText, activePills.fullTime && styles.pillTextActive]}>
            Full-Time
          </Text>
        </Pressable>

        <Pressable
          style={[styles.pill, activePills.highSalary && styles.pillActive]}
          onPress={() => onTogglePill?.('highSalary')}
        >
          <Ionicons
            name="cash-outline"
            size={13}
            color={activePills.highSalary ? '#FFFFFF' : COLORS.text}
          />
          <Text style={[styles.pillText, activePills.highSalary && styles.pillTextActive]}>
            $100k - $150k
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    height: 52,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIconBtn: {
    padding: 2,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    height: '100%',
    paddingVertical: 0,
    paddingHorizontal: 2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clearBtn: {
    padding: 6,
    marginRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSquareBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  filterSquareBtnPressed: {
    opacity: 0.8,
  },
  filterSquareBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    width: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8D4F2',
  },
  pillFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});