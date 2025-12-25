'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
    const router = useRouter();
    const { signIn, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await signIn(email, password);
            router.push('/admin');
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'Invalid credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.loginCard}>
                <div className={styles.logo}>
                    <Image src="/logo.png" alt="Houses of Medusa" width={75} height={60} />
                </div>

                <h1>Admin Access</h1>
                <p className={styles.subtitle}>Sign in to manage your luxury empire</p>

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
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@housesofmedusa.com"
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

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Protected area. Authorized personnel only.
                </p>
            </div>
        </div>
    );
}
