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

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const initialData = applicationService.getApplicationData();

  const [country, setCountry] = useState(initialData.country || 'India');
  const [postalCode, setPostalCode] = useState(initialData.postalCode || '201309');
  const [cityState, setCityState] = useState(initialData.cityState || 'Noida, Uttar Pradesh');
  const [area, setArea] = useState(initialData.area || 'Sector 62');
  const [streetAddress, setStreetAddress] = useState(
    initialData.streetAddress || 'A-12, H Block, Sector 62'
  );
  const [focusedField, setFocusedField] = useState(null);

  const [errors, setErrors] = useState({});

  const scrollViewRef = useRef(null);
  const scrollOffsetY = useRef(0);
  const fieldLayouts = useRef({});
  const focusedFieldRef = useRef(null);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollToActiveField = useCallback((fieldName) => {
    const target = fieldName || focusedFieldRef.current;
    if (!target) return;
    const fieldY = fieldLayouts.current[target];
    if (typeof fieldY === 'number') {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, fieldY - 24),
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
          scrollToActiveField();
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
  }, [scrollToActiveField]);

  const handleFieldLayout = (fieldName) => (event) => {
    fieldLayouts.current[fieldName] = event.nativeEvent.layout.y;
  };

  const handleFocus = (fieldName) => {
    focusedFieldRef.current = fieldName;
    setFocusedField(fieldName);
    setTimeout(() => {
      scrollToActiveField(fieldName);
    }, 120);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const validate = () => {
    const errs = {};
    if (!postalCode.trim()) errs.postalCode = 'Postal code is required';
    if (!cityState.trim()) errs.cityState = 'City, state/territory is required';
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstErrorKey = Object.keys(errs)[0];
      const targetY = fieldLayouts.current[firstErrorKey];
      if (typeof targetY === 'number') {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, targetY - 24),
          animated: true,
        });
      }
    }

    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    Keyboard.dismiss();
    if (!validate()) return;

    applicationService.updateApplicationData({
      country: country.trim(),
      postalCode: postalCode.trim(),
      cityState: cityState.trim(),
      area: area.trim(),
      streetAddress: streetAddress.trim(),
    });

    if (initialData.returnToReview) {
      applicationService.updateApplicationData({ returnToReview: false });
      router.push('/jobs/apply/review');
    } else {
      router.push('/jobs/apply/resume');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ApplicationHeader progress={50} />

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
          <Text style={styles.heading}>Add your location</Text>
          <Text style={styles.subheading}>
            We will save these details to your profile. Fields marked with (*) are required.
          </Text>

          {/* Country Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Country</Text>
            <Pressable style={styles.countryPicker}>
              <Text style={styles.countryText}>{country}</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.textDark} />
            </Pressable>
          </View>

          {/* Postal Code */}
          <View
            style={styles.fieldGroup}
            onLayout={handleFieldLayout('postalCode')}
          >
            <Text style={styles.label}>Postal code *</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'postalCode' && styles.inputFocused,
                errors.postalCode && styles.inputError,
              ]}
              value={postalCode}
              onChangeText={(text) => {
                setPostalCode(text);
                if (errors.postalCode) setErrors((prev) => ({ ...prev, postalCode: null }));
              }}
              onFocus={() => handleFocus('postalCode')}
              onBlur={handleBlur}
              keyboardType="numeric"
              placeholder="e.g. 201309"
              placeholderTextColor="#9CA3AF"
            />
            {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode}</Text>}
          </View>

          {/* City, state/territory */}
          <View
            style={styles.fieldGroup}
            onLayout={handleFieldLayout('cityState')}
          >
            <Text style={styles.label}>City, state/territory *</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'cityState' && styles.inputFocused,
                errors.cityState && styles.inputError,
              ]}
              value={cityState}
              onChangeText={(text) => {
                setCityState(text);
                if (errors.cityState) setErrors((prev) => ({ ...prev, cityState: null }));
              }}
              onFocus={() => handleFocus('cityState')}
              onBlur={handleBlur}
              placeholder="e.g. Noida, Uttar Pradesh"
              placeholderTextColor="#9CA3AF"
            />
            {errors.cityState && <Text style={styles.errorText}>{errors.cityState}</Text>}
          </View>

          {/* Area */}
          <View
            style={styles.fieldGroup}
            onLayout={handleFieldLayout('area')}
          >
            <Text style={styles.label}>Area</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'area' && styles.inputFocused,
              ]}
              value={area}
              onChangeText={setArea}
              onFocus={() => handleFocus('area')}
              onBlur={handleBlur}
              placeholder="e.g. Sector 62"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Street Address */}
          <View
            style={styles.fieldGroup}
            onLayout={handleFieldLayout('streetAddress')}
          >
            <Text style={styles.label}>Street address</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'streetAddress' && styles.inputFocused,
              ]}
              value={streetAddress}
              onChangeText={setStreetAddress}
              onFocus={() => handleFocus('streetAddress')}
              onBlur={handleBlur}
              placeholder="e.g. A-12, H Block, Sector 62"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Lock Privacy Notice */}
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed" size={15} color={COLORS.textSecondaryColor} />
            <Text style={styles.privacyText}>
              This will not be visible to employers. Only your city/state will be shared.
            </Text>
          </View>
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
    lineHeight: 18,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  countryText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  privacyText: {
    fontSize: 12,
    color: COLORS.textSecondaryColor,
    flex: 1,
    lineHeight: 16,
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
