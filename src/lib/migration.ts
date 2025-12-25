/**
 * Firestore Schema Migration & Seed Script
 * Houses of Medusa - Ultra-Luxury Ecommerce Platform
 * 
 * This script creates all Firestore collections with demo data
 * 
 * USAGE:
 * 1. Make sure Firebase credentials are set in .env.local
 * 2. Run: npm run seed
 */

// This is a browser-compatible script that can be run from the app
// Import this file and call the functions to seed data

import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    setDoc,
    writeBatch,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

// ============================================
// SCHEMA DEFINITIONS
// ============================================

/**
 * Firestore Collections Structure:
 * 
 * /products/{productId}
 * /brands/{brandId}
 * /categories/{categoryId}
 * /collections/{collectionId}
 * /sizeCharts/{sizeChartId}
 * /orders/{orderId}
 * /users/{userId}
 * /admins/{adminId}
 * /homepage/main
 * /media/{mediaId}
 */

// ============================================
// DEMO DATA
// ============================================

export const demoBrands = [
    {
        id: 'versace',
        name: 'Versace',
        slug: 'versace',
        logo: '/brands/versace.png',
        description: 'Founded in 1978 by Gianni Versace, the Italian luxury fashion house represents bold, glamorous designs with iconic Medusa motifs.',
        story: 'From the vibrant streets of Milan to the most exclusive runways in the world, Versace has defined luxury fashion for over four decades.',
        country: 'Italy',
        founded: 1978,
        featured: true,
        isActive: true,
        productCount: 24,
    },
    {
        id: 'armani',
        name: 'Giorgio Armani',
        slug: 'armani',
        logo: '/brands/armani.png',
        description: 'Italian luxury fashion house founded by Giorgio Armani, known for clean, tailored lines and understated elegance.',
        story: 'Giorgio Armani revolutionized modern fashion with his deconstructed jacket design, creating a new standard for effortless sophistication.',
        country: 'Italy',
        founded: 1975,
        featured: true,
        isActive: true,
        productCount: 18,
    },
    {
        id: 'prada',
        name: 'Prada',
        slug: 'prada',
        logo: '/brands/prada.png',
        description: 'Italian luxury fashion house specializing in leather handbags, shoes, and accessories with minimalist Italian design.',
        story: 'What began as a leather goods shop in Milan\'s Galleria Vittorio Emanuele II has become one of the most influential fashion houses in the world.',
        country: 'Italy',
        founded: 1913,
        featured: true,
        isActive: true,
        productCount: 32,
    },
    {
        id: 'gucci',
        name: 'Gucci',
        slug: 'gucci',
        logo: '/brands/gucci.png',
        description: 'Italian luxury brand of fashion and leather goods, famous for distinctive patterns and the iconic interlocking G logo.',
        story: 'From Florence to the world, Gucci has been at the forefront of luxury fashion, blending heritage craftsmanship with bold contemporary design.',
        country: 'Italy',
        founded: 1921,
        featured: true,
        isActive: true,
        productCount: 28,
    },
    {
        id: 'dolce-gabbana',
        name: 'Dolce & Gabbana',
        slug: 'dolce-gabbana',
        logo: '/brands/dolce-gabbana.png',
        description: 'Italian luxury fashion house known for Mediterranean-inspired designs celebrating Italian heritage and sensuality.',
        story: 'Domenico Dolce and Stefano Gabbana created a fashion empire built on Sicily\'s rich cultural heritage and artisanal traditions.',
        country: 'Italy',
        founded: 1985,
        featured: false,
        isActive: true,
        productCount: 15,
    },
    {
        id: 'burberry',
        name: 'Burberry',
        slug: 'burberry',
        logo: '/brands/burberry.png',
        description: 'British luxury fashion house known for its iconic trench coat and distinctive check pattern.',
        story: 'For over 160 years, Burberry has been synonymous with British luxury, from the trenches of World War I to the runways of London Fashion Week.',
        country: 'United Kingdom',
        founded: 1856,
        featured: false,
        isActive: true,
        productCount: 20,
    },
];

