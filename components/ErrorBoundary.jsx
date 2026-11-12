import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import { router } from 'expo-router';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleDismiss = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRestart = () => {
    this.setState({ hasError: false, error: null }, () => {
      try {
        router.replace('/auth/login');
      } catch (e) {
        try {
          router.replace('/');
        } catch {}
      }
    });
  };

  render() {
    if (this.state.hasError) {
      const errorMsg =
        this.state.error?.message ||
        (typeof this.state.error === 'string' ? this.state.error : 'Unexpected issue occurred');

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Technokrate Hire</Text>
            <Text style={styles.heading}>Something went wrong</Text>
            <Text style={styles.subtext}>
              The application encountered an unexpected issue, but we kept it running safely.
            </Text>

            {/* Diagnostic Message */}
            <View style={styles.debugBox}>
              <Text style={styles.debugTitle}>Notice:</Text>
              <Text style={styles.debugText} numberOfLines={3}>
                {errorMsg}
              </Text>
            </View>

            {/* Actions: Try Again & Restart App */}
            <View style={styles.buttonRow}>
              <Pressable style={styles.tryAgainButton} onPress={this.handleDismiss}>
                <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
                <Text style={styles.tryAgainText}>Try Again</Text>
              </Pressable>

              <Pressable style={styles.button} onPress={this.handleRestart}>
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.buttonText}>Restart App</Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  debugBox: {
    width: '100%',
    backgroundColor: '#FAF5FC',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 18,
  },
  debugTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  debugText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  tryAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    justifyContent: 'center',
  },
  tryAgainText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
