import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    DocumentData,
    QueryConstraint,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
    Product,
    Brand,
    Category,
    Collection,
    SizeChart,
    HomepageContent,
    MediaItem,
    Order,
    AdminUser,
    ProductFormData,
    BrandFormData,
    CollectionFormData,
    SizeChartFormData,
    CategoryFormData,
} from '@/types';

// Collection references
export const COLLECTIONS = {
    PRODUCTS: 'products',
    BRANDS: 'brands',
    CATEGORIES: 'categories',
    COLLECTIONS: 'collections',
    SIZE_CHARTS: 'sizeCharts',
    HOMEPAGE: 'homepage',
    MEDIA: 'media',
    ORDERS: 'orders',
    ADMIN_USERS: 'adminUsers',
} as const;

// ===== GENERIC HELPERS =====
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// ===== PRODUCTS =====
export async function getProducts(constraints: QueryConstraint[] = []): Promise<Product[]> {
    const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('visibility', '==', 'live'),
        ...constraints
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getAllProducts(constraints: QueryConstraint[] = []): Promise<Product[]> {
    const q = query(collection(db, COLLECTIONS.PRODUCTS), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const q = query(collection(db, COLLECTIONS.PRODUCTS), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Product;
}

export async function createProduct(data: ProductFormData): Promise<string> {
    const slug = generateSlug(data.name);
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        ...data,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
}

export async function getFeaturedProducts(count: number = 8): Promise<Product[]> {
    const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('visibility', '==', 'live'),
        where('featured', '==', true),
        limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProductsByBrand(brandId: string): Promise<Product[]> {
    const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('visibility', '==', 'live'),
        where('brandId', '==', brandId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
    const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('visibility', '==', 'live'),
        where('categoryId', '==', categoryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

// ===== BRANDS =====
export async function getBrands(): Promise<Brand[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.BRANDS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
}

export async function getFeaturedBrands(): Promise<Brand[]> {
    const q = query(
        collection(db, COLLECTIONS.BRANDS),
        where('status', '==', 'featured')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Brand));
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
    const q = query(collection(db, COLLECTIONS.BRANDS), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Brand;
}

export async function getBrandById(id: string): Promise<Brand | null> {
    const docRef = doc(db, COLLECTIONS.BRANDS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Brand;
}

export async function createBrand(data: BrandFormData): Promise<string> {
    const slug = generateSlug(data.name);
    const docRef = await addDoc(collection(db, COLLECTIONS.BRANDS), {
        ...data,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateBrand(id: string, data: Partial<BrandFormData>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BRANDS, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteBrand(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.BRANDS, id));
}

// ===== CATEGORIES =====
export async function getCategories(): Promise<Category[]> {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function getCategoryById(id: string): Promise<Category | null> {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Category;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const q = query(collection(db, COLLECTIONS.CATEGORIES), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Category;
}

export async function createCategory(data: CategoryFormData): Promise<string> {
    const slug = generateSlug(data.name);
    const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
        ...data,
        slug,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.CATEGORIES, id), data);
}

export async function deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id));
}

// ===== COLLECTIONS =====
export async function getCollections(): Promise<Collection[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.COLLECTIONS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
}

export async function getActiveCollections(): Promise<Collection[]> {
    const q = query(
        collection(db, COLLECTIONS.COLLECTIONS),
        where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
}

export async function getHomepageCollections(): Promise<Collection[]> {
    const q = query(
        collection(db, COLLECTIONS.COLLECTIONS),
        where('isActive', '==', true),
        where('homepagePosition', '!=', null),
        orderBy('homepagePosition')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
    const q = query(collection(db, COLLECTIONS.COLLECTIONS), where('slug', '==', slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Collection;
}

export async function getCollectionById(id: string): Promise<Collection | null> {
    const docRef = doc(db, COLLECTIONS.COLLECTIONS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Collection;
}

export async function createCollection(data: CollectionFormData): Promise<string> {
    const slug = generateSlug(data.name);
    const docRef = await addDoc(collection(db, COLLECTIONS.COLLECTIONS), {
        ...data,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateCollection(id: string, data: Partial<CollectionFormData>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.COLLECTIONS, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteCollection(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.COLLECTIONS, id));
}

// ===== SIZE CHARTS =====
export async function getSizeCharts(): Promise<SizeChart[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.SIZE_CHARTS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SizeChart));
}

export async function getSizeChartById(id: string): Promise<SizeChart | null> {
    const docRef = doc(db, COLLECTIONS.SIZE_CHARTS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as SizeChart;
}

export async function getSizeChartForProduct(productId: string, brandId: string, categoryId: string): Promise<SizeChart | null> {
    // Priority: Product > Brand > Category > Global

    // Check product-specific
    let q = query(
        collection(db, COLLECTIONS.SIZE_CHARTS),
        where('type', '==', 'product'),
        where('attachedTo', '==', productId),
        limit(1)
    );
    let snapshot = await getDocs(q);
    if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as SizeChart;

    // Check brand-specific
    q = query(
        collection(db, COLLECTIONS.SIZE_CHARTS),
        where('type', '==', 'brand'),
        where('attachedTo', '==', brandId),
        limit(1)
    );
    snapshot = await getDocs(q);
    if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as SizeChart;

    // Check category-specific
    q = query(
        collection(db, COLLECTIONS.SIZE_CHARTS),
        where('type', '==', 'category'),
        where('attachedTo', '==', categoryId),
        limit(1)
    );
    snapshot = await getDocs(q);
    if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as SizeChart;

    // Check global
    q = query(
        collection(db, COLLECTIONS.SIZE_CHARTS),
        where('type', '==', 'global'),
        limit(1)
    );
    snapshot = await getDocs(q);
    if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as SizeChart;

    return null;
}

export async function createSizeChart(data: SizeChartFormData): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.SIZE_CHARTS), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateSizeChart(id: string, data: Partial<SizeChartFormData>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SIZE_CHARTS, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteSizeChart(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.SIZE_CHARTS, id));
}

// ===== HOMEPAGE =====
export async function getHomepageContent(): Promise<HomepageContent | null> {
    const docRef = doc(db, COLLECTIONS.HOMEPAGE, 'content');
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as HomepageContent;
}

export async function updateHomepageContent(data: Partial<HomepageContent>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.HOMEPAGE, 'content');
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

// ===== MEDIA =====
export async function getMedia(folder?: string): Promise<MediaItem[]> {
    let q = collection(db, COLLECTIONS.MEDIA);
    if (folder) {
        q = query(q, where('folder', '==', folder)) as any;
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
}

export async function createMediaItem(data: Omit<MediaItem, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.MEDIA), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function deleteMediaItem(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.MEDIA, id));
}

// ===== ORDERS =====
export async function getOrders(): Promise<Order[]> {
    const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

export async function getOrderById(id: string): Promise<Order | null> {
    const docRef = doc(db, COLLECTIONS.ORDERS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Order;
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.ORDERS), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ORDERS, id);
    await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
    });
}
