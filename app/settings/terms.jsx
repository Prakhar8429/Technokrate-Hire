import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import PrimaryButton from '../../components/PrimaryButton';
import infoService from '../../services/infoService';

export default function TermsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [termsData, setTermsData] = useState(null);
  const [clauses, setClauses] = useState([]);

  const loadTerms = async () => {
    setLoading(true);
    try {
      // API 32: Get Terms and Services (GET /api/jobseeker/termsAndService/getTerms)
      const data = await infoService.getTermsAndService({ forceRefresh: true });
      if (data) {
        setTermsData(data);
        if (data.content) {
          // Parse HTML paragraphs into structured clauses
          const matches = data.content.match(/<p>(.*?)<\/p>/gi);
          if (matches && matches.length > 0) {
            const parsed = matches
              .map((p) => p.replace(/<\/?p>/gi, '').trim())
              .filter(Boolean);
            setClauses(parsed);
          } else {
            const plain = data.content.replace(/<[^>]+>/g, '').trim();
            const split = plain.split('\n').map((s) => s.trim()).filter(Boolean);
            setClauses(split.length > 0 ? split : [plain]);
          }
        }
      }
    } catch (e) {
      console.log('Error loading terms:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, []);

  const handleDownload = () => {
    Alert.alert('Terms & Services', 'Agreement copy verified and accessible within Technokrate Hire app.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          <Text style={styles.navTitle}>{termsData?.title || 'Terms & Services'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading Terms & Conditions...</Text>
          </View>
        )}

        {!loading && clauses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={42} color={COLORS.mutedText} />
            <Text style={styles.emptyTitle}>Terms Currently Unavailable</Text>
            <Text style={styles.emptySubtitle}>Unable to retrieve terms at this moment. Please check back later.</Text>
            <Pressable style={styles.retryBtn} onPress={loadTerms}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && clauses.length > 0 && (
          <View style={styles.card}>
            {clauses.map((clause, index) => (
              <View key={index} style={styles.clauseBox}>
                <Text style={styles.clauseNum}>{index + 1})</Text>
                <Text style={styles.clauseText}>{clause.replace(/^\d+\)\s*/, '')}</Text>
              </View>
            ))}
          </View>
        )}

        {!loading && clauses.length > 0 && (
          <PrimaryButton
            title="Acknowledge Agreement"
            onPress={handleDownload}
            style={styles.downloadBtn}
          />
        )}
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
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.mutedText,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  clauseBox: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E6F8',
  },
  clauseNum: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  clauseText: {
    fontSize: 13.5,
    color: COLORS.text,
    lineHeight: 20,
  },
  downloadBtn: {
    marginBottom: 16,
  },
});