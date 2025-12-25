import { Timestamp } from 'firebase/firestore';

// ===== PRODUCT =====
export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    order: number;
}

export interface ProductVariant {
    id: string;
    size: string;
    sku: string;
    inventory: number;
    price?: number; // Override main price if different
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    brandId: string;
    categoryId: string;
    description: string; // Rich text HTML
    images: string[]; // Firebase Storage URLs
    price: number; // Private pricing in INR
    compareAtPrice?: number;
    costPrice?: number; // For profit tracking
    variants: ProductVariant[];
    sizes: string[];
    inventory: number; // Total across all variants
    lowStockThreshold: number;
    tags: string[]; // e.g., "Italian Craft", "Limited"
    sizeChartId?: string;
    visibility: 'draft' | 'live' | 'archive';
    featured: boolean;
    weight?: number; // In grams
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== BRAND =====
export interface Brand {
    id: string;
    name: string;
    slug: string;
    logo: string; // Firebase Storage URL
    description: string;
    story?: string; // Rich text
    countryOfOrigin: string;
    foundedYear?: number;
    featured: boolean;
    defaultSizeChartId?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== SIZE CHART =====
export interface SizeChart {
    id: string;
    name: string;
    type: 'product' | 'brand' | 'category' | 'global';
    attachedTo?: string; // Product/Brand/Category ID
    headers: string[]; // e.g., ["Size", "US", "UK", "EU", "Chest (cm)"]
    rows: string[][]; // Table data
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== COLLECTION =====
export interface Collection {
    id: string;
    name: string; // "The Medusa Edit"
    slug: string;
    description: string;
    image: string;
    productIds: string[];
    featured: boolean;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== CATEGORY =====
export interface Category {
    id: string;
    name: string;
    slug: string;
    parentId?: string;
    image?: string;
    order: number;
    defaultSizeChartId?: string;
    createdAt: Timestamp;
}

// ===== FORM DATA TYPES =====
export type ProductFormData = Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>;
export type BrandFormData = Omit<Brand, 'id' | 'slug' | 'createdAt' | 'updatedAt'>;
export type CollectionFormData = Omit<Collection, 'id' | 'slug' | 'createdAt' | 'updatedAt'>;
export type SizeChartFormData = Omit<SizeChart, 'id' | 'createdAt' | 'updatedAt'>;
export type CategoryFormData = Omit<Category, 'id' | 'slug' | 'createdAt'>;

// ===== CUSTOMER =====
export interface Customer {
    id: string; // Firebase Auth UID
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    defaultAddressId?: string;
    orderCount: number;
    totalSpent: number;
    tags: string[]; // VIP, Wholesale, etc.
    notes?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== ADDRESS BOOK =====
export interface Address {
    id: string;
    customerId: string;
    label: string; // "Home", "Office", etc.
    firstName: string;
    lastName: string;
    company?: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== CART =====
export interface CartItem {
    productId: string;
    productName: string;
    brandName: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
    addedAt: Timestamp;
}

export interface Cart {
    id: string;
    customerId?: string; // Optional for guest carts
    sessionId?: string; // For guest carts
    items: CartItem[];
    subtotal: number;
    itemCount: number;
    expiresAt?: Timestamp; // For abandoned cart cleanup
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== ORDER =====
export interface OrderItem {
    productId: string;
    variantId?: string;
    productName: string;
    brandName: string;
    sku?: string;
    price: number;
    quantity: number;
    size?: string;
    image: string;
    totalPrice: number;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'ready_to_ship'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'refunded';

export type PaymentStatus =
    | 'pending'
    | 'authorized'
    | 'paid'
    | 'partially_refunded'
    | 'refunded'
    | 'failed'
    | 'cancelled';

export interface Order {
    id: string;
    orderNumber: string; // HOM-0001
    customerId?: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;

    // Items
    items: OrderItem[];

    // Pricing
    subtotal: number;
    discount: number;
    discountCode?: string;
    shippingCost: number;
    tax: number;
    total: number;

    // Status
    status: OrderStatus;
    paymentStatus: PaymentStatus;

    // Addresses
    shippingAddress: Address;
    billingAddress?: Address;

    // Shipping
    shippingMethod: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: Timestamp;

    // Payment
    paymentMethod: string;
    paymentId?: string; // Razorpay payment ID
    razorpayOrderId?: string;

    // Notes
    customerNotes?: string;
    internalNotes?: string;
    tags: string[];

