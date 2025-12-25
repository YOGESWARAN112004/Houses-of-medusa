'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import styles from './page.module.css';

interface MediaItem {
    name: string;
    url: string;
    fullPath: string;
}

interface UploadProgress {
    name: string;
    progress: number;
}

export default function MediaLibraryPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<UploadProgress[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [folder, setFolder] = useState('media');

    const folders = ['media', 'products', 'brands', 'collections', 'homepage'];

    useEffect(() => {
        fetchMedia();
    }, [folder]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const folderRef = ref(storage, folder);
            const result = await listAll(folderRef);

            const items = await Promise.all(
                result.items.map(async (item) => {
                    const url = await getDownloadURL(item);
                    return {
                        name: item.name,
                        url,
                        fullPath: item.fullPath,
                    };
                })
            );

            setMedia(items);
        } catch (error) {
            console.error('Error fetching media:', error);
            setMedia([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const fileArray = Array.from(files);

        for (const file of fileArray) {
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                continue;
            }

            const fileName = `${Date.now()}-${file.name}`;
            const storageRef = ref(storage, `${folder}/${fileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            setUploading(prev => [...prev, { name: file.name, progress: 0 }]);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploading(prev =>
                        prev.map(u => u.name === file.name ? { ...u, progress } : u)
                    );
                },
                (error) => {
                    console.error('Upload error:', error);
                    setUploading(prev => prev.filter(u => u.name !== file.name));
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    setMedia(prev => [...prev, { name: fileName, url, fullPath: `${folder}/${fileName}` }]);
                    setUploading(prev => prev.filter(u => u.name !== file.name));
                }
            );
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDelete = async () => {
        if (selectedItems.length === 0) return;
        if (!confirm(`Delete ${selectedItems.length} item(s)?`)) return;

        for (const path of selectedItems) {
            try {
                const itemRef = ref(storage, path);
                await deleteObject(itemRef);
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }

        setMedia(prev => prev.filter(m => !selectedItems.includes(m.fullPath)));
        setSelectedItems([]);
    };

    const toggleSelect = (fullPath: string) => {
        setSelectedItems(prev =>
            prev.includes(fullPath) ? prev.filter(p => p !== fullPath) : [...prev, fullPath]
        );
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Media Library</h1>
                    <p>Manage images and assets</p>
                </div>
                <div className={styles.headerActions}>
                    {selectedItems.length > 0 && (
                        <button className="btn btn-secondary" onClick={handleDelete}>
                            Delete ({selectedItems.length})
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                        + Upload Files
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                </div>
            </header>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.folders}>
                    {folders.map(f => (
                        <button
                            key={f}
                            className={`${styles.folderBtn} ${folder === f ? styles.active : ''}`}
                            onClick={() => setFolder(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className={styles.viewToggle}>
                    <button
                        className={viewMode === 'grid' ? styles.active : ''}
                        onClick={() => setViewMode('grid')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                    </button>
                    <button
                        className={viewMode === 'list' ? styles.active : ''}
                        onClick={() => setViewMode('list')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="4" width="18" height="4" rx="1" />
                            <rect x="3" y="10" width="18" height="4" rx="1" />
                            <rect x="3" y="16" width="18" height="4" rx="1" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Upload Progress */}
            {uploading.length > 0 && (
                <div className={styles.uploadProgress}>
                    {uploading.map((item, i) => (
                        <div key={i} className={styles.progressItem}>
                            <span>{item.name}</span>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${item.progress}%` }} />
                            </div>
                            <span>{Math.round(item.progress)}%</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Media Grid/List */}
            {loading ? (
                <div className={styles.loading}>Loading media...</div>
            ) : media.length === 0 ? (
                <div className={styles.empty}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                    </svg>
                    <p>No media in this folder</p>
                    <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                        Upload Files
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className={styles.mediaGrid}>
                    {media.map((item) => (
                        <div
                            key={item.fullPath}
                            className={`${styles.mediaItem} ${selectedItems.includes(item.fullPath) ? styles.selected : ''}`}
                        >
                            <div className={styles.mediaThumb} onClick={() => toggleSelect(item.fullPath)}>
                                <Image src={item.url} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                {selectedItems.includes(item.fullPath) && (
                                    <div className={styles.selectBadge}>✓</div>
                                )}
                            </div>
                            <div className={styles.mediaInfo}>
                                <span className={styles.mediaName}>{item.name}</span>
                                <button className={styles.copyBtn} onClick={() => copyUrl(item.url)}>
                                    Copy URL
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.mediaList}>
                    {media.map((item) => (
                        <div
                            key={item.fullPath}
                            className={`${styles.listItem} ${selectedItems.includes(item.fullPath) ? styles.selected : ''}`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(item.fullPath)}
                                onChange={() => toggleSelect(item.fullPath)}
                            />
                            <div className={styles.listThumb}>
                                <Image src={item.url} alt={item.name} width={50} height={50} style={{ objectFit: 'cover' }} />
                            </div>
                            <span className={styles.listName}>{item.name}</span>
                            <button className={styles.copyBtn} onClick={() => copyUrl(item.url)}>
                                Copy URL
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
