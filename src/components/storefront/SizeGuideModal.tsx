'use client';

import { useEffect } from 'react';
import styles from './SizeGuideModal.module.css';

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    sizeChart: {
        headers: string[];
        rows: string[][];
    };
}

export default function SizeGuideModal({
    isOpen,
    onClose,
    productName,
    sizeChart
}: SizeGuideModalProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className={styles.overlay} onClick={onClose} />

            {/* Modal */}
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h2>Size Guide</h2>
                        <p>{productName}</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Size Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    {sizeChart.headers.map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sizeChart.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* How to Measure */}
                    <div className={styles.howToMeasure}>
                        <h3>How to Measure</h3>
                        <div className={styles.measureTips}>
                            <div className={styles.tip}>
                                <span className={styles.tipIcon}>1</span>
                                <p>Use a soft measuring tape for accurate measurements</p>
                            </div>
                            <div className={styles.tip}>
                                <span className={styles.tipIcon}>2</span>
                                <p>Measure against a similar item you own for best fit</p>
                            </div>
                            <div className={styles.tip}>
                                <span className={styles.tipIcon}>3</span>
                                <p>When between sizes, we recommend sizing up</p>
                            </div>
                        </div>
                    </div>

                    {/* International Sizes Note */}
                    <div className={styles.note}>
                        <p>
                            <strong>Note:</strong> All measurements are in centimeters unless otherwise specified.
                            For personalized sizing assistance, please contact our concierge team.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
