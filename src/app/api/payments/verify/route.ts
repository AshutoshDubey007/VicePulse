import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/service';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  orderId: z.string().min(3, 'Order ID is required'),
  paymentId: z.string().min(3, 'Payment ID is required'),
  signature: z.string().min(10, 'Payment signature is required'),
  userId: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = verifyPaymentSchema.parse(body);

    const userId = validated.userId || 'usr-1';

    const result = await paymentService.verifyAndActivateSubscription({
      orderId: validated.orderId,
      paymentId: validated.paymentId,
      signature: validated.signature,
      userId,
      paymentMethod: validated.paymentMethod,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Server signature verification rejected payment.',
          verified: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      subscription: result.subscription,
      message: 'Subscription activated successfully.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[API verify payment error]', error);
    return NextResponse.json(
      { error: error.message || 'Error executing payment signature verification.' },
      { status: 500 }
    );
  }
}
