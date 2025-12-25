'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
    getProducts,
    getBrands,
    getCategories,
    getCollections,
    getFeaturedProducts,
    getHomepageContent,
} from '@/lib/firestore';
import { Product, Brand, Category, Collection, HomepageContent } from '@/types';

interface ShopContextType {
    products: Product[];
    brands: Brand[];
    categories: Category[];
    collections: Collection[];
    featuredProducts: Product[];
    homepageContent: HomepageContent | null;
    loading: boolean;
    error: string | null;
    refreshProducts: () => Promise<void>;
    refreshBrands: () => Promise<void>;
    refreshAll: () => Promise<void>;
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string, size: string) => void;
    updateCartQuantity: (productId: string, size: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

interface CartItem {
    productId: string;
    productName: string;
    brandName: string;
    price: number;
    size: string;
    quantity: number;
    image?: string;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('medusa-cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                setCart(parsed.items || []);
            } catch (e) {
                console.error('Error parsing cart:', e);
            }
        }
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem('medusa-cart', JSON.stringify({ items: cart }));
        window.dispatchEvent(new Event('cart-updated'));
    }, [cart]);

    const refreshProducts = useCallback(async () => {
        try {
            const [allProducts, featured] = await Promise.all([
                getProducts(),
                getFeaturedProducts(),
            ]);
            setProducts(allProducts);
            setFeaturedProducts(featured);
        } catch (err) {
            setError('Failed to load products');
            console.error(err);
        }
    }, []);

    const refreshBrands = useCallback(async () => {
        try {
            const allBrands = await getBrands();
            setBrands(allBrands);
        } catch (err) {
            setError('Failed to load brands');
            console.error(err);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [
                allProducts,
                allBrands,
                allCategories,
                allCollections,
                featured,
                homepage,
            ] = await Promise.all([
                getProducts(),
                getBrands(),
                getCategories(),
                getCollections(),
                getFeaturedProducts(),
                getHomepageContent(),
            ]);

            setProducts(allProducts);
            setBrands(allBrands);
            setCategories(allCategories);
            setCollections(allCollections);
            setFeaturedProducts(featured);
            setHomepageContent(homepage);
        } catch (err) {
            setError('Failed to load shop data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    // Cart functions
    const addToCart = (item: CartItem) => {
        setCart(prev => {
            const existing = prev.find(
                i => i.productId === item.productId && i.size === item.size
            );
            if (existing) {
                return prev.map(i =>
                    i.productId === item.productId && i.size === item.size
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (productId: string, size: string) => {
        setCart(prev => prev.filter(
            i => !(i.productId === productId && i.size === size)
        ));
    };

    const updateCartQuantity = (productId: string, size: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId, size);
            return;
        }
        setCart(prev => prev.map(i =>
            i.productId === productId && i.size === size
                ? { ...i, quantity }
                : i
        ));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const value = {
        products,
        brands,
        categories,
        collections,
        featuredProducts,
        homepageContent,
        loading,
        error,
        refreshProducts,
        refreshBrands,
        refreshAll,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartCount,
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
}