export const demoCategories = [
    {
        id: 'clothing',
        name: 'Clothing',
        slug: 'clothing',
        description: 'Luxury apparel from the world\'s finest fashion houses',
        image: '/categories/clothing.jpg',
        productCount: 45,
        isActive: true,
        displayOrder: 1,
    },
    {
        id: 'handbags',
        name: 'Handbags',
        slug: 'handbags',
        description: 'Iconic designer handbags and leather goods',
        image: '/categories/handbags.jpg',
        productCount: 32,
        isActive: true,
        displayOrder: 2,
    },
    {
        id: 'watches',
        name: 'Watches',
        slug: 'watches',
        description: 'Prestigious timepieces from legendary watchmakers',
        image: '/categories/watches.jpg',
        productCount: 18,
        isActive: true,
        displayOrder: 3,
    },
    {
        id: 'accessories',
        name: 'Accessories',
        slug: 'accessories',
        description: 'Premium accessories to complete your look',
        image: '/categories/accessories.jpg',
        productCount: 24,
        isActive: true,
        displayOrder: 4,
    },
    {
        id: 'footwear',
        name: 'Footwear',
        slug: 'footwear',
        description: 'Designer shoes crafted by master artisans',
        image: '/categories/footwear.jpg',
        productCount: 28,
        isActive: true,
        displayOrder: 5,
    },
    {
        id: 'jewelry',
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Exquisite jewelry pieces and fine gems',
        image: '/categories/jewelry.jpg',
        productCount: 15,
        isActive: true,
        displayOrder: 6,
    },
];

