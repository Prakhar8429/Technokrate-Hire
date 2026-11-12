import React, { useEffect, useRef, createContext, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import BrandLogo from './BrandLogo';

export const AuthLayoutContext = createContext({
  scrollToInput: (offset = 0) => {},
  restoreScroll: () => {},
});

export function useAuthLayout() {
  return useContext(AuthLayoutContext);
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  description,
  illustration,
  showBack = true,
  onBack,
  topRightText,
  onTopRightPress,
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 860;
  const scrollViewRef = useRef(null);

  const scrollToInput = (offset = 80) => {
    scrollViewRef.current?.scrollTo({ y: offset, animated: true });
  };

  const restoreScroll = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        restoreScroll();
      }
    );
    return () => {
      hideSub.remove();
    };
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/auth/login');
    }
  };

  return (
    <AuthLayoutContext.Provider value={{ scrollToInput, restoreScroll }}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.root}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
          >
            <View style={[styles.mainWrapper, isLargeScreen && styles.mainWrapperLarge]}>
              {/* Top navigation bar (Back button & optional Top Right action like Skip) */}
              <View style={styles.navBar}>
                {showBack ? (
                  <Pressable
                    onPress={handleBack}
                    style={({ pressed }) => [
                      styles.backButton,
                      pressed && styles.backButtonPressed,
                    ]}
                    hitSlop={12}
                  >
                    <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                  </Pressable>
                ) : (
                  <View style={styles.backPlaceholder} />
                )}

                {Boolean(topRightText) && (
                  <Pressable
                    onPress={onTopRightPress}
                    style={({ pressed }) => [
                      styles.topRightButton,
                      pressed && styles.topRightButtonPressed,
                    ]}
                    hitSlop={10}
                  >
                    <Text style={styles.topRightText}>{topRightText}</Text>
                  </Pressable>
                )}
              </View>

              {/* Dual Column Layout for Large Screens, Stack for Mobile */}
              <View style={[styles.contentRow, isLargeScreen && styles.contentRowLarge]}>
                {/* Left Column: Logo + Auth Card */}
                <View style={[styles.leftColumn, isLargeScreen && styles.leftColumnLarge]}>
                  <View style={styles.logoContainer}>
                    <BrandLogo size={isLargeScreen ? 'large' : 'medium'} align="center" />
                  </View>

                  <View style={styles.card}>
                    {Boolean(title) && <Text style={styles.title}>{title}</Text>}
                    {Boolean(subtitle) && <Text style={styles.subtitle}>{subtitle}</Text>}
                    {Boolean(description) && (
                      <Text style={styles.description}>{description}</Text>
                    )}

                    <View style={styles.formContainer}>{children}</View>
                  </View>

                  {/* Stable Mobile Illustration below card - always mounted, scaled cleanly */}
                  {!isLargeScreen && illustration && (
                    <View style={styles.mobileIllustrationWrapper}>
                      {React.isValidElement(illustration)
                        ? React.cloneElement(illustration, {
                            width: Math.min(width - 48, 260),
                            height: 180,
                          })
                        : illustration}
                    </View>
                  )}
                </View>

                {/* Right Column: Purple Wave Backdrop & Illustration (Figma Design) */}
                {isLargeScreen && illustration && (
                  <View style={styles.rightColumn}>
                    <View style={styles.purpleBannerBg}>
                      <View style={styles.illustrationWrapper}>{illustration}</View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthLayoutContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  mainWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  mainWrapperLarge: {
    paddingHorizontal: 40,
    paddingTop: 24,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    marginBottom: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonPressed: {
    backgroundColor: '#EDF2F7',
    transform: [{ scale: 0.96 }],
  },
  backPlaceholder: {
    width: 40,
    height: 40,
  },
  topRightButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  topRightButtonPressed: {
    opacity: 0.7,
  },
  topRightText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  contentRow: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 2,
  },
  contentRowLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 580,
  },
  leftColumn: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  leftColumnLarge: {
    width: '45%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  logoContainer: {
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 6,
  },
  description: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  formContainer: {
    marginTop: 18,
    width: '100%',
  },
  rightColumn: {
    width: '52%',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  purpleBannerBg: {
    width: '100%',
    height: 520,
    borderRadius: 28,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  illustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileIllustrationWrapper: {
    marginTop: 18,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
