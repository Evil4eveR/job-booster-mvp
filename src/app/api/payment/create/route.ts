/**
 * POST /api/payment/create
 * 
 * Creates a PayPal order for payment processing.
 * In production, this would call the PayPal Orders API.
 * For MVP/demo, it creates a record and returns an order ID.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PayPal configuration from environment
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

// Product pricing
const PRODUCT_PRICE = '4.99';
const PRODUCT_CURRENCY = 'EUR';
const PRODUCT_NAME = 'BewerbungGenie - German Application Bundle';

/**
 * Get PayPal access token using client credentials
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
 * Create a PayPal order using the Orders API
 */
async function createPayPalOrder(accessToken: string): Promise<string> {
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: PRODUCT_CURRENCY,
          value: PRODUCT_PRICE,
        },
        description: PRODUCT_NAME,
      }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('[PayPal Order Creation Failed]:', errorData);
    throw new Error('Failed to create PayPal order');
  }

  const data = await response.json();
  return data.id;
}

export async function POST(request: NextRequest) {
  try {
    let orderId: string;

    // Check if PayPal credentials are configured
    if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
      // Production flow: Create real PayPal order
      const accessToken = await getPayPalAccessToken();
      orderId = await createPayPalOrder(accessToken);
    } else {
      // Demo/Development flow: Generate a mock order ID
      orderId = `MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }

    // Store the payment record
    await db.payment.create({
      data: {
        paypalOrderId: orderId,
        status: 'created',
        amount: PRODUCT_PRICE,
        currency: PRODUCT_CURRENCY,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        amount: PRODUCT_PRICE,
        currency: PRODUCT_CURRENCY,
        clientId: PAYPAL_CLIENT_ID || null, // Send client ID for PayPal JS SDK
        isDemo: !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET,
      }
    });
  } catch (error) {
    console.error('[Payment Create API Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to create payment order';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