export const demoProducts = [
    {
        id: 'midnight-serpent-clutch',
        name: 'Midnight Serpent Clutch',
        slug: 'midnight-serpent-clutch',
        brandId: 'versace',
        categoryId: 'handbags',
        description: 'A masterpiece of Italian craftsmanship, the Midnight Serpent Clutch embodies the essence of power and sophistication. Hand-finished with the iconic Medusa head clasp.',
        shortDescription: 'Iconic Medusa clutch in midnight leather',
        materials: ['Italian Nappa Leather', 'Gold-tone Hardware', 'Satin Lining'],
        careInstructions: 'Store in dust bag. Avoid direct sunlight and moisture.',
        price: 185000, // ₹1,85,000
        compareAtPrice: 240000,
        currency: 'INR',
        images: ['/products/clutch-1.jpg', '/products/clutch-2.jpg', '/products/clutch-3.jpg'],
        sizes: ['One Size'],
        colors: ['Midnight Black', 'Ruby Red', 'Ivory'],
        inventory: 5,
        sku: 'VS-CLT-001',
        visibility: 'live',
        featured: true,
        tags: ['Limited Edition', 'New Arrival', 'Bestseller'],
        sizeChartId: null,
        weight: 0.5,
        dimensions: { length: 25, width: 5, height: 15 },
    },
    {
        id: 'imperial-chronograph',
        name: 'Imperial Chronograph',
        slug: 'imperial-chronograph',
        brandId: 'armani',
        categoryId: 'watches',
        description: 'Swiss precision meets Italian elegance in this stunning timepiece. The Imperial Chronograph features a sapphire crystal face and automatic movement.',
        shortDescription: 'Swiss automatic chronograph with sapphire crystal',
        materials: ['Stainless Steel Case', 'Sapphire Crystal', 'Italian Leather Strap'],
        careInstructions: 'Service every 3-5 years. Water resistant to 50m.',
        price: 420000,
        compareAtPrice: 550000,
        currency: 'INR',
        images: ['/products/watch-1.jpg', '/products/watch-2.jpg'],
        sizes: ['One Size'],
        colors: ['Silver/Black', 'Gold/Brown'],
        inventory: 3,
        sku: 'GA-WTC-001',
        visibility: 'live',
        featured: true,
        tags: ['Bestseller'],
    },
    {
        id: 'athena-leather-tote',
        name: 'Athena Leather Tote',
        slug: 'athena-leather-tote',
        brandId: 'prada',
        categoryId: 'handbags',
        description: 'Handcrafted from the finest Saffiano leather, the Athena Tote is the epitome of understated luxury. Spacious interior with multiple compartments.',
        shortDescription: 'Classic Saffiano leather tote',
        materials: ['Saffiano Leather', 'Gold-tone Hardware', 'Jacquard Lining'],
        careInstructions: 'Clean with soft cloth. Store stuffed to maintain shape.',
        price: 210000,
        compareAtPrice: 280000,
        currency: 'INR',
        images: ['/products/tote-1.jpg', '/products/tote-2.jpg'],
        sizes: ['One Size'],
        colors: ['Nero', 'Caramel', 'Powder Pink'],
        inventory: 8,
        sku: 'PR-TT-001',
        visibility: 'live',
        featured: true,
        tags: ['New Arrival'],
    },
    {
        id: 'obsidian-silk-blazer',
        name: 'Obsidian Silk Blazer',
        slug: 'obsidian-silk-blazer',
        brandId: 'gucci',
        categoryId: 'clothing',
        description: 'Pure Italian silk with hand-finished details. A statement piece for the discerning collector. Features signature Gucci lining and mother of pearl buttons.',
        shortDescription: 'Italian silk blazer with signature detailing',
        materials: ['100% Italian Silk', 'Viscose Lining', 'Mother of Pearl Buttons'],
        careInstructions: 'Dry clean only. Store on padded hanger.',
        price: 320000,
        compareAtPrice: 410000,
        currency: 'INR',
        images: ['/products/blazer-1.jpg', '/products/blazer-2.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Obsidian Black'],
        inventory: 12,
        sku: 'GC-BLZ-001',
        visibility: 'live',
        featured: true,
        tags: ['Limited Edition'],
        sizeChartId: 'clothing-standard',
    },
    {
        id: 'medusa-heel-pumps',
        name: 'Medusa Heel Pumps',
        slug: 'medusa-heel-pumps',
        brandId: 'versace',
        categoryId: 'footwear',
        description: 'Iconic Medusa hardware adorns these stunning patent leather pumps. 100mm stiletto heel with leather sole.',
        shortDescription: 'Patent leather pumps with Medusa hardware',
        materials: ['Patent Leather Upper', 'Leather Sole', 'Gold-tone Medusa'],
        careInstructions: 'Use leather conditioner. Store with shoe trees.',
        price: 145000,
        compareAtPrice: 190000,
        currency: 'INR',
        images: ['/products/pumps-1.jpg', '/products/pumps-2.jpg'],
        sizes: ['35', '36', '37', '38', '39', '40', '41'],
        colors: ['Black Patent', 'Red Patent', 'Nude'],
        inventory: 15,
        sku: 'VS-PMP-001',
        visibility: 'live',
        featured: false,
        tags: [],
        sizeChartId: 'footwear-eu',
    },
    {
        id: 'heritage-trench-coat',
        name: 'Heritage Trench Coat',
        slug: 'heritage-trench-coat',
        brandId: 'burberry',
        categoryId: 'clothing',
        description: 'The definitive trench coat, crafted from weatherproof gabardine and featuring the iconic check lining. A timeless investment piece.',
        shortDescription: 'Iconic gabardine trench with check lining',
        materials: ['Cotton Gabardine', 'Check Cotton Lining', 'Leather Buckles'],
        careInstructions: 'Specialist dry clean recommended.',
        price: 280000,
        compareAtPrice: 350000,
        currency: 'INR',
        images: ['/products/trench-1.jpg', '/products/trench-2.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Honey', 'Black', 'Navy'],
        inventory: 6,
        sku: 'BB-TRC-001',
        visibility: 'live',
        featured: true,
        tags: ['Heritage', 'Classic'],
        sizeChartId: 'clothing-standard',
    },
];

