import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import AppHeader from '../../components/AppHeader';
import PrimaryButton from '../../components/PrimaryButton';
import candidateService from '../../services/candidateService';

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      const [data, currentActive] = await Promise.all([
        candidateService.getJobSeekerPlans(),
        candidateService.getActivePlan(),
      ]);
      if (Array.isArray(data)) {
        setPlans(data);
      }
      if (currentActive) {
        setActivePlan(currentActive);
      }
    } catch (e) {
      console.log('Error fetching plans:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans();
  };

  const handleSelectPlan = (planName, price, planId) => {
    if (!planId) return;
    router.push({
      pathname: '/plans/payment',
      params: { planName, price: String(price), planId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader showNotification />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Hero Banner */}
        <Text style={styles.title}>Accelerate Your Career</Text>
        <Text style={styles.subtitle}>
          Upgrade your account to access exclusive tools designed to put your profile in front of top recruiters and high-growth companies.
        </Text>

        {/* Current Plan Card */}
        <View style={styles.currentPlanCard}>
          <View style={styles.currentPlanBadge}>
            <Text style={styles.currentPlanBadgeText}>Current Plan</Text>
          </View>
          <Text style={styles.planName}>{activePlan?.planName ? `${activePlan.planName} (Active)` : 'Free'}</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.primary} />
              <Text style={styles.featureText}>Apply to 5 jobs/month</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={COLORS.primary} />
              <Text style={styles.featureText}>Basic profile visibility</Text>
            </View>
          </View>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading subscription plans...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && plans.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={48} color={COLORS.mutedText} />
            <Text style={styles.emptyTitle}>No Plans Available</Text>
            <Text style={styles.emptySubtitle}>
              There are currently no active subscription plans configured. Please check back later.
            </Text>
            <Pressable style={styles.retryBtn} onPress={onRefresh}>
              <Text style={styles.retryBtnText}>Refresh Plans</Text>
            </Pressable>
          </View>
        )}

        {/* Dynamic Plans from Live API */}
        {!loading && plans.map((plan, index) => {
          const isFeatured = index === 0;

          if (isFeatured) {
            return (
              <View key={plan._id || index} style={styles.proCard}>
                <View style={styles.recommendedBadge}>
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.recommendedText}>
                    {plan.discount ? `${plan.discount}% OFF • Featured` : 'Recommended'}
                  </Text>
                </View>

                <Text style={styles.proTitle}>{plan.planName}</Text>
                <Text style={styles.proTag}>{plan.planTag}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.proPrice}>₹{plan.planPrice.toLocaleString()}</Text>
                  <Text style={styles.proPeriod}>/ {plan.validity}</Text>
                </View>

                <View style={styles.proFeaturesList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                    <Text style={styles.proFeatureText}>
                      Apply to {plan.canApplyJobsPerMonth} jobs/month
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                    <Text style={styles.proFeatureText}>
                      Profile Boost: {plan.profileBoost ? 'Included' : 'Not Included'}
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                    <Text style={styles.proFeatureText}>
                      Job Alerts: {plan.jobAlert ? 'Instant Recruiter Alerts' : 'Standard'}
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                    <Text style={styles.proFeatureText}>
                      Support: {plan.support ? '24/7 Priority Support' : 'Standard'}
                    </Text>
                  </View>
                </View>

                <PrimaryButton
                  title="Upgrade Now"
                  onPress={() => handleSelectPlan(plan.planName, plan.planPrice, plan._id)}
                  style={styles.proBtn}
                  textStyle={{ color: COLORS.primary }}
                />
              </View>
            );
          }

          return (
            <View key={plan._id || index} style={styles.planCard}>
              {Boolean(plan.discount) && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{plan.discount}% OFF</Text>
                </View>
              )}
              <Text style={styles.cardPlanTitle}>{plan.planName}</Text>
              <Text style={styles.cardPlanDuration}>{plan.validity} Validity • {plan.planTag}</Text>
              <Text style={styles.cardPlanPrice}>₹{plan.planPrice.toLocaleString()}</Text>

              <View style={styles.featuresList}>
                <Text style={styles.specText}>• Apply to {plan.canApplyJobsPerMonth} jobs/month</Text>
                <Text style={styles.specText}>• Profile Boost: {plan.profileBoost ? 'Yes' : 'No'}</Text>
                <Text style={styles.specText}>• Job Alerts: {plan.jobAlert ? 'Yes' : 'No'}</Text>
                <Text style={styles.specText}>• Priority Support: {plan.support ? 'Yes' : 'No'}</Text>
              </View>

              <Pressable
                style={styles.selectBtn}
                onPress={() => handleSelectPlan(plan.planName, plan.planPrice, plan._id)}
              >
                <Text style={styles.selectBtnText}>Select Plan</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 95,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.mutedText,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 20,
  },
  currentPlanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currentPlanBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  currentPlanBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  featuresList: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.text,
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.mutedText,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    marginVertical: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.mutedText,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  proCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 10,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  proTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  proTag: {
    fontSize: 12,
    color: '#E9D5FF',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    marginBottom: 16,
  },
  proPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  proPeriod: {
    fontSize: 13,
    color: '#DDD6FE',
    marginLeft: 4,
  },
  proFeaturesList: {
    gap: 8,
    marginBottom: 20,
  },
  proFeatureText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  proBtn: {
    backgroundColor: '#FFFFFF',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECE6F5',
    shadowColor: '#7000B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF9E7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  cardPlanTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardPlanDuration: {
    fontSize: 12.5,
    color: COLORS.mutedText,
    marginBottom: 6,
  },
  cardPlanPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  specText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  selectBtn: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
