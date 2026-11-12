import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import employerService from '../../../../services/employerService';

export default function EmployerJobMatchesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [jobData, matchData] = await Promise.all([
        employerService.getJobDetails(id),
        employerService.getDatabaseMatches(id),
      ]);
      setJob(jobData);
      setMatches(matchData || []);
      setLoading(false);
    })();
  }, [id]);

  const handleInvite = (candName) => {
    Alert.alert(
      'Invitation Sent! 🚀',
      `An invite to apply for "${job?.title || 'this role'}" has been sent to ${candName}.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            AI Smart Matches
          </Text>
          <Text style={styles.topBarSub}>{job?.title || 'Job Matches'}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.bannerIconBox}>
            <Ionicons name="sparkles" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Smart Talent Recommendations</Text>
            <Text style={styles.bannerSub}>
              These candidates closely match your requirements in skills, experience, and location.
            </Text>
          </View>
        </View>

        {matches.map((cand) => (
          <View key={cand._id} style={styles.card}>
            <Pressable
              style={styles.candHeader}
              onPress={() => router.push(`/employer/candidates/${cand._id}`)}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{cand.initials || 'A'}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.candName}>{cand.name}</Text>
                <Text style={styles.candRole}>{cand.role}</Text>
                <Text style={styles.candMeta}>
                  {cand.experience} • {cand.location}
                </Text>
              </View>

              <View style={styles.matchScoreBadge}>
                <Ionicons name="flash" size={12} color="#D97706" />
                <Text style={styles.matchScoreText}>{cand.matchScore}</Text>
              </View>
            </Pressable>

            {/* Skills */}
            <View style={styles.skillsSection}>
              <Text style={styles.skillsLabel}>Matching Skills:</Text>
              <View style={styles.skillsRow}>
                {cand.skills?.map((s, idx) => (
                  <View key={idx} style={styles.skillPill}>
                    <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                    <Text style={styles.skillPillText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Card Actions */}
            <View style={styles.cardActions}>
              <Pressable
                style={styles.viewProfileBtn}
                onPress={() => router.push(`/employer/candidates/${cand._id}`)}
              >
                <Text style={styles.viewProfileBtnText}>View Full Profile</Text>
                <Ionicons name="arrow-forward" size={13} color={COLORS.primary} />
              </Pressable>

              <Pressable
                style={styles.inviteBtn}
                onPress={() => handleInvite(cand.name)}
              >
                <Ionicons name="paper-plane-outline" size={14} color="#FFFFFF" />
                <Text style={styles.inviteBtnText}>Invite to Apply</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
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
  topBarCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  topBarSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  bannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#92400E',
  },
  bannerSub: {
    fontSize: 11.5,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  candHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2E6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  candName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  candRole: {
    fontSize: 12,
    color: '#475569',
    marginTop: 1,
  },
  candMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  skillsSection: {
    marginVertical: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  skillsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5FC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  skillPillText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  inviteBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
});