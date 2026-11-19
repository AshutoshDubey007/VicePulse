import { paymentService } from './service';
import { SubscriptionPlanId, SubscriptionStatus } from '@/types';
import { getPlanConfig } from './plans';

export interface UserEntitlements {
  userId: string;
  planId: SubscriptionPlanId;
  planName: string;
  status: SubscriptionStatus;
  isActive: boolean;
  tier: 'free' | 'pro' | 'elite';
  currentPeriodEnd: string | null;
  daysRemaining: number;
  cancelAtPeriodEnd: boolean;
  features: string[];
  canAccessClassifiedOverlays: boolean;
  canExportGpxJson: boolean;
  canAccessTelemetryFilters: boolean;
  isUpgradeEligible: boolean;
  availableUpgrades: string[];
}

export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  const sub = await paymentService.getSubscription(userId);

  const isExpired = sub ? new Date(sub.currentPeriodEnd).getTime() < Date.now() : true;
  const isActive = Boolean(sub && (sub.status === 'active' || sub.status === 'trialing') && !isExpired);

  const planId: SubscriptionPlanId = isActive && sub ? sub.planId : 'free';
  const planConfig = getPlanConfig(planId);

  const daysRemaining = (sub && !isExpired) 
    ? Math.max(0, Math.ceil((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const tier: 'free' | 'pro' | 'elite' = 
    planId === 'syndicate_elite' ? 'elite' :
    planId === 'scout_pro' ? 'pro' : 'free';

  const canAccessClassifiedOverlays = tier === 'pro' || tier === 'elite';
  const canExportGpxJson = tier === 'elite';
  const canAccessTelemetryFilters = tier === 'pro' || tier === 'elite';

  const isUpgradeEligible = planId !== 'syndicate_elite';
  const availableUpgrades = planId === 'free' 
    ? ['scout_pro', 'syndicate_elite'] 
    : planId === 'scout_pro' 
    ? ['syndicate_elite'] 
    : [];

  return {
    userId,
    planId,
    planName: planConfig?.name || 'Standard Scout',
    status: sub ? sub.status : 'active',
    isActive,
    tier,
    currentPeriodEnd: sub ? sub.currentPeriodEnd : null,
    daysRemaining,
    cancelAtPeriodEnd: sub ? sub.cancelAtPeriodEnd : false,
    features: planConfig?.features || [],
    canAccessClassifiedOverlays,
    canExportGpxJson,
    canAccessTelemetryFilters,
    isUpgradeEligible,
    availableUpgrades,
  };
}

export async function hasProAccess(userId: string): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId);
  return entitlements.isActive && (entitlements.tier === 'pro' || entitlements.tier === 'elite');
}

export async function hasEliteAccess(userId: string): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId);
  return entitlements.isActive && entitlements.tier === 'elite';
}
