import { NextResponse } from 'next/server';
import { executeAutonomousReconPipeline } from '@/lib/autonomous/pipeline';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const trigger = body.trigger || 'manual';

    const result = await executeAutonomousReconPipeline(trigger);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
