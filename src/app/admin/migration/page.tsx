'use client';

import { useState } from 'react';
import styles from './page.module.css';
import {
    runFullMigration,
    seedBrands,
    seedCategories,
    seedProducts,
    seedCollections,
    seedSizeCharts,
    seedHomepage,
    migrationData
} from '@/lib/migration';

interface LogEntry {
    type: 'info' | 'success' | 'error';
    message: string;
    timestamp: Date;
}

export default function MigrationPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const addLog = (type: LogEntry['type'], message: string) => {
        setLogs(prev => [...prev, { type, message, timestamp: new Date() }]);
    };

    const runMigration = async (name: string, fn: () => Promise<void>) => {
        addLog('info', `Starting ${name}...`);
        try {
            await fn();
            addLog('success', `✓ ${name} completed`);
        } catch (error) {
            addLog('error', `✗ ${name} failed: ${(error as Error).message}`);
            throw error;
        }
    };

    const handleFullMigration = async () => {
        setIsRunning(true);
        setLogs([]);
        addLog('info', '🌱 Starting full migration...');

        try {
            await runMigration('Brands', seedBrands);
            await runMigration('Categories', seedCategories);
            await runMigration('Products', seedProducts);
            await runMigration('Collections', seedCollections);
            await runMigration('Size Charts', seedSizeCharts);
            await runMigration('Homepage', seedHomepage);

            addLog('success', '✨ Full migration completed successfully!');
        } catch (error) {
            addLog('error', '❌ Migration failed. Check console for details.');
        } finally {
            setIsRunning(false);
        }
    };

    const handleSeedCollection = async (name: string, fn: () => Promise<void>) => {
        setIsRunning(true);
        setLogs([]);
        await runMigration(name, fn);
        setIsRunning(false);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Database Migration</h1>
                <p>Seed Firestore with demo data for the Houses of Medusa platform</p>
            </header>

            <div className={styles.actions}>
                <button
                    className={`btn btn-primary ${styles.mainAction}`}
                    onClick={handleFullMigration}
                    disabled={isRunning}
                >
                    {isRunning ? 'Running...' : 'Run Full Migration'}
                </button>
            </div>

            <div className={styles.grid}>
                <div className={styles.section}>
                    <h2>Individual Seeds</h2>
                    <div className={styles.seedList}>
                        <button
                            className={styles.seedBtn}
                            onClick={() => handleSeedCollection('Brands', seedBrands)}
                            disabled={isRunning}
                        >
                            <span className={styles.count}>{migrationData.brands.length}</span>
                            <span>Seed Brands</span>
                        </button>
                        <button
                            className={styles.seedBtn}
                            onClick={() => handleSeedCollection('Categories', seedCategories)}
                            disabled={isRunning}
                        >
                            <span className={styles.count}>{migrationData.categories.length}</span>
                            <span>Seed Categories</span>
                        </button>
                        <button
                            className={styles.seedBtn}
                            onClick={() => handleSeedCollection('Products', seedProducts)}
                            disabled={isRunning}
                        >
                            <span className={styles.count}>{migrationData.products.length}</span>
                            <span>Seed Products</span>
                        </button>
                        <button
                            className={styles.seedBtn}
                            onClick={() => handleSeedCollection('Collections', seedCollections)}
                            disabled={isRunning}
                        >
                            <span className={styles.count}>{migrationData.collections.length}</span>
                            <span>Seed Collections</span>
                        </button>
                        <button
                            className={styles.seedBtn}
                            onClick={() => handleSeedCollection('Size Charts', seedSizeCharts)}
                            disabled={isRunning}
                        >
                            <span className={styles.count}>{migrationData.sizeCharts.length}</span>
                            <span>Seed Size Charts</span>
                        </button>
                        <button
                            className={styles.seedBtn}
                            onClick={() => handleSeedCollection('Homepage', seedHomepage)}
                            disabled={isRunning}
                        >
                            <span className={styles.count}>1</span>
                            <span>Seed Homepage</span>
                        </button>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2>Migration Log</h2>
                    <div className={styles.console}>
                        {logs.length === 0 ? (
                            <p className={styles.placeholder}>Click a button to start migration...</p>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className={`${styles.logEntry} ${styles[log.type]}`}>
                                    <span className={styles.time}>
                                        {log.timestamp.toLocaleTimeString()}
                                    </span>
                                    <span>{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.schema}>
                <h2>Firestore Schema</h2>
                <div className={styles.schemaGrid}>
                    <div className={styles.schemaCard}>
                        <h3>/products</h3>
                        <code>id, name, slug, brandId, categoryId, description, price, compareAtPrice, images[], sizes[], colors[], inventory, sku, visibility, featured, tags[], sizeChartId</code>
                    </div>
                    <div className={styles.schemaCard}>
                        <h3>/brands</h3>
                        <code>id, name, slug, logo, description, story, country, founded, featured, isActive, productCount</code>
                    </div>
                    <div className={styles.schemaCard}>
                        <h3>/categories</h3>
                        <code>id, name, slug, description, image, productCount, isActive, displayOrder</code>
                    </div>
                    <div className={styles.schemaCard}>
                        <h3>/collections</h3>
                        <code>id, name, slug, description, image, featured, productIds[], isActive, displayOrder</code>
                    </div>
                    <div className={styles.schemaCard}>
                        <h3>/sizeCharts</h3>
                        <code>id, name, type, categoryId, brandId, productId, priority, measurements[], notes, isActive</code>
                    </div>
                    <div className={styles.schemaCard}>
                        <h3>/orders</h3>
                        <code>id, userId, items[], shippingAddress, billingAddress, subtotal, tax, shipping, total, status, paymentId, trackingNumber</code>
                    </div>
                    <div className={styles.schemaCard}>
                        <h3>/users</h3>
                        <code>id, email, displayName, firstName, lastName, wishlist[], addresses[], createdAt</code>
                    </div>
                    <div className={styles.schemaCard}>
                        <h3>/admins</h3>
                        <code>id, email, displayName, role (admin|editor|viewer), createdAt</code>
                    </div>
                </div>
            </div>
        </div>
    );
}
