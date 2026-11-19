import connectDB from '@/lib/mongodb';
import EngineConfig, { getEngineConfig } from '@/models/EngineConfig';

export interface TokenUsageRecord {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
}

// Pricing rates (e.g. Gemini 2.5 Flash: $0.075 per 1M input tokens, $0.30 per 1M output tokens)
const COST_PER_INPUT_TOKEN = 0.000000075;
const COST_PER_OUTPUT_TOKEN = 0.0000003;

export async function recordResourceUsage(promptTokens: number, completionTokens: number): Promise<TokenUsageRecord> {
  const totalTokens = promptTokens + completionTokens;
  const estimatedCostUSD = promptTokens * COST_PER_INPUT_TOKEN + completionTokens * COST_PER_OUTPUT_TOKEN;

  await connectDB();
  const todayStr = new Date().toISOString().split('T')[0];

  const config = await getEngineConfig();

  // Reset daily tokens if new day
  if (config.lastBudgetResetDate !== todayStr) {
    config.totalTokensUsedToday = totalTokens;
    config.estimatedCostTodayUSD = estimatedCostUSD;
    config.lastBudgetResetDate = todayStr;
  } else {
    config.totalTokensUsedToday = (config.totalTokensUsedToday || 0) + totalTokens;
    config.estimatedCostTodayUSD = (config.estimatedCostTodayUSD || 0) + estimatedCostUSD;
  }

  await config.save();

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCostUSD,
  };
}

export async function isBudgetExceeded(): Promise<boolean> {
  try {
    await connectDB();
    const config = await getEngineConfig();
    const todayStr = new Date().toISOString().split('T')[0];

    if (config.lastBudgetResetDate !== todayStr) {
      return false;
    }

    return (config.estimatedCostTodayUSD || 0) >= (config.dailyBudgetCapUSD || 5.0);
  } catch {
    return false;
  }
}

export async function getResourceTelemetry() {
  await connectDB();
  const config = await getEngineConfig();
  const todayStr = new Date().toISOString().split('T')[0];

  const isCurrentDay = config.lastBudgetResetDate === todayStr;

  return {
    tokensToday: isCurrentDay ? config.totalTokensUsedToday : 0,
    costTodayUSD: isCurrentDay ? Math.round(config.estimatedCostTodayUSD * 1000) / 1000 : 0,
    dailyBudgetCapUSD: config.dailyBudgetCapUSD || 5.0,
    budgetExceeded: isCurrentDay ? (config.estimatedCostTodayUSD || 0) >= (config.dailyBudgetCapUSD || 5.0) : false,
    enginePaused: config.researchEnginePaused,
    autoPublishEnabled: config.autoPublishEnabled,
  };
}
