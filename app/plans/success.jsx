import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import PlanPurchaseSuccess from '../../components/PlanPurchaseSuccess';

export default function PurchaseSuccessScreen() {
  const params = useLocalSearchParams();
  const planName = params.planName || 'Basic Plan (60 Days)';

  return <PlanPurchaseSuccess planName={planName} />;
}