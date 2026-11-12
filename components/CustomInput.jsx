import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuthLayout } from './AuthLayout';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  containerStyle,
  multiline = false,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const { scrollToInput } = useAuthLayout();

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const safeValue = value !== undefined && value !== null ? String(value) : '';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Pressable onPress={handleContainerPress} hitSlop={6}>
          <Text style={styles.label}>{label}</Text>
        </Pressable>
      )}
      <Pressable
        onPress={handleContainerPress}
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          multiline && styles.inputContainerMultiline,
        ]}
      >
        <TextInput
          ref={inputRef}
          {...props}
          style={[styles.input, multiline && styles.inputMultiline, props.style]}
          value={safeValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          editable={props.editable !== false}
          onFocus={(e) => {
            setIsFocused(true);
            try {
              scrollToInput?.(40);
            } catch {}
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          underlineColorAndroid="transparent"
        />
      </Pressable>
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
  },
  inputContainerMultiline: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputFocused: {
    borderColor: COLORS.inputFocusBorder,
    backgroundColor: '#FFFFFF',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBg,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.textPrimary,
    height: 48,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inputMultiline: {
    height: '100%',
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '500',
  },
});
