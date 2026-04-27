import React, { useState, useEffect } from 'react';
import { 
    Typography, Chip
} from '@mui/material';
import { User, Plus, Edit2, Trash2, Shield, Search, Phone, Lock, Circle, Fingerprint, Activity } from 'lucide-react';
import api from '../utils/api';
import BaseDialog from '../components/ui/BaseDialog';
import { motion, AnimatePresence } from 'framer-motion';
import './UserManagementPage.scss';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        mobile: '',
        role_id: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchData();

        const handleTrigger = () => {
            setFormData({ username: '', password: '', mobile: '', role_id: '', status: 'ACTIVE' });
            setEditingUser(null);
            setShowAddModal(true);
        };
        window.addEventListener('trigger-add-user', handleTrigger);
        return () => window.removeEventListener('trigger-add-user', handleTrigger);
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/roles')
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        try {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser._id}`, formData);
            } else {
                await api.post('/admin/users', formData);
            }
            fetchData();
            setShowAddModal(false);
            setEditingUser(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/admin/users/${userToDelete._id}`);
            fetchData();
            setUserToDelete(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            mobile: user.mobile || '',
            role_id: user.role_id?._id || user.role_id || '',
            status: user.status,
            password: ''
        });
        setShowAddModal(true);
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) || 
        (u.mobile && u.mobile.includes(search))
    );

    return (
        <div className="user-mgmt-root">
            <header className="user-header-section">
                <div className="title-group">
                    <h1>User Registry</h1>
                    <p>Manage employee identities and organizational access layers</p>
                </div>
            </header>

            <div className="user-table-glass">
                <table>
                    <thead>
                        <tr>
                            <th>Identity</th>
                            <th>Mobile Shard</th>
                            <th>Current Role</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {filteredUsers.map((user, idx) => (
                                <motion.tr 
                                    key={user._id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                >
                                    <td data-label="Identity">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ width: 46, height: 46, borderRadius: '14px', background: '#f1f5f9', display: 'grid', placeItems: 'center', fontWeight: 950, color: '#64748b', fontSize: '1.1rem' }}>
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                                <div className={`status-orb ${user.status.toLowerCase()}`}></div>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 950, color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {user.username}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>ID: {user._id.slice(-6).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Mobile Shard" style={{ fontWeight: 800, color: '#475569' }}>{user.mobile || '—'}</td>
                                    <td data-label="Current Role">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, color: '#6366f1', fontSize: '0.85rem' }}>
                                            <Shield size={14} />
                                            {user.role?.role_name || 'No Role'}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <button onClick={() => handleEdit(user)} className="btn-user-action-edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => setUserToDelete(user)} className="btn-user-action-delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* ── Add/Edit User Modal ──────────────────────── */}
            <BaseDialog
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingUser ? "Edit Identity" : "Provision Identity"}
                maxWidth="xs"
            >
                <div className="form-modal-cute">
                    <div className="cute-form-header">
                        <div className="icon-box">
                            <Fingerprint size={38} />
                        </div>
                        <h2>{editingUser ? "Evolve Identity" : "New Neural Link"}</h2>
                        <p>{editingUser ? "Update the core parameters for this user shard." : "Initialize a new access link for the organizational grid."}</p>
                    </div>

                    <div className="cute-input-group">
                        <label>Username Label</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input 
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                placeholder="e.g. jarvis_01"
                            />
                        </div>
                    </div>

                    <div className="cute-input-group">
                        <label>{editingUser ? "Secret Key (Optional)" : "Neural Secret Key"}</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input 
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="cute-input-group">
                        <label>Comms Link (Mobile)</label>
                        <div className="input-wrapper">
                            <Phone size={18} className="input-icon" />
                            <input 
                                value={formData.mobile}
                                onChange={e => setFormData({...formData, mobile: e.target.value})}
                                placeholder="+91 00000 00000"
                            />
                        </div>
                    </div>

                    <div className="cute-input-group">
                        <label>Authority Layer</label>
                        <div className="input-wrapper">
                            <Shield size={18} className="input-icon" />
                            <select 
                                value={formData.role_id}
                                onChange={e => setFormData({...formData, role_id: e.target.value})}
                                disabled={editingUser?.role?.role_name === 'Super Admin'}
                                style={{ opacity: editingUser?.role?.role_name === 'Super Admin' ? 0.5 : 1, cursor: editingUser?.role?.role_name === 'Super Admin' ? 'not-allowed' : 'pointer' }}
                            >
                                <option value="">Select Role Shard</option>
                                {roles.map(r => (
                                    <option key={r._id} value={r._id}>{r.role_name}</option>
                                ))}
                            </select>
                        </div>
                        {editingUser?.role?.role_name === 'Super Admin' && (
                            <span style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: 900, marginLeft: '0.5rem', marginTop: '0.4rem', display: 'block' }}>
                                SYSTEM PROTECTED ROLE
                            </span>
                        )}
                    </div>

                    <div className="cute-input-group">
                        <label>Lifecycle Status</label>
                        <div className="input-wrapper">
                            <Activity size={18} className="input-icon" />
                            <select 
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="DISABLED">DISABLED</option>
                            </select>
                        </div>
                    </div>

                    <button className="btn-cute-submit" onClick={handleSubmit}>
                        {editingUser ? "SYNC IDENTITY" : "INITIALIZE LINK"}
                    </button>
                </div>
            </BaseDialog>

            {/* ── Delete Confirmation Modal ──────────────── */}
            <BaseDialog
                open={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                title="De-Provision Identity?"
                maxWidth="xs"
            >
                <div className="delete-confirm-cute">
                    <div className="warning-icon-bounce">
                        <Trash2 size={42} color="#ef4444" />
                    </div>
                    <h2>Sever this link?</h2>
                    <p>De-provisioning <b>{userToDelete?.username}</b> will instantly revoke all neural access. This action is irreversible.</p>
                    
                    <div className="delete-actions-row">
                        <button className="btn-keep" onClick={() => setUserToDelete(null)}>No, Keep it</button>
                        <button className="btn-delete-final" onClick={handleDelete}>Yes, Sever Link</button>
                    </div>
                </div>
            </BaseDialog>
        </div>
    );
}
