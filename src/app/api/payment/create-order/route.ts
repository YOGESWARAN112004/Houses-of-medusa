import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = 'INR', receipt, notes } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid amount' },
                { status: 400 }
            );
        }

        // Check if Razorpay credentials are configured
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            // Demo mode - return mock order
            console.log('Razorpay not configured - running in demo mode');
            return NextResponse.json({
                success: true,
                demo: true,
                data: {
                    orderId: `demo_order_${Date.now()}`,
                    amount: Math.round(amount * 100),
                    currency,
                },
            });
        }

        // Import Razorpay dynamically to avoid crash if not installed
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        // Amount should be in paise (smallest currency unit)
        const amountInPaise = Math.round(amount * 100);

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency,
            receipt: receipt || `order_${Date.now()}`,
            notes: notes || {},
        });

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
            },
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create order. Check Razorpay credentials.' },
            { status: 500 }
        );
    }
}
