'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { user, adminUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login');
        } else if (!loading && user && !adminUser) {
            // User is logged in but not an admin
            router.push('/admin/login');
        }
    }, [user, adminUser, loading, router]);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)',
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '2px solid var(--border-subtle)',
                    borderTopColor: 'var(--gold-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
            </div>
        );
    }

    if (!user || !adminUser) {
        return null;
    }

    return <>{children}</>;
}
