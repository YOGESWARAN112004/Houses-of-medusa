'use client';

import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';

export default function FAQPage() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <span className={styles.eyebrow}>Assistance</span>
                        <h1 className={styles.title}>Frequently Asked Questions</h1>
                        <p className={styles.date}>Curated answers for our esteemed clients</p>
                    </header>

                    <div className={styles.content}>
                        <section className={styles.section}>
                            <h2>Authenticity & Sourcing</h2>
                            <ul>
                                <li>
                                    <span className={styles.question}>Are your products authentic?</span>
                                    <p className={styles.answer}>Absolutely. Every piece in our collection is sourced directly from authorized factory outlets of the respective maisons. We guarantee 100% authenticity on every item we sell.</p>
                                </li>
                                <li>
                                    <span className={styles.question}>Do items come with original packaging?</span>
                                    <p className={styles.answer}>Yes, items typically come with their original dust bags, authenticity cards, and boxes, exactly as they would be received from the boutique.</p>
                                </li>
                            </ul>
                        </section>

                        <section className={styles.section}>
                            <h2>Ordering & Shipping</h2>
                            <ul>
                                <li>
                                    <span className={styles.question}>How long does shipping take?</span>
                                    <p className={styles.answer}>Because we source from international locations to secure the best pricing, standard shipping takes 15-21 business days. We appreciate your patience as we ensure secure and insured delivery.</p>
                                </li>
                                <li>
                                    <span className={styles.question}>Do you ship internationally?</span>
                                    <p className={styles.answer}>Currently, we specialize in serving our clients within India. We are expanding our global footprint soon.</p>
                                </li>
                            </ul>
                        </section>

                        <section className={styles.section}>
                            <h2>Returns & Care</h2>
                            <ul>
                                <li>
                                    <span className={styles.question}>What is your return policy?</span>
                                    <p className={styles.answer}>Returns are accepted within 2 days of delivery. Items must be in pristine, unworn condition. Please see our Returns page for full details.</p>
                                </li>
                                <li>
                                    <span className={styles.question}>Do you offer repairs?</span>
                                    <p className={styles.answer}>We do not offer in-house repair services. We recommend contacting the respective brand's boutique for any service needs, as your item is an authentic product.</p>
                                </li>
                            </ul>
                        </section>

                        <section className={styles.section}>
                            <p>For any other inquiries, please contact our Concierge at <span className={styles.highlight}>concierge@housesofmedusa.com</span>.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
