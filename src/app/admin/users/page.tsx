'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import styles from './page.module.css';

interface Admin {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: any;
}

export default function AdminUsersPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'admin',
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'admins'));
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Admin[];
            setAdmins(data);
        } catch (error) {
            console.error('Error fetching admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Add to admins collection
            await setDoc(doc(db, 'admins', userCredential.user.uid), {
                email: formData.email,
                name: formData.name,
                role: formData.role,
                createdAt: serverTimestamp(),
            });

            // Refresh list
            await fetchAdmins();

            // Reset form and close modal
            setFormData({ email: '', password: '', name: '', role: 'admin' });
            setShowModal(false);
        } catch (err: any) {
            console.error('Error creating admin:', err);
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password must be at least 6 characters.');
            } else {
                setError(err.message || 'Failed to create admin.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`Remove admin access for ${email}?`)) return;

        try {
            await deleteDoc(doc(db, 'admins', id));
            setAdmins(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting admin:', error);
            alert('Failed to remove admin. Note: This only removes from Firestore, not Firebase Auth.');
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Admin Users</h1>
                    <p>Manage who has access to the admin panel</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add Admin
                </button>
            </header>

            {/* Admins List */}
            {loading ? (
                <div className={styles.loading}>Loading admins...</div>
            ) : admins.length === 0 ? (
                <div className={styles.empty}>
                    <p>No admins configured yet.</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Add First Admin
                    </button>
                </div>
            ) : (
                <div className={styles.adminsList}>
                    {admins.map((admin) => (
                        <div key={admin.id} className={styles.adminCard}>
                            <div className={styles.adminInfo}>
                                <div className={styles.avatar}>
                                    {admin.name?.charAt(0)?.toUpperCase() || admin.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3>{admin.name || 'Unnamed Admin'}</h3>
                                    <p>{admin.email}</p>
                                </div>
                            </div>
                            <div className={styles.adminMeta}>
                                <span className={`${styles.role} ${styles[admin.role]}`}>
                                    {admin.role}
                                </span>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(admin.id, admin.email)}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <polyline points="3,6 5,6 21,6" />
                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Admin Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Add New Admin</h2>

                        {error && <p className={styles.error}>{error}</p>}

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="admin@housesofmedusa.com"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    minLength={6}
                                    placeholder="Minimum 6 characters"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="role">Role</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="editor">Editor</option>
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Creating...' : 'Create Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
