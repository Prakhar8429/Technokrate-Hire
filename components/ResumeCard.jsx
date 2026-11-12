import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import PrimaryButton from './PrimaryButton';

export default function ResumeCard({
  resume,
  userProfile,
  onOptionsPress,
  onPreviewPress,
  onUploadPress,
  isUploading = false,
}) {
  if (!resume) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="document-text-outline" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>No Resume Uploaded</Text>
        <Text style={styles.emptySubtitle}>
          Upload your resume in PDF format so employers can discover your qualifications.
        </Text>
        <PrimaryButton
          title={isUploading ? 'Selecting File...' : 'Upload Resume (PDF)'}
          onPress={onUploadPress}
          loading={isUploading}
          icon="cloud-upload-outline"
          style={styles.uploadCta}
        />
      </View>
    );
  }

  return (
    <View style={styles.resumeCardContainer}>
      <View style={styles.resumeCard}>
        {/* Top Header of Card */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.pdfBadge}>
              <Ionicons name="document-text" size={20} color="#DC2626" />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.resumeTitle} numberOfLines={1}>
                {resume.fileName || 'Resume.pdf'}
              </Text>
              <Text style={styles.resumeDate}>
                Uploaded: {resume.uploadedDate || 'Recently'} • PDF Document
              </Text>
            </View>
          </View>

          {onOptionsPress && (
            <Pressable
              style={styles.optionsBtn}
              onPress={onOptionsPress}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Resume options"
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#0F172A" />
            </Pressable>
          )}
        </View>

        {/* Document Preview Thumbnail Box */}
        <Pressable
          style={styles.thumbnailBox}
          onPress={onPreviewPress}
          accessibilityRole="button"
          accessibilityLabel="Preview PDF Document"
        >
          <View style={styles.resumeMiniPaper}>
            <Text style={styles.miniDocName}>{userProfile?.fullName || 'Candidate'}</Text>
            <Text style={styles.miniDocMeta}>{userProfile?.location || 'India'}</Text>
            <View style={styles.miniDivider} />
            <Text style={styles.miniSectionHeading}>Experience</Text>
            <Text style={styles.miniRoleTitle}>CometUIT Technologies Pvt. Ltd.</Text>
            <Text style={styles.miniRoleDesc}>
              Developed responsive UI components using React.js and modern frameworks...
            </Text>
            <View style={styles.miniDivider} />
            <Text style={styles.miniSectionHeading}>Skills & Competencies</Text>
            <Text style={styles.miniRoleDesc}>
              React • React Native • JavaScript • Node.js • Mobile UX
            </Text>
          </View>

          {/* Interactive Tap-to-preview Badge */}
          <View style={styles.tapToViewOverlay}>
            <View style={styles.tapToViewBadge}>
              <Ionicons name="open-outline" size={14} color="#FFFFFF" />
              <Text style={styles.tapToViewText}>Tap to open PDF</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  resumeCardContainer: {
    marginBottom: 20,
  },
  resumeCard: {
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pdfBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  resumeDate: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  optionsBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8F6FC',
  },
  thumbnailBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
    position: 'relative',
  },
  resumeMiniPaper: {
    padding: 14,
  },
  miniDocName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  miniDocMeta: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  miniDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  miniSectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  miniRoleTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  miniRoleDesc: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 15,
  },
  tapToViewOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  tapToViewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tapToViewText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE6F5',
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  uploadCta: {
    minWidth: 200,
  },
});
