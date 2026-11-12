import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../../constants/colors';
import CustomInput from '../../components/CustomInput';
import PrimaryButton from '../../components/PrimaryButton';
import candidateService, { getInitials } from '../../services/candidateService';
import authStorage from '../../src/storage/authStorage';

export default function EditProfileScreen() {
  const router = useRouter();

  const initialProfile = candidateService.getUserProfile();
  const [name, setName] = useState(initialProfile.fullName || 'Candidate');
  const [role, setRole] = useState(initialProfile.role || 'Senior UX Designer');
  const [location, setLocation] = useState(initialProfile.location || 'Noida, Uttar Pradesh');
  const [about, setAbout] = useState(
    initialProfile.about ||
    'Strategic UX Designer with 8+ years of experience building scalable design systems and high-converting user journeys for FinTech and SaaS industry leaders.'
  );
  const [visibility, setVisibility] = useState(initialProfile.visibility || 'public'); // 'public' | 'recruiter'
  const [profileImage, setProfileImage] = useState(initialProfile.profileImage || null);
  const [saving, setSaving] = useState(false);

  const handlePickImage = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const imageUri = res.assets[0].uri;
        setProfileImage(imageUri);
        candidateService.updateUserProfile({ profileImage: imageUri });
        Alert.alert('Profile Photo Updated', 'Your profile picture has been updated successfully.');
      }
    } catch (err) {
      console.log('Image picker error:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    candidateService.updateUserProfile({
      fullName: name.trim(),
      role: role.trim(),
      location: location.trim(),
      about: about.trim(),
      visibility,
      profileImage,
    });

    try {
      const token = await authStorage.getToken();
      if (token) {
        await candidateService.updateProfileApi({
          fullName: name.trim(),
          about: about.trim(),
          basicDetails: {
            location: location.trim(),
            specialization: role.trim(),
          },
        }, token);
      }
    } catch (e) {
      console.log('Error updating profile on backend:', e.message);
    }

    setSaving(false);
    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          <Text style={styles.navTitle}>Edit Profile</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar with functional camera icon (Screen 09) */}
        <View style={styles.avatarSection}>
          <Pressable
            style={styles.avatar}
            onPress={handlePickImage}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Change profile picture"
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{getInitials(name)}</Text>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text style={styles.avatarName}>{name}</Text>
          <Text style={styles.avatarRole}>{role}</Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.card}>
          <CustomInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

          <CustomInput
            label="Professional Title"
            value={role}
            onChangeText={setRole}
            placeholder="e.g. Software Engineer / Designer"
          />

          <CustomInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="Nagpur, MH"
          />

          <CustomInput
            label="About"
            value={about}
            onChangeText={setAbout}
            placeholder="Brief bio about your professional expertise..."
            multiline
            numberOfLines={4}
            style={{ height: 90, textAlignVertical: 'top' }}
          />

          {/* Profile Visibility */}
          <Text style={styles.label}>Profile Visibility</Text>
          <View style={styles.visibilityRow}>
            <Pressable
              style={[
                styles.visibilityOption,
                visibility === 'public' && styles.visibilityActive,
              ]}
              onPress={() => setVisibility('public')}
            >
              <Ionicons
                name={visibility === 'public' ? 'radio-button-on' : 'radio-button-off'}
                size={16}
                color={visibility === 'public' ? COLORS.primary : COLORS.mutedText}
              />
              <Text style={styles.visibilityText}>Public</Text>
            </Pressable>

            <Pressable
              style={[
                styles.visibilityOption,
                visibility === 'recruiter' && styles.visibilityActive,
              ]}
              onPress={() => setVisibility('recruiter')}
            >
              <Ionicons
                name={visibility === 'recruiter' ? 'radio-button-on' : 'radio-button-off'}
                size={16}
                color={visibility === 'recruiter' ? COLORS.primary : COLORS.mutedText}
              />
              <Text style={styles.visibilityText}>Recruiter Only</Text>
            </Pressable>
          </View>

          <PrimaryButton
            title="Save Profile"
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: 24 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBg,
  },
  topNav: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarImg: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.gold,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  avatarRole: {
    fontSize: 13,
    color: COLORS.mutedText,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 8,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: 16,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  visibilityActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F3E8FF',
  },
  visibilityText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
});