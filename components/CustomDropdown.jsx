import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function CustomDropdown({
  label,
  placeholder = 'Select an option',
  selectedValue,
  value,
  onSelect,
  options = [],
  data = [],
  items = [],
  loading = false,
  disabled = false,
  disabledReason,
  error = null,
  onRetry = null,
  style,
  renderItemLabel,
  searchable,
  searchPlaceholder = 'Search...',
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Support options, data, or items prop seamlessly
  const rawList =
    Array.isArray(options) && options.length > 0
      ? options
      : Array.isArray(data) && data.length > 0
      ? data
      : Array.isArray(items) && items.length > 0
      ? items
      : [];

  // Current selected value (support both selectedValue and value props)
  const currentVal = selectedValue !== undefined ? selectedValue : value;

  // Normalize items to ensure each item has an id and name for display
  const normalizedOptions = rawList.map((item, idx) => {
    if (typeof item === 'string' || typeof item === 'number') {
      const s = String(item);
      return { id: s, name: s, value: s };
    }
    if (!item || typeof item !== 'object') {
      const s = String(item ?? idx);
      return { id: s, name: s, value: s };
    }
    const computedName = renderItemLabel
      ? renderItemLabel(item)
      : (item.name ?? item.label ?? item.title ?? item.value ?? item.id ?? `Option ${idx + 1}`);
    const name = computedName !== undefined && computedName !== null ? String(computedName) : `Option ${idx + 1}`;
    const id = item.id !== undefined && item.id !== null
      ? String(item.id)
      : (item.value !== undefined && item.value !== null ? String(item.value) : name);
    return { ...item, id, name };
  });

  // Find the display name for the currently selected ID/value
  const selectedItem = normalizedOptions.find(
    (opt) =>
      String(opt.id) === String(currentVal) ||
      String(opt.name) === String(currentVal) ||
      (opt.value !== undefined && String(opt.value) === String(currentVal))
  );
  const displayText = selectedItem ? selectedItem.name : '';

  const filteredOptions = searchQuery.trim()
    ? normalizedOptions.filter((opt) => {
        const text = String(opt?.name || opt?.label || opt?.title || opt?.id || '');
        return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
      })
    : normalizedOptions;

  const handleOpen = () => {
    if (disabled || loading) return;
    setSearchQuery('');
    setModalVisible(true);
  };

  const handleSelectItem = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    setModalVisible(false);
  };

  const shouldShowSearch =
    searchable !== false && (searchable === true || normalizedOptions.length > 5);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        style={[
          styles.dropdownBox,
          disabled && styles.disabledBox,
          error && styles.errorBox,
        ]}
        onPress={handleOpen}
      >
        <Text
          style={[
            styles.valueText,
            !displayText && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {loading
            ? 'Loading options...'
            : displayText || disabledReason || placeholder}
        </Text>

        <View style={styles.rightIconWrapper}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons
              name="chevron-down"
              size={20}
              color={disabled ? '#94A3B8' : '#64748B'}
            />
          )}
        </View>
      </Pressable>

      {error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry && (
            <Pressable onPress={onRetry} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {/* Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => { e?.stopPropagation?.(); }}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || placeholder || 'Select Option'}</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={12}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            {/* Search filter */}
            {shouldShowSearch && (
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={18} color="#94A3B8" />
                <TextInput
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </Pressable>
                )}
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item, index) => String(item.id || item.name || index)}
              renderItem={({ item }) => {
                const isSelected =
                  String(currentVal) === String(item.id) ||
                  String(currentVal) === String(item.name) ||
                  (item.value !== undefined && String(currentVal) === String(item.value));
                return (
                  <Pressable
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                    ]}
                    onPress={() => handleSelectItem(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={COLORS.primary}
                      />
                    )}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No options found</Text>
                </View>
              }
              style={{ maxHeight: 360 }}
              keyboardShouldPersistTaps="handled"
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  disabledBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  errorBox: {
    borderColor: '#EF4444',
  },
  valueText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  disabledText: {
    color: '#94A3B8',
  },
  rightIconWrapper: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  retryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FEE2E2',
  },
  retryText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 10,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    height: '100%',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionRowSelected: {
    backgroundColor: '#F5EAFA',
  },
  optionText: {
    fontSize: 14,
    color: '#334155',
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#F8FAFC',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13.5,
  },
});
