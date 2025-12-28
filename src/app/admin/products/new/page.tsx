'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import styles from './page.module.css';

interface UploadedImage {
    url: string;
    name: string;
}

interface UploadProgress {
    name: string;
    progress: number;
}

interface Brand {
    id: string;
    name: string;
    slug: string;
}

export default function NewProductPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [uploading, setUploading] = useState<UploadProgress[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        brand: '',
        category: '',
        price: '',
        compareAtPrice: '',
        description: '',
        inventory: '',
        visibility: 'draft',
        featured: false,
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'brands'));
            const brandsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Brand[];
            setBrands(brandsData);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Auto-generate slug from name
        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            }));
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);

        for (const file of fileArray) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                continue;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large. Max size is 5MB`);
                continue;
            }

            // Upload file
            await uploadFile(file);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadFile = async (file: File) => {
        const fileName = `${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `products/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Add to uploading state
        setUploading(prev => [...prev, { name: file.name, progress: 0 }]);

        return new Promise<void>((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploading(prev =>
                        prev.map(u => u.name === file.name ? { ...u, progress } : u)
                    );
                },
                (error) => {
                    console.error('Upload error:', error);
                    setUploading(prev => prev.filter(u => u.name !== file.name));
                    alert(`Failed to upload ${file.name}`);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setImages(prev => [...prev, { url: downloadURL, name: fileName }]);
                    setUploading(prev => prev.filter(u => u.name !== file.name));
                    resolve();
                }
            );
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        for (const file of fileArray) {
            if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
                await uploadFile(file);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.brand || !formData.category || !formData.price) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSaving(true);

        try {
            const productId = formData.slug || `product-${Date.now()}`;

            await setDoc(doc(db, 'products', productId), {
                id: productId,
                name: formData.name,
                slug: formData.slug,
                brandId: formData.brand,
                categoryId: formData.category,
                description: formData.description,
                price: parseInt(formData.price) || 0,
                compareAtPrice: parseInt(formData.compareAtPrice) || null,
                currency: 'INR',
                images: images.map(img => img.url),
                inventory: parseInt(formData.inventory) || 0,
                visibility: formData.visibility,
                featured: formData.featured,
                sizes: ['One Size'],
                colors: [],
                tags: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            router.push('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. Check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/admin/products" className={styles.backLink}>
                    ← Back to Products
                </Link>
                <h1>Add New Product</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                    {/* Main Content */}
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
                                    placeholder="e.g., Midnight Serpent Clutch"
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
                                        placeholder="auto-generated"
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="brand">Brand *</label>
                                    <select
                                        id="brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="category">Category *</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="handbags">Handbags</option>
                                        <option value="watches">Watches</option>
                                        <option value="accessories">Accessories</option>
                                        <option value="footwear">Footwear</option>
                                        <option value="jewelry">Jewelry</option>
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
                                    placeholder="Describe the craftsmanship, materials, and story behind this piece..."
                                />
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2>Product Images</h2>

                            {/* Uploaded Images */}
                            {images.length > 0 && (
                                <div className={styles.imageGrid}>
                                    {images.map((image, index) => (
                                        <div key={index} className={styles.imageItem}>
                                            <Image
                                                src={image.url}
                                                alt={`Product ${index + 1}`}
                                                width={150}
                                                height={150}
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <button
                                                type="button"
                                                className={styles.removeImage}
                                                onClick={() => removeImage(index)}
                                            >
                                                ×
                                            </button>
                                            {index === 0 && <span className={styles.primaryBadge}>Primary</span>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Progress */}
                            {uploading.length > 0 && (
                                <div className={styles.uploadProgress}>
                                    {uploading.map((upload, index) => (
                                        <div key={index} className={styles.progressItem}>
                                            <span>{upload.name}</span>
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${upload.progress}%` }}
                                                />
                                            </div>
                                            <span>{Math.round(upload.progress)}%</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Zone */}
                            <div
                                className={styles.mediaUpload}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                <div className={styles.uploadZone}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                        <polyline points="17,8 12,3 7,8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <p>Drag and drop images here, or click to browse</p>
                                    <span>Supports: JPG, PNG, WebP (max 5MB each)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className={styles.sideColumn}>
                        <div className={styles.card}>
                            <h2>Status</h2>

                            <div className={styles.formGroup}>
                                <label htmlFor="visibility">Visibility</label>
                                <select
                                    id="visibility"
                                    name="visibility"
                                    value={formData.visibility}
                                    onChange={handleInputChange}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="live">Live</option>
                                    <option value="archive">Archived</option>
                                </select>
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="featured"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="featured">Featured Product</label>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2>Pricing</h2>

                            <div className={styles.formGroup}>
                                <label htmlFor="price">Private Price (₹) *</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="1"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="compareAtPrice">Compare At Price (₹)</label>
                                <input
                                    type="number"
                                    id="compareAtPrice"
                                    name="compareAtPrice"
                                    value={formData.compareAtPrice}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="1"
                                    placeholder="Original retail price"
                                />
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2>Inventory</h2>

                            <div className={styles.formGroup}>
                                <label htmlFor="inventory">Stock Quantity *</label>
                                <input
                                    type="number"
                                    id="inventory"
                                    name="inventory"
                                    value={formData.inventory}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
