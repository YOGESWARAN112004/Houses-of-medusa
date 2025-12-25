import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    listAll,
} from 'firebase/storage';
import { storage } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
    url: string;
    path: string;
    filename: string;
}

// Upload folders
export const STORAGE_FOLDERS = {
    PRODUCTS: 'products',
    BRANDS: 'brands',
    COLLECTIONS: 'collections',
    HOMEPAGE: 'homepage',
    GENERAL: 'general',
} as const;

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
    file: File,
    folder: string = STORAGE_FOLDERS.GENERAL
): Promise<UploadResult> {
    const extension = file.name.split('.').pop();
    const filename = `${uuidv4()}.${extension}`;
    const path = `${folder}/${filename}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return {
        url,
        path,
        filename,
    };
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
    files: File[],
    folder: string = STORAGE_FOLDERS.GENERAL
): Promise<UploadResult[]> {
    const results = await Promise.all(
        files.map(file => uploadFile(file, folder))
    );
    return results;
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
}

/**
 * Get all files in a folder
 */
export async function listFiles(folder: string): Promise<string[]> {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    const urls = await Promise.all(
        result.items.map(item => getDownloadURL(item))
    );
    return urls;
}

/**
 * Generate a resized image URL (if using Firebase Extensions)
 * Note: This requires the Resize Images extension to be installed
 */
export function getResizedImageUrl(
    originalUrl: string,
    size: 'thumb' | 'medium' | 'large'
): string {
    const sizeMap = {
        thumb: '200x200',
        medium: '800x800',
        large: '1600x1600',
    };

    // If using Firebase Extension, the resized images follow a naming convention
    // This is a placeholder - adjust based on your extension configuration
    return originalUrl.replace(/(\.[^.]+)$/, `_${sizeMap[size]}$1`);
}

/**
 * Validate file type
 */
export function isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
}

/**
 * Validate file size (max 10MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
}

/**
 * Get file dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
