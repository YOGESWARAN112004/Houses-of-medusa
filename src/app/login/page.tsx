'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message?.includes('invalid-credential')) {
                setError('Invalid email or password');
            } else if (error.message?.includes('user-not-found')) {
                setError('No account found with this email');
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

                        <h1>Welcome Back</h1>
                        <p className={styles.subtitle}>Sign in to access your private luxury experience</p>

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
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>

                            <Link href="/forgot-password" className={styles.forgotLink}>
                                Forgot your password?
                            </Link>

                            <button
                                type="submit"
                                className={`btn btn-primary ${styles.submitBtn}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className={styles.divider}>
                            <span>or</span>
                        </div>

                        <p className={styles.signupPrompt}>
                            New to Houses of Medusa?{' '}
                            <Link href="/signup">Create an account</Link>
                        </p>
                    </div>

                    <div className={styles.benefits}>
                        <h2>Member Benefits</h2>
                        <ul>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                <span>Exclusive private pricing on luxury pieces</span>
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                <span>Early access to new collections</span>
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                <span>Order history and wishlist</span>
                            </li>
                            <li>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22,4 12,14.01 9,11.01" />
                                </svg>
                                <span>Personalized recommendations</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
