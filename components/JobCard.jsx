import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { formatJobLocation } from '../utils/jobFormatters';

export default function JobCard({ job, onToggleSave, onApply }) {
  const router = useRouter();

  const handlePressCard = () => {
    router.push(`/jobs/${job._id}`);
  };

  const handleApplyPress = (e) => {
    e?.stopPropagation?.();
    router.push(`/jobs/${job._id}`);
  };

  const handleSavePress = (e) => {
    e?.stopPropagation?.();
    if (onToggleSave) {
      onToggleSave(job._id);
    }
  };

  // Company avatar initials
  const initials = (job.companyName || 'TH')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePressCard}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.companyRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {job.jobTitle}
            </Text>
            <Text style={styles.companyLocation} numberOfLines={1}>
              {job.companyName || 'Technokrate Partner'} • {formatJobLocation(job.locationCity || job.jobLocation)}
            </Text>
          </View>
        </View>

        {/* Bookmark Icon */}
        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSavePress}
          hitSlop={10}
        >
          <Ionicons
            name={job.isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={job.isSaved ? COLORS.primary : COLORS.mutedText}
          />
        </Pressable>
      </View>

      {/* Pills & Tags Row */}
      <View style={styles.tagsRow}>
        <View style={styles.salaryTag}>
          <Text style={styles.salaryText}>
            {job.salaryFormatted ||
              (job.salaryRange
                ? `₹${job.salaryRange.minSalary?.toLocaleString()} - ₹${job.salaryRange.maxSalary?.toLocaleString()}`
                : 'Competitive')}
          </Text>
        </View>

        <View style={styles.metaTag}>
          <Text style={styles.metaTagText}>{job.jobType || 'Full-Time'}</Text>
        </View>

        {Boolean(job.category) && (
          <View style={styles.metaTag}>
            <Text style={styles.metaTagText}>{job.category}</Text>
          </View>
        )}
      </View>

      {/* Footer Row: Posted Time & Apply CTA */}
      <View style={styles.footerRow}>
        <View style={styles.timeWrapper}>
          <Ionicons name="time-outline" size={14} color={COLORS.mutedText} />
          <Text style={styles.timeText}>{job.postedTime || job.expireDate || 'Recent'}</Text>
        </View>

        {job.isApplied ? (
          <Pressable style={styles.appliedBtn} onPress={handleApplyPress}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.teal} />
            <Text style={styles.appliedBtnText}>Applied</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.applyBtn} onPress={handleApplyPress}>
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: '#FAF5FC',
    transform: [{ scale: 0.995 }],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.lavenderBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  titleCol: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  companyLocation: {
    fontSize: 12.5,
    color: COLORS.mutedText,
    marginTop: 2,
  },
  saveBtn: {
    padding: 4,
  },
  saveBtnPressed: {
    transform: [{ scale: 0.9 }],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 14,
  },
  salaryTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  salaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  metaTag: {
    backgroundColor: '#F8F9FE',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaTagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3E8FF',
    paddingTop: 10,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.mutedText,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  appliedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  appliedBtnText: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '700',
  },
});