    // Timestamps
    paidAt?: Timestamp;
    shippedAt?: Timestamp;
    deliveredAt?: Timestamp;
    cancelledAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== ORDER TRACKING =====
export interface TrackingEvent {
    id: string;
    orderId: string;
    status: string;
    description: string;
    location?: string;
    timestamp: Timestamp;
    createdBy?: string; // Admin who added the event
}

export interface Shipment {
    id: string;
    orderId: string;
    carrier: string; // Delhivery, BlueDart, etc.
    trackingNumber: string;
    trackingUrl?: string;
    status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
    estimatedDelivery?: Timestamp;
    actualDelivery?: Timestamp;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    events: TrackingEvent[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== INVENTORY =====
export interface InventoryMovement {
    id: string;
    productId: string;
    variantId?: string;
    type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer' | 'damage';
    quantity: number; // Positive for in, negative for out
    previousStock: number;
    newStock: number;
    reference?: string; // Order ID, PO number, etc.
    notes?: string;
    createdBy: string;
    createdAt: Timestamp;
}

export interface InventoryAlert {
    id: string;
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
    status: 'low_stock' | 'out_of_stock' | 'resolved';
    acknowledgedAt?: Timestamp;
    acknowledgedBy?: string;
    createdAt: Timestamp;
}

// ===== COUPON / DISCOUNT =====
export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number; // Percentage (10) or fixed amount (500)
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    usedCount: number;
    perCustomerLimit?: number;
    applicableProducts?: string[]; // Empty = all products
    applicableCategories?: string[];
    startDate: Timestamp;
    endDate: Timestamp;
    isActive: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== WISHLIST =====
export interface Wishlist {
    id: string;
    customerId: string;
    items: {
        productId: string;
        addedAt: Timestamp;
    }[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== REVIEWS =====
export interface Review {
    id: string;
    productId: string;
    customerId: string;
    customerName: string;
    orderId?: string;
    rating: number; // 1-5
    title?: string;
    content: string;
    images?: string[];
    isVerifiedPurchase: boolean;
    status: 'pending' | 'approved' | 'rejected';
    adminResponse?: string;
    helpfulCount: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// ===== HOMEPAGE CONTENT =====
export interface HomepageContent {
    id: string;
    hero: {
        title: string;
        subtitle: string;
        image: string;
        ctaPrimary: { text: string; link: string };
        ctaSecondary: { text: string; link: string };
    };
    announcement: {
        text: string;
        link?: string;
        enabled: boolean;
    };
    featuredCollectionIds: string[];
    featuredProductIds: string[];
    featuredBrandIds: string[];
    updatedAt: Timestamp;
}

// ===== MEDIA =====
export interface MediaItem {
    id: string;
    url: string;
    filename: string;
    alt: string;
    type: 'image' | 'video';
    size: number;
    dimensions?: {
        width: number;
        height: number;
    };
    folder: string;
    createdAt: Timestamp;
}

// ===== ADMIN USER =====
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    avatar?: string;
    lastLogin?: Timestamp;
    createdAt: Timestamp;
}

// ===== SETTINGS =====
export interface StoreSettings {
    id: string;
    storeName: string;
    storeEmail: string;
    storePhone: string;
    currency: string;
    taxRate: number;
    freeShippingThreshold: number;
    defaultShippingCost: number;
    address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    socialLinks: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        youtube?: string;
    };
    policies: {
        shipping?: string;
        returns?: string;
        privacy?: string;
        terms?: string;
    };
    updatedAt: Timestamp;
}

// ===== NOTIFICATIONS =====
export interface Notification {
    id: string;
    type: 'order' | 'inventory' | 'review' | 'system';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    recipientId?: string; // Admin user ID
    createdAt: Timestamp;
}

// ===== ANALYTICS =====
export interface DailyStat {
    id: string;
    date: string; // YYYY-MM-DD
    orders: number;
    revenue: number;
    visitors?: number;
    conversionRate?: number;
    averageOrderValue: number;
}

// ===== API RESPONSE =====
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ===== PAGINATION =====
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ===== FILTERS =====
export interface ProductFilters {
    brandId?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    visibility?: 'draft' | 'live' | 'archive';
    featured?: boolean;
    inStock?: boolean;
}

export interface OrderFilters {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    customerId?: string;
    startDate?: Timestamp;
    endDate?: Timestamp;
    minTotal?: number;
    maxTotal?: number;
}

// ===== AFFILIATE PROGRAM =====
export type AffiliateStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Affiliate {
    id: string;
    userId?: string; // Firebase Auth UID if registered
    email: string;
    firstName: string;
    lastName: string;
    phone: string;

    // Referral info
    referralCode: string; // Unique code like "JOHN2024"
    referralLink: string; // Full URL

    // Status
    status: AffiliateStatus;
    approvedAt?: Timestamp;
    approvedBy?: string;
    rejectionReason?: string;

    // Commission
    commissionRate: number; // Percentage (e.g., 10 for 10%)
    commissionType: 'percentage' | 'flat'; // Flat = fixed amount per sale
    flatCommission?: number; // If type is flat

    // Stats
    totalClicks: number;
    totalOrders: number;
    totalSales: number; // Total revenue generated
    totalCommission: number; // Total commission earned
    pendingCommission: number; // Unpaid commission
    paidCommission: number;

    // Payment info
    paymentMethod?: 'bank_transfer' | 'upi' | 'paypal';
    paymentDetails?: {
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        upiId?: string;
        paypalEmail?: string;
    };

    // Social/Marketing
    website?: string;
    instagram?: string;
    youtube?: string;
    howDidYouHear?: string;
    marketingPlan?: string;

    // Notes
    adminNotes?: string;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface AffiliateReferral {
    id: string;
    affiliateId: string;
    affiliateCode: string;

    // Visitor info
    visitorIp?: string;
    userAgent?: string;
    landingPage: string;

    // Conversion
    converted: boolean;
    orderId?: string;
    orderTotal?: number;
    commissionAmount?: number;

    // Timestamps
    visitedAt: Timestamp;
    convertedAt?: Timestamp;
}

export interface AffiliateCommission {
    id: string;
    affiliateId: string;
    orderId: string;
    orderNumber: string;
    orderTotal: number;
    commissionRate: number;
    commissionAmount: number;
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
    paidAt?: Timestamp;
    paymentReference?: string;
    notes?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface AffiliatePayout {
    id: string;
    affiliateId: string;
    amount: number;
    paymentMethod: string;
    paymentDetails: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transactionId?: string;
    notes?: string;
    processedBy?: string;
    createdAt: Timestamp;
    processedAt?: Timestamp;
}