export const demoCollections = [
    {
        id: 'medusa-edit',
        name: 'The Medusa Edit',
        slug: 'medusa-edit',
        description: 'Curated pieces from our most exclusive collections, each embodying power and sophistication.',
        image: '/collections/medusa-edit.jpg',
        featured: true,
        productIds: ['midnight-serpent-clutch', 'medusa-heel-pumps'],
        isActive: true,
        displayOrder: 1,
    },
    {
        id: 'italian-heritage',
        name: 'Italian Heritage',
        slug: 'italian-heritage',
        description: 'Celebrating centuries of Italian craftsmanship with pieces from Milan, Florence, and Rome.',
        image: '/collections/italian-heritage.jpg',
        featured: true,
        productIds: ['athena-leather-tote', 'obsidian-silk-blazer', 'imperial-chronograph'],
        isActive: true,
        displayOrder: 2,
    },
    {
        id: 'midnight-luxe',
        name: 'Midnight Luxe',
        slug: 'midnight-luxe',
        description: 'Dark, mysterious, and undeniably elegant. After-hours sophistication.',
        image: '/collections/midnight-luxe.jpg',
        featured: false,
        productIds: ['midnight-serpent-clutch', 'obsidian-silk-blazer'],
        isActive: true,
        displayOrder: 3,
    },
];

export const demoSizeCharts = [
    {
        id: 'clothing-standard',
        name: 'Standard Clothing',
        type: 'category',
        categoryId: 'clothing',
        brandId: null,
        productId: null,
        priority: 1,
        measurements: [
            { size: 'XS', bust: '80-84', waist: '60-64', hips: '86-90', usSize: '0-2', ukSize: '4-6', euSize: '32-34' },
            { size: 'S', bust: '84-88', waist: '64-68', hips: '90-94', usSize: '4-6', ukSize: '8-10', euSize: '36-38' },
            { size: 'M', bust: '88-92', waist: '68-72', hips: '94-98', usSize: '8-10', ukSize: '12-14', euSize: '40-42' },
            { size: 'L', bust: '92-96', waist: '72-76', hips: '98-102', usSize: '12-14', ukSize: '16-18', euSize: '44-46' },
            { size: 'XL', bust: '96-100', waist: '76-80', hips: '102-106', usSize: '16-18', ukSize: '20-22', euSize: '48-50' },
        ],
        notes: 'Measurements are in centimeters. For the most accurate fit, we recommend professional measuring.',
        isActive: true,
    },
    {
        id: 'footwear-eu',
        name: 'European Footwear',
        type: 'category',
        categoryId: 'footwear',
        brandId: null,
        productId: null,
        priority: 1,
        measurements: [
            { size: '35', euSize: '35', usSize: '5', ukSize: '2.5', footLength: '22.5' },
            { size: '36', euSize: '36', usSize: '6', ukSize: '3.5', footLength: '23' },
            { size: '37', euSize: '37', usSize: '7', ukSize: '4.5', footLength: '23.5' },
            { size: '38', euSize: '38', usSize: '8', ukSize: '5.5', footLength: '24' },
            { size: '39', euSize: '39', usSize: '9', ukSize: '6.5', footLength: '24.5' },
            { size: '40', euSize: '40', usSize: '10', ukSize: '7.5', footLength: '25' },
            { size: '41', euSize: '41', usSize: '11', ukSize: '8.5', footLength: '25.5' },
        ],
        notes: 'Foot length in centimeters. Italian brands may run small - consider sizing up.',
        isActive: true,
    },
];

