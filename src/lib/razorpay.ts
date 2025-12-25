/**
 * Razorpay configuration and utilities
 * Note: The actual Razorpay instance is created dynamically in API routes
 * to avoid crashing if credentials are not set
 */

export interface RazorpayOrderOptions {
    amount: number; // Amount in paise (INR) or smallest currency unit
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
}

export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    notes: Record<string, string>;
    created_at: number;
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
): boolean {
    const crypto = require('crypto');
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
        console.warn('RAZORPAY_KEY_SECRET not set');
        return false;
    }

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

    return expectedSignature === signature;
}

/**
 * Get Razorpay public key for frontend
 */
export function getRazorpayPublicKey(): string {
    return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
}

/**
 * Check if Razorpay is configured
 */
export function isRazorpayConfigured(): boolean {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}
