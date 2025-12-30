'use client';

import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';

export default function TermsPage() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <span className={styles.eyebrow}>Legal</span>
                        <h1 className={styles.title}>Terms & Conditions</h1>
                        <p className={styles.date}>Last Updated: December 2024</p>
                    </header>

                    <div className={styles.content}>
                        <section className={styles.section}>
                            <h2>1. Introduction</h2>
                            <p>
                                Welcome to Houses of Medusa. These Terms and Conditions govern your use of our website and the purchase of products from our private collection. By accessing our site, you agree to these terms.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>2. Authenticity & Sourcing</h2>
                            <p>
                                Houses of Medusa guarantees that all products offered are 100% authentic. We source our inventory directly from verified factory outlets of prestigious luxury maisons.
                            </p>
                            <p>
                                While we are an independent retailer and not directly affiliated with the brands we sell, we stand behind the authenticity of every item. Each piece undergoes a rigorous verification process before being presented to our clients.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>3. Shipping Policy</h2>
                            <p>
                                As our inventory is sourced from international factory outlets to provide you with exceptional value, please allow for the following delivery times:
                            </p>
                            <ul>
                                <li className={styles.highlight}>Standard Shipping: 15 to 21 business days</li>
                            </ul>
                            <p>
                                We appreciate your patience. This timeframe ensures that we can handle customs, verification, and secure packaging of your luxury items. You will receive tracking information once your order has been dispatched from our facility.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>4. Returns & Refunds</h2>
                            <p>
                                We want you to be completely satisfied with your purchase. Our return policy is designed to be fair while maintaining the exclusivity and quality of our inventory.
                            </p>
                            <ul>
                                <li>
                                    <span className={styles.highlight}>Return Window:</span> You must initiate a return request within <span className={styles.highlight}>2 days of delivery</span>.
                                </li>
                                <li>
                                    <span className={styles.highlight}>Condition:</span> Items must be returned in their original, unused condition with all tags, authenticity cards, dust bags, and packaging intact.
                                </li>
                                <li>
                                    <span className={styles.highlight}>Process:</span> To initiate a return, please contact our concierge team. Returns requested after the 2-day window will not be accepted.
                                </li>
                            </ul>
                            <p>
                                Refunds will be processed to the original method of payment after the returned item has been inspected and approved by our quality control team.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>5. Pricing & Payment</h2>
                            <p>
                                All prices are listed in INR and are inclusive of relevant taxes unless stated otherwise. We reserve the right to adjust pricing without prior notice, though this will not affect orders that have already been confirmed.
                            </p>
                            <p>
                                We accept major credit cards, debit cards, and other secure payment methods. Payment must be completed at the time of order.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>6. Limitation of Liability</h2>
                            <p>
                                Houses of Medusa shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the purchase price of the product in question.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>7. Contact Us</h2>
                            <p>
                                For any questions regarding these terms, shipping, or returns, please contact our dedicated support team at:
                            </p>
                            <p>
                                Email: concierge@housesofmedusa.com<br />
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
