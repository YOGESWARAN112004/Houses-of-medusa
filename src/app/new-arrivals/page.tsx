'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    brandId: string;
    categoryId: string;
    images: string[];
    tags?: string[];
    visibility: string;
    createdAt?: any; // Timestamp or string
}

interface Category {
    id: string;
    name: string;
}

export default function NewArrivalsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch categories
            const categoriesSnap = await getDocs(collection(db, 'categories'));
            setCategories(categoriesSnap.docs.map(d => ({ id: d.id, name: d.data().name })));

            // Fetch products (only live ones)
            // Ideally we would order by createdAt desc here, but we'll do client side to avoid index issues for now
            const productsSnap = await getDocs(
                query(collection(db, 'products'), where('visibility', '==', 'live'))
            );
            setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getProductDate = (p: Product) => {
        if (!p.createdAt) return 0;
        if (p.createdAt.seconds) return p.createdAt.seconds * 1000; // Firestore Timestamp
        if (typeof p.createdAt === 'string') return new Date(p.createdAt).getTime();
        return 0;
    };

    const filteredProducts = products
        .filter(p => selectedCategory === 'all' || p.categoryId === selectedCategory)
        .sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'newest') {
                return getProductDate(b) - getProductDate(a);
            }
            // For 'featured' or default, we can still fall back to newest or keep original
            return 0;
        });

    return (
        <>
            <Header />

            <main className={styles.main}>
                {/* Page Header */}
                <section className={styles.pageHeader}>
                    <span className={styles.eyebrow}>Just Arrived</span>
                    <h1>New Arrivals</h1>
                    <p>The latest additions to our exclusive collection</p>
                </section>

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}>Category</span>
                        <div className={styles.filterOptions}>
                            <button
                                className={`${styles.filterBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}>Sort</span>
                        <select
                            className={styles.filterSelect}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest</option>
                            <option value="featured">Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className={styles.loading}>Loading new arrivals...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No new arrivals at the moment.</p>
                        <p>Check back soon!</p>
                    </div>
                ) : (
                    <div className={styles.productsGrid}>
                        {filteredProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug}`}
                                className={styles.productCard}
                            >
                                <div className={styles.productImage}>
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className={styles.productPlaceholder}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <polyline points="21,15 16,10 5,21" />
                                            </svg>
                                        </div>
                                    )}
                                    {product.tags && product.tags.length > 0 && (
                                        <div className={styles.productTags}>
                                            {product.tags.map((tag, i) => (
                                                <span key={i} className={styles.productTag}>{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className={styles.productOverlay}>
                                        <span className={styles.productViewBtn}>View Details</span>
                                    </div>
                                </div>
                                <div className={styles.productContent}>
                                    <span className={styles.productBrand}>{product.brandId}</span>
                                    <h3 className={styles.productName}>{product.name}</h3>
                                    <div className={styles.productPrice}>
                                        <span className={styles.price}>{formatPrice(product.price)}</span>
                                        {product.compareAtPrice && (
                                            <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </>
    );
}
