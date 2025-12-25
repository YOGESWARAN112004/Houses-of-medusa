'use client';

import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';

export default function AboutPage() {
    return (
        <>
            <Header />

            <main className={styles.main}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroContent}>
                        <h1>The House</h1>
                        <p className={styles.tagline}>Where Status Meets Sophistication</p>
                    </div>
                </section>

                {/* Story Section */}
                <section className={styles.story}>
                    <div className={styles.container}>
                        <div className={styles.storyGrid}>
                            <div className={styles.storyContent}>
                                <span className={styles.label}>Our Story</span>
                                <h2>Redefining Luxury Access</h2>
                                <p>
                                    Houses of Medusa was born from a singular vision: to democratize access to the world&apos;s
                                    most coveted luxury brands without compromising on authenticity or experience.
                                </p>
                                <p>
                                    We have cultivated exclusive relationships with verified factory outlets and authorized
                                    distributors across Italy, France, and beyond. Through these partnerships, we bring you
                                    exceptional pieces at private pricing—typically reserved for industry insiders and VIP clientele.
                                </p>
                                <p>
                                    Every item in our collection is 100% authentic, sourced directly from the maisons themselves
                                    or their authorized channels. We don&apos;t just sell fashion. We curate status.
                                </p>
                            </div>
                            <div className={styles.storyImage}>
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src="/logo.png"
                                        alt="Houses of Medusa"
                                        width={300}
                                        height={240}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className={styles.values}>
                    <div className={styles.container}>
                        <span className={styles.label}>Our Pillars</span>
                        <h2>The Medusa Promise</h2>

                        <div className={styles.valuesGrid}>
                            <div className={styles.valueCard}>
                                <div className={styles.valueIcon}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        <path d="M9 12l2 2 4-4" />
                                    </svg>
                                </div>
                                <h3>100% Authentic</h3>
                                <p>Every piece verified and authenticated. Direct sourcing from authorized channels only.</p>
                            </div>

                            <div className={styles.valueCard}>
                                <div className={styles.valueIcon}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                </div>
                                <h3>Private Pricing</h3>
                                <p>Exclusive outlet rates typically reserved for industry insiders. Save up to 70% off retail.</p>
                            </div>

                            <div className={styles.valueCard}>
                                <div className={styles.valueIcon}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                </div>
                                <h3>Discreet Service</h3>
                                <p>Unmarked packaging. No external branding. Your luxury, your secret.</p>
                            </div>

                            <div className={styles.valueCard}>
                                <div className={styles.valueIcon}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                    </svg>
                                </div>
                                <h3>Curated Selection</h3>
                                <p>Hand-picked pieces from the world&apos;s most prestigious fashion houses and ateliers.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Brands Section */}
                <section className={styles.brands}>
                    <div className={styles.container}>
                        <span className={styles.label}>The Maisons</span>
                        <h2>Brands We Represent</h2>
                        <p className={styles.brandsSubtitle}>
                            From Milan to Paris, we partner with the most iconic names in luxury fashion.
                        </p>

                        <div className={styles.brandsList}>
                            {['Versace', 'Armani', 'Prada', 'Gucci', 'Dolce & Gabbana', 'Burberry'].map((brand) => (
                                <div key={brand} className={styles.brandName}>{brand}</div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className={styles.cta}>
                    <div className={styles.container}>
                        <h2>Experience The House</h2>
                        <p>Join our exclusive community and unlock private access to the world&apos;s finest luxury pieces.</p>
                        <div className={styles.ctaButtons}>
                            <Link href="/products" className="btn btn-primary">
                                Explore Collection
                            </Link>
                            <Link href="/signup" className="btn btn-secondary">
                                Become a Member
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
