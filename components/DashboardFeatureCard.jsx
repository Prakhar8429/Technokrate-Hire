import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardFeatureCard({
  title,
  iconName,
  iconColor = '#6C47FF',
  iconBg = '#F0EAFF',
  onPress,
  style,
  accessibilityLabel,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.cleanCard,
        pressed && styles.cardPressed,
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      <View style={[styles.cleanIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.cardBottomRow}>
        <Text style={styles.cleanCardTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={18} color="#6C47FF" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cleanCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 124,
    justifyContent: 'space-between',
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  cleanIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  cleanCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
});
