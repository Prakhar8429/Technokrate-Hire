import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import candidateService, { getInitials } from '../services/candidateService';

export default function ProfileHeader({
  userProfile,
  onEditPress,
  onStatusPress,
}) {
  const profile = userProfile || candidateService.getUserProfile();
  const displayName = profile?.fullName || candidateService.getUserProfile()?.fullName || 'Candidate';
  const displayLocation = profile?.location || candidateService.getUserProfile()?.location || 'Noida, Uttar Pradesh';

  return (
    <View style={styles.userCard}>
      {/* Avatar circle with profile photo or initials */}
      <View style={styles.avatarCircle}>
        {profile?.profileImage ? (
          <Image
            source={{ uri: profile.profileImage }}
            style={styles.avatarCircleImage}
          />
        ) : (
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        )}
      </View>

      {/* Full Name with Edit Pencil Icon */}
      <View style={styles.nameRow}>
        <Text style={styles.userName}>{displayName}</Text>
        {onEditPress && (
          <Pressable
            onPress={onEditPress}
            hitSlop={10}
            style={styles.pencilBtn}
            accessibilityRole="button"
            accessibilityLabel="Edit Profile"
          >
            <Ionicons name="pencil" size={17} color="#475569" />
          </Pressable>
        )}
      </View>

      {/* Location */}
      {displayLocation ? (
        <Text style={styles.locationText}>{displayLocation}</Text>
      ) : null}

      {/* Green Pill: Employers can find you */}
      {onStatusPress ? (
        <Pressable
          style={styles.employersPill}
          onPress={onStatusPress}
          accessibilityRole="button"
          accessibilityLabel="Employer visibility status"
        >
          <Ionicons name="eye" size={15} color="#059669" />
          <Text style={styles.employersPillText}>Employers can find you</Text>
          <Ionicons name="chevron-down" size={15} color="#059669" />
        </Pressable>
      ) : (
        <View style={styles.employersPill}>
          <Ionicons name="eye" size={15} color="#059669" />
          <Text style={styles.employersPillText}>Employers can find you</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarCircleImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#6C47FF',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pencilBtn: {
    padding: 3,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  employersPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  employersPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
});
