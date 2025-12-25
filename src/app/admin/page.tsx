'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './page.module.css';

interface Product {
    id: string;
    name: string;
    brandId: string;
    price: number;
    visibility: string;
}

interface Order {
    id: string;
    customerEmail: string;
    total: number;
    status: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        liveProducts: 0,
        totalBrands: 0,
        totalOrders: 0,
    });
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch products
            const productsSnap = await getDocs(collection(db, 'products'));
            const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
            const liveProducts = products.filter(p => p.visibility === 'live');

            // Fetch brands
            const brandsSnap = await getDocs(collection(db, 'brands'));

            // Fetch orders
            const ordersSnap = await getDocs(collection(db, 'orders'));
            const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];

            setStats({
                totalProducts: products.length,
                liveProducts: liveProducts.length,
                totalBrands: brandsSnap.docs.length,
                totalOrders: orders.length,
            });

            // Recent products (last 4)
            setRecentProducts(products.slice(-4).reverse());

            // Recent orders (last 3)
            setRecentOrders(orders.slice(-3).reverse());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back to Houses of Medusa Admin</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/products/new" className="btn btn-primary">
                        Add Product
                    </Link>
                </div>
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Products</span>
                    <div className={styles.statValue}>{loading ? '...' : stats.totalProducts}</div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Live Products</span>
                    <div className={styles.statValue}>{loading ? '...' : stats.liveProducts}</div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Active Brands</span>
                    <div className={styles.statValue}>{loading ? '...' : stats.totalBrands}</div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Orders</span>
                    <div className={styles.statValue}>{loading ? '...' : stats.totalOrders}</div>
                </div>
            </div>

            {/* Content Grid */}
            <div className={styles.contentGrid}>
                {/* Recent Products */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Recent Products</h2>
                        <Link href="/admin/products" className={styles.viewAllLink}>
                            View All
                        </Link>
                    </div>
                    <div className={styles.tableWrapper}>
                        {recentProducts.length === 0 ? (
                            <p className={styles.emptyText}>No products yet. Add your first product!</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Brand</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <Link href={`/admin/products/${product.id}`} className={styles.productLink}>
                                                    {product.name}
                                                </Link>
                                            </td>
                                            <td>{product.brandId}</td>
                                            <td>{formatPrice(product.price)}</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[product.visibility]}`}>
                                                    {product.visibility}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Recent Orders</h2>
                        <Link href="/admin/orders" className={styles.viewAllLink}>
                            View All
                        </Link>
                    </div>
                    <div className={styles.ordersList}>
                        {recentOrders.length === 0 ? (
                            <p className={styles.emptyText}>No orders yet.</p>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderInfo}>
                                        <span className={styles.orderId}>{order.id}</span>
                                        <span className={styles.orderCustomer}>{order.customerEmail}</span>
                                    </div>
                                    <div className={styles.orderMeta}>
                                        <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                                        <span className={`${styles.status} ${styles[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>Quick Actions</h2>
                    </div>
                    <div className={styles.quickActions}>
                        <Link href="/admin/products/new" className={styles.actionBtn}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Add Product</span>
                        </Link>
                        <Link href="/admin/brands" className={styles.actionBtn}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                            </svg>
                            <span>Add Brand</span>
                        </Link>
                        <Link href="/admin/collections" className={styles.actionBtn}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                            </svg>
                            <span>Add Collection</span>
                        </Link>
                        <Link href="/admin/homepage" className={styles.actionBtn}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Edit Homepage</span>
                        </Link>
                    </div>
                </div>

                {/* System Status */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>System Status</h2>
                    </div>
                    <div className={styles.statusList}>
                        <div className={styles.statusItem}>
                            <span className={styles.statusDot} style={{ background: '#22c55e' }}></span>
                            <span>Firebase Connected</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusDot} style={{ background: '#22c55e' }}></span>
                            <span>Storage Active</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusDot} style={{ background: stats.liveProducts > 0 ? '#22c55e' : '#eab308' }}></span>
                            <span>{stats.liveProducts} Live Products</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusDot} style={{ background: stats.totalBrands > 0 ? '#22c55e' : '#eab308' }}></span>
                            <span>{stats.totalBrands} Brands</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
