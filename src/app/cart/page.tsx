'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';

interface CartItem {
    productId: string;
    productName: string;
    brandName: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cart = localStorage.getItem('medusa-cart');
        if (cart) {
            const parsed = JSON.parse(cart);
            setCartItems(parsed.items || []);
        }
        setIsLoading(false);
    }, []);

    const updateQuantity = (productId: string, size: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        const updatedItems = cartItems.map(item =>
            item.productId === productId && item.size === size
                ? { ...item, quantity: newQuantity }
                : item
        );

        setCartItems(updatedItems);
        localStorage.setItem('medusa-cart', JSON.stringify({ items: updatedItems }));
    };

    const removeItem = (productId: string, size: string) => {
        const updatedItems = cartItems.filter(
            item => !(item.productId === productId && item.size === size)
        );

        setCartItems(updatedItems);
        localStorage.setItem('medusa-cart', JSON.stringify({ items: updatedItems }));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 500 ? 0 : 25;
    const total = subtotal + shipping;

    if (isLoading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className={styles.loading}>Loading...</div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Your Private Bag</h1>

                    {cartItems.length === 0 ? (
                        <div className={styles.emptyCart}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                            <h2>Your bag is empty</h2>
                            <p>Discover our curated collection of luxury pieces</p>
                            <Link href="/products" className="btn btn-primary">
                                Explore Collection
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.cartLayout}>
                            {/* Cart Items */}
                            <div className={styles.cartItems}>
                                {cartItems.map((item) => (
                                    <div key={`${item.productId}-${item.size}`} className={styles.cartItem}>
                                        <div className={styles.itemImage}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.productName} />
                                            ) : (
                                                <div className={styles.placeholder}>
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21,15 16,10 5,21" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.itemDetails}>
                                            <span className={styles.itemBrand}>{item.brandName}</span>
                                            <h3 className={styles.itemName}>{item.productName}</h3>
                                            <span className={styles.itemSize}>Size: {item.size}</span>

                                            <div className={styles.itemActions}>
                                                <div className={styles.quantityControl}>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        −
                                                    </button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}>
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    className={styles.removeBtn}
                                                    onClick={() => removeItem(item.productId, item.size)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className={styles.itemPrice}>
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className={styles.orderSummary}>
                                <h2>Order Summary</h2>

                                <div className={styles.summaryRows}>
                                    <div className={styles.summaryRow}>
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>Shipping</span>
                                        <span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
                                    </div>
                                    {subtotal < 500 && (
                                        <div className={styles.freeShippingNote}>
                                            Add {formatPrice(500 - subtotal)} more for complimentary shipping
                                        </div>
                                    )}
                                </div>

                                <div className={styles.summaryTotal}>
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>

                                <Link href="/checkout" className={`btn btn-primary ${styles.checkoutBtn}`}>
                                    Proceed to Private Checkout
                                </Link>

                                <p className={styles.reserveNote}>
                                    Your pieces are reserved for 30 minutes
                                </p>

                                <div className={styles.trustBadges}>
                                    <div className={styles.badge}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        <span>Verified Authenticity</span>
                                    </div>
                                    <div className={styles.badge}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                            <line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                        <span>Secure Payment</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
