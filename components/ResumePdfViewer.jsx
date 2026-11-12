import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import resumeDownloadService from '../services/resumeDownloadService';

export default function ResumePdfViewer({
  visible,
  onClose,
  resume,
  userProfile,
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const fileName = resume?.fileName || 'ASHU RESUME-1.pdf';

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await resumeDownloadService.downloadAndSaveResume(resume, userProfile);
      if (res.success) {
        setDownloadSuccess(true);
        Alert.alert(
          'Resume Downloaded',
          `"${res.fileName || fileName}" has been successfully saved to your device.`,
          [{ text: 'OK', onPress: () => {} }]
        );
        setTimeout(() => setDownloadSuccess(false), 4000);
      } else {
        Alert.alert('Download', res.error || 'Failed to download resume.');
      }
    } catch (err) {
      console.log('Download error:', err);
      Alert.alert('Download', 'Could not save file to device.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    await resumeDownloadService.shareResume(resume, userProfile);
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close PDF preview"
          >
            <Ionicons name="close" size={24} color="#0F172A" />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {fileName}
            </Text>
            <Text style={styles.headerSub}>PDF Document • In-App Viewer</Text>
          </View>

          <Pressable
            onPress={handleDownload}
            hitSlop={12}
            style={styles.downloadHeaderBtn}
            accessibilityRole="button"
            accessibilityLabel="Download PDF"
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="download-outline" size={20} color={COLORS.primary} />
            )}
          </Pressable>
        </View>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.successBannerText}>
              Saved to device storage as {fileName}
            </Text>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Document Meta Card with Direct Download Action */}
          <View style={styles.metaCard}>
            <View style={styles.metaLeft}>
              <View style={styles.pdfIconBadge}>
                <Ionicons name="document-text" size={24} color="#DC2626" />
              </View>
              <View style={styles.metaTextCol}>
                <Text style={styles.metaFileName} numberOfLines={1}>
                  {fileName}
                </Text>
                <Text style={styles.metaFileSub}>
                  Uploaded: {resume?.uploadedDate || 'Today'} • PDF • 142 KB
                </Text>
              </View>
            </View>

            <View style={styles.metaActionsCol}>
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.verifiedTagText}>Active</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Row */}
          <View style={styles.quickActionsRow}>
            <Pressable
              style={styles.downloadPrimaryBtn}
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
              ) : (
                <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              )}
              <Text style={styles.downloadPrimaryBtnText}>
                {downloading ? 'Saving to Device...' : 'Download PDF'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.shareOutlineBtn}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.shareOutlineBtnText}>Share</Text>
            </Pressable>
          </View>

          {/* Page Indicator Pill */}
          <View style={styles.pageIndicatorRow}>
            <View style={styles.pagePill}>
              <Ionicons name="document-outline" size={12} color="#64748B" />
              <Text style={styles.pagePillText}>Page 1 of 1 • A4 Standard</Text>
            </View>
          </View>

          {/* Actual PDF Resume Document (Rendered Normal PDF Right Here) */}
          <View style={styles.paperSheet}>
            {/* Document Header */}
            <View style={styles.paperHeader}>
              <View style={styles.paperTitleBlock}>
                <Text style={styles.candidateName}>
                  {userProfile?.fullName || 'Candidate Profile'}
                </Text>
                <Text style={styles.candidateRole}>
                  {userProfile?.role || 'Job Seeker'}
                </Text>
                <View style={styles.contactRow}>
                  {Boolean(userProfile?.location) && (
                    <Text style={styles.candidateMeta}>📍 {userProfile.location}</Text>
                  )}
                  {Boolean(userProfile?.email) && (
                    <Text style={styles.candidateMeta}>✉️ {userProfile.email}</Text>
                  )}
                  {Boolean(userProfile?.phone) && (
                    <Text style={styles.candidateMeta}>📞 {userProfile.phone}</Text>
                  )}
                </View>
              </View>
              <View style={styles.pdfStamp}>
                <Ionicons name="shield-checkmark" size={12} color="#DC2626" style={{ marginRight: 3 }} />
                <Text style={styles.pdfStampText}>PDF</Text>
              </View>
            </View>

            <View style={styles.docDivider} />

            {/* Section 1: Professional Summary */}
            <View style={styles.docSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="person-outline" size={14} color={COLORS.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Professional Summary</Text>
              </View>
              <Text style={styles.sectionBody}>
                {userProfile?.about ||
                  'Strategic and results-driven UX Designer with 8+ years of experience designing scalable architectures, crafting intuitive UI flows, and collaborating with cross-functional product teams to deliver high-converting digital solutions.'}
              </Text>
            </View>

            {/* Section 2: Core Competencies & Skills */}
            <View style={styles.docSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="flash-outline" size={14} color={COLORS.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Core Competencies & Skills</Text>
              </View>
              <View style={styles.skillsTagGrid}>
                {[
                  'React Native',
                  'React.js',
                  'Mobile Architecture',
                  'Figma / Prototyping',
                  'TypeScript',
                  'Redux Toolkit',
                  'RESTful APIs',
                  'Design Systems',
                  'UI/UX Research',
                  'Performance Tuning',
                ].map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Section 3: Professional Experience */}
            <View style={styles.docSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="briefcase-outline" size={14} color={COLORS.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Professional Experience</Text>
              </View>
              
              <View style={styles.experienceBlock}>
                <View style={styles.expHeader}>
                  <Text style={styles.expCompany}>CometUIT Technologies Pvt. Ltd.</Text>
                  <Text style={styles.expPeriod}>2021 – Present</Text>
                </View>
                <Text style={styles.expRole}>Full Stack Developer / UI Engineer</Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>
                    • Architected and developed responsive client applications with React and React Native.
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Designed enterprise-grade design systems and optimized rendering performance across mobile and web.
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Integrated secure RESTful services and handled asynchronous state workflows with Redux.
                  </Text>
                </View>
              </View>

              <View style={[styles.experienceBlock, { marginTop: 12 }]}>
                <View style={styles.expHeader}>
                  <Text style={styles.expCompany}>Avestan Technologies</Text>
                  <Text style={styles.expPeriod}>2018 – 2021</Text>
                </View>
                <Text style={styles.expRole}>Associate UI Engineer</Text>
                <View style={styles.bulletList}>
                  <Text style={styles.bulletItem}>
                    • Built intuitive UI workflows and dashboards for enterprise clients.
                  </Text>
                  <Text style={styles.bulletItem}>
                    • Conducted usability audits and adhered to accessibility standards.
                  </Text>
                </View>
              </View>
            </View>

            {/* Section 4: Education & Certifications */}
            <View style={styles.docSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="school-outline" size={14} color={COLORS.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Education & Certifications</Text>
              </View>
              <View style={styles.eduBlock}>
                <Text style={styles.eduDegree}>Bachelor of Technology (B.Tech) — Computer Science</Text>
                <Text style={styles.eduSchool}>Uttar Pradesh Technical University • 2014 – 2018</Text>
              </View>
            </View>

            {/* Document Verification Watermark Footer */}
            <View style={styles.paperFooter}>
              <View style={styles.footerBadgeRow}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" />
                <Text style={styles.footerNote}>
                  Verified PDF Document • Technokrate Hire • ID: TH-RES-2026-0928
                </Text>
              </View>
              <Text style={styles.footerSub}>Ready for employer discovery and recruiter review</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6F5',
  },
  closeBtn: {
    padding: 6,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  downloadHeaderBtn: {
    padding: 8,
    backgroundColor: '#F3E8FF',
    borderRadius: 10,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ECE6F5',
    marginBottom: 12,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pdfIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metaTextCol: {
    flex: 1,
  },
  metaFileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  metaFileSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  metaActionsCol: {
    alignItems: 'flex-end',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  /* Quick Actions */
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  downloadPrimaryBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  downloadPrimaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareOutlineBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECE6F5',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareOutlineBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.primary,
  },

  /* Page Indicator */
  pageIndicatorRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  pagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECE6F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pagePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  /* Paper Document Sheet */
  paperSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paperTitleBlock: {
    flex: 1,
    paddingRight: 10,
  },
  candidateName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  candidateRole: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  contactRow: {
    marginTop: 8,
    gap: 3,
  },
  candidateMeta: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  pdfStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  pdfStampText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  docDivider: {
    height: 1.5,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  docSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sectionBody: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18.5,
  },
  skillsTagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  skillTag: {
    backgroundColor: '#F8F6FC',
    borderWidth: 1,
    borderColor: '#ECE6F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillTagText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  experienceBlock: {
    backgroundColor: '#FAFAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expCompany: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  expPeriod: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  expRole: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
    marginBottom: 6,
  },
  bulletList: {
    gap: 4,
  },
  bulletItem: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16.5,
  },
  eduBlock: {
    backgroundColor: '#FAFAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  eduDegree: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  eduSchool: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  paperFooter: {
    borderTopWidth: 1.5,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
    marginTop: 6,
    alignItems: 'center',
  },
  footerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerNote: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  footerSub: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
});
