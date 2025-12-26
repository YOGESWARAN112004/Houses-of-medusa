import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, shippingAddress, customerEmail, customerName, customerPhone } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid items in cart' },
                { status: 400 }
            );
        }

        // 1. Calculate totals and validate stock
        let subtotal = 0;
        const verifiedItems = [];

        for (const item of items) {
            // Fetch product to verify price and stock
            const productRef = adminDb.collection('products').doc(item.productId);
            const productSnap = await productRef.get();

            if (!productSnap.exists) {
                return NextResponse.json(
                    { success: false, error: `Product not found: ${item.productName}` },
                    { status: 400 }
                );
            }

            const productData = productSnap.data();

            if (!productData) {
                return NextResponse.json(
                    { success: false, error: `Product data invalid: ${item.productName}` },
                    { status: 400 }
                );
            }

            // Check inventory
            if (productData.inventory < item.quantity) {
                return NextResponse.json(
                    { success: false, error: `Insufficient stock for ${productData.name}. Only ${productData.inventory} left.` },
                    { status: 400 }
                );
            }

            const price = productData.price;
            subtotal += price * item.quantity;

            verifiedItems.push({
                productId: item.productId,
                variantId: item.size, // Using size as variant identifier for now
                sku: productData.sku || item.productId,
                name: productData.name,
                price: price,
                quantity: item.quantity,
                image: productData.images?.[0] || '',
                total: price * item.quantity
            });
        }

        const shipping = subtotal >= 10000 ? 0 : 500;
        const tax = Math.round(subtotal * 0.18); // 18% GST default
        const total = subtotal + shipping + tax;

        // 2. Create Order in Firestore (Pending)
        const orderData = {
            status: 'pending',
            paymentStatus: 'pending',
            customerEmail,
            customerName,
            customerPhone,
            items: verifiedItems,
            pricing: {
                subtotal,
                shipping,
                tax,
                total,
                currency: 'INR'
            },
            shippingAddress,
            billingAddress: shippingAddress, // Default to same for now
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        const orderRef = await adminDb.collection('orders').add(orderData);
        const firestoreOrderId = orderRef.id;

        // 3. Initialize Razorpay Order
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        // Demo Mode Check
        if (!keyId || !keySecret) {
            console.log('Razorpay not configured - running in demo mode');
            // Update order with demo ID
            return NextResponse.json({
                success: true,
                demo: true,
                data: {
                    orderId: firestoreOrderId, // Use Firestore ID as ref
                    razorpayOrderId: `demo_rp_${Date.now()}`,
                    amount: total,
                    currency: 'INR',
                },
            });
        }

        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(total * 100), // paise
            currency: 'INR',
            receipt: firestoreOrderId,
            notes: {
                firestoreOrderId: firestoreOrderId,
                customerEmail: customerEmail
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                orderId: firestoreOrderId,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount, // paise
                currency: razorpayOrder.currency,
            },
        });

    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}
