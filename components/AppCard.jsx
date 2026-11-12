import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

export default function AppCard({
  children,
  style,
  onPress,
  disabled = false,
  variant = 'default', // 'default' | 'elevated' | 'flat'
}) {
  const CardComponent = onPress ? Pressable : View;

  return (
    <CardComponent
      style={({ pressed }) => [
        styles.card,
        variant === 'elevated' && styles.cardElevated,
        variant === 'flat' && styles.cardFlat,
        pressed && !disabled && styles.cardPressed,
        style,
      ]}
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
    >
      {children}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  cardElevated: {
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
  },
  cardFlat: {
    shadowOpacity: 0,
    elevation: 0,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
