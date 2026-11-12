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

const PAY_PERIODS = [
  { label: 'Per year', value: 'year' },
  { label: 'Per month', value: 'month' },
  { label: 'Per week', value: 'week' },
  { label: 'Per day', value: 'day' },
  { label: 'Per hour', value: 'hour' },
];

export default function PayPreferenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('80000');
  const [period, setPeriod] = useState('year');
  const [periodModalVisible, setPeriodModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const prefs = preferenceService.getPreferences();
      if (prefs.minimumPay) {
        setAmount(prefs.minimumPay.amount ? String(prefs.minimumPay.amount) : '');
        setPeriod(prefs.minimumPay.period || 'year');
      }
    }, [])
  );

  const selectedPeriodLabel =
    PAY_PERIODS.find((p) => p.value === period)?.label || 'Per year';

  const handleSave = async () => {
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
    await preferenceService.updateMinimumPay({
      amount: numAmount,
      period,
    });
    Alert.alert('Saved', 'Pay preference updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Preference',
      'Are you sure you want to clear your pay preference?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await preferenceService.deletePreferenceSection('minimumPay');
            setAmount('');
            setPeriod('year');
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
        <Text style={styles.headerTitle}>Edit pay</Text>
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
          What is the minimum pay you expect? We'll use this to match you with relevant opportunities.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Minimum base pay</Text>
          <View style={styles.amountInputRow}>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencySymbol}>₹</Text>
            </View>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              placeholder="e.g. 80,000"
              placeholderTextColor="#94A3B8"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Pay period</Text>
          <Pressable
            style={styles.dropdownSelector}
            onPress={() => setPeriodModalVisible(true)}
          >
            <Text style={styles.dropdownText}>{selectedPeriodLabel}</Text>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Pay Period Bottom Sheet Modal */}
      <Modal
        visible={periodModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPeriodModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPeriodModalVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => { e?.stopPropagation?.(); }}>
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>Select pay period</Text>

            {PAY_PERIODS.map((p) => {
              const isSelected = p.value === period;
              return (
                <Pressable
                  key={p.value}
                  style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                  onPress={() => {
                    setPeriod(p.value);
                    setPeriodModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected,
                    ]}
                  >
                    {p.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton title="Save" onPress={handleSave} style={styles.saveBtn} />
        {!!amount && (
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
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  currencyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#EEF2F6',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  amountInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionSelected: {
    backgroundColor: '#FBF8FF',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  modalOptionTextSelected: {
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
});
