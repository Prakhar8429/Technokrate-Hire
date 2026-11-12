import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import employerService from '../../../services/employerService';

export default function EmployerCandidateProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [candidate, setCandidate] = useState(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await employerService.getCandidateProfile(id);
      setCandidate(data);
      setLoading(false);
    })();
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Candidate Profile: ${candidate?.name} (${candidate?.role}) on Technokrate Hire.`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleToggleShortlist = () => {
    setIsShortlisted(!isShortlisted);
    Alert.alert(
      isShortlisted ? 'Removed' : 'Shortlisted! 🌟',
      isShortlisted
        ? `${candidate?.name} has been removed from shortlisted candidates.`
        : `${candidate?.name} is now saved to your shortlisted candidates.`
    );
  };

  const handleScheduleInterview = () => {
    Alert.alert(
      'Schedule Interview',
      `An interview request notification and calendar invite will be dispatched to ${candidate?.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Invite',
          onPress: () =>
            Alert.alert('Invite Sent', 'Candidate has been notified via email and SMS.'),
        },
      ]
    );
  };

  const handleDownloadResume = () => {
    Alert.alert(
      'Download Resume',
      `Downloading ${candidate?.resume?.fileName || 'candidate_resume.pdf'}...`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <Text style={styles.topBarTitle}>Candidate Profile</Text>
        <Pressable onPress={handleShare} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="share-social-outline" size={20} color="#0F172A" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <View style={styles.card}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {candidate?.name ? candidate.name[0] : 'C'}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.candName}>{candidate?.name}</Text>
              <Text style={styles.candRole}>{candidate?.role}</Text>
              <Text style={styles.candCompany}>{candidate?.company}</Text>
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={13} color="#64748B" />
                <Text style={styles.candLocation}>{candidate?.location}</Text>
              </View>
            </View>
          </View>

          {/* Quick CTA Actions */}
          <View style={styles.ctaRow}>
            <Pressable
              style={[
                styles.ctaBtn,
                isShortlisted && styles.ctaBtnActive,
              ]}
              onPress={handleToggleShortlist}
            >
              <Ionicons
                name={isShortlisted ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={isShortlisted ? '#FFFFFF' : COLORS.primary}
              />
              <Text
                style={[
                  styles.ctaBtnText,
                  isShortlisted && styles.ctaBtnTextActive,
                ]}
              >
                {isShortlisted ? 'Shortlisted' : 'Shortlist'}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.ctaBtn, styles.ctaBtnPrimary]}
              onPress={handleScheduleInterview}
            >
              <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
              <Text style={[styles.ctaBtnText, { color: '#FFFFFF' }]}>
                Interview
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Resume Attachment Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resume / CV</Text>
          <View style={styles.resumeBox}>
            <View style={styles.pdfIconBox}>
              <Ionicons name="document-text" size={24} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeFileName}>
                {candidate?.resume?.fileName || 'resume_file.pdf'}
              </Text>
              <Text style={styles.resumeFileSize}>
                PDF • {candidate?.resume?.fileSize || '1.5 MB'}
              </Text>
            </View>
            <Pressable style={styles.downloadResumeBtn} onPress={handleDownloadResume}>
              <Ionicons name="download-outline" size={16} color={COLORS.primary} />
              <Text style={styles.downloadResumeText}>Download</Text>
            </Pressable>
          </View>
        </View>

        {/* About Candidate */}
        {candidate?.about && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About Candidate</Text>
            <Text style={styles.bodyText}>{candidate.about}</Text>
          </View>
        )}

        {/* Skills */}
        {candidate?.topSkills && candidate.topSkills.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Key Skills & Competencies</Text>
            <View style={styles.chipsWrap}>
              {candidate.topSkills.map((s, idx) => (
                <View key={idx} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience Timeline */}
        {candidate?.experience && candidate.experience.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {candidate.experience.map((exp, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineRole}>{exp.role}</Text>
                  <Text style={styles.timelineOrg}>{exp.company}</Text>
                  <Text style={styles.timelineDate}>{exp.duration}</Text>
                  <Text style={styles.timelineLoc}>{exp.location}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education Timeline */}
        {candidate?.education && candidate.education.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Education</Text>
            {candidate.education.map((edu, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineRole}>{edu.degree}</Text>
                  <Text style={styles.timelineOrg}>{edu.institution}</Text>
                  <Text style={styles.timelineDate}>{edu.year}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {candidate?.certifications && candidate.certifications.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Licenses & Certifications</Text>
            {candidate.certifications.map((cert, idx) => (
              <View key={idx} style={styles.certItem}>
                <Ionicons name="ribbon-outline" size={20} color={COLORS.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.certName}>{cert.name}</Text>
                  <Text style={styles.certIssuer}>
                    {cert.issuer} • Issued {cert.issueDate}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Contact / Schedule Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.bottomScheduleBtn}
          onPress={handleScheduleInterview}
        >
          <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
          <Text style={styles.bottomScheduleText}>
            Connect & Schedule Interview
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2E6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  candName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  candRole: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  candCompany: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  candLocation: {
    fontSize: 11.5,
    color: '#64748B',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  ctaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  ctaBtnActive: {
    backgroundColor: COLORS.primary,
  },
  ctaBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  ctaBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ctaBtnTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  resumeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pdfIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeFileName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  resumeFileSize: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  downloadResumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2E6F8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  downloadResumeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#F2E6F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineRole: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  timelineOrg: {
    fontSize: 12,
    color: '#475569',
    marginTop: 1,
  },
  timelineDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  timelineLoc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  certName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  certIssuer: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 14,
  },
  bottomScheduleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});