'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { attributeOrderToAffiliate } from '@/hooks';
import Script from 'next/script';
import Header from '@/components/storefront/Header';
import styles from './page.module.css';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CartItem {
    productId: string;
    productName: string;
    brandName: string;
    price: number;
    size: string;
    quantity: number;
}

export default function CheckoutPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: '',
    });

    useEffect(() => {
        const cart = localStorage.getItem('medusa-cart');
        if (cart) {
            const parsed = JSON.parse(cart);
            setCartItems(parsed.items || []);
        }
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 10000 ? 0 : 500;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
        }
    };

    const initializeRazorpay = async () => {
        setIsProcessing(true);
        setPaymentError(null);

        try {
            // 1. Create order on backend (Firestore + Razorpay)
            // We need to send full details to create the pending order
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cartItems,
                    shippingAddress: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        address: formData.address,
                        apartment: formData.apartment,
                        city: formData.city,
                        state: formData.state,
                        postalCode: formData.postalCode,
                        country: formData.country,
                        phone: formData.phone
                    },
                    customerEmail: formData.email,
                    customerName: `${formData.firstName} ${formData.lastName}`,
                    customerPhone: formData.phone
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create order');
            }

            // data.data contains: orderId (Firestore), razorpayOrderId, amount, currency
            const { orderId: firestoreOrderId, razorpayOrderId, amount, currency } = data.data;

            // Check if Razorpay key is configured
            const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
            if (!razorpayKey) {
                throw new Error('Payment gateway not configured. Please contact support.');
            }


            // 2. Initialize Razorpay checkout
            const options = {
                key: razorpayKey,
                amount: amount,
                currency: currency,
                name: 'Houses of Medusa',
                description: 'Luxury Purchase',
                order_id: razorpayOrderId,
                handler: async function (response: any) {
                    // 3. Verify payment on backend
                    const verifyResponse = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            firestore_order_id: firestoreOrderId // Important for updating status
                        }),
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.success) {
                        // Attribute order to affiliate if applicable
                        await attributeOrderToAffiliate(
                            firestoreOrderId, // Use system ID
                            `HOM-${Date.now()}`,
                            total
                        );
                        // Clear cart and redirect
                        localStorage.removeItem('medusa-cart');
                        window.location.href = '/checkout/success?order_id=' + firestoreOrderId;
                    } else {
                        setPaymentError('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone,
                },
                notes: {
                    address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.postalCode}`,
                    firestore_order_id: firestoreOrderId
                },
                theme: {
                    color: '#c9a86c',
                    backdrop_color: 'rgba(13, 20, 33, 0.95)',
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

            razorpay.on('payment.failed', function (response: any) {
                setPaymentError(response.error.description);
                setIsProcessing(false);
            });

        } catch (error: any) {
            console.error('Payment error:', error);
            setPaymentError(error.message || 'Failed to initialize payment. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
        } else {
            initializeRazorpay();
        }
    };

    return (
        <>
            {/* Load Razorpay Script */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
            />

            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Left - Form */}
                    <div className={styles.formSection}>
                        <Link href="/cart" className={styles.backLink}>
                            ← Return to bag
                        </Link>

                        <h1 className={styles.title}>Private Checkout</h1>
                        <p className={styles.subtitle}>Your piece is reserved. Complete your order with discretion.</p>

                        {/* Progress Steps */}
                        <div className={styles.steps}>
                            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                                <span>1</span> Information
                            </div>
                            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                                <span>2</span> Shipping
                            </div>
                            <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
                                <span>3</span> Payment
                            </div>
                        </div>

                        {paymentError && (
                            <div className={styles.errorMessage}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                <span>{paymentError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {step === 1 && (
                                <div className={styles.formStep}>
                                    <h2>Contact Information</h2>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="your@email.com"
                                        />
                                    </div>

                                    <h2>Shipping Address</h2>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="firstName">First Name</label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="lastName">Last Name</label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="address">Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="apartment">Apartment, suite, etc. (optional)</label>
                                        <input
                                            type="text"
                                            id="apartment"
                                            name="apartment"
                                            value={formData.apartment}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="city">City</label>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="state">State</label>
                                            <input
                                                type="text"
                                                id="state"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="postalCode">PIN Code</label>
                                            <input
                                                type="text"
                                                id="postalCode"
                                                name="postalCode"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone">Phone (for delivery)</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="+91"
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className={styles.formStep}>
                                    <h2>Shipping Method</h2>

                                    <div className={styles.shippingOptions}>
                                        <label className={styles.shippingOption}>
                                            <input type="radio" name="shipping" value="standard" defaultChecked />
                                            <div className={styles.optionContent}>
                                                <div>
                                                    <strong>Discreet Standard Delivery</strong>
                                                    <span>5-7 business days</span>
                                                </div>
                                                <span className={styles.optionPrice}>
                                                    {shipping === 0 ? 'Complimentary' : formatPrice(shipping)}
                                                </span>
                                            </div>
                                        </label>

                                        <label className={styles.shippingOption}>
                                            <input type="radio" name="shipping" value="express" />
                                            <div className={styles.optionContent}>
                                                <div>
                                                    <strong>Express Private Delivery</strong>
                                                    <span>2-3 business days</span>
                                                </div>
                                                <span className={styles.optionPrice}>{formatPrice(1000)}</span>
                                            </div>
                                        </label>

                                        <label className={styles.shippingOption}>
                                            <input type="radio" name="shipping" value="overnight" />
                                            <div className={styles.optionContent}>
                                                <div>
                                                    <strong>Overnight White Glove</strong>
                                                    <span>Next business day</span>
                                                </div>
                                                <span className={styles.optionPrice}>{formatPrice(2000)}</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div className={styles.shippingNote}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        <span>All shipments are discreetly packaged with no external branding</span>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className={styles.formStep}>
                                    <h2>Payment</h2>

                                    <div className={styles.razorpayInfo}>
                                        <div className={styles.paymentLogo}>
                                            <svg viewBox="0 0 122 30" width="120" fill="currentColor">
                                                <path d="M122 24.5V27H119.1V24.5H122ZM119.1 6.5V22H116.1V6.5H119.1Z" />
                                                <path d="M109.7 22.3C108.5 22.3 107.4 22 106.7 21.3C105.9 20.6 105.5 19.5 105.5 17.9V10.7H102.9V8.1H105.5V4.2L108.5 3.3V8.1H112.4V10.7H108.5V17.6C108.5 18.5 108.7 19.1 109 19.5C109.4 19.9 109.9 20.1 110.6 20.1C111.2 20.1 111.9 19.9 112.4 19.6V22C111.6 22.2 110.7 22.3 109.7 22.3Z" />
                                                <path d="M99.8 22H96.8V8.1H99.8V22ZM98.3 5.8C97.7 5.8 97.2 5.6 96.8 5.2C96.4 4.8 96.2 4.3 96.2 3.8C96.2 3.2 96.4 2.7 96.8 2.4C97.2 2 97.7 1.8 98.3 1.8C98.9 1.8 99.4 2 99.8 2.4C100.2 2.7 100.4 3.2 100.4 3.8C100.4 4.3 100.2 4.8 99.8 5.2C99.4 5.6 98.9 5.8 98.3 5.8Z" />
                                                <path d="M91.5 22L87.1 15.1H86.5V22H83.5V2.6H86.5V12.5H87.1L91.2 8.1H95L89.5 14.5L95.3 22H91.5Z" />
                                                <path d="M62.6 22V8.1H65.5V10.3C66 9.5 66.6 8.9 67.4 8.5C68.1 8.1 69 7.9 69.9 7.9C71.3 7.9 72.5 8.3 73.3 9.2C74.2 10.1 74.6 11.4 74.6 13V22H71.6V13.5C71.6 12.5 71.4 11.7 70.9 11.2C70.5 10.7 69.8 10.4 69 10.4C68.2 10.4 67.4 10.7 66.8 11.3C66.2 11.9 65.6 12.8 65.6 14.1V22H62.6Z" />
                                            </svg>
                                        </div>
                                        <p>You will be redirected to Razorpay's secure payment gateway</p>
                                    </div>

                                    <div className={styles.paymentMethods}>
                                        <span>Accepted Payment Methods:</span>
                                        <div className={styles.paymentIcons}>
                                            <span>💳 Cards</span>
                                            <span>🏦 Net Banking</span>
                                            <span>📱 UPI</span>
                                            <span>💰 Wallets</span>
                                        </div>
                                    </div>

                                    <div className={styles.securityNote}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        <span>256-bit SSL encrypted payment. Your data is secure.</span>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.submitBtn}`}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : step < 3 ? 'Continue' : `Pay ${formatPrice(total)}`}
                            </button>
                        </form>
                    </div>

                    {/* Right - Order Summary */}
                    <div className={styles.summarySection}>
                        <h2>Order Summary</h2>

                        <div className={styles.summaryItems}>
                            {cartItems.map((item) => (
                                <div key={`${item.productId}-${item.size}`} className={styles.summaryItem}>
                                    <div className={styles.itemImage}>
                                        <div className={styles.placeholder}>
                                            <span>{item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemBrand}>{item.brandName}</span>
                                        <span className={styles.itemName}>{item.productName}</span>
                                        <span className={styles.itemSize}>Size: {item.size}</span>
                                    </div>
                                    <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summaryTotals}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>GST (18%)</span>
                                <span>{formatPrice(tax)}</span>
                            </div>
                            <div className={styles.summaryTotal}>
                                <span>Total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
