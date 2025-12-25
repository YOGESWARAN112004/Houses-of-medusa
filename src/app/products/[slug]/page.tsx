'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import SizeGuideModal from '@/components/storefront/SizeGuideModal';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    brandId: string;
    categoryId: string;
    description: string;
    tags: string[];
    images: string[];
    sizes: string[];
    inventory: number;
    sizeChartId?: string;
}

interface Brand {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
    const { slug } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [brand, setBrand] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
    const [sizeChart, setSizeChart] = useState<{ headers: string[]; rows: string[][] } | null>(null);

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    const fetchProduct = async () => {
        try {
            // Find product by slug
            const productsSnap = await getDocs(
                query(collection(db, 'products'), where('slug', '==', slug))
            );

            if (productsSnap.empty) {
                setLoading(false);
                return;
            }

            const productData = { id: productsSnap.docs[0].id, ...productsSnap.docs[0].data() } as Product;
            setProduct(productData);
            setSelectedSize(productData.sizes?.[0] || '');

            // Fetch brand
            if (productData.brandId) {
                const brandDoc = await getDoc(doc(db, 'brands', productData.brandId));
                if (brandDoc.exists()) {
                    setBrand({ id: brandDoc.id, ...brandDoc.data() } as Brand);
                }
            }

            // Fetch size chart if exists
            if (productData.sizeChartId) {
                const chartDoc = await getDoc(doc(db, 'sizeCharts', productData.sizeChartId));
                if (chartDoc.exists()) {
                    setSizeChart(chartDoc.data() as { headers: string[]; rows: string[][] });
                }
            }
        } catch (error) {
            console.error('Error fetching product:', error);
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

    const handleAddToCart = () => {
        if (!product) return;

        const cart = JSON.parse(localStorage.getItem('medusa-cart') || '{"items":[]}');
        const existingItem = cart.items.find(
            (item: { productId: string; size: string }) =>
                item.productId === product.id && item.size === selectedSize
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId: product.id,
                productName: product.name,
                brandName: brand?.name || '',
                price: product.price,
                size: selectedSize,
                quantity,
                image: product.images?.[0] || '',
            });
        }

        localStorage.setItem('medusa-cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className={styles.loading}>Loading product...</div>
                </main>
                <Footer />
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className={styles.notFound}>
                        <h1>Product Not Found</h1>
                        <p>The product you&apos;re looking for doesn&apos;t exist.</p>
                        <Link href="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main className={styles.main}>
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb}>
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <Link href="/products">Shop</Link>
                    {brand && (
                        <>
                            <span>/</span>
                            <Link href={`/brands/${brand.slug}`}>{brand.name}</Link>
                        </>
                    )}
                    <span>/</span>
                    <span>{product.name}</span>
                </nav>

                <div className={styles.productLayout}>
                    {/* Image Gallery */}
                    <div className={styles.gallery}>
                        <div className={styles.mainImage}>
                            {product.images?.[selectedImage] ? (
                                <Image
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21,15 16,10 5,21" />
                                    </svg>
                                    <span>No Image</span>
                                </div>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className={styles.thumbnails}>
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <Image src={image} alt={`View ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className={styles.productInfo}>
                        <div className={styles.productMeta}>
                            {brand && (
                                <Link href={`/brands/${brand.slug}`} className={styles.brand}>
                                    {brand.name}
                                </Link>
                            )}
                            {product.tags && product.tags.map((tag, i) => (
                                <span key={i} className={styles.tag}>{tag}</span>
                            ))}
                        </div>

                        <h1 className={styles.productName}>{product.name}</h1>

                        <div className={styles.priceBlock}>
                            <span className={styles.price}>{formatPrice(product.price)}</span>
                            {product.compareAtPrice && (
                                <>
                                    <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>
                                    <span className={styles.discount}>
                                        {Math.round((1 - product.price / product.compareAtPrice) * 100)}% Off
                                    </span>
                                </>
                            )}
                        </div>

                        <div className={styles.divider}></div>

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className={styles.optionGroup}>
                                <div className={styles.optionHeader}>
                                    <span className={styles.optionLabel}>Size</span>
                                    {sizeChart && (
                                        <button
                                            className={styles.sizeGuideBtn}
                                            onClick={() => setSizeGuideOpen(true)}
                                        >
                                            View Size Guide
                                        </button>
                                    )}
                                </div>
                                <div className={styles.sizeOptions}>
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            className={`${styles.sizeBtn} ${selectedSize === size ? styles.active : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className={styles.optionGroup}>
                            <span className={styles.optionLabel}>Quantity</span>
                            <div className={styles.quantitySelector}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>
                                <span>{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.inventory || 10, quantity + 1))}
                                    disabled={quantity >= (product.inventory || 10)}
                                >
                                    +
                                </button>
                            </div>
                            {product.inventory && product.inventory <= 5 && (
                                <span className={styles.inventoryNote}>
                                    Only {product.inventory} pieces available
                                </span>
                            )}
                        </div>

                        {/* Add to Cart */}
                        <button
                            className={`btn btn-primary ${styles.addToCartBtn}`}
                            onClick={handleAddToCart}
                        >
                            Add to Private Bag
                        </button>

                        <p className={styles.reserveNote}>
                            Your piece will be reserved for 30 minutes
                        </p>

                        <div className={styles.divider}></div>

                        {/* Description */}
                        {product.description && (
                            <div className={styles.description}>
                                <h3>The Details</h3>
                                <div dangerouslySetInnerHTML={{ __html: product.description }} />
                            </div>
                        )}

                        {/* Authenticity */}
                        <div className={styles.authenticity}>
                            <div className={styles.authenticityIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            <div>
                                <h4>Verified Authenticity</h4>
                                <p>Sourced directly from verified factory outlets. Certificate of authenticity included.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brand Story Section */}
                {brand && (
                    <section className={styles.brandStory}>
                        <div className={styles.brandStoryContent}>
                            <span className={styles.eyebrow}>The Maison</span>
                            <h2>{brand.name}</h2>
                            <p>{brand.description || `Discover the complete collection from ${brand.name}.`}</p>
                            <Link href={`/brands/${brand.slug}`} className="btn btn-secondary">
                                Explore the House
                            </Link>
                        </div>
                    </section>
                )}
            </main>

            <Footer />

            {/* Size Guide Modal */}
            {sizeChart && (
                <SizeGuideModal
                    isOpen={sizeGuideOpen}
                    onClose={() => setSizeGuideOpen(false)}
                    productName={product.name}
                    sizeChart={sizeChart}
                />
            )}
        </>
    );
}
