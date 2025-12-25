'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

    return (
        <>
            <header
                className={`${styles.header} ${scrolled ? styles.scrolled : ''} ${transparent && !scrolled ? styles.transparent : ''}`}
            >
                <div className={styles.container}>
                    {/* Left Navigation */}
                    <nav className={styles.navLeft}>
                        <Link href="/collections" className={styles.navLink}>
                            Collections
                        </Link>
                        <Link href="/brands" className={styles.navLink}>
                            Maisons
                        </Link>
                        <Link href="/products" className={styles.navLink}>
                            Shop
                        </Link>
                    </nav>

                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <Image
                            src="/logo.png"
                            alt="Houses of Medusa"
                            width={62}
                            height={50}
                            priority
                        />
                        <span className={styles.brandName}>Houses of Medusa</span>
                    </Link>

                    {/* Right Navigation */}
                    <nav className={styles.navRight}>
                        <Link href="/about" className={styles.navLink}>
                            The House
                        </Link>
                        <Link href="/login" className={styles.navLink}>
                            Account
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
                            className={styles.menuBtn}
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <span></span>
                            <span></span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
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

                <nav className={styles.mobileNav}>
                    <Link href="/collections" onClick={() => setMenuOpen(false)}>Collections</Link>
                    <Link href="/brands" onClick={() => setMenuOpen(false)}>Maisons</Link>
                    <Link href="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
                    <Link href="/about" onClick={() => setMenuOpen(false)}>The House</Link>
                    <Link href="/cart" onClick={() => setMenuOpen(false)}>Shopping Bag</Link>
                </nav>

                <div className={styles.mobileFooter}>
                    <p className="text-accent">"We don't sell fashion. We sell status."</p>
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
