'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const REFERRAL_STORAGE_KEY = 'medusa-affiliate-ref';
const REFERRAL_EXPIRY_DAYS = 30;

export default function AffiliateTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            captureReferral(refCode);
        }
    }, [searchParams]);

    const captureReferral = async (code: string) => {
        try {
            // Check if already have a valid referral
            const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
            if (stored) {
                const existing = JSON.parse(stored);
                if (Date.now() < existing.expiresAt) {
                    // Already have valid referral, skip
                    cleanUrl();
                    return;
                }
            }

            // Validate referral code
            const affiliatesRef = collection(db, 'affiliates');
            const q = query(
                affiliatesRef,
                where('referralCode', '==', code),
                where('status', '==', 'approved')
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log('Invalid or inactive referral code');
                cleanUrl();
                return;
            }

            const affiliate = snapshot.docs[0];
            const affiliateId = affiliate.id;

            // Store referral data
            const now = Date.now();
            const data = {
                code,
                affiliateId,
                capturedAt: now,
                expiresAt: now + (REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            };

            localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));

            // Increment click count
            await updateDoc(doc(db, 'affiliates', affiliateId), {
                totalClicks: increment(1),
            });

            // Log referral visit
            await addDoc(collection(db, 'affiliateReferrals'), {
                affiliateId,
                affiliateCode: code,
                landingPage: window.location.pathname,
                converted: false,
                visitedAt: serverTimestamp(),
            });

            cleanUrl();
        } catch (error) {
            console.error('Error capturing referral:', error);
            cleanUrl();
        }
    };

    const cleanUrl = () => {
        const url = new URL(window.location.href);
        if (url.searchParams.has('ref')) {
            url.searchParams.delete('ref');
            window.history.replaceState({}, '', url.toString());
        }
    };

    return null; // This component doesn't render anything
}
