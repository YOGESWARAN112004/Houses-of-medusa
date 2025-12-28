'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

interface HeaderProps {
    transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load cart count from localStorage
    useEffect(() => {
        const cart = localStorage.getItem('medusa-cart');
        if (cart) {
            const parsed = JSON.parse(cart);
            setCartCount(parsed.items?.length || 0);
        }
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    return (
        <>
            <header
                className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${transparent && !scrolled ? styles.transparent : ''}`}
            >
                <div className={styles.container}>
                    {/* Left Navigation */}
                    <nav className={styles.navLeft}>
                        <Link href="/collections" className={styles.navLink}>
                            <span className={styles.navText}>Collections</span>
                        </Link>
                        <Link href="/brands" className={styles.navLink}>
                            <span className={styles.navText}>Maisons</span>
                        </Link>
                        <Link href="/products" className={styles.navLink}>
                            <span className={styles.navText}>Shop</span>
                        </Link>
                    </nav>

                    {/* Brand Name - Text Based */}
                    <Link href="/" className={styles.logo}>
                        <span className={styles.brandName}>Houses of Medusa</span>
                    </Link>

                    {/* Right Navigation */}
                    <nav className={styles.navRight}>
                        <Link href="/about" className={styles.navLink}>
                            <span className={styles.navText}>The House</span>
                        </Link>
                        <Link href="/login" className={styles.navLink}>
                            <span className={styles.navText}>Account</span>
                        </Link>
                        <button className={styles.searchBtn} aria-label="Search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        </button>
                        <Link href="/cart" className={styles.cartBtn}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                            {cartCount > 0 && (
                                <span className={styles.cartCount}>{cartCount}</span>
                            )}
                        </Link>
                        <button
                            className={`${styles.menuBtn} ${menuOpen ? styles.menuOpen : ''}`}
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
                <div className={styles.mobileMenuHeader}>
                    <span className={styles.mobileBrandName}>Houses of Medusa</span>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <nav className={styles.mobileNav}>
                    <Link href="/collections" onClick={() => setMenuOpen(false)}>
                        <span className={styles.mobileNavText}>Collections</span>
                        <span className={styles.mobileNavArrow}>→</span>
                    </Link>
                    <Link href="/brands" onClick={() => setMenuOpen(false)}>
                        <span className={styles.mobileNavText}>Maisons</span>
                        <span className={styles.mobileNavArrow}>→</span>
                    </Link>
                    <Link href="/products" onClick={() => setMenuOpen(false)}>
                        <span className={styles.mobileNavText}>Shop</span>
                        <span className={styles.mobileNavArrow}>→</span>
                    </Link>
                    <Link href="/about" onClick={() => setMenuOpen(false)}>
                        <span className={styles.mobileNavText}>The House</span>
                        <span className={styles.mobileNavArrow}>→</span>
                    </Link>
                    <Link href="/cart" onClick={() => setMenuOpen(false)}>
                        <span className={styles.mobileNavText}>Shopping Bag</span>
                        <span className={styles.mobileNavArrow}>→</span>
                    </Link>
                </nav>

                <div className={styles.mobileFooter}>
                    <p className={styles.mobileTagline}>"We don't sell fashion. We sell status."</p>
                    <div className={styles.mobileContact}>
                        <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
                        <span className={styles.mobileDivider}>•</span>
                        <Link href="/login" onClick={() => setMenuOpen(false)}>Account</Link>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            <div
                className={`${styles.overlay} ${menuOpen ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
            />
        </>
    );
}
