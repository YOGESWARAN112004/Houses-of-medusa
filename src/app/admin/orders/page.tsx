'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './page.module.css';

interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    status: string;
    paymentStatus: string;
    pricing: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    createdAt: Timestamp;
    paymentId?: string;
}

const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    ready_to_ship: '#8b5cf6',
    shipped: '#06b6d4',
    delivered: '#10b981',
    cancelled: '#ef4444',
    refunded: '#6b7280',
};

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    ready_to_ship: 'Ready to Ship',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];

            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
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
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = searchQuery === '' ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getItemCount = (order: Order) => {
        return order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    };

    return (
        <div className={styles.container}>
            {/* Page Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Orders</h1>
                    <p className={styles.subtitle}>Manage and track customer orders</p>
                </div>
                <button onClick={fetchOrders} className={styles.refreshBtn} disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #c9a86c 0%, #a07c4a 100%)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{orders.length}</span>
                        <span className={styles.statLabel}>Total Orders</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{orders.filter(o => o.status === 'processing').length}</span>
                        <span className={styles.statLabel}>Processing</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <rect x="1" y="3" width="15" height="13" />
                            <polygon points="16,8 20,8 23,11 23,16 16,16" />
                            <circle cx="5.5" cy="18.5" r="2.5" />
                            <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{orders.filter(o => o.status === 'shipped').length}</span>
                        <span className={styles.statLabel}>Shipped</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22,4 12,14.01 9,11.01" />
                        </svg>
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{orders.filter(o => o.status === 'delivered').length}</span>
                        <span className={styles.statLabel}>Delivered</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchContainer}>
                    <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by order ID, name, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filterTabs}>
                    <button
                        className={`${styles.filterTab} ${filterStatus === 'all' ? styles.active : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.filterTab} ${filterStatus === 'pending' ? styles.active : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`${styles.filterTab} ${filterStatus === 'processing' ? styles.active : ''}`}
                        onClick={() => setFilterStatus('processing')}
                    >
                        Processing
                    </button>
                    <button
                        className={`${styles.filterTab} ${filterStatus === 'shipped' ? styles.active : ''}`}
                        onClick={() => setFilterStatus('shipped')}
                    >
                        Shipped
                    </button>
                    <button
                        className={`${styles.filterTab} ${filterStatus === 'delivered' ? styles.active : ''}`}
                        onClick={() => setFilterStatus('delivered')}
                    >
                        Delivered
                    </button>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <span>Loading orders...</span>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className={styles.emptyState}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    <h3>No orders found</h3>
                    <p>Orders will appear here once customers make purchases</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <span className={styles.orderId}>#{order.id.substring(0, 8).toUpperCase()}</span>
                                            {order.paymentId && (
                                                <span className={styles.paymentBadge}>Paid</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.customer}>
                                                <span className={styles.customerName}>{order.customerName || 'N/A'}</span>
                                                <span className={styles.customerEmail}>{order.customerEmail || '-'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.itemCount}>{getItemCount(order)} items</span>
                                        </td>
                                        <td>
                                            <span className={styles.total}>{formatPrice(order.pricing?.total || 0)}</span>
                                        </td>
                                        <td>
                                            <span
                                                className={styles.statusBadge}
                                                style={{ backgroundColor: `${statusColors[order.status]}20`, color: statusColors[order.status] }}
                                            >
                                                {statusLabels[order.status] || order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.date}>{formatDate(order.createdAt)}</span>
                                        </td>
                                        <td>
                                            <Link href={`/admin/orders/${order.id}`} className={styles.viewBtn}>
                                                View
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 18l6-6-6-6" />
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className={styles.mobileCards}>
                        {filteredOrders.map((order) => (
                            <Link href={`/admin/orders/${order.id}`} key={order.id} className={styles.orderCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardOrderInfo}>
                                        <span className={styles.cardOrderId}>#{order.id.substring(0, 8).toUpperCase()}</span>
                                        <span
                                            className={styles.statusBadge}
                                            style={{ backgroundColor: `${statusColors[order.status]}20`, color: statusColors[order.status] }}
                                        >
                                            {statusLabels[order.status] || order.status}
                                        </span>
                                    </div>
                                    <span className={styles.cardTotal}>{formatPrice(order.pricing?.total || 0)}</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.cardCustomer}>
                                        <span className={styles.customerName}>{order.customerName || 'N/A'}</span>
                                        <span className={styles.customerEmail}>{order.customerEmail || '-'}</span>
                                    </div>
                                    <div className={styles.cardMeta}>
                                        <span>{getItemCount(order)} items</span>
                                        <span>•</span>
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                </div>
                                <div className={styles.cardArrow}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
