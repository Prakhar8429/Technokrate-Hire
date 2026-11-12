import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import ApplicationHeader from '../../../components/application/ApplicationHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import applicationService from '../../../services/applicationService';

export default function SupportingDocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const initialData = applicationService.getApplicationData();

  const [hasCoverLetter, setHasCoverLetter] = useState(
    initialData.hasCoverLetter !== undefined ? initialData.hasCoverLetter : true
  );
  const [coverLetterText, setCoverLetterText] = useState(
    initialData.coverLetterText !== undefined
      ? initialData.coverLetterText
      : 'I am very interested in this role and believe my skills and projects make me a good fit for this position...'
  );
  const [additionalDocs, setAdditionalDocs] = useState(
    initialData.additionalDocs || [{ name: 'Portfolio.pdf', size: '1.2 MB' }]
  );
  const [isFocused, setIsFocused] = useState(false);

  const scrollViewRef = useRef(null);
  const scrollOffsetY = useRef(0);
  const coverLetterLayoutY = useRef(0);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollToCoverLetter = useCallback(() => {
    if (coverLetterLayoutY.current > 0) {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, coverLetterLayoutY.current - 20),
        animated: true,
      });
    }
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          scrollToCoverLetter();
        }, 60);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollToCoverLetter]);

  const handleFocus = () => {
    setIsFocused(true);
    setTimeout(() => {
      scrollToCoverLetter();
    }, 120);
  };

  const handleRemoveCoverLetter = () => {
    setCoverLetterText('');
    setHasCoverLetter(false);
  };

  const handleRemoveDoc = (index) => {
    const updated = additionalDocs.filter((_, i) => i !== index);
    setAdditionalDocs(updated);
  };

  const handleContinue = () => {
    Keyboard.dismiss();
    applicationService.updateApplicationData({
      hasCoverLetter,
      coverLetterText: hasCoverLetter ? coverLetterText.trim() : '',
      additionalDocs,
    });

    router.push('/jobs/apply/review');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ApplicationHeader progress={85} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: isKeyboardVisible ? 280 : 30 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            scrollOffsetY.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          <Text style={styles.heading}>Add supporting documents</Text>
          <Text style={styles.subheading}>This is optional to add.</Text>

          {/* Cover Letter Section */}
          <Text style={styles.sectionLabel}>Cover letter</Text>

          {/* Option 1: Write Cover Letter Card */}
          <Pressable
            style={[
              styles.optionCard,
              hasCoverLetter && styles.optionCardActive,
            ]}
            onPress={() => setHasCoverLetter(true)}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionTitleRow}>
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color={COLORS.primary}
                />
                <Text style={styles.optionTitle}>Write a cover letter</Text>
              </View>
              {hasCoverLetter ? (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.emptyCircle} />
              )}
            </View>

            {hasCoverLetter && (
              <View
                style={styles.coverLetterBox}
                onLayout={(e) => {
                  coverLetterLayoutY.current = e.nativeEvent.layout.y;
                }}
              >
                <TextInput
                  style={[
                    styles.textArea,
                    isFocused && styles.textAreaFocused,
                  ]}
                  value={coverLetterText}
                  onChangeText={(text) => {
                    if (text.length <= 4000) setCoverLetterText(text);
                  }}
                  onFocus={handleFocus}
                  onBlur={() => setIsFocused(false)}
                  multiline
                  numberOfLines={5}
                  placeholder="Explain why you're a great fit for this role..."
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />

                <View style={styles.counterRow}>
                  <Text style={styles.counterText}>
                    {coverLetterText.length} / 4000
                  </Text>
                  <Pressable onPress={handleRemoveCoverLetter} hitSlop={8}>
                    <Text style={styles.removeText}>✕ Remove</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>

          {/* Option 2: Apply without cover letter */}
          <Pressable
            style={[
              styles.optionCard,
              !hasCoverLetter && styles.optionCardActive,
              { marginTop: 12, paddingVertical: 14 },
            ]}
            onPress={() => setHasCoverLetter(false)}
          >
            <View style={styles.optionHeader}>
              <View style={styles.optionTitleRow}>
                {!hasCoverLetter ? (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.emptyCircle} />
                )}
                <Text style={[styles.optionTitle, { marginLeft: 8 }]}>
                  Apply without a cover letter
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Additional Documents Section */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
            Additional documents
          </Text>

          {additionalDocs.map((doc, idx) => (
            <View key={idx} style={styles.docItemCard}>
              <View style={styles.docItemLeft}>
                <View style={styles.docIconSquare}>
                  <Ionicons name="attach" size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docSize}>{doc.size}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => handleRemoveDoc(idx)}
                style={styles.docDeleteBtn}
                hitSlop={10}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </Pressable>
            </View>
          ))}

          {/* Upload a file card */}
          <Pressable style={styles.uploadCard}>
            <View style={styles.uploadIconCircle}>
              <Ionicons name="arrow-up" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.uploadTitle}>Upload a file</Text>
          </Pressable>
        </ScrollView>

        {/* Keyboard-Safe Continue Button Bar */}
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: isKeyboardVisible ? 12 : Math.max(insets.bottom, 16),
            },
          ]}
        >
          <PrimaryButton title="Continue" onPress={handleContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.appBg,
  },
  keyboardContainer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.textSecondaryColor,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 16,
    padding: 16,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  coverLetterBox: {
    marginTop: 14,
  },
  textArea: {
    backgroundColor: '#F8F6FC',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 14,
    fontSize: 13.5,
    color: COLORS.textDark,
    minHeight: 110,
    lineHeight: 20,
  },
  textAreaFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  counterText: {
    fontSize: 12,
    color: COLORS.textSecondaryColor,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  docItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  docItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  docSize: {
    fontSize: 12,
    color: COLORS.textSecondaryColor,
    marginTop: 2,
  },
  docDeleteBtn: {
    padding: 4,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  uploadIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
});
