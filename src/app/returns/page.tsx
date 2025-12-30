'use client';

import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';

export default function ReturnsPage() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <span className={styles.eyebrow}>Client Care</span>
                        <h1 className={styles.title}>Returns & Exchanges</h1>
                        <p className={styles.date}>Effective Date: January 2025</p>
                    </header>

                    <div className={styles.content}>
                        <section className={styles.section}>
                            <h2>Our Philosophy</h2>
                            <p>
                                At Houses of Medusa, we curate the finest pieces from the world's most prestigious maisons. We understand that occasionally, a piece may not meet your exact requirements. Our return policy is designed to be as seamless and respectful as the service we provide.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>Return Window</h2>
                            <p>
                                We accept returns for a full refund or exchange within <span className={styles.highlight}>2 days of delivery</span>. Due to the exclusive and limited nature of our inventory (sourced from factory outlets), prompt returns ensure fairness to our waiting list of clients.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>Condition of Items</h2>
                            <p>
                                To be eligible for a return, your item must be in the same condition that you received it:
                            </p>
                            <ul>
                                <li>Unworn, unused, and unwashed</li>
                                <li>Original tags must be attached and intact</li>
                                <li>In the original packaging (box, dust bag, etc.)</li>
                                <li>Receipt or proof of purchase included</li>
                            </ul>
                            <p>
                                Items that do not meet these criteria will not be accepted and will be sent back to you at your expense.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>How to Initiate a Return</h2>
                            <p>
                                1. <strong>Contact Concierge:</strong> Email us at concierge@housesofmedusa.com with your order number and reason for return.
                                <br />
                                2. <strong>Verification:</strong> Our team will authorize the return and provide you with a shipping label.
                                <br />
                                3. <strong>Shipment:</strong> Pack the item securely and drop it off at the designated carrier location within 24 hours of receiving the label.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>Refunds</h2>
                            <p>
                                Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
                            </p>
                            <p>
                                If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment within 5-10 business days.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>Non-Returnable Items</h2>
                            <p>
                                Certain types of items cannot be returned, including:
                            </p>
                            <ul>
                                <li>Personalized or custom-ordered items</li>
                                <li>Intimate apparel and swimwear</li>
                                <li>Timepieces that have been adjusted</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
