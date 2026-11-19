import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EngineConfig, { getEngineConfig } from '@/models/EngineConfig';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const config = await getEngineConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const config = await getEngineConfig();

    if (typeof body.researchEnginePaused === 'boolean') {
      config.researchEnginePaused = body.researchEnginePaused;
    }
    if (typeof body.autoPublishEnabled === 'boolean') {
      config.autoPublishEnabled = body.autoPublishEnabled;
    }
    if (typeof body.discoverySearchIntervalHours === 'number') {
      config.discoverySearchIntervalHours = Math.max(1, body.discoverySearchIntervalHours);
    }
    if (typeof body.redditMonitoringIntervalHours === 'number') {
      config.redditMonitoringIntervalHours = Math.max(1, body.redditMonitoringIntervalHours);
    }
    if (typeof body.queryExpansionIntervalHours === 'number') {
      config.queryExpansionIntervalHours = Math.max(1, body.queryExpansionIntervalHours);
    }
    if (typeof body.corroborationIntervalHours === 'number') {
      config.corroborationIntervalHours = Math.max(1, body.corroborationIntervalHours);
    }
    if (typeof body.dailyBudgetCapUSD === 'number') {
      config.dailyBudgetCapUSD = Math.max(0.5, body.dailyBudgetCapUSD);
    }
    if (body.enabledConnectors && typeof body.enabledConnectors === 'object') {
      config.enabledConnectors = {
        ...config.enabledConnectors,
        ...body.enabledConnectors,
      };
    }

    await config.save();

    return NextResponse.json({
      success: true,
      message: 'Engine configuration updated successfully',
      data: config,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
