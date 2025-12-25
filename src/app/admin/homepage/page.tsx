'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import styles from './page.module.css';

interface HomepageData {
    hero: {
        title: string;
        subtitle: string;
        image: string;
        ctaPrimary: { text: string; link: string };
        ctaSecondary: { text: string; link: string };
    };
    announcement: {
        enabled: boolean;
        text: string;
    };
    featuredCollectionIds: string[];
    featuredProductIds: string[];
}

interface Collection {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
}

export default function HomepageEditorPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [heroData, setHeroData] = useState({
        title: "We don't sell fashion. We sell status.",
        subtitle: 'Curated luxury pieces with exclusive private pricing from verified factory outlets.',
        image: '',
        ctaPrimary: 'Explore Collection',
        ctaPrimaryLink: '/products',
        ctaSecondary: 'Our Story',
        ctaSecondaryLink: '/about',
    });

    const [announcement, setAnnouncement] = useState({
        enabled: true,
        text: 'Complimentary shipping on orders over ₹10,000 • New arrivals every week',
    });

    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch homepage data
            const homepageDoc = await getDoc(doc(db, 'homepage', 'main'));
            if (homepageDoc.exists()) {
                const data = homepageDoc.data() as HomepageData;
                setHeroData({
                    title: data.hero?.title || heroData.title,
                    subtitle: data.hero?.subtitle || heroData.subtitle,
                    image: data.hero?.image || '',
                    ctaPrimary: data.hero?.ctaPrimary?.text || 'Explore Collection',
                    ctaPrimaryLink: data.hero?.ctaPrimary?.link || '/products',
                    ctaSecondary: data.hero?.ctaSecondary?.text || 'Our Story',
                    ctaSecondaryLink: data.hero?.ctaSecondary?.link || '/about',
                });
                setAnnouncement({
                    enabled: data.announcement?.enabled ?? true,
                    text: data.announcement?.text || announcement.text,
                });
                setSelectedCollections(data.featuredCollectionIds || []);
                setSelectedProducts(data.featuredProductIds || []);
            }

            // Fetch collections
            const collectionsSnap = await getDocs(collection(db, 'collections'));
            setCollections(collectionsSnap.docs.map(d => ({ id: d.id, name: d.data().name })));

            // Fetch products
            const productsSnap = await getDocs(collection(db, 'products'));
            setProducts(productsSnap.docs.map(d => ({ id: d.id, name: d.data().name })));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setHeroData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fileName = `hero-${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `homepage/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            () => { },
            (error) => {
                console.error('Upload error:', error);
                setUploading(false);
                alert('Failed to upload image');
            },
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                setHeroData(prev => ({ ...prev, image: url }));
                setUploading(false);
            }
        );
    };

    const toggleCollection = (id: string) => {
        setSelectedCollections(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const toggleProduct = (id: string) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'homepage', 'main'), {
                hero: {
                    title: heroData.title,
                    subtitle: heroData.subtitle,
                    image: heroData.image,
                    ctaPrimary: { text: heroData.ctaPrimary, link: heroData.ctaPrimaryLink },
                    ctaSecondary: { text: heroData.ctaSecondary, link: heroData.ctaSecondaryLink },
                },
                announcement: {
                    enabled: announcement.enabled,
                    text: announcement.text,
                },
                featuredCollectionIds: selectedCollections,
                featuredProductIds: selectedProducts,
                updatedAt: serverTimestamp(),
            });
            alert('Homepage settings saved successfully!');
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save. Check console for details.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.page}><div className={styles.loading}>Loading...</div></div>;
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Homepage Editor</h1>
                    <p>Customize your storefront appearance</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Publish Changes'}
                </button>
            </header>

            <div className={styles.sectionsGrid}>
                {/* Hero Section */}
                <section className={styles.section}>
                    <h2>Hero Section</h2>

                    <div className={styles.formGroup}>
                        <label>Hero Image</label>
                        {heroData.image ? (
                            <div className={styles.imagePreview}>
                                <Image src={heroData.image} alt="Hero" width={400} height={225} style={{ objectFit: 'cover' }} />
                                <button onClick={() => setHeroData(prev => ({ ...prev, image: '' }))}>Change</button>
                            </div>
                        ) : (
                            <div className={styles.imageUpload} onClick={() => fileInputRef.current?.click()}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21,15 16,10 5,21" />
                                </svg>
                                <p>{uploading ? 'Uploading...' : 'Click to upload hero image'}</p>
                                <span>Recommended: 1920x1080px</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="title">Headline</label>
                        <input type="text" id="title" name="title" value={heroData.title} onChange={handleHeroChange} />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="subtitle">Subheadline</label>
                        <textarea id="subtitle" name="subtitle" value={heroData.subtitle} onChange={handleHeroChange} rows={3} />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="ctaPrimary">Primary Button Text</label>
                            <input type="text" id="ctaPrimary" name="ctaPrimary" value={heroData.ctaPrimary} onChange={handleHeroChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="ctaPrimaryLink">Primary Button Link</label>
                            <input type="text" id="ctaPrimaryLink" name="ctaPrimaryLink" value={heroData.ctaPrimaryLink} onChange={handleHeroChange} />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="ctaSecondary">Secondary Button Text</label>
                            <input type="text" id="ctaSecondary" name="ctaSecondary" value={heroData.ctaSecondary} onChange={handleHeroChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="ctaSecondaryLink">Secondary Button Link</label>
                            <input type="text" id="ctaSecondaryLink" name="ctaSecondaryLink" value={heroData.ctaSecondaryLink} onChange={handleHeroChange} />
                        </div>
                    </div>
                </section>

                {/* Announcement Bar */}
                <section className={styles.section}>
                    <h2>Announcement Bar</h2>

                    <div className={styles.toggleRow}>
                        <label className={styles.toggle}>
                            <input
                                type="checkbox"
                                checked={announcement.enabled}
                                onChange={(e) => setAnnouncement(prev => ({ ...prev, enabled: e.target.checked }))}
                            />
                            <span className={styles.toggleSlider}></span>
                        </label>
                        <span>Show announcement bar</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="announcementText">Announcement Text</label>
                        <input
                            type="text"
                            id="announcementText"
                            value={announcement.text}
                            onChange={(e) => setAnnouncement(prev => ({ ...prev, text: e.target.value }))}
                        />
                    </div>
                </section>

                {/* Featured Collections */}
                <section className={styles.section}>
                    <h2>Featured Collections</h2>
                    <p className={styles.sectionNote}>Select which collections appear on the homepage</p>

                    <div className={styles.collectionList}>
                        {collections.length === 0 ? (
                            <p className={styles.emptyNote}>No collections yet. Add some first.</p>
                        ) : (
                            collections.map((coll) => (
                                <div key={coll.id} className={styles.collectionItem}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCollections.includes(coll.id)}
                                        onChange={() => toggleCollection(coll.id)}
                                    />
                                    <span>{coll.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Featured Products */}
                <section className={styles.section}>
                    <h2>Featured Products</h2>
                    <p className={styles.sectionNote}>Select products to feature on homepage</p>

                    <div className={styles.productGrid}>
                        {products.length === 0 ? (
                            <p className={styles.emptyNote}>No products yet. Add some first.</p>
                        ) : (
                            products.map((product) => (
                                <div
                                    key={product.id}
                                    className={`${styles.productThumb} ${selectedProducts.includes(product.id) ? styles.selected : ''}`}
                                    onClick={() => toggleProduct(product.id)}
                                >
                                    <div className={styles.thumbImage}>
                                        {selectedProducts.includes(product.id) && <span className={styles.checkmark}>✓</span>}
                                    </div>
                                    <span>{product.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
