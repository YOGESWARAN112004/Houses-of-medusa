'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const collectionsSnap = await getDocs(query(collection(db, 'collections')));
                setCollections(collectionsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Collection[]);
            } catch (error) {
                console.error('Error fetching collections:', error);
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
                        <span className={styles.eyebrow}>Curated Volumes</span>
                        <h1 className={styles.title}>All Collections</h1>
                        <p className={styles.description}>
                            Explore our distinct compilations of luxury, each telling a unique story of craftsmanship and heritage.
                        </p>
                    </header>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gold-muted)' }}>Loading Collections...</div>
                    ) : (
                        <div className={styles.grid}>
                            {collections.map((coll) => (
                                <Link key={coll.id} href={`/collections/${coll.slug}`} className={styles.card}>
                                    <div className={styles.imageContainer}>
                                        {coll.image ? (
                                            <Image
                                                src={coll.image}
                                                alt={coll.name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className={styles.placeholder}>
                                                <span>{coll.name.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.overlay}>
                                        <h3 className={styles.cardTitle}>{coll.name}</h3>
                                        <p className={styles.cardDesc}>{coll.description}</p>
                                        <span className={styles.viewBtn}>
                                            Explore Collection
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                            {collections.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    No collections found.
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
