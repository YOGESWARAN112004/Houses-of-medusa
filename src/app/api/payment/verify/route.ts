import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, firestore_order_id } = body;

        // Note: active_order_id (Razorpay order ID) is used for signature
        // firestore_order_id is the document ID in our DB

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify the payment signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            console.error('Invalid signature for order:', razorpay_order_id);
            return NextResponse.json(
                { success: false, error: 'Invalid payment signature' },
                { status: 400 }
            );
        }

        // Fetch the order from Firestore to get items for inventory update
        // We expect firestore_order_id to be passed, but we can also search by Razorpay ID if needed
        // For simplicity, let's assume we pass firestore_order_id from frontend

        let orderRef;
        let orderData;

        if (firestore_order_id) {
            orderRef = adminDb.collection('orders').doc(firestore_order_id);
            const orderSnap = await orderRef.get();
            if (orderSnap.exists) {
                orderData = orderSnap.data();
            }
        }

        // If we found the order, proceed with updates
        if (orderRef && orderData) {

            // 1. Update Order Status
            await orderRef.update({
                status: 'processing', // Paid confirmed -> Processing
                paymentStatus: 'paid',
                paymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                updatedAt: FieldValue.serverTimestamp(),
            });

            // 2. Decrement Inventory
            const items = orderData.items || [];
            const batch = adminDb.batch();

            for (const item of items) {
                if (item.productId) {
                    const productRef = adminDb.collection('products').doc(item.productId);
                    batch.update(productRef, {
                        inventory: FieldValue.increment(-item.quantity)
                    });
                }
            }
            await batch.commit();

            return NextResponse.json({
                success: true,
                message: 'Payment verified and order updated',
                data: {
                    orderId: firestore_order_id,
                    paymentId: razorpay_payment_id,
                },
            });

        } else {
            // If we couldn't find the Fireatore order (edge case), we still verify the payment
            // but log an error that the DB update failed
            console.error('Payment verified but Order not found in Firestore:', firestore_order_id);

            return NextResponse.json({
                success: true,
                warning: 'Payment verified but order record not updated',
                data: {
                    paymentId: razorpay_payment_id,
                },
            });
        }

    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to verify payment' },
            { status: 500 }
        );
    }
}
