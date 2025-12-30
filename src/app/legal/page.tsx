'use client';

import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';
import Link from 'next/link';

export default function LegalPage() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>Legal Information</h1>
                    </header>

                    <div className={styles.content}>
                        <Link href="/privacy" className={styles.linkCard}>
                            <h2 className={styles.cardTitle}>Privacy Policy</h2>
                            <p className={styles.cardDesc}>How we collect, use, and protect your personal information.</p>
                        </Link>

                        <Link href="/terms" className={styles.linkCard}>
                            <h2 className={styles.cardTitle}>Terms of Service</h2>
                            <p className={styles.cardDesc}>The terms and conditions governing your use of our website.</p>
                        </Link>

                        <Link href="/shipping" className={styles.linkCard}>
                            <h2 className={styles.cardTitle}>Shipping Policy</h2>
                            <p className={styles.cardDesc}>Information about delivery times, methods, and costs.</p>
                        </Link>

                        <Link href="/returns" className={styles.linkCard}>
                            <h2 className={styles.cardTitle}>Returns & Exchanges</h2>
                            <p className={styles.cardDesc}>Our policy regarding returns, refunds, and exchanges.</p>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
