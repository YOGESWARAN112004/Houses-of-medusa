'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: 'admin' | 'editor' | 'viewer';
    photoURL: string | null;
}

interface AuthContextType {
    user: User | null;
    adminUser: AdminUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch admin user data from Firestore
                try {
                    const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
                    if (adminDoc.exists()) {
                        const data = adminDoc.data();
                        setAdminUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            role: data.role || 'viewer',
                            photoURL: firebaseUser.photoURL,
                        });
                    } else {
                        setAdminUser(null);
                    }
                } catch (error) {
                    console.error('Error fetching admin data:', error);
                    setAdminUser(null);
                }
            } else {
                setAdminUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);

        // Check if user is an admin
        const adminDoc = await getDoc(doc(db, 'admins', result.user.uid));
        if (!adminDoc.exists()) {
            await firebaseSignOut(auth);
            throw new Error('You do not have admin access');
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with name
        await updateProfile(result.user, { displayName: name });

        // Create admin document (default role: viewer - needs manual upgrade)
        await setDoc(doc(db, 'admins', result.user.uid), {
            email,
            displayName: name,
            role: 'viewer',
            createdAt: new Date(),
        });
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setAdminUser(null);
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const value = {
        user,
        adminUser,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        isAdmin: adminUser?.role === 'admin' || adminUser?.role === 'editor',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
