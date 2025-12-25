'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface UploadProgress {
    fileName: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    url?: string;
    error?: string;
}

export function useStorage() {
    const [uploads, setUploads] = useState<Record<string, UploadProgress>>({});

    const uploadFile = async (file: File, folder: string = 'media'): Promise<string> => {
        const fileName = `${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `${folder}/${fileName}`);

        return new Promise((resolve, reject) => {
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Track upload progress
            setUploads(prev => ({
                ...prev,
                [fileName]: { fileName, progress: 0, status: 'uploading' },
            }));

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploads(prev => ({
                        ...prev,
                        [fileName]: { ...prev[fileName], progress },
                    }));
                },
                (error) => {
                    setUploads(prev => ({
                        ...prev,
                        [fileName]: { ...prev[fileName], status: 'error', error: error.message },
                    }));
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setUploads(prev => ({
                        ...prev,
                        [fileName]: { ...prev[fileName], status: 'completed', progress: 100, url: downloadURL },
                    }));
                    resolve(downloadURL);
                }
            );
        });
    };

    const uploadFiles = async (files: FileList | File[], folder: string = 'media'): Promise<string[]> => {
        const fileArray = Array.from(files);
        const urls = await Promise.all(fileArray.map(file => uploadFile(file, folder)));
        return urls;
    };

    const deleteFile = async (url: string): Promise<void> => {
        try {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    };

    const clearUploads = () => {
        setUploads({});
    };

    return {
        uploadFile,
        uploadFiles,
        deleteFile,
        uploads,
        clearUploads,
    };
}

// Storage folder constants
export const STORAGE_FOLDERS = {
    PRODUCTS: 'products',
    BRANDS: 'brands',
    COLLECTIONS: 'collections',
    HERO: 'hero',
    MEDIA: 'media',
} as const;

// Utility functions for image handling
export const isValidImageType = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
};

export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};
