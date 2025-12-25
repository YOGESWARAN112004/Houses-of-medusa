'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  brandId: string;
  images: string[];
  tags?: string[];
}

interface HomepageData {
  hero: {
    title: string;
    subtitle: string;
    image: string;
    ctaPrimary: { text: string; link: string };
    ctaSecondary: { text: string; link: string };
  };
  announcement: {
    enabled: boolean;
    text: string;
  };
  featuredCollectionIds: string[];
  featuredProductIds: string[];
}

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [homepage, setHomepage] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch homepage settings
      const homepageDoc = await getDoc(doc(db, 'homepage', 'main'));
      if (homepageDoc.exists()) {
        setHomepage(homepageDoc.data() as HomepageData);
      }

      // Fetch featured collections
      const collectionsSnap = await getDocs(query(collection(db, 'collections'), where('featured', '==', true), limit(3)));
      setCollections(collectionsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Collection[]);

      // Fetch brands
      const brandsSnap = await getDocs(query(collection(db, 'brands'), limit(6)));
      setBrands(brandsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Brand[]);

      // Fetch featured products
      const productsSnap = await getDocs(query(collection(db, 'products'), where('featured', '==', true), limit(4)));
      setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  return (
    <>
      <Header transparent />

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <div className={styles.heroGradient}></div>
            <div className={styles.heroPattern}></div>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroLogo}>
              <Image
                src="/logo.png"
                alt="Houses of Medusa"
                width={375}
                height={300}
                priority
              />
            </div>
            <h1 className={styles.heroTitle}>
              Houses of Medusa
            </h1>
            <p className={styles.heroSubtitle}>
              Luxury Outlet Retail
            </p>
            <div className={styles.heroDivider}></div>
            <p className={styles.heroTagline}>
              {homepage?.hero?.title || "We don't sell fashion. We sell status."}
            </p>
            <div className={styles.heroActions}>
              <Link href={homepage?.hero?.ctaPrimary?.link || "/products"} className="btn btn-primary">
                {homepage?.hero?.ctaPrimary?.text || "Explore Collection"}
              </Link>
              <Link href={homepage?.hero?.ctaSecondary?.link || "/about"} className="btn btn-secondary">
                {homepage?.hero?.ctaSecondary?.text || "Our Story"}
              </Link>
            </div>
          </div>

          <div className={styles.scrollIndicator}>
            <span>Discover</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* Announcement Strip */}
        {homepage?.announcement?.enabled !== false && homepage?.announcement?.text && (
          <div className={styles.announcement}>
            <p>{homepage.announcement.text}</p>
          </div>
        )}

        {/* Featured Collections */}
        {collections.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Curated for You</span>
              <h2 className={styles.sectionTitle}>Signature Collections</h2>
              <p className={styles.sectionDesc}>
                Discover carefully curated selections from the world's most prestigious houses
              </p>
            </div>

            <div className={styles.collections}>
              {collections.map((coll, index) => (
                <Link
                  key={coll.id}
                  href={`/collections/${coll.slug}`}
                  className={styles.collectionCard}
                >
                  <div className={styles.collectionImage}>
                    {coll.image ? (
                      <Image src={coll.image} alt={coll.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.collectionPlaceholder}>
                        <span>{coll.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className={styles.collectionOverlay}></div>
                  </div>
                  <div className={styles.collectionContent}>
                    <span className={styles.collectionIndex}>0{index + 1}</span>
                    <h3>{coll.name}</h3>
                    <p>{coll.description}</p>
                    <span className={styles.collectionLink}>
                      Explore
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Editorial Banner */}
        <section className={styles.editorial}>
          <div className={styles.editorialContent}>
            <span className={styles.editorialEyebrow}>The Medusa Philosophy</span>
            <h2 className={styles.editorialTitle}>
              Crafted with Intent.<br />Worn with Authority.
            </h2>
            <p className={styles.editorialText}>
              Every piece in our collection is sourced directly from verified factory outlets,
              ensuring authenticity while providing access to luxury that was once reserved for the few.
            </p>
            <Link href="/about" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
          <div className={styles.editorialImage}>
            <div className={styles.editorialPattern}></div>
          </div>
        </section>

        {/* Featured Products */}
        {products.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Private Access</span>
              <h2 className={styles.sectionTitle}>Featured Pieces</h2>
              <p className={styles.sectionDesc}>
                Exclusive offerings with private pricing for the discerning collector
              </p>
            </div>

            <div className={styles.productsGrid}>
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={styles.productCard}
                >
                  <div className={styles.productImage}>
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.productPlaceholder}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21,15 16,10 5,21" />
                        </svg>
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className={styles.productTags}>
                        {product.tags.map((tag, i) => (
                          <span key={i} className={styles.productTag}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className={styles.productOverlay}>
                      <span className={styles.productViewBtn}>View Details</span>
                    </div>
                  </div>
                  <div className={styles.productContent}>
                    <span className={styles.productBrand}>{product.brandId}</span>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.productPrice}>
                      <span className={styles.price}>{formatPrice(product.price)}</span>
                      {product.compareAtPrice && (
                        <span className={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.sectionAction}>
              <Link href="/products" className="btn btn-secondary">
                View All Pieces
              </Link>
            </div>
          </section>
        )}

        {/* Brand Showcase */}
        {brands.length > 0 && (
          <section className={styles.brandsSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEyebrow}>Our Maisons</span>
              <h2 className={styles.sectionTitle}>The Houses We Represent</h2>
            </div>

            <div className={styles.brandLogos}>
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className={styles.brandLogo}
                >
                  {brand.logo ? (
                    <Image src={brand.logo} alt={brand.name} width={100} height={50} style={{ objectFit: 'contain' }} />
                  ) : (
                    <span>{brand.name}</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trust Section */}
        <section className={styles.trustSection}>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h4>Verified Authenticity</h4>
              <p>Every piece authenticated and verified from factory outlets</p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <h4>Private Pricing</h4>
              <p>Exclusive access to luxury at exceptional value</p>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h4>Discreet Delivery</h4>
              <p>Elegantly packaged and delivered with care</p>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className={styles.newsletter}>
          <div className={styles.newsletterContent}>
            <h2>Join the House</h2>
            <p>Receive exclusive access to new arrivals, private sales, and curated collections.</p>
            <form className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Enter your email"
                className={styles.newsletterInput}
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
            <span className={styles.newsletterNote}>
              Your privacy is sacred. Unsubscribe anytime.
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
