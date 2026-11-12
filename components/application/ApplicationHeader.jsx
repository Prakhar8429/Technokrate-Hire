import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import applicationService from '../../services/applicationService';
import { formatJobLocation } from '../../utils/jobFormatters';

export default function ApplicationHeader({
  progress = 25,
  onBack,
  showCancel = true,
  onCancel,
}) {
  const router = useRouter();
  const data = applicationService.getApplicationData();
  const [showDetails, setShowDetails] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    Alert.alert(
      'Exit Application',
      'Are you sure you want to exit? Your entered details will be preserved.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.replace(`/jobs/${data.jobId || '69b7e164cad08489669d835e'}`),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Nav Action Row */}
      <View style={styles.topRow}>
        <Pressable onPress={handleBack} hitSlop={12} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </Pressable>

        {showCancel && (
          <Pressable onPress={handleCancel} hitSlop={12}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        )}
      </View>

      {/* Job Info Section */}
      <View style={styles.jobInfoSection}>
        <Text style={styles.jobTitle} numberOfLines={1}>
          {data.jobTitle || 'Senior Product Designer'}
        </Text>
        <Text style={styles.jobMeta} numberOfLines={1}>
          {data.companyName || 'Technokrate Hire'} • {formatJobLocation(data.jobLocation || 'Remote')}
        </Text>
        <Pressable onPress={() => setShowDetails(!showDetails)} hitSlop={6}>
          <Text style={styles.detailsLink}>
            {showDetails ? 'Hide details' : 'See more details'}
          </Text>
        </Pressable>

        {showDetails && (
          <View style={styles.detailsDropdown}>
            <Text style={styles.dropdownText}>
              Salary: {data.salaryFormatted || '$140k - $170k'} • Full-Time
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar Row */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBtn: {
    padding: 4,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  jobInfoSection: {
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  jobMeta: {
    fontSize: 13,
    color: COLORS.textSecondaryColor,
    marginTop: 2,
    fontWeight: '500',
  },
  detailsLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },
  detailsDropdown: {
    marginTop: 6,
    padding: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#EAE6EE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    minWidth: 32,
    textAlign: 'right',
  },
});
