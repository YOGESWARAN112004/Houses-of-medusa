'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const REFERRAL_STORAGE_KEY = 'medusa-affiliate-ref';
const REFERRAL_EXPIRY_DAYS = 30;

interface ReferralData {
    code: string;
    affiliateId: string;
    capturedAt: number;
    expiresAt: number;
}

export function useAffiliateTracking() {
    const searchParams = useSearchParams();
    const [referralData, setReferralData] = useState<ReferralData | null>(null);

    // Capture referral code from URL on mount
    useEffect(() => {
        const refCode = searchParams.get('ref');

        if (refCode) {
            captureReferral(refCode);
        } else {
            // Load existing referral from storage
            loadStoredReferral();
        }
    }, [searchParams]);

    const captureReferral = async (code: string) => {
        try {
            // Validate referral code exists and is approved
            const affiliatesRef = collection(db, 'affiliates');
            const q = query(affiliatesRef, where('referralCode', '==', code), where('status', '==', 'approved'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log('Invalid or inactive referral code');
                return;
            }

            const affiliate = snapshot.docs[0];
            const affiliateId = affiliate.id;

            // Store referral data
            const now = Date.now();
            const data: ReferralData = {
                code,
                affiliateId,
                capturedAt: now,
                expiresAt: now + (REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            };

            localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
            setReferralData(data);

            // Increment click count for affiliate
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

            // Clean URL without ref param
            const url = new URL(window.location.href);
            url.searchParams.delete('ref');
            window.history.replaceState({}, '', url.toString());

        } catch (error) {
            console.error('Error capturing referral:', error);
        }
    };

    const loadStoredReferral = () => {
        try {
            const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
            if (!stored) return;

            const data: ReferralData = JSON.parse(stored);

            // Check if expired
            if (Date.now() > data.expiresAt) {
                localStorage.removeItem(REFERRAL_STORAGE_KEY);
                return;
            }

            setReferralData(data);
        } catch (error) {
            console.error('Error loading referral:', error);
        }
    };

    const getReferralCode = useCallback(() => {
        return referralData?.code || null;
    }, [referralData]);

    const getAffiliateId = useCallback(() => {
        return referralData?.affiliateId || null;
    }, [referralData]);

    const clearReferral = useCallback(() => {
        localStorage.removeItem(REFERRAL_STORAGE_KEY);
        setReferralData(null);
    }, []);

    return {
        referralCode: referralData?.code || null,
        affiliateId: referralData?.affiliateId || null,
        hasReferral: !!referralData,
        getReferralCode,
        getAffiliateId,
        clearReferral,
    };
}

// Utility to attribute order to affiliate
export async function attributeOrderToAffiliate(
    orderId: string,
    orderNumber: string,
    orderTotal: number
) {
    try {
        const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
        if (!stored) return null;

        const data: ReferralData = JSON.parse(stored);

        // Check if expired
        if (Date.now() > data.expiresAt) {
            localStorage.removeItem(REFERRAL_STORAGE_KEY);
            return null;
        }

        // Get affiliate to calculate commission
        const affiliateDoc = await getDocs(
            query(collection(db, 'affiliates'), where('referralCode', '==', data.code))
        );

        if (affiliateDoc.empty) return null;

        const affiliate = affiliateDoc.docs[0];
        const affiliateData = affiliate.data();
        const commissionRate = affiliateData.commissionRate || 10;
        const commissionAmount = (orderTotal * commissionRate) / 100;

        // Create commission record
        await addDoc(collection(db, 'affiliateCommissions'), {
            affiliateId: data.affiliateId,
            orderId,
            orderNumber,
            orderTotal,
            commissionRate,
            commissionAmount,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Update affiliate stats
        await updateDoc(doc(db, 'affiliates', data.affiliateId), {
            totalOrders: increment(1),
            totalSales: increment(orderTotal),
            totalCommission: increment(commissionAmount),
            pendingCommission: increment(commissionAmount),
            updatedAt: serverTimestamp(),
        });

        // Update referral record as converted
        const referralsQuery = query(
            collection(db, 'affiliateReferrals'),
            where('affiliateCode', '==', data.code),
            where('converted', '==', false)
        );
        const referrals = await getDocs(referralsQuery);
        if (!referrals.empty) {
            await updateDoc(doc(db, 'affiliateReferrals', referrals.docs[0].id), {
                converted: true,
                orderId,
                orderTotal,
                commissionAmount,
                convertedAt: serverTimestamp(),
            });
        }

        // Clear referral after successful attribution
        localStorage.removeItem(REFERRAL_STORAGE_KEY);

        return {
            affiliateId: data.affiliateId,
            commissionAmount,
        };
    } catch (error) {
        console.error('Error attributing order to affiliate:', error);
        return null;
    }
}
