'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './page.module.css';

interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    size?: string;
    image?: string;
    sku?: string;
}

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    status: string;
    paymentStatus: string;
    paymentId?: string;
    razorpayOrderId?: string;
    pricing: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    items: OrderItem[];
    shippingAddress: {
        firstName: string;
        lastName: string;
        address: string;
        apartment?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone?: string;
    };
    trackingNumber?: string;
    carrier?: string;
    internalNotes?: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'processing', label: 'Processing', color: '#3b82f6' },
    { value: 'ready_to_ship', label: 'Ready to Ship', color: '#8b5cf6' },
    { value: 'shipped', label: 'Shipped', color: '#06b6d4' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: '#0ea5e9' },
    { value: 'delivered', label: 'Delivered', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
    { value: 'refunded', label: 'Refunded', color: '#6b7280' },
];

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const orderRef = doc(db, 'orders', orderId);
            const orderSnap = await getDoc(orderRef);

            if (orderSnap.exists()) {
                const data = { id: orderSnap.id, ...orderSnap.data() } as Order;
                setOrder(data);
                setSelectedStatus(data.status);
                setTrackingNumber(data.trackingNumber || '');
                setCarrier(data.carrier || '');
                setInternalNotes(data.internalNotes || '');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            setMessage({ type: 'error', text: 'Failed to load order details' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!order) return;

        try {
            setSaving(true);
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: selectedStatus,
                trackingNumber: trackingNumber || null,
                carrier: carrier || null,
                internalNotes: internalNotes || null,
                updatedAt: new Date(),
            });

            setMessage({ type: 'success', text: 'Order updated successfully' });
            fetchOrder();
        } catch (error) {
            console.error('Error updating order:', error);
            setMessage({ type: 'error', text: 'Failed to update order' });
        } finally {
            setSaving(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getStatusColor = (status: string) => {
        return statusOptions.find(s => s.value === status)?.color || '#888888';
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <span>Loading order details...</span>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <h3>Order not found</h3>
                    <p>This order may have been deleted or doesn't exist.</p>
                    <Link href="/admin/orders" className={styles.backBtn}>
                        ← Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/admin/orders" className={styles.backLink}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Orders
                </Link>
                <div className={styles.headerMain}>
                    <div className={styles.headerInfo}>
                        <h1 className={styles.title}>
                            Order <span className={styles.orderId}>#{orderId.substring(0, 8).toUpperCase()}</span>
                        </h1>
                        <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                    </div>
                    <span
                        className={styles.statusBadgeLarge}
                        style={{ backgroundColor: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}
                    >
                        {statusOptions.find(s => s.value === order.status)?.label || order.status}
                    </span>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)}>×</button>
                </div>
            )}

            <div className={styles.grid}>
                {/* Left Column - Order Details */}
                <div className={styles.mainColumn}>
                    {/* Customer Info Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Customer</h2>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.customerInfo}>
                                <div className={styles.customerAvatar}>
                                    {order.customerName?.charAt(0).toUpperCase() || 'C'}
                                </div>
                                <div className={styles.customerDetails}>
                                    <span className={styles.customerName}>{order.customerName || 'N/A'}</span>
                                    <a href={`mailto:${order.customerEmail}`} className={styles.customerEmail}>
                                        {order.customerEmail}
                                    </a>
                                    <a href={`tel:${order.customerPhone}`} className={styles.customerPhone}>
                                        {order.customerPhone}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Items ({order.items?.length || 0})</h2>
                        </div>
                        <div className={styles.itemsList}>
                            {order.items?.map((item, index) => (
                                <div key={index} className={styles.item}>
                                    <div className={styles.itemImage}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} />
                                        ) : (
                                            <div className={styles.imagePlaceholder}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21,15 16,10 5,21" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <div className={styles.itemMeta}>
                                            {item.sku && <span>SKU: {item.sku}</span>}
                                            {item.size && <span>Size: {item.size}</span>}
                                            <span>Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                    <div className={styles.itemPrice}>
                                        <span className={styles.pricePerUnit}>{formatPrice(item.price)} each</span>
                                        <span className={styles.priceTotal}>{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pricing Summary */}
                        <div className={styles.pricingSummary}>
                            <div className={styles.pricingRow}>
                                <span>Subtotal</span>
                                <span>{formatPrice(order.pricing?.subtotal || 0)}</span>
                            </div>
                            <div className={styles.pricingRow}>
                                <span>Shipping</span>
                                <span>{order.pricing?.shipping === 0 ? 'Free' : formatPrice(order.pricing?.shipping || 0)}</span>
                            </div>
                            <div className={styles.pricingRow}>
                                <span>GST (18%)</span>
                                <span>{formatPrice(order.pricing?.tax || 0)}</span>
                            </div>
                            <div className={`${styles.pricingRow} ${styles.pricingTotal}`}>
                                <span>Total</span>
                                <span>{formatPrice(order.pricing?.total || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Shipping Address</h2>
                        </div>
                        <div className={styles.cardBody}>
                            <address className={styles.address}>
                                <strong>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</strong><br />
                                {order.shippingAddress?.address}
                                {order.shippingAddress?.apartment && <>, {order.shippingAddress.apartment}</>}<br />
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                                {order.shippingAddress?.country}
                                {order.shippingAddress?.phone && (
                                    <>
                                        <br />
                                        <a href={`tel:${order.shippingAddress.phone}`}>{order.shippingAddress.phone}</a>
                                    </>
                                )}
                            </address>
                        </div>
                    </div>
                </div>

                {/* Right Column - Actions */}
                <div className={styles.sidebar}>
                    {/* Payment Info */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Payment</h2>
                            <span
                                className={styles.paymentBadge}
                                style={{
                                    backgroundColor: order.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                    color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'
                                }}
                            >
                                {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                            </span>
                        </div>
                        <div className={styles.cardBody}>
                            {order.paymentId && (
                                <div className={styles.paymentDetail}>
                                    <span className={styles.paymentLabel}>Payment ID</span>
                                    <span className={styles.paymentValue}>{order.paymentId}</span>
                                </div>
                            )}
                            {order.razorpayOrderId && (
                                <div className={styles.paymentDetail}>
                                    <span className={styles.paymentLabel}>Razorpay Order</span>
                                    <span className={styles.paymentValue}>{order.razorpayOrderId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Update Status */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Update Order</h2>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.formGroup}>
                                <label>Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className={styles.select}
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Carrier</label>
                                <select
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="">Select carrier</option>
                                    <option value="Delhivery">Delhivery</option>
                                    <option value="BlueDart">BlueDart</option>
                                    <option value="DTDC">DTDC</option>
                                    <option value="FedEx">FedEx</option>
                                    <option value="DHL">DHL</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Tracking Number</label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Enter tracking number"
                                    className={styles.input}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Internal Notes</label>
                                <textarea
                                    value={internalNotes}
                                    onChange={(e) => setInternalNotes(e.target.value)}
                                    placeholder="Add notes about this order..."
                                    rows={3}
                                    className={styles.textarea}
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={styles.saveBtn}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
