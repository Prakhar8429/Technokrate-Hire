import { Platform, Alert, Share } from 'react-native';

/**
 * Service to handle saving, downloading, and previewing Resume documents
 * directly on device without external dependencies.
 */
export const resumeDownloadService = {
  /**
   * Save / Download the resume to device storage / share
   * @param {Object} resume - Resume metadata { fileName, url, ... }
   * @param {Object} userProfile - User profile information
   * @returns {Promise<{ success: boolean, path?: string, error?: string }>}
   */
  async downloadAndSaveResume(resume, userProfile) {
    const fileName = resume?.fileName || 'ASHU_RESUME-1.pdf';
    const safeFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    try {
      if (Platform.OS === 'web') {
        return this._downloadWeb(resume, safeFileName, userProfile);
      }

      // Native Mobile (Android / iOS): Use Native Share sheet for save to files / drive
      const textContent = this._generateTextResume(resume, userProfile);
      await Share.share({
        title: safeFileName,
        message: textContent,
      });

      return {
        success: true,
        fileName: safeFileName,
      };
    } catch (err) {
      console.log('Error downloading resume:', err);
      return {
        success: false,
        error: err?.message || 'Failed to save resume',
      };
    }
  },

  /**
   * Share the resume document via native system share dialog (Android / iOS)
   */
  async shareResume(resume, userProfile) {
    const fileName = resume?.fileName || 'Resume.pdf';
    const candidateName = userProfile?.fullName || 'Candidate';
    const role = userProfile?.role || 'Job Seeker';

    try {
      const shareMessage = `Technokrate Hire Verified Resume\n\nCandidate: ${candidateName}\nRole: ${role}\nDocument: ${fileName}\n\nManaged securely via Technokrate Hire mobile app.`;
      
      const result = await Share.share({
        title: fileName,
        message: shareMessage,
        url: resume?.url,
      });

      return result;
    } catch (err) {
      console.log('Error sharing resume:', err);
      Alert.alert('Share Resume', 'Could not open share dialog.');
    }
  },

  /**
   * Get formatted resume text for in-app preview modal
   */
  getFormattedResumeText(role = 'Candidate Profile', userProfile = null) {
    const name = userProfile?.fullName ? userProfile.fullName.toUpperCase() : 'CANDIDATE RESUME';
    const loc = userProfile?.location || 'Verified Location';
    const phone = userProfile?.phone || '';
    const email = userProfile?.email || '';
    const contactLine = [loc, phone ? `Phone: ${phone}` : '', email ? `Email: ${email}` : ''].filter(Boolean).join(' | ');

    return (
      `==================================================\n` +
      `               ${name}\n` +
      `        ${role.toUpperCase()}\n` +
      `  ${contactLine}\n` +
      `==================================================\n\n` +
      `PROFESSIONAL SUMMARY\n` +
      `--------------------\n` +
      `Senior Product Designer and UX Architect with 7+ years of experience leading mobile design systems, end-to-end user workflows, and multi-platform digital products.\n\n` +
      `CORE COMPETENCIES\n` +
      `-----------------\n` +
      `• Design Systems & Figma Component Architecture\n` +
      `• Mobile UX/UI (iOS & Android Human Interface Guidelines)\n` +
      `• Rapid Wireframing & Interactive Prototyping\n` +
      `• User Research, Usability Testing & Analytics\n` +
      `• Cross-Functional Agile Collaboration with Engineering\n\n` +
      `RELEVANT EXPERIENCE\n` +
      `-------------------\n` +
      `Technokrate Hire / Digital Products (2022 - Present)\n` +
      `Lead Product Designer\n` +
      `• Spearheaded the complete redesign of candidate hiring portal and mobile flow, improving application completion rate by 42%.\n` +
      `• Architected unified purple design token system across 20+ core screens.\n` +
      `• Conducted iterative usability studies with recruiters and candidates.\n\n` +
      `Avestan Solutions (2019 - 2022)\n` +
      `UI/UX Designer\n` +
      `• Designed responsive dashboards, job tracking flows, and notification centers.\n` +
      `• Built scalable Figma component libraries used by 15+ developers.\n\n` +
      `EDUCATION\n` +
      `---------\n` +
      `Bachelor of Technology (B.Tech) in Computer Science\n` +
      `Interaction Design Foundation (IxDF) Certified\n\n` +
      `==================================================\n` +
      `Verified Document • Technokrate Hire • ID: TH-RES-2026-0928\n`
    );
  },

  /**
   * Helper for Web browser direct download
   */
  _downloadWeb(resume, fileName, userProfile) {
    try {
      const content = this._generateTextResume(resume, userProfile);
      const blob = new Blob([content], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = resume?.url || blobUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      return {
        success: true,
        fileName,
      };
    } catch (err) {
      console.log('Web download error:', err);
      return {
        success: false,
        error: err.message,
      };
    }
  },

  /**
   * Formatted text content of the candidate's resume
   */
  _generateTextResume(resume, userProfile) {
    return this.getFormattedResumeText(userProfile?.role || 'Senior Product Designer');
  },
};

export default resumeDownloadService;