export const demoHomepageContent = {
    id: 'main',
    hero: {
        title: "We don't sell fashion. We sell status.",
        subtitle: 'Curated luxury pieces with exclusive private pricing from verified factory outlets.',
        image: '/hero-bg.jpg',
        ctaPrimary: { text: 'Explore Collection', link: '/products' },
        ctaSecondary: { text: 'Our Story', link: '/about' },
    },
    announcement: {
        enabled: true,
        text: 'Complimentary shipping on orders over ₹10,000 • New arrivals every week',
        link: null,
    },
    featuredCollectionIds: ['medusa-edit', 'italian-heritage'],
    featuredProductIds: ['midnight-serpent-clutch', 'imperial-chronograph', 'athena-leather-tote', 'obsidian-silk-blazer'],
    brandShowcase: {
        enabled: true,
        title: 'The Houses',
        brandIds: ['versace', 'armani', 'prada', 'gucci'],
    },
    trustBadges: [
        { icon: 'verified', title: 'Verified Authentic', description: 'Every piece authenticated' },
        { icon: 'shipping', title: 'Discreet Shipping', description: 'No external branding' },
        { icon: 'returns', title: 'Effortless Returns', description: '14-day return policy' },
    ],
};

// ============================================
// MIGRATION FUNCTIONS
// ============================================

export async function seedBrands() {
    console.log('📦 Seeding brands...');
    const batch = writeBatch(db);

    for (const brand of demoBrands) {
        const ref = doc(db, 'brands', brand.id);
        batch.set(ref, {
            ...brand,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    await batch.commit();
    console.log(`   ✓ ${demoBrands.length} brands created`);
}

export async function seedCategories() {
    console.log('📂 Seeding categories...');
    const batch = writeBatch(db);

    for (const category of demoCategories) {
        const ref = doc(db, 'categories', category.id);
        batch.set(ref, {
            ...category,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    await batch.commit();
    console.log(`   ✓ ${demoCategories.length} categories created`);
}

export async function seedProducts() {
    console.log('🛍️ Seeding products...');
    const batch = writeBatch(db);

    for (const product of demoProducts) {
        const ref = doc(db, 'products', product.id);
        batch.set(ref, {
            ...product,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    await batch.commit();
    console.log(`   ✓ ${demoProducts.length} products created`);
}

export async function seedCollections() {
    console.log('🎨 Seeding collections...');
    const batch = writeBatch(db);

    for (const coll of demoCollections) {
        const ref = doc(db, 'collections', coll.id);
        batch.set(ref, {
            ...coll,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    await batch.commit();
    console.log(`   ✓ ${demoCollections.length} collections created`);
}

export async function seedSizeCharts() {
    console.log('📏 Seeding size charts...');
    const batch = writeBatch(db);

    for (const chart of demoSizeCharts) {
        const ref = doc(db, 'sizeCharts', chart.id);
        batch.set(ref, {
            ...chart,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    await batch.commit();
    console.log(`   ✓ ${demoSizeCharts.length} size charts created`);
}

export async function seedHomepage() {
    console.log('🏠 Seeding homepage content...');

    await setDoc(doc(db, 'homepage', 'main'), {
        ...demoHomepageContent,
        updatedAt: serverTimestamp(),
    });

    console.log('   ✓ Homepage content created');
}

export async function runFullMigration() {
    console.log('🌱 Starting Firestore Schema Migration...\n');

    try {
        await seedBrands();
        await seedCategories();
        await seedProducts();
        await seedCollections();
        await seedSizeCharts();
        await seedHomepage();

        console.log('\n✨ Migration completed successfully!');
        return { success: true };
    } catch (error) {
        console.error('❌ Migration failed:', error);
        return { success: false, error };
    }
}

// Export for use in admin panel
export const migrationData = {
    brands: demoBrands,
    categories: demoCategories,
    products: demoProducts,
    collections: demoCollections,
    sizeCharts: demoSizeCharts,
    homepage: demoHomepageContent,
};
