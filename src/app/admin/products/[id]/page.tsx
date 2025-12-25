'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import styles from '../new/page.module.css';

// Demo product data
const getProduct = (id: string) => ({
    id,
    name: 'Midnight Serpent Clutch',
    slug: 'midnight-serpent-clutch',
    brand: 'versace',
    category: 'handbags',
    price: '1850',
    compareAtPrice: '2400',
    description: 'A masterpiece of Italian craftsmanship, the Midnight Serpent Clutch embodies the essence of power and sophistication.',
    inventory: '5',
    visibility: 'live',
    featured: true,
});

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const product = getProduct(id);

    const [formData, setFormData] = useState({
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        description: product.description,
        inventory: product.inventory,
        visibility: product.visibility,
        featured: product.featured,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        alert('Product updated! (Demo - integrate with Firestore)');
        router.push('/admin/products');
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/admin/products" className={styles.backLink}>
                    ← Back to Products
                </Link>
                <h1>Edit Product</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={styles.mainColumn}>
                        <div className={styles.card}>
                            <h2>Basic Information</h2>

                            <div className={styles.formGroup}>
                                <label htmlFor="name">Product Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="slug">URL Slug</label>
                                <div className={styles.slugInput}>
                                    <span>/products/</span>
                                    <input
                                        type="text"
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="brand">Brand *</label>
                                    <select id="brand" name="brand" value={formData.brand} onChange={handleInputChange} required>
                                        <option value="">Select Brand</option>
                                        <option value="versace">Versace</option>
                                        <option value="armani">Armani</option>
                                        <option value="prada">Prada</option>
                                        <option value="gucci">Gucci</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="category">Category *</label>
                                    <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                                        <option value="">Select Category</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="handbags">Handbags</option>
                                        <option value="watches">Watches</option>
                                        <option value="accessories">Accessories</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={6}
                                />
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2>Media</h2>
                            <div className={styles.mediaUpload}>
                                <div className={styles.uploadZone}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                        <polyline points="17,8 12,3 7,8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <p>Drag and drop images here, or click to browse</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.sideColumn}>
                        <div className={styles.card}>
                            <h2>Status</h2>
                            <div className={styles.formGroup}>
                                <label htmlFor="visibility">Visibility</label>
                                <select id="visibility" name="visibility" value={formData.visibility} onChange={handleInputChange}>
                                    <option value="draft">Draft</option>
                                    <option value="live">Live</option>
                                    <option value="archive">Archived</option>
                                </select>
                            </div>
                            <div className={styles.checkboxGroup}>
                                <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleInputChange} />
                                <label htmlFor="featured">Featured Product</label>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2>Pricing</h2>
                            <div className={styles.formGroup}>
                                <label htmlFor="price">Private Price (₹) *</label>
                                <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} required min="0" />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="compareAtPrice">Compare At Price (₹)</label>
                                <input type="number" id="compareAtPrice" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleInputChange} min="0" />
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2>Inventory</h2>
                            <div className={styles.formGroup}>
                                <label htmlFor="inventory">Stock Quantity *</label>
                                <input type="number" id="inventory" name="inventory" value={formData.inventory} onChange={handleInputChange} required min="0" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Product</button>
                </div>
            </form>
        </div>
    );
}
