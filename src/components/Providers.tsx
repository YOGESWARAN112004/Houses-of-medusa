'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ShopProvider } from '@/contexts/ShopContext';
import { ReactNode } from 'react';

interface ProvidersProps {
    children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            <ShopProvider>
                {children}
            </ShopProvider>
        </AuthProvider>
    );
}
