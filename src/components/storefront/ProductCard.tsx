'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';
import type { Product, Brand } from '@/types';

interface ProductCardProps {
    product: Product;
    brand?: Brand;
    priority?: boolean;
}

export default function ProductCard({ product, brand, priority = false }: ProductCardProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Link href={`/products/${product.slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className={styles.image}
                        priority={priority}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21,15 16,10 5,21" />
                        </svg>
                    </div>
                )}

                {/* Hover overlay */}
                <div className={styles.overlay}>
                    <span className={styles.viewBtn}>View Details</span>
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className={styles.tags}>
                        {product.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className={styles.tag}>{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.content}>
                {brand && (
                    <span className={styles.brand}>{brand.name}</span>
                )}
                <h3 className={styles.name}>{product.name}</h3>
                <div className={styles.priceRow}>
                    <span className={styles.price}>{formatPrice(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className={styles.comparePrice}>
                            {formatPrice(product.compareAtPrice)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
