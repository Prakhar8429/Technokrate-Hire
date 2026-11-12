import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const STATUS_CONFIGS = {
  Applied: {
    color: '#10B981',
    bg: '#E8F8F0',
    icon: 'paper-plane-outline',
  },
  'In Progress': {
    color: '#0284C7',
    bg: '#E0F2FE',
    icon: 'time-outline',
  },
  Viewed: {
    color: '#2563EB',
    bg: '#EFF6FF',
    icon: 'eye-outline',
  },
  Shortlisted: {
    color: '#7E22CE',
    bg: '#FAF5FF',
    icon: 'star',
  },
  Interview: {
    color: '#7E22CE',
    bg: '#F3E8FF',
    icon: 'calendar-outline',
  },
  Selected: {
    color: '#059669',
    bg: '#D1FAE5',
    icon: 'checkmark-circle',
  },
  Rejected: {
    color: '#DC2626',
    bg: '#FEE2E2',
    icon: 'close-circle-outline',
  },
  'Full-Time': {
    color: '#6C47FF',
    bg: '#F0EAFF',
    icon: null,
  },
  'Part-Time': {
    color: '#D97706',
    bg: '#FEF3C7',
    icon: null,
  },
  Remote: {
    color: '#0D9488',
    bg: '#CCFBF1',
    icon: null,
  },
  Hybrid: {
    color: '#3B82F6',
    bg: '#DBEAFE',
    icon: null,
  },
  'Expiring Soon': {
    color: '#DC2626',
    bg: '#FEE2E2',
    icon: 'alert-circle-outline',
  },
  Active: {
    color: '#059669',
    bg: '#D1FAE5',
    icon: 'checkmark-outline',
  },
  Expired: {
    color: '#64748B',
    bg: '#F1F5F9',
    icon: 'time-outline',
  },
};

export default function StatusBadge({
  status = 'Applied',
  label,
  color,
  backgroundColor,
  icon,
  size = 'medium', // 'small' | 'medium' | 'large'
  style,
}) {
  const config = STATUS_CONFIGS[status] || {
    color: COLORS.primary,
    bg: COLORS.primaryLight,
    icon: null,
  };

  const badgeColor = color || config.color;
  const badgeBg = backgroundColor || config.bg;
  const iconName = icon !== undefined ? icon : config.icon;
  const displayLabel = label || status;

  return (
    <View
      style={[
        styles.badge,
        size === 'small' && styles.badgeSmall,
        size === 'large' && styles.badgeLarge,
        { backgroundColor: badgeBg },
        style,
      ]}
    >
      {iconName ? (
        <Ionicons
          name={iconName}
          size={size === 'small' ? 10 : size === 'large' ? 14 : 12}
          color={badgeColor}
          style={styles.icon}
        />
      ) : null}
      <Text
        style={[
          styles.badgeText,
          size === 'small' && styles.badgeTextSmall,
          size === 'large' && styles.badgeTextLarge,
          { color: badgeColor },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeLarge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  icon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextLarge: {
    fontSize: 12,
    fontWeight: '700',
  },
});
