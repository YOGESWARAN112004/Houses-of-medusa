import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {/* Top Section */}
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <Image
                            src="/logo.png"
                            alt="Houses of Medusa"
                            width={100}
                            height={80}
                        />
                        <p className={styles.tagline}>
                            "We don't sell fashion.<br />We sell status."
                        </p>
                    </div>

                    <div className={styles.links}>
                        <div className={styles.column}>
                            <h4>Discover</h4>
                            <Link href="/collections">Collections</Link>
                            <Link href="/brands">Maisons</Link>
                            <Link href="/products">Shop All</Link>
                            <Link href="/new-arrivals">New Arrivals</Link>
                        </div>

                        <div className={styles.column}>
                            <h4>Categories</h4>
                            <Link href="/products?category=clothing">Clothing</Link>
                            <Link href="/products?category=handbags">Handbags</Link>
                            <Link href="/products?category=watches">Timepieces</Link>
                            <Link href="/products?category=accessories">Accessories</Link>
                        </div>

                        <div className={styles.column}>
                            <h4>The House</h4>
                            <Link href="/about">Our Story</Link>
                            <Link href="/authenticity">Authenticity</Link>
                            <Link href="/contact">Contact</Link>
                            <Link href="/faq">FAQ</Link>
                        </div>

                        <div className={styles.column}>
                            <h4>Legal</h4>
                            <Link href="/privacy">Privacy Policy</Link>
                            <Link href="/terms">Terms of Service</Link>
                            <Link href="/shipping">Shipping</Link>
                            <Link href="/returns">Returns</Link>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className={styles.divider}></div>

                {/* Bottom Section */}
                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Houses of Medusa. All rights reserved.
                    </p>

                    <div className={styles.trust}>
                        <span className={styles.trustBadge}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M9 12l2 2 4-4" />
                            </svg>
                            Verified Authenticity
                        </span>
                        <span className={styles.trustBadge}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            Secure Payment
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
