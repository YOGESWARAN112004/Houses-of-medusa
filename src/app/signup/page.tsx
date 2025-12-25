'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from '../login/page.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Update profile with name
            const displayName = `${formData.firstName} ${formData.lastName}`;
            await updateProfile(result.user, { displayName });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', result.user.uid), {
                email: formData.email,
                displayName,
                firstName: formData.firstName,
                lastName: formData.lastName,
                createdAt: new Date(),
                wishlist: [],
                addresses: [],
            });

            router.push('/');
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message?.includes('email-already-in-use')) {
                setError('An account with this email already exists');
            } else if (error.message?.includes('weak-password')) {
                setError('Password is too weak. Please use a stronger password.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.formCard}>
                        <div className={styles.logo}>
                            <Image src="/logo.png" alt="Houses of Medusa" width={87} height={70} />
                        </div>

                        <h1>Join The House</h1>
                        <p className={styles.subtitle}>Create your account for exclusive access</p>

                        {error && (
                            <div className={styles.error}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="firstName">First Name</label>
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
                                    <label htmlFor="lastName">Last Name</label>
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

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your@email.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Minimum 8 characters"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                            </div>

                            <p className={styles.terms}>
                                By creating an account, you agree to our{' '}
                                <Link href="/terms">Terms of Service</Link> and{' '}
                                <Link href="/privacy">Privacy Policy</Link>.
                            </p>

                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.submitBtn}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div className={styles.divider}>
                            <span>or</span>
                        </div>

                        <p className={styles.signupPrompt}>
                            Already have an account?{' '}
                            <Link href="/login">Sign in</Link>
                        </p>
                    </div>

                    <div className={styles.benefits}>
                        <h2>Why Join?</h2>
                        <ul>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                <span>Access to private outlet pricing - up to 70% off retail</span>
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                <span>Early access to new arrivals and exclusive drops</span>
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                <span>Save items to your wishlist for later</span>
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                <span>VIP concierge support for personalized styling</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
