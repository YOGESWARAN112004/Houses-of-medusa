'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import styles from './page.module.css';

interface Brand {
    id: string;
    name: string;
    slug: string;
    logo: string;
    description: string;
    country: string;
    founded: number;
    featured: boolean;
    isActive: boolean;
}

export default function BrandsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        country: '',
        founded: '',
        featured: false,
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'brands'));
            const brandsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Brand[];
            setBrands(brandsData);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
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

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        setUploading(true);
        const fileName = `${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `brands/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            () => { },
            (error) => {
                console.error('Upload error:', error);
                setUploading(false);
                alert('Failed to upload logo');
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setLogoUrl(downloadURL);
                setUploading(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !logoUrl) {
            alert('Please fill in brand name and upload a logo');
            return;
        }

        setSaving(true);
        try {
            const brandId = formData.slug || `brand-${Date.now()}`;
            await setDoc(doc(db, 'brands', brandId), {
                id: brandId,
                name: formData.name,
                slug: formData.slug,
                logo: logoUrl,
                description: formData.description,
                country: formData.country,
                founded: parseInt(formData.founded) || null,
                featured: formData.featured,
                isActive: true,
                productCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            setShowAddForm(false);
            setFormData({ name: '', slug: '', description: '', country: '', founded: '', featured: false });
            setLogoUrl('');
            fetchBrands();
        } catch (error) {
            console.error('Error saving brand:', error);
            alert('Failed to save brand');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Brands</h1>
                    <p>Manage luxury maisons and fashion houses</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                    + Add Brand
                </button>
            </header>

            {/* Add Brand Modal */}
            {showAddForm && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Add New Brand</h2>
                            <button className={styles.closeBtn} onClick={() => setShowAddForm(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <div className={styles.logoUpload}>
                                    <label>Brand Logo *</label>
                                    {logoUrl ? (
                                        <div className={styles.logoPreview}>
                                            <Image src={logoUrl} alt="Logo" width={100} height={100} style={{ objectFit: 'contain' }} />
                                            <button type="button" onClick={() => setLogoUrl('')}>Change</button>
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
                                                onChange={handleLogoUpload}
                                                style={{ display: 'none' }}
                                            />
                                            {uploading ? 'Uploading...' : 'Click to upload logo'}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formFields}>
                                    <div className={styles.formGroup}>
                                        <label>Brand Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g., Versace"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Italy"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Founded Year</label>
                                        <input
                                            type="number"
                                            name="founded"
                                            value={formData.founded}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 1978"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Brand story and heritage..."
                                />
                            </div>

                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="featured"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="featured">Featured Brand (shown on homepage)</label>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Brand'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Brands Grid */}
            {loading ? (
                <div className={styles.loading}>Loading brands...</div>
            ) : brands.length === 0 ? (
                <div className={styles.empty}>
                    <p>No brands yet. Add your first luxury maison.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {brands.map(brand => (
                        <div key={brand.id} className={styles.brandCard}>
                            <div className={styles.brandLogo}>
                                {brand.logo ? (
                                    <Image src={brand.logo} alt={brand.name} width={80} height={80} style={{ objectFit: 'contain' }} />
                                ) : (
                                    <div className={styles.noLogo}>{brand.name[0]}</div>
                                )}
                            </div>
                            <div className={styles.brandInfo}>
                                <h3>{brand.name}</h3>
                                <p>{brand.country} {brand.founded ? `• Est. ${brand.founded}` : ''}</p>
                            </div>
                            {brand.featured && <span className={styles.featuredBadge}>Featured</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
