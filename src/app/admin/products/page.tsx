'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './page.module.css';

interface Product {
    id: string;
    name: string;
    slug: string;
    brandId: string;
    categoryId: string;
    price: number;
    inventory: number;
    visibility: string;
    featured: boolean;
    images: string[];
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'products'));
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
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

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.brandId?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || product.visibility === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteDoc(doc(db, 'products', id));
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleBulkAction = async (action: 'live' | 'draft' | 'delete') => {
        if (action === 'delete') {
            if (!confirm(`Delete ${selectedProducts.length} products?`)) return;
            for (const id of selectedProducts) {
                await deleteDoc(doc(db, 'products', id));
            }
            setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
        } else {
            for (const id of selectedProducts) {
                await updateDoc(doc(db, 'products', id), { visibility: action });
            }
            setProducts(prev => prev.map(p =>
                selectedProducts.includes(p.id) ? { ...p, visibility: action } : p
            ));
        }
        setSelectedProducts([]);
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1>Products</h1>
                    <p>Manage your product catalog</p>
                </div>
                <Link href="/admin/products/new" className="btn btn-primary">
                    Add Product
                </Link>
            </header>

            {/* Filters Bar */}
            <div className={styles.filtersBar}>
                <div className={styles.searchWrapper}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.statusFilters}>
                    {['all', 'live', 'draft', 'archive'].map((status) => (
                        <button
                            key={status}
                            className={`${styles.statusBtn} ${selectedStatus === status ? styles.active : ''}`}
                            onClick={() => setSelectedStatus(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
                <div className={styles.bulkActions}>
                    <span>{selectedProducts.length} selected</span>
                    <button className={styles.bulkBtn} onClick={() => handleBulkAction('live')}>Set Live</button>
                    <button className={styles.bulkBtn} onClick={() => handleBulkAction('draft')}>Set Draft</button>
                    <button className={`${styles.bulkBtn} ${styles.danger}`} onClick={() => handleBulkAction('delete')}>Delete</button>
                </div>
            )}

            {/* Loading / Empty / Table */}
            {loading ? (
                <div className={styles.emptyState}>Loading products...</div>
            ) : filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    <h3>No products found</h3>
                    <p>{products.length === 0 ? 'Add your first product to get started.' : 'Try adjusting your search or filters'}</p>
                    {products.length === 0 && (
                        <Link href="/admin/products/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Add Product
                        </Link>
                    )}
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>Product</th>
                                <th>Brand</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Featured</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => toggleSelect(product.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className={styles.productCell}>
                                            <div className={styles.productImage}>
                                                {product.images?.[0] ? (
                                                    <Image src={product.images[0]} alt={product.name} width={40} height={40} style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21,15 16,10 5,21" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <Link href={`/admin/products/${product.id}`} className={styles.productName}>
                                                    {product.name}
                                                </Link>
                                                <span className={styles.productSlug}>/{product.slug}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.brandId}</td>
                                    <td>{product.categoryId}</td>
                                    <td>{formatPrice(product.price)}</td>
                                    <td>
                                        <span className={product.inventory <= 2 ? styles.lowStock : ''}>
                                            {product.inventory}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${styles[product.visibility]}`}>
                                            {product.visibility}
                                        </span>
                                    </td>
                                    <td>
                                        {product.featured && (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gold-primary)" stroke="none">
                                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                            </svg>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Link href={`/admin/products/${product.id}`} className={styles.actionBtn}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </Link>
                                            <Link href={`/products/${product.slug}`} target="_blank" className={styles.actionBtn}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                                    <polyline points="15,3 21,3 21,9" />
                                                    <line x1="10" y1="14" x2="21" y2="3" />
                                                </svg>
                                            </Link>
                                            <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(product.id)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <polyline points="3,6 5,6 21,6" />
                                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
