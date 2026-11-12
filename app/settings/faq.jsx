import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function FAQScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const faqs = [
    {
      q: 'How do I Create an Account?',
      a: 'Click on the Sign Up button, fill in your details, and verify your email/phone address to create your account.',
    },
    {
      q: 'How can I update my profile information?',
      a: 'Go to Settings > Profile section, make your adjustments, and click Save Profile.',
    },
    {
      q: 'How do I set up job alerts for new Opportunities?',
      a: 'Click on the Alerts tab, tap Create Alert, choose your preferred job roles, locations, and salary range.',
    },
    {
      q: 'How do recruiters see my profile?',
      a: 'If your profile visibility is set to Public or Recruiter Only, hiring companies can discover your resume and portfolio.',
    },
  ];

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topNav}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          <Text style={styles.navTitle}>FAQ</Text>
        </Pressable>
      </View>

      <View style={styles.container}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.mutedText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            placeholderTextColor={COLORS.mutedText}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map((item, idx) => (
            <View key={idx} style={styles.faqCard}>
              <Text style={styles.question}>{item.q}</Text>
              <Text style={styles.answer}>{item.a}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
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
  container: {
    flex: 1,
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.text,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  question: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  answer: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});