/**
 * Database Seed Script for Houses of Medusa
 * Run this script to populate Firestore with demo data
 * 
 * Usage: 
 * 1. Ensure Firebase credentials are set in .env.local
 * 2. Run: npx ts-node --esm scripts/seed-database.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Demo Brands
const brands = [
    {
        id: 'versace',
        name: 'Versace',
        slug: 'versace',
        logo: '/brands/versace.png',
        description: 'Founded in 1978 by Gianni Versace, the Italian luxury fashion house represents bold, glamorous designs.',
        country: 'Italy',
        founded: 1978,
        featured: true,
        isActive: true,
        productCount: 24,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'armani',
        name: 'Giorgio Armani',
        slug: 'armani',
        logo: '/brands/armani.png',
        description: 'Italian luxury fashion house founded by Giorgio Armani, known for clean, tailored lines.',
        country: 'Italy',
        founded: 1975,
        featured: true,
        isActive: true,
        productCount: 18,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'prada',
        name: 'Prada',
        slug: 'prada',
        logo: '/brands/prada.png',
        description: 'Italian luxury fashion house specializing in leather handbags, shoes, and accessories.',
        country: 'Italy',
        founded: 1913,
        featured: true,
        isActive: true,
        productCount: 32,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'gucci',
        name: 'Gucci',
        slug: 'gucci',
        logo: '/brands/gucci.png',
        description: 'Italian luxury brand of fashion and leather goods, known for its distinctive patterns.',
        country: 'Italy',
        founded: 1921,
        featured: true,
        isActive: true,
        productCount: 28,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'dolce-gabbana',
        name: 'Dolce & Gabbana',
        slug: 'dolce-gabbana',
        logo: '/brands/dolce-gabbana.png',
        description: 'Italian luxury fashion house known for Mediterranean-inspired designs.',
        country: 'Italy',
        founded: 1985,
        featured: false,
        isActive: true,
        productCount: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

// Demo Categories
const categories = [
    { id: 'clothing', name: 'Clothing', slug: 'clothing', description: 'Luxury apparel', productCount: 45, isActive: true },
    { id: 'handbags', name: 'Handbags', slug: 'handbags', description: 'Designer handbags', productCount: 32, isActive: true },
    { id: 'watches', name: 'Watches', slug: 'watches', description: 'Luxury timepieces', productCount: 18, isActive: true },
    { id: 'accessories', name: 'Accessories', slug: 'accessories', description: 'Premium accessories', productCount: 24, isActive: true },
    { id: 'footwear', name: 'Footwear', slug: 'footwear', description: 'Designer shoes', productCount: 28, isActive: true },
];

// Demo Products
const products = [
    {
        id: 'midnight-serpent-clutch',
        name: 'Midnight Serpent Clutch',
        slug: 'midnight-serpent-clutch',
        brandId: 'versace',
        categoryId: 'handbags',
        description: 'A masterpiece of Italian craftsmanship, the Midnight Serpent Clutch embodies the essence of power and sophistication.',
        price: 1850,
        compareAtPrice: 2400,
        images: ['/products/clutch-1.jpg', '/products/clutch-2.jpg'],
        sizes: ['One Size'],
        inventory: 5,
        visibility: 'live',
        featured: true,
        tags: ['Limited Edition', 'New Arrival'],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'imperial-chronograph',
        name: 'Imperial Chronograph',
        slug: 'imperial-chronograph',
        brandId: 'armani',
        categoryId: 'watches',
        description: 'Swiss precision meets Italian elegance in this stunning timepiece.',
        price: 4200,
        compareAtPrice: 5500,
        images: ['/products/watch-1.jpg', '/products/watch-2.jpg'],
        sizes: ['One Size'],
        inventory: 3,
        visibility: 'live',
        featured: true,
        tags: ['Bestseller'],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'athena-leather-tote',
        name: 'Athena Leather Tote',
        slug: 'athena-leather-tote',
        brandId: 'prada',
        categoryId: 'handbags',
        description: 'Handcrafted from the finest Saffiano leather, the Athena Tote is the epitome of understated luxury.',
        price: 2100,
        compareAtPrice: 2800,
        images: ['/products/tote-1.jpg', '/products/tote-2.jpg'],
        sizes: ['One Size'],
        inventory: 8,
        visibility: 'live',
        featured: true,
        tags: ['New Arrival'],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'obsidian-silk-blazer',
        name: 'Obsidian Silk Blazer',
        slug: 'obsidian-silk-blazer',
        brandId: 'gucci',
        categoryId: 'clothing',
        description: 'Pure Italian silk with hand-finished details. A statement piece for the discerning collector.',
        price: 3200,
        compareAtPrice: 4100,
        images: ['/products/blazer-1.jpg', '/products/blazer-2.jpg'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        inventory: 12,
        visibility: 'live',
        featured: true,
        tags: ['Limited Edition'],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'medusa-heel-pumps',
        name: 'Medusa Heel Pumps',
        slug: 'medusa-heel-pumps',
        brandId: 'versace',
        categoryId: 'footwear',
        description: 'Iconic Medusa hardware adorns these stunning patent leather pumps.',
        price: 1450,
        compareAtPrice: 1900,
        images: ['/products/pumps-1.jpg', '/products/pumps-2.jpg'],
        sizes: ['35', '36', '37', '38', '39', '40'],
        inventory: 15,
        visibility: 'live',
        featured: false,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

// Demo Collections
const collections = [
    {
        id: 'medusa-edit',
        name: 'The Medusa Edit',
        slug: 'medusa-edit',
        description: 'Curated pieces from our most exclusive collections.',
        image: '/collections/medusa-edit.jpg',
        featured: true,
        productIds: ['midnight-serpent-clutch', 'medusa-heel-pumps'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 'italian-heritage',
        name: 'Italian Heritage',
        slug: 'italian-heritage',
        description: 'Celebrating centuries of Italian craftsmanship.',
        image: '/collections/italian-heritage.jpg',
        featured: true,
        productIds: ['athena-leather-tote', 'obsidian-silk-blazer', 'imperial-chronograph'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

// Homepage Content
const homepageContent = {
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
    },
    featuredCollectionIds: ['medusa-edit', 'italian-heritage'],
    featuredProductIds: ['midnight-serpent-clutch', 'imperial-chronograph', 'athena-leather-tote', 'obsidian-silk-blazer'],
    updatedAt: new Date(),
};

async function seedDatabase() {
    console.log('🌱 Starting database seed...');

    try {
        // Seed Brands
        console.log('📦 Seeding brands...');
        const brandBatch = writeBatch(db);
        for (const brand of brands) {
            const brandRef = doc(db, 'brands', brand.id);
            brandBatch.set(brandRef, brand);
        }
        await brandBatch.commit();
        console.log(`   ✓ ${brands.length} brands created`);

        // Seed Categories
        console.log('📂 Seeding categories...');
        const categoryBatch = writeBatch(db);
        for (const category of categories) {
            const categoryRef = doc(db, 'categories', category.id);
            categoryBatch.set(categoryRef, category);
        }
        await categoryBatch.commit();
        console.log(`   ✓ ${categories.length} categories created`);

        // Seed Products
        console.log('🛍️ Seeding products...');
        const productBatch = writeBatch(db);
        for (const product of products) {
            const productRef = doc(db, 'products', product.id);
            productBatch.set(productRef, product);
        }
        await productBatch.commit();
        console.log(`   ✓ ${products.length} products created`);

        // Seed Collections
        console.log('🎨 Seeding collections...');
        const collectionBatch = writeBatch(db);
        for (const coll of collections) {
            const collRef = doc(db, 'collections', coll.id);
            collectionBatch.set(collRef, coll);
        }
        await collectionBatch.commit();
        console.log(`   ✓ ${collections.length} collections created`);

        // Seed Homepage
        console.log('🏠 Seeding homepage content...');
        await setDoc(doc(db, 'homepage', 'main'), homepageContent);
        console.log('   ✓ Homepage content created');

        console.log('\n✨ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

async function createAdminUser(email: string, password: string, name: string) {
    console.log(`\n👤 Creating admin user: ${email}`);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, 'admins', uid), {
            email,
            displayName: name,
            role: 'admin',
            createdAt: new Date(),
        });

        console.log(`   ✓ Admin user created with UID: ${uid}`);
        return uid;
    } catch (error: unknown) {
        const err = error as Error;
        if (err.message?.includes('email-already-in-use')) {
            console.log('   ℹ️ Admin user already exists');
        } else {
            console.error('❌ Error creating admin:', error);
        }
    }
}

// Run seed
seedDatabase();

// Optionally create admin user
// Uncomment and modify the line below to create an admin user:
// createAdminUser('admin@housesofmedusa.com', 'your-secure-password', 'Admin User');
