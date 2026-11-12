import React, { useRef } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuthLayout } from './AuthLayout';

export default function OTPInput({ value = '', onChange, hasError = false }) {
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const digits = [value[0] || '', value[1] || '', value[2] || '', value[3] || ''];
  const { scrollToInput } = useAuthLayout();

  const handleChange = (text, index) => {
    // Handle paste of 4 digits
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      const newDigits = cleaned.slice(0, 4).padEnd(4, ' ').split('');
      const fullCode = cleaned.slice(0, 4);
      onChange(fullCode);
      const nextIndex = Math.min(cleaned.length, 3);
      inputRefs[nextIndex]?.current?.focus();
      return;
    }

    const digit = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    const combined = newDigits.join('').trim();
    onChange(combined);

    // Auto-focus next field
    if (digit && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs[index - 1]?.current?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join('').trim());
      }
    }
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <Pressable
          key={index}
          onPress={() => inputRefs[index]?.current?.focus()}
          style={[
            styles.box,
            Boolean(digit) && styles.boxFilled,
            hasError && styles.boxError,
          ]}
        >
          <TextInput
            ref={inputRefs[index]}
            style={styles.input}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => scrollToInput?.(40)}
            keyboardType="number-pad"
            maxLength={index === 0 ? 4 : 1}
            selectTextOnFocus
            textAlign="center"
            autoFocus={index === 0}
            underlineColorAndroid="transparent"
            editable={true}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
    paddingHorizontal: 8,
    maxWidth: 320,
    alignSelf: 'center',
    width: '100%',
  },
  box: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  boxError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBg,
  },
  input: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    width: '100%',
    height: '100%',
    textAlign: 'center',
  },
});
