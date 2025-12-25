'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import styles from './page.module.css';

interface Collection {
    id: string;
    name: string;
    slug: string;
    image: string;
    description: string;
    featured: boolean;
    isActive: boolean;
    productIds: string[];
}

interface Product {
    id: string;
    name: string;
}

export default function CollectionsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        featured: false,
    });

    useEffect(() => {
        fetchCollections();
        fetchProducts();
    }, []);

    const fetchCollections = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'collections'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Collection[];
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
            })) as Product[];
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setUploading(true);
        const fileName = `${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `collections/${fileName}`);
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
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setImageUrl(downloadURL);
                setUploading(false);
            }
        );
    };

    const toggleProduct = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('Please fill in collection name');
            return;
        }

        setSaving(true);
        try {
            const collectionId = formData.slug || `collection-${Date.now()}`;
            await setDoc(doc(db, 'collections', collectionId), {
                id: collectionId,
                name: formData.name,
                slug: formData.slug,
                image: imageUrl || '/collections/default.jpg',
                description: formData.description,
                featured: formData.featured,
                isActive: true,
                productIds: selectedProducts,
                displayOrder: collections.length + 1,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setShowAddForm(false);
            setFormData({ name: '', slug: '', description: '', featured: false });
            setImageUrl('');
            setSelectedProducts([]);
            fetchCollections();
        } catch (error) {
            console.error('Error saving collection:', error);
            alert('Failed to save collection');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Collections</h1>
                    <p>Curate and organize product collections</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                    + Add Collection
                </button>
            </header>

            {/* Add Collection Modal */}
            {showAddForm && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Collection</h2>
                            <button className={styles.closeBtn} onClick={() => setShowAddForm(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <div className={styles.imageUpload}>
                                    <label>Cover Image</label>
                                    {imageUrl ? (
                                        <div className={styles.imagePreview}>
                                            <Image src={imageUrl} alt="Cover" width={200} height={120} style={{ objectFit: 'cover' }} />
                                            <button type="button" onClick={() => setImageUrl('')}>Change</button>
                                        </div>
                                    ) : (
                                        <div
                                            className={styles.uploadZone}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                            />
                                            {uploading ? 'Uploading...' : 'Click to upload cover image'}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formFields}>
                                    <div className={styles.formGroup}>
                                        <label>Collection Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., The Medusa Edit"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Describe this collection..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Select Products</label>
                                <div className={styles.productList}>
                                    {products.length === 0 ? (
                                        <p className={styles.noProducts}>No products available. Add products first.</p>
                                    ) : (
                                        products.map(product => (
                                            <label key={product.id} className={styles.productItem}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product.id)}
                                                    onChange={() => toggleProduct(product.id)}
                                                />
                                                <span>{product.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="featured"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="featured">Featured Collection (shown on homepage)</label>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Collections Grid */}
            {loading ? (
                <div className={styles.loading}>Loading collections...</div>
            ) : collections.length === 0 ? (
                <div className={styles.empty}>
                    <p>No collections yet. Create your first curated collection.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {collections.map(coll => (
                        <div key={coll.id} className={styles.collectionCard}>
                            <div className={styles.collectionImage}>
                                {coll.image ? (
                                    <Image src={coll.image} alt={coll.name} fill style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div className={styles.noImage}>{coll.name[0]}</div>
                                )}
                                {coll.featured && <span className={styles.featuredBadge}>Featured</span>}
                            </div>
                            <div className={styles.collectionInfo}>
                                <h3>{coll.name}</h3>
                                <p>{coll.productIds?.length || 0} products</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
