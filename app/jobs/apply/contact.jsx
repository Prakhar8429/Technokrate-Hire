import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import ApplicationHeader from '../../../components/application/ApplicationHeader';
import PrimaryButton from '../../../components/PrimaryButton';
import applicationService from '../../../services/applicationService';

export default function ContactInformationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const initialData = applicationService.getApplicationData();

  const [firstName, setFirstName] = useState(initialData.firstName || '');
  const [lastName, setLastName] = useState(initialData.lastName || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [phoneCode, setPhoneCode] = useState(initialData.phoneCountryCode || '+91');
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || '');
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
        // Scroll once keyboard is fully open and layout settled
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
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!phoneNumber.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phoneNumber.replace(/\D/g, '').length < 8) {
      errs.phone = 'Please enter a valid phone number';
    }
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstErrorKey = Object.keys(errs)[0];
      const targetField = firstErrorKey === 'phone' ? 'phone' : firstErrorKey;
      const targetY = fieldLayouts.current[targetField];
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
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phoneCountryCode: phoneCode,
      phoneNumber: phoneNumber.trim(),
    });

    if (initialData.returnToReview) {
      applicationService.updateApplicationData({ returnToReview: false });
      router.push('/jobs/apply/review');
    } else {
      router.push('/jobs/apply/location');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ApplicationHeader progress={25} />

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
            { paddingBottom: isKeyboardVisible ? 260 : 30 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            scrollOffsetY.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          <Text style={styles.heading}>Add your contact information</Text>
          <Text style={styles.subheading}>Fields marked with (*) are required.</Text>

          {/* First Name */}
          <View
            style={styles.fieldGroup}
            onLayout={handleFieldLayout('firstName')}
          >
            <Text style={styles.label}>First name *</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'firstName' && styles.inputFocused,
                errors.firstName && styles.inputError,
              ]}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: null }));
              }}
              onFocus={() => handleFocus('firstName')}
              onBlur={handleBlur}
              placeholder="First name"
              placeholderTextColor="#9CA3AF"
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>

          {/* Last Name */}
          <View
            style={styles.fieldGroup}
            onLayout={handleFieldLayout('lastName')}
          >
            <Text style={styles.label}>Last name *</Text>
            <TextInput
              style={[
                styles.input,
                focusedField === 'lastName' && styles.inputFocused,
                errors.lastName && styles.inputError,
              ]}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: null }));
              }}
              onFocus={() => handleFocus('lastName')}
              onBlur={handleBlur}
              placeholder="Last name"
              placeholderTextColor="#9CA3AF"
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>

          {/* Email */}
          <View
            style={styles.fieldGroup}
            onLayout={handleFieldLayout('email')}
          >
            <Text style={styles.label}>Email</Text>
            <View
              style={[
                styles.inputWithIcon,
                focusedField === 'email' && styles.inputFocused,
                errors.email && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.innerInput}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="name@example.com"
                placeholderTextColor="#9CA3AF"
              />
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.primary}
                style={styles.infoIcon}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone Number with Country Code */}
          <View
            style={styles.fieldGroup}
            onLayout={handleFieldLayout('phone')}
          >
            <Text style={styles.label}>Phone number</Text>
            <View style={styles.phoneRow}>
              <Pressable style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>{phoneCode}</Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.textDark} />
              </Pressable>

              <TextInput
                style={[
                  styles.phoneInput,
                  focusedField === 'phone' && styles.inputFocused,
                  errors.phone && styles.inputError,
                ]}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                }}
                onFocus={() => handleFocus('phone')}
                onBlur={handleBlur}
                keyboardType="phone-pad"
                placeholder="Phone number"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
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
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  innerInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  infoIcon: {
    marginLeft: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  phoneInput: {
    flex: 1,
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
