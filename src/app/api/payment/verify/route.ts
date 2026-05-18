/**
 * POST /api/payment/verify
 * 
 * Verifies a PayPal payment after user completes checkout.
 * In production, this calls the PayPal Capture API.
 * For MVP/demo, it marks the mock payment as captured.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Capture a PayPal order (server-side verification)
 */
async function capturePayPalOrder(accessToken: string, orderId: string): Promise<{
  captured: boolean;
  captureId?: string;
  amount?: string;
  currency?: string;
}> {
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('[PayPal Capture Failed]:', await response.text());
    return { captured: false };
  }

  const data = await response.json();
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

  if (capture && capture.status === 'COMPLETED') {
    return {
      captured: true,
      captureId: capture.id,
      amount: capture.amount?.value,
      currency: capture.amount?.currency_code,
    };
  }

  return { captured: false };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find the payment record
    const payment = await db.payment.findUnique({
      where: { paypalOrderId: orderId }
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Already captured
    if (payment.status === 'captured') {
      return NextResponse.json({
        success: true,
        data: { verified: true, orderId, alreadyCaptured: true }
      });
    }

    let verified = false;
    let captureId: string | undefined;

    // Check if using real PayPal or demo mode
    if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET && !orderId.startsWith('MOCK-')) {
      // Production: Verify with PayPal API
      const accessToken = await getPayPalAccessToken();
      const result = await capturePayPalOrder(accessToken, orderId);
      verified = result.captured;
      captureId = result.captureId;
    } else {
      // Demo mode: Auto-verify mock orders
      verified = true;
      captureId = `CAPTURE-${Date.now()}`;
    }

    if (verified) {
      // Update payment status
      await db.payment.update({
        where: { paypalOrderId: orderId },
        data: {
          status: 'captured',
          paypalCaptureId: captureId,
        }
      });

      return NextResponse.json({
        success: true,
        data: { verified: true, orderId }
      });
    } else {
      // Update payment as failed
      await db.payment.update({
        where: { paypalOrderId: orderId },
        data: { status: 'failed' }
      });

      return NextResponse.json(
        { success: false, error: 'Payment verification failed. Please try again.' },
        { status: 402 }
      );
    }
  } catch (error) {
    console.error('[Payment Verify API Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify payment';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
