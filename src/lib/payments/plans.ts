import { PlanConfig } from '@/types';

// Configurable pricing driven by env variables with sensible fallbacks
const PRO_MONTHLY_INR = Number(process.env.NEXT_PUBLIC_PRICE_PRO_MONTHLY_INR || 499);
const PRO_YEARLY_INR = Number(process.env.NEXT_PUBLIC_PRICE_PRO_YEARLY_INR || 4499);
const ELITE_MONTHLY_INR = Number(process.env.NEXT_PUBLIC_PRICE_ELITE_MONTHLY_INR || 999);
const ELITE_YEARLY_INR = Number(process.env.NEXT_PUBLIC_PRICE_ELITE_YEARLY_INR || 8999);

export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Rookie Scout',
    tagline: 'Standard community surveillance access',
    badge: 'FREE FOREVER',
    prices: {
      monthly: { amount: 0, currency: 'INR', formatted: '₹0' },
      yearly: { amount: 0, currency: 'INR', formatted: '₹0', savings: '' },
    },
    features: [
      'Access to public discovery feed',
      'Basic Leonida tactical map browsing',
      'Submit field discoveries for review',
      'Standard community comments & notes',
      'Confirm sightings ("I found this too")',
    ],
    exclusivePerks: [],
    highlight: false,
  },
  {
    id: 'scout_pro',
    name: 'Leonida Syndicate Pro',
    tagline: 'Advanced tactical intelligence for active investigators',
    badge: 'MOST POPULAR',
    prices: {
      monthly: {
        amount: PRO_MONTHLY_INR,
        currency: 'INR',
        formatted: `₹${PRO_MONTHLY_INR}/mo`,
      },
      yearly: {
        amount: PRO_YEARLY_INR,
        currency: 'INR',
        formatted: `₹${PRO_YEARLY_INR}/yr`,
        savings: 'Save ~25%',
      },
    },
    features: [
      'Classified Satellite & Heatmap Overlays',
      'Advanced Telemetry Filters (Exact Time Windows & Rare Weather)',
      'Unlimited Saved Dossiers & Custom Bookmarks',
      'Priority verification queue for submitted reports',
      'Pro Scout Badge displayed across all field notes',
      'Direct GPX/JSON Coordinate Export',
    ],
    exclusivePerks: [
      'Unrestricted Tactical Radar Scanner',
      'Priority Audit Channel in Verification Desk',
    ],
    highlight: true,
  },
  {
    id: 'syndicate_elite',
    name: 'Vice Master Cartographer',
    tagline: 'Complete access to raw leak telemetry & priority audit tools',
    badge: 'MAX PRIVILEGE',
    prices: {
      monthly: {
        amount: ELITE_MONTHLY_INR,
        currency: 'INR',
        formatted: `₹${ELITE_MONTHLY_INR}/mo`,
      },
      yearly: {
        amount: ELITE_YEARLY_INR,
        currency: 'INR',
        formatted: `₹${ELITE_YEARLY_INR}/yr`,
        savings: 'Save ~25%',
      },
    },
    features: [
      'Everything in Leonida Syndicate Pro',
      'Direct Ingestion Access to Research Inbox Tools',
      'Instant SMS/Discord Webhook Alerts for Exotic Car Spawns',
      'Elite Cartographer Verified Gold Crest Badge',
      'Early access to new district map leaks & data drops',
      'Direct communication channel with Lead Auditors',
    ],
    exclusivePerks: [
      'Automated Webhook Recon Alerts',
      'Gold Border & VIP Radar Reticle',
    ],
    highlight: false,
  },
];

export function getPlanConfig(planId: string): PlanConfig | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === planId);
}
