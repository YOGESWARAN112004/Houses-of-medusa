'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Brand {
    id: string;
    name: string;
    slug: string;
    logo: string;
}

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandsSnap = await getDocs(query(collection(db, 'brands')));
                setBrands(brandsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Brand[]);
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <span className={styles.eyebrow}>The Houses</span>
                        <h1 className={styles.title}>Maisons</h1>
                        <p className={styles.description}>
                            We are proud to present pieces from the world's most revered luxury houses.
                        </p>
                    </header>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gold-muted)' }}>Loading Maisons...</div>
                    ) : (
                        <div className={styles.grid}>
                            {brands.map((brand) => (
                                <Link key={brand.id} href={`/brands/${brand.slug}`} className={styles.card}>
                                    <div className={styles.imageContainer}>
                                        {brand.logo ? (
                                            <Image
                                                src={brand.logo}
                                                alt={brand.name}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <div className={styles.placeholder}>
                                                <span>{brand.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className={styles.viewBtn}>View House</span>
                                </Link>
                            ))}
                            {brands.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    No brands found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
