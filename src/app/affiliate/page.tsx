'use client';

import { useState } from 'react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';

export default function AffiliateSignupPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        website: '',
        instagram: '',
        youtube: '',
        howDidYouHear: '',
        marketingPlan: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const generateReferralCode = (firstName: string, lastName: string) => {
        const base = (firstName.slice(0, 3) + lastName.slice(0, 3)).toUpperCase();
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${base}${random}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Check if email already applied
            const existingCheck = await getDocs(
                query(collection(db, 'affiliates'), where('email', '==', formData.email))
            );

            if (!existingCheck.empty) {
                setError('This email has already applied for the affiliate program.');
                setLoading(false);
                return;
            }

            const referralCode = generateReferralCode(formData.firstName, formData.lastName);
            const referralLink = `${window.location.origin}?ref=${referralCode}`;

            await addDoc(collection(db, 'affiliates'), {
                ...formData,
                referralCode,
                referralLink,
                status: 'pending',
                commissionRate: 10, // Default 10%
                commissionType: 'percentage',
                totalClicks: 0,
                totalOrders: 0,
                totalSales: 0,
                totalCommission: 0,
                pendingCommission: 0,
                paidCommission: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setSubmitted(true);
        } catch (err) {
            console.error('Error submitting application:', err);
            setError('Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className={styles.successCard}>
                        <div className={styles.successIcon}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                        </div>
                        <h1>Application Submitted!</h1>
                        <p>Thank you for applying to the Houses of Medusa Affiliate Program.</p>
                        <p>We will review your application and get back to you within 2-3 business days.</p>
                        <Link href="/" className="btn btn-primary">
                            Return to Homepage
                        </Link>
                    </div>
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
                    <div className={styles.hero}>
                        <span className={styles.eyebrow}>Partner with Us</span>
                        <h1>Affiliate Program</h1>
                        <p>Earn commission by sharing luxury with your audience</p>
                    </div>

                    <div className={styles.benefits}>
                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>💰</div>
                            <h3>10% Commission</h3>
                            <p>Earn on every successful referral</p>
                        </div>
                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>🔗</div>
                            <h3>Unique Link</h3>
                            <p>Get your personal referral link</p>
                        </div>
                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>📊</div>
                            <h3>Track Performance</h3>
                            <p>Real-time analytics dashboard</p>
                        </div>
                        <div className={styles.benefitCard}>
                            <div className={styles.benefitIcon}>💳</div>
                            <h3>Easy Payouts</h3>
                            <p>Monthly payments via bank/UPI</p>
                        </div>
                    </div>

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h2>Apply Now</h2>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="firstName">First Name *</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="lastName">Last Name *</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Phone *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="website">Website (optional)</label>
                            <input
                                type="url"
                                id="website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://"
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="instagram">Instagram Handle</label>
                                <input
                                    type="text"
                                    id="instagram"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="@username"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="youtube">YouTube Channel</label>
                                <input
                                    type="text"
                                    id="youtube"
                                    name="youtube"
                                    value={formData.youtube}
                                    onChange={handleChange}
                                    placeholder="Channel name"
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="howDidYouHear">How did you hear about us?</label>
                            <select
                                id="howDidYouHear"
                                name="howDidYouHear"
                                value={formData.howDidYouHear}
                                onChange={handleChange}
                            >
                                <option value="">Select...</option>
                                <option value="instagram">Instagram</option>
                                <option value="youtube">YouTube</option>
                                <option value="google">Google Search</option>
                                <option value="friend">Friend/Referral</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="marketingPlan">How do you plan to promote us? *</label>
                            <textarea
                                id="marketingPlan"
                                name="marketingPlan"
                                value={formData.marketingPlan}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Tell us about your audience and how you'll share our products..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
