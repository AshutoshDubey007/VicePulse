'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlanConfig, UserSubscription, PaymentRecord, SubscriptionBillingCycle } from '@/types';
import { 
  CreditCard, 
  Check, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Clock, 
  X,
  Radio,
  ArrowRight,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface BillingClientProps {
  initialSubscription: UserSubscription | null;
  plans: PlanConfig[];
  paymentHistory: PaymentRecord[];
  isPaymentsEnabled: boolean;
}

interface ActiveQrOrder {
  orderId: string;
  amount: number;
  currency: string;
  qrCodeUrl?: string;
  qrCodeData?: string;
  upiIntentUrl?: string;
  expiresAt: string;
  planId: string;
  planName: string;
  billingCycle: string;
}

export const BillingClient: React.FC<BillingClientProps> = ({
  initialSubscription,
  plans,
  paymentHistory: initialHistory,
  isPaymentsEnabled,
}) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(initialSubscription);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialHistory);
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  
  // Real Dynamic QR Modal State
  const [activeQrOrder, setActiveQrOrder] = useState<ActiveQrOrder | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<
    'pending' | 'verifying' | 'success' | 'expired' | 'failed'
  >('pending');
  
  // Setup Incomplete Notice (when merchant credentials are not yet configured)
  const [setupIncompleteNotice, setSetupIncompleteNotice] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active user's current plan
  const currentPlanId = subscription?.planId || 'free';
  const currentPlan = plans.find((p) => p.id === currentPlanId) || plans[0];

  // 1. Strict 5-Minute Countdown Timer driven by Server Expiration
  useEffect(() => {
    if (!activeQrOrder || orderPaymentStatus === 'success' || orderPaymentStatus === 'expired') {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const expires = new Date(activeQrOrder.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        setOrderPaymentStatus('expired');
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [activeQrOrder, orderPaymentStatus]);

  // 2. Real-Time Status Polling (Every 3 seconds while payment session is pending)
  useEffect(() => {
    if (!activeQrOrder || orderPaymentStatus === 'success' || orderPaymentStatus === 'expired') {
      return;
    }

    let isMounted = true;
    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/payments/status?orderId=${activeQrOrder.orderId}`);
        const data = await res.json();
        if (!isMounted) return;

        if (data.status === 'success') {
          setOrderPaymentStatus('success');

          // Refresh subscription data
          const subRes = await fetch('/api/payments/subscription');
          const subData = await subRes.json();
          if (subData.subscription) {
            setSubscription(subData.subscription);
          }

          // Refresh payment history
          const histRes = await fetch('/api/payments/history');
          const histData = await histRes.json();
          if (histData.payments) {
            setPayments(histData.payments);
          }
        } else if (data.status === 'expired') {
          setOrderPaymentStatus('expired');
        } else if (data.status === 'failed') {
          setOrderPaymentStatus('failed');
        }
      } catch (err) {
        // Transient poll error, retry on next interval
      }
    };

    const pollInterval = setInterval(pollStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [activeQrOrder, orderPaymentStatus]);

  // Handle plan checkout initiation
  const handleStartCheckout = async (plan: PlanConfig) => {
    setSelectedPlan(plan);
    setLoadingPlanId(plan.id);
    setStatusMessage(null);
    setSetupIncompleteNotice(null);

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          provider: 'razorpay',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.gatewayConfigured === false) {
          setSetupIncompleteNotice({
            title: 'MERCHANT ONBOARDING & CREDENTIALS REQUIRED',
            message:
              data.error ||
              'Real live UPI payments require Razorpay merchant keys (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) in the server environment. VicePulse will not simulate false payments.',
          });
        } else {
          setStatusMessage({ text: data.error || 'Failed to initialize checkout', type: 'error' });
        }
        return;
      }

      // Open Real Dynamic QR Payment Modal
      setActiveQrOrder(data);
      setOrderPaymentStatus('pending');
      setSecondsRemaining(300);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Payment initialization error', type: 'error' });
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch('/api/payments/cancel', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription);
        setStatusMessage({
          text: 'Your subscription will not renew after the current billing period.',
          type: 'success',
        });
        setCancelModalOpen(false);
      }
    } catch (e) {
      setStatusMessage({ text: 'Failed to cancel subscription', type: 'error' });
    } finally {
      setCancelLoading(false);
    }
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 font-body bg-ink text-cream">
      
      {/* Header */}
      <div className="border-b-3 border-ink pb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase font-black px-2 py-0.5 bg-orange text-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]">
              LEONIDA RECON MEMBERSHIP
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-cream text-shadow-hard leading-none pt-1">
            SYNDICATE BILLING & CLEARANCE
          </h1>
          <p className="font-body text-xs sm:text-sm text-cream/80 mt-1 max-w-xl">
            Upgrade your scout status for classified satellite radar layers, instant notifications, and raw GeoJSON telemetry exports.
          </p>
        </div>

        {/* Feature Flag Notice */}
        {!isPaymentsEnabled && (
          <div className="p-3 bg-sun text-ink border-2 border-ink text-xs font-mono font-bold flex items-center gap-2 shadow-[2px_2px_0px_#1A0B2E]">
            <Radio className="w-4 h-4 text-orange stroke-[2.5px] animate-pulse" />
            <span>PAYMENT SYSTEM TEMPORARILY DISABLED BY ADMIN</span>
          </div>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-4 border-2 font-mono text-xs flex items-center justify-between font-bold shadow-[3px_3px_0px_#1A0B2E] ${
            statusMessage.type === 'success'
              ? 'bg-teal text-ink border-ink'
              : 'bg-red-500 text-cream border-ink'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>
      )}

      {/* 1. CURRENT ENTITLEMENT STATUS CARD */}
      <div className="bg-ink-card border-3 border-ink p-6 sm:p-8 space-y-6 shadow-[5px_5px_0px_#1A0B2E]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange text-ink border-2 border-ink flex items-center justify-center font-display text-2xl font-black shadow-[2px_2px_0px_#FF4FA0]">
              <ShieldCheck className="w-7 h-7 stroke-[2.5px]" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-orange uppercase font-black">ACTIVE SCOUT CLEARANCE:</span>
              <h3 className="font-display text-2xl sm:text-3xl text-cream text-shadow-hard leading-tight tracking-wide">
                {currentPlan.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span
              className={`px-3 py-1 font-mono uppercase font-black border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] ${
                subscription?.status === 'active'
                  ? 'bg-teal text-ink'
                  : 'bg-sun text-ink'
              }`}
            >
              STATUS: {subscription?.status.toUpperCase() || 'ACTIVE (ROOKIE)'}
            </span>

            {subscription && subscription.planId !== 'free' && !subscription.cancelAtPeriodEnd && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-3 py-1 bg-ink text-red-400 border-2 border-ink hover:border-red-400 font-mono text-xs uppercase font-bold"
              >
                Cancel Renewal
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs font-bold">
          <div className="bg-ink p-4 border-2 border-ink space-y-1 shadow-[2px_2px_0px_#1A0B2E]">
            <span className="text-cream/60 uppercase text-[10px]">BILLING FREQUENCY:</span>
            <div className="text-sun uppercase font-black">
              {subscription?.billingCycle ? `${subscription.billingCycle} Renewal` : 'Free / Lifetime'}
            </div>
          </div>

          <div className="bg-ink p-4 border-2 border-ink space-y-1 shadow-[2px_2px_0px_#1A0B2E]">
            <span className="text-cream/60 uppercase text-[10px]">CURRENT ACCESS VALID UNTIL:</span>
            <div className="text-orange font-black">
              {subscription?.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : 'Lifetime Free Access'}
            </div>
            {subscription?.cancelAtPeriodEnd && (
              <span className="text-[10px] text-red-400 block font-normal">
                Scheduled to expire on this date.
              </span>
            )}
          </div>

          <div className="bg-ink p-4 border-2 border-ink space-y-1 shadow-[2px_2px_0px_#1A0B2E]">
            <span className="text-cream/60 uppercase text-[10px]">PAYMENT METHOD:</span>
            <div className="text-teal uppercase font-black">
              {subscription?.provider ? 'Verified Dynamic UPI' : 'Community Tier'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRICING & PLAN TIERS */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl uppercase tracking-tight text-cream text-shadow-hard">
              CHOOSE YOUR INVESTIGATIVE TIER
            </h2>
            <p className="font-body text-xs text-cream/80 mt-0.5">
              Instant dynamic QR code checkout with server-verified UPI payment activation.
            </p>
          </div>

          {/* Billing Cycle Switch */}
          <div className="bg-ink-card p-1 border-2 border-ink flex items-center shadow-[3px_3px_0px_#1A0B2E]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 font-mono text-xs uppercase font-black transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-orange text-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]'
                  : 'text-cream/70 hover:text-cream'
              }`}
            >
              Monthly Term
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1 font-mono text-xs uppercase font-black transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-orange text-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]'
                  : 'text-cream/70 hover:text-cream'
              }`}
            >
              <span>Annual Pass</span>
              <span className="bg-teal text-ink text-[9px] px-1.5 py-0.2 rounded-xs font-black">
                SAVE 25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = currentPlanId === p.id;
            const price = billingCycle === 'yearly' ? p.prices.yearly : p.prices.monthly;

            return (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between bg-ink-card border-3 border-ink p-6 transition-all shadow-[5px_5px_0px_#1A0B2E] ${
                  p.highlight ? 'ring-3 ring-orange' : ''
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3.5 right-4 font-mono text-[10px] font-black uppercase px-2 py-0.5 bg-sun text-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]">
                    {p.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-2xl uppercase text-cream text-shadow-hard tracking-wide">
                      {p.name}
                    </h3>
                    <p className="font-body text-xs text-cream/70 mt-1 leading-relaxed">
                      {p.tagline}
                    </p>
                  </div>

                  <div className="pt-2 border-t-2 border-ink-border">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl text-cream tracking-tight">
                        {price.formatted}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && p.prices.yearly.savings && (
                      <span className="font-mono text-[10px] text-teal block mt-0.5 font-bold">
                        {p.prices.yearly.savings}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2 pt-2">
                    <span className="font-mono text-[10px] uppercase font-black text-orange block">
                      SURVEILLANCE CAPABILITIES:
                    </span>
                    <ul className="space-y-2 font-mono text-xs">
                      {p.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal stroke-[2.5px] shrink-0 mt-0.5" />
                          <span className="text-cream/90">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-ink-border mt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-ink text-teal border-2 border-ink font-mono text-xs uppercase font-black cursor-default text-center"
                    >
                      Current Clearance Active
                    </button>
                  ) : p.id === 'free' ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-ink text-cream/60 border-2 border-ink font-mono text-xs uppercase font-bold text-center"
                    >
                      Included as Default
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartCheckout(p)}
                      disabled={loadingPlanId === p.id}
                      className="w-full py-3 bg-orange hover:bg-orange-hover text-ink font-mono text-xs uppercase font-black tracking-wider transition-all border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] flex items-center justify-center gap-2 group"
                    >
                      {loadingPlanId === p.id ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Dynamic QR...</span>
                        </span>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4 stroke-[2.5px]" />
                          <span>Generate UPI QR Code</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform stroke-[2.5px]" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. REAL TRANSACTION AUDIT LEDGER */}
      <div className="bg-ink-card border-3 border-ink p-6 space-y-4 shadow-[5px_5px_0px_#1A0B2E] font-mono text-xs">
        <div className="flex items-center justify-between border-b-2 border-ink pb-3">
          <h3 className="font-display text-2xl uppercase tracking-tight text-cream text-shadow-hard">
            BILLING & TRANSACTION AUDIT LOG
          </h3>
          <span className="text-cream/60 text-[10px] uppercase font-bold">DATABASE-BACKED RECORDS</span>
        </div>

        {payments.length === 0 ? (
          <p className="text-cream/60 text-center py-6 uppercase font-bold">No previous billing transactions recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-ink text-cream/70 border-b-2 border-ink text-[10px] uppercase font-bold">
                <tr>
                  <th className="p-3">Order Reference</th>
                  <th className="p-3">Plan Tier</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink-border font-bold">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-ink transition-colors">
                    <td className="p-3">
                      <div className="text-cream font-mono">{pay.orderId}</div>
                      <div className="text-[10px] text-cream/60 font-mono">{pay.paymentId || 'Pending'}</div>
                    </td>
                    <td className="p-3 capitalize">{pay.planId.replace('_', ' ')} ({pay.billingCycle})</td>
                    <td className="p-3 text-orange font-mono">₹{pay.amount}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 border-2 border-ink font-black ${
                          pay.status === 'success'
                            ? 'bg-teal text-ink'
                            : pay.status === 'failed'
                            ? 'bg-red-500 text-cream'
                            : pay.status === 'refunded'
                            ? 'bg-orange text-ink'
                            : 'bg-sun text-ink'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-3 text-cream/70">{new Date(pay.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      {pay.status === 'success' ? (
                        <span className="text-teal font-mono text-[11px]">
                          Verified ✓
                        </span>
                      ) : (
                        <span className="text-cream/40 font-mono text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. REAL DYNAMIC QR-BASED PAYMENT MODAL (5-Minute Strict Expiration) */}
      {activeQrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ink-card border-3 border-ink w-full max-w-lg shadow-[8px_8px_0px_#1A0B2E] p-6 space-y-5 font-body">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange stroke-[2.5px]" />
                <span className="font-display tracking-wider text-2xl uppercase text-cream text-shadow-hard">
                  DYNAMIC UPI CHECKOUT
                </span>
              </div>
              {orderPaymentStatus !== 'verifying' && (
                <button
                  onClick={() => setActiveQrOrder(null)}
                  className="text-cream/60 hover:text-cream p-1 transition-colors"
                >
                  <X className="w-5 h-5 stroke-[2.5px]" />
                </button>
              )}
            </div>

            {/* Plan & Amount Summary */}
            <div className="bg-ink p-3.5 border-2 border-ink space-y-1.5 font-mono text-xs font-bold shadow-[2px_2px_0px_#1A0B2E]">
              <div className="flex justify-between items-center">
                <span className="text-cream/60">Selected Clearance:</span>
                <span className="text-cream font-display text-base uppercase">{activeQrOrder.planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cream/60">Billing Term:</span>
                <span className="text-orange uppercase">{activeQrOrder.billingCycle}</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-ink-border pt-1.5">
                <span className="text-cream/60">Amount Payable:</span>
                <span className="text-teal font-display text-2xl font-black">
                  ₹{activeQrOrder.amount} <span className="text-xs font-mono font-normal text-cream/70">INR</span>
                </span>
              </div>
            </div>

            {/* QR CODE DISPLAY AREA */}
            <div className="bg-[#111114] border-2 border-ink p-5 flex flex-col items-center justify-center text-center space-y-3 relative shadow-inner">
              
              {/* Top Countdown HUD Banner */}
              <div
                className={`w-full py-1 px-3 border flex items-center justify-between font-mono text-xs font-black uppercase ${
                  orderPaymentStatus === 'expired'
                    ? 'bg-red-950 text-red-400 border-red-500/60'
                    : secondsRemaining < 60
                    ? 'bg-orange/20 text-orange border-orange animate-pulse'
                    : 'bg-ink text-sun border-sun/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SESSION EXPIRATION:</span>
                </div>
                <span className="font-mono text-sm tracking-widest font-black">
                  {orderPaymentStatus === 'expired' ? '00:00 (EXPIRED)' : formatCountdown(secondsRemaining)}
                </span>
              </div>

              {/* QR Image or Expired State */}
              {orderPaymentStatus === 'expired' ? (
                <div className="w-64 h-64 bg-ink border-2 border-red-500/40 rounded-sm flex flex-col items-center justify-center p-6 space-y-3 text-center">
                  <AlertCircle className="w-12 h-12 text-red-400 stroke-[2.5px]" />
                  <p className="font-display text-lg text-cream uppercase tracking-wide">
                    QR CODE EXPIRED
                  </p>
                  <p className="font-mono text-[10px] text-cream/70 leading-relaxed">
                    The 5-minute security window has elapsed. No funds were debited. Click below to generate a fresh QR code.
                  </p>
                  <button
                    onClick={() => {
                      if (selectedPlan) handleStartCheckout(selectedPlan);
                    }}
                    className="px-4 py-2 bg-orange text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate New QR</span>
                  </button>
                </div>
              ) : orderPaymentStatus === 'success' ? (
                <div className="w-64 h-64 bg-ink border-2 border-teal rounded-sm flex flex-col items-center justify-center p-6 space-y-3 text-center animate-fade-in">
                  <CheckCircle2 className="w-14 h-14 text-teal stroke-[2.5px] animate-bounce" />
                  <p className="font-display text-2xl text-cream uppercase tracking-wide">
                    PAYMENT VERIFIED!
                  </p>
                  <p className="font-mono text-xs text-teal font-bold">
                    Your {activeQrOrder.planName} clearance is now active.
                  </p>
                </div>
              ) : (
                <div className="relative group">
                  {/* Tactical Reticle Border */}
                  <div className="p-3 bg-[#F4F0E8] border-3 border-ink rounded-sm shadow-[4px_4px_0px_#1A0B2E]">
                    <img
                      src={activeQrOrder.qrCodeUrl || activeQrOrder.qrCodeData}
                      alt="Dynamic UPI QR Code"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                  {/* Neon Corner Accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-orange"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-orange"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-orange"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-orange"></div>
                </div>
              )}

              {/* Order Reference */}
              <div className="font-mono text-[10px] text-cream/70 flex items-center gap-2">
                <span>ORDER REF:</span>
                <span className="text-cream font-bold font-mono selection:bg-orange selection:text-ink">
                  {activeQrOrder.orderId}
                </span>
              </div>
            </div>

            {/* Status & Instructions */}
            {orderPaymentStatus !== 'success' && orderPaymentStatus !== 'expired' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-2.5 bg-ink border border-ink-border flex items-center justify-between text-sun font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal animate-ping" />
                    <span>AWAITING UPI CONFIRMATION...</span>
                  </div>
                  <span className="text-[10px] text-cream/60 font-normal">Live Gateway Polling Active</span>
                </div>

                <p className="text-[11px] text-cream/80 text-center font-mono leading-relaxed">
                  Scan this QR code using any supported UPI app (Google Pay, PhonePe, Paytm, BHIM, Navi, CRED) and complete your payment.
                </p>

                {/* Mobile Intent Button */}
                {activeQrOrder.upiIntentUrl && (
                  <a
                    href={activeQrOrder.upiIntentUrl}
                    className="md:hidden w-full py-2.5 bg-sun hover:bg-sun/90 text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] flex items-center justify-center gap-2 text-center"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open in Mobile UPI App</span>
                  </a>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex gap-3">
              {orderPaymentStatus === 'success' ? (
                <button
                  onClick={() => {
                    setActiveQrOrder(null);
                    setStatusMessage({
                      text: `Upgrade confirmed! You now have active ${activeQrOrder.planName} privileges.`,
                      type: 'success',
                    });
                  }}
                  className="w-full py-3 bg-teal hover:bg-teal/90 text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[3px_3px_0px_#1A0B2E]"
                >
                  Enter Classified Recon Hub
                </button>
              ) : (
                <button
                  onClick={() => setActiveQrOrder(null)}
                  className="w-full py-2 bg-ink hover:bg-ink-border text-cream font-mono text-xs uppercase font-bold border-2 border-ink"
                >
                  Cancel Payment Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. MERCHANT SETUP INCOMPLETE NOTICE MODAL */}
      {setupIncompleteNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ink-card border-3 border-orange w-full max-w-md shadow-[8px_8px_0px_#1A0B2E] p-6 space-y-4 font-body">
            <div className="flex items-center gap-2 text-orange">
              <AlertTriangle className="w-6 h-6 stroke-[2.5px]" />
              <h3 className="font-display text-2xl uppercase text-cream text-shadow-hard tracking-wide">
                {setupIncompleteNotice.title}
              </h3>
            </div>

            <div className="bg-ink p-4 border-2 border-ink space-y-2 font-mono text-xs text-cream/90 leading-relaxed">
              <p>{setupIncompleteNotice.message}</p>
              <div className="p-2 bg-[#111114] border border-ink-border text-[10px] space-y-1 text-cream/70">
                <p className="font-bold text-sun">Required Server Credentials:</p>
                <p>• RAZORPAY_KEY_ID (e.g. rzp_live_... or rzp_test_...)</p>
                <p>• RAZORPAY_KEY_SECRET</p>
                <p>• RAZORPAY_WEBHOOK_SECRET</p>
              </div>
              <p className="text-teal text-[11px]">
                VicePulse enforces real merchant payment verification. Simulation and fake activations have been permanently disabled.
              </p>
            </div>

            <button
              onClick={() => setSetupIncompleteNotice(null)}
              className="w-full py-2.5 bg-orange hover:bg-orange-hover text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 6. CANCEL SUBSCRIPTION CONFIRMATION MODAL */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-none animate-fadeIn">
          <div className="bg-ink-card border-3 border-ink w-full max-w-md shadow-[6px_6px_0px_#1A0B2E] p-6 space-y-4 font-body">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5 stroke-[2.5px]" />
              <h3 className="font-display text-2xl uppercase text-cream text-shadow-hard">CANCEL MEMBERSHIP?</h3>
            </div>
            <p className="text-xs text-cream/80 leading-relaxed font-body">
              Are you sure you want to cancel? You will keep full access to classified overlays and telemetry filters until the end of your billing cycle on{' '}
              <strong>{subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</strong>.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-ink text-cream border-2 border-ink font-mono text-xs uppercase font-bold"
              >
                Keep Active
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-cream font-mono text-xs uppercase font-black border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
