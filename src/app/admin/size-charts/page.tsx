'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// Demo size charts
const demoSizeCharts = [
    {
        id: '1',
        name: 'Men\'s Clothing - Standard',
        type: 'category',
        attachedTo: 'Men\'s Apparel',
        headers: ['Size', 'US', 'UK', 'EU', 'Chest (cm)', 'Waist (cm)'],
        rows: [
            ['XS', '34', '34', '44', '86-91', '71-76'],
            ['S', '36', '36', '46', '91-96', '76-81'],
            ['M', '38', '38', '48', '96-101', '81-86'],
            ['L', '40', '40', '50', '101-106', '86-91'],
            ['XL', '42', '42', '52', '106-111', '91-96'],
        ],
    },
    {
        id: '2',
        name: 'Women\'s Shoes - EU Standard',
        type: 'category',
        attachedTo: 'Women\'s Footwear',
        headers: ['EU', 'US', 'UK', 'CM'],
        rows: [
            ['35', '5', '2', '22.5'],
            ['36', '6', '3', '23'],
            ['37', '7', '4', '24'],
            ['38', '8', '5', '25'],
            ['39', '9', '6', '26'],
        ],
    },
    {
        id: '3',
        name: 'Versace Brand Standard',
        type: 'brand',
        attachedTo: 'Versace',
        headers: ['Size', 'IT', 'US', 'Bust (cm)', 'Waist (cm)', 'Hips (cm)'],
        rows: [
            ['38', '38', '2', '80', '60', '88'],
            ['40', '40', '4', '84', '64', '92'],
            ['42', '42', '6', '88', '68', '96'],
            ['44', '44', '8', '92', '72', '100'],
        ],
    },
    {
        id: '4',
        name: 'Handbag Dimensions',
        type: 'global',
        attachedTo: null,
        headers: ['Size', 'Width (cm)', 'Height (cm)', 'Depth (cm)'],
        rows: [
            ['Mini', '18', '12', '6'],
            ['Small', '24', '16', '8'],
            ['Medium', '30', '22', '10'],
            ['Large', '38', '28', '12'],
        ],
    },
];

export default function SizeChartsPage() {
    const [selectedType, setSelectedType] = useState('all');
    const [editingChart, setEditingChart] = useState<string | null>(null);

    const filteredCharts = demoSizeCharts.filter(chart =>
        selectedType === 'all' || chart.type === selectedType
    );

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1>Size Charts</h1>
                    <p>Manage product and brand sizing information</p>
                </div>
                <button className="btn btn-primary">
                    Create Size Chart
                </button>
            </header>

            {/* Info Box */}
            <div className={styles.infoBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div>
                    <strong>Size Chart Priority</strong>
                    <p>When displaying size charts: Product-specific → Brand-specific → Category-specific → Global</p>
                </div>
            </div>

            {/* Type Filters */}
            <div className={styles.typeFilters}>
                {['all', 'product', 'brand', 'category', 'global'].map((type) => (
                    <button
                        key={type}
                        className={`${styles.typeBtn} ${selectedType === type ? styles.active : ''}`}
                        onClick={() => setSelectedType(type)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {/* Size Charts List */}
            <div className={styles.chartsList}>
                {filteredCharts.map((chart) => (
                    <div key={chart.id} className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <div>
                                <h3>{chart.name}</h3>
                                <div className={styles.chartMeta}>
                                    <span className={`${styles.typeBadge} ${styles[chart.type]}`}>
                                        {chart.type}
                                    </span>
                                    {chart.attachedTo && (
                                        <span className={styles.attachedTo}>→ {chart.attachedTo}</span>
                                    )}
                                </div>
                            </div>
                            <div className={styles.chartActions}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => setEditingChart(editingChart === chart.id ? null : chart.id)}
                                >
                                    {editingChart === chart.id ? 'Close' : 'Edit'}
                                </button>
                                <button className={`${styles.actionBtn} ${styles.danger}`}>
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* Size Chart Table */}
                        <div className={styles.tableWrapper}>
                            <table className={styles.chartTable}>
                                <thead>
                                    <tr>
                                        {chart.headers.map((header, i) => (
                                            <th key={i}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {chart.rows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map((cell, cellIndex) => (
                                                <td key={cellIndex}>
                                                    {editingChart === chart.id ? (
                                                        <input
                                                            type="text"
                                                            defaultValue={cell}
                                                            className={styles.cellInput}
                                                        />
                                                    ) : (
                                                        cell
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Edit Actions */}
                        {editingChart === chart.id && (
                            <div className={styles.editActions}>
                                <button className={styles.addRowBtn}>+ Add Row</button>
                                <button className={styles.addColBtn}>+ Add Column</button>
                                <button className="btn btn-primary">Save Changes</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
