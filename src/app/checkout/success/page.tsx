import Link from 'next/link';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';

export default function CheckoutSuccessPage() {
    return (
        <>
            <Header />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.successIcon}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22,4 12,14.01 9,11.01" />
                        </svg>
                    </div>

                    <h1>Thank You for Your Order</h1>
                    <p className={styles.subtitle}>
                        Your exclusive piece has been secured. We are preparing your order with the utmost care.
                    </p>

                    <div className={styles.orderInfo}>
                        <p>A confirmation email has been sent to your registered email address.</p>
                        <p>You will receive tracking information once your order ships.</p>
                    </div>

                    <div className={styles.actions}>
                        <Link href="/products" className="btn btn-primary">
                            Continue Shopping
                        </Link>
                        <Link href="/" className="btn btn-secondary">
                            Return Home
                        </Link>
                    </div>

                    <div className={styles.support}>
                        <p>Questions about your order?</p>
                        <a href="mailto:concierge@housesofmedusa.com">Contact our concierge team</a>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
