'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './page.module.css';

interface Affiliate {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    referralCode: string;
    referralLink: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    commissionRate: number;
    totalClicks: number;
    totalOrders: number;
    totalSales: number;
    totalCommission: number;
    pendingCommission: number;
    paidCommission: number;
    instagram?: string;
    youtube?: string;
    website?: string;
    marketingPlan?: string;
    createdAt: any;
}

export default function AdminAffiliatesPage() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const fetchAffiliates = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'affiliates'));
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Affiliate[];
            setAffiliates(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        } catch (error) {
            console.error('Error fetching affiliates:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'suspended') => {
        try {
            await updateDoc(doc(db, 'affiliates', id), {
                status,
                ...(status === 'approved' ? { approvedAt: serverTimestamp() } : {}),
                updatedAt: serverTimestamp(),
            });
            setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status } : a));
            setSelectedAffiliate(null);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const updateCommission = async (id: string, rate: number) => {
        try {
            await updateDoc(doc(db, 'affiliates', id), {
                commissionRate: rate,
                updatedAt: serverTimestamp(),
            });
            setAffiliates(prev => prev.map(a => a.id === id ? { ...a, commissionRate: rate } : a));
        } catch (error) {
            console.error('Error updating commission:', error);
        }
    };

    const filteredAffiliates = affiliates.filter(a =>
        filter === 'all' || a.status === filter
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
    };

    const stats = {
        total: affiliates.length,
        pending: affiliates.filter(a => a.status === 'pending').length,
        approved: affiliates.filter(a => a.status === 'approved').length,
        totalSales: affiliates.reduce((sum, a) => sum + a.totalSales, 0),
        totalCommission: affiliates.reduce((sum, a) => sum + a.totalCommission, 0),
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Affiliates</h1>
                    <p>Manage affiliate program members</p>
                </div>
            </header>

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Affiliates</span>
                    <div className={styles.statValue}>{stats.total}</div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Pending Approval</span>
                    <div className={styles.statValue}>{stats.pending}</div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Active Affiliates</span>
                    <div className={styles.statValue}>{stats.approved}</div>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Sales Generated</span>
                    <div className={styles.statValue}>{formatCurrency(stats.totalSales)}</div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === 'pending' && stats.pending > 0 && (
                            <span className={styles.badge}>{stats.pending}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className={styles.loading}>Loading affiliates...</div>
            ) : filteredAffiliates.length === 0 ? (
                <div className={styles.empty}>No affiliates found.</div>
            ) : (
                <div className={styles.affiliatesList}>
                    {filteredAffiliates.map((affiliate) => (
                        <div key={affiliate.id} className={styles.affiliateCard}>
                            <div className={styles.affiliateInfo}>
                                <div className={styles.avatar}>
                                    {affiliate.firstName.charAt(0)}{affiliate.lastName.charAt(0)}
                                </div>
                                <div>
                                    <h3>{affiliate.firstName} {affiliate.lastName}</h3>
                                    <p>{affiliate.email}</p>
                                    <span className={styles.code}>{affiliate.referralCode}</span>
                                </div>
                            </div>

                            <div className={styles.affiliateStats}>
                                <div>
                                    <span>Orders</span>
                                    <strong>{affiliate.totalOrders}</strong>
                                </div>
                                <div>
                                    <span>Sales</span>
                                    <strong>{formatCurrency(affiliate.totalSales)}</strong>
                                </div>
                                <div>
                                    <span>Commission</span>
                                    <strong>{affiliate.commissionRate}%</strong>
                                </div>
                                <div>
                                    <span>Earned</span>
                                    <strong>{formatCurrency(affiliate.totalCommission)}</strong>
                                </div>
                            </div>

                            <div className={styles.affiliateActions}>
                                <span className={`${styles.status} ${styles[affiliate.status]}`}>
                                    {affiliate.status}
                                </span>
                                <button
                                    className={styles.viewBtn}
                                    onClick={() => setSelectedAffiliate(affiliate)}
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedAffiliate && (
                <div className={styles.modalOverlay} onClick={() => setSelectedAffiliate(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedAffiliate.firstName} {selectedAffiliate.lastName}</h2>
                            <button onClick={() => setSelectedAffiliate(null)}>×</button>
                        </div>

                        <div className={styles.modalContent}>
                            <div className={styles.detailRow}>
                                <span>Email</span>
                                <strong>{selectedAffiliate.email}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Phone</span>
                                <strong>{selectedAffiliate.phone}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Referral Code</span>
                                <strong>{selectedAffiliate.referralCode}</strong>
                            </div>
                            <div className={styles.detailRow}>
                                <span>Referral Link</span>
                                <input type="text" value={selectedAffiliate.referralLink} readOnly />
                            </div>
                            {selectedAffiliate.instagram && (
                                <div className={styles.detailRow}>
                                    <span>Instagram</span>
                                    <strong>{selectedAffiliate.instagram}</strong>
                                </div>
                            )}
                            {selectedAffiliate.youtube && (
                                <div className={styles.detailRow}>
                                    <span>YouTube</span>
                                    <strong>{selectedAffiliate.youtube}</strong>
                                </div>
                            )}
                            {selectedAffiliate.website && (
                                <div className={styles.detailRow}>
                                    <span>Website</span>
                                    <strong>{selectedAffiliate.website}</strong>
                                </div>
                            )}
                            {selectedAffiliate.marketingPlan && (
                                <div className={styles.detailFull}>
                                    <span>Marketing Plan</span>
                                    <p>{selectedAffiliate.marketingPlan}</p>
                                </div>
                            )}

                            <div className={styles.commissionEdit}>
                                <label>Commission Rate (%)</label>
                                <div className={styles.commissionInput}>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        defaultValue={selectedAffiliate.commissionRate}
                                        id="commissionInput"
                                    />
                                    <button onClick={() => {
                                        const input = document.getElementById('commissionInput') as HTMLInputElement;
                                        updateCommission(selectedAffiliate.id, Number(input.value));
                                    }}>
                                        Update
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            {selectedAffiliate.status === 'pending' && (
                                <>
                                    <button
                                        className={`btn ${styles.approveBtn}`}
                                        onClick={() => updateStatus(selectedAffiliate.id, 'approved')}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className={`btn ${styles.rejectBtn}`}
                                        onClick={() => updateStatus(selectedAffiliate.id, 'rejected')}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {selectedAffiliate.status === 'approved' && (
                                <button
                                    className={`btn ${styles.suspendBtn}`}
                                    onClick={() => updateStatus(selectedAffiliate.id, 'suspended')}
                                >
                                    Suspend
                                </button>
                            )}
                            {(selectedAffiliate.status === 'rejected' || selectedAffiliate.status === 'suspended') && (
                                <button
                                    className={`btn ${styles.approveBtn}`}
                                    onClick={() => updateStatus(selectedAffiliate.id, 'approved')}
                                >
                                    Approve
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
