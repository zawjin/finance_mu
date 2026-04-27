import React, { useState, useEffect } from 'react';
import { 
    Typography, Checkbox
} from '@mui/material';
import { Shield, Plus, Edit2, Trash2, Save, X, Fingerprint, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import BaseDialog from '../components/ui/BaseDialog';
import { motion, AnimatePresence } from 'framer-motion';
import './RoleManagementPage.scss';

const MODULES = ["Dashboard", "Audit Ledger", "Cash Reserves", "Asset Portfolio", "Fixed Costs", "Health", "Salary Calculation", "User Management", "Role Management", "Settings"];

const ROLE_COLORS = [
    { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
];

export default function RoleManagementPage() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [newRoleName, setNewRoleName] = useState('');

    useEffect(() => {
        fetchRoles();

        const handleTrigger = () => {
            console.log("Triggering Add Role Modal via Global Event");
            setNewRoleName('');
            setEditingRole(null);
            setShowAddModal(true);
        };
        window.addEventListener('trigger-add-role', handleTrigger);
        return () => window.removeEventListener('trigger-add-role', handleTrigger);
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/admin/roles');
            setRoles(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveRole = async () => {
        try {
            if (editingRole && editingRole._id) {
                await api.put(`/admin/roles/${editingRole._id}`, editingRole);
            } else {
                await api.post('/admin/roles', { role_name: newRoleName, permissions: [] });
            }
            fetchRoles();
            setEditingRole(null);
            setShowAddModal(false);
            setNewRoleName('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;
        try {
            await api.delete(`/admin/roles/${roleToDelete._id}`);
            fetchRoles();
            setRoleToDelete(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTogglePermission = (module, action) => {
        const updatedPermissions = [...(editingRole.permissions || [])];
        const moduleIndex = updatedPermissions.findIndex(p => p.module_name === module);
        
        if (moduleIndex > -1) {
            updatedPermissions[moduleIndex] = {
                ...updatedPermissions[moduleIndex],
                [action]: !updatedPermissions[moduleIndex][action]
            };
        } else {
            updatedPermissions.push({
                module_name: module,
                can_view: action === 'can_view',
                can_create: action === 'can_create',
                can_edit: action === 'can_edit',
                can_delete: action === 'can_delete'
            });
        }
        setEditingRole({ ...editingRole, permissions: updatedPermissions });
    };

    return (
        <div className="role-mgmt-root">
            <header className="role-header-section">
                <div className="title-group">
                    <h1>Role Authority</h1>
                    <p>Govern system-wide access shards and neural permissions</p>
                </div>
            </header>

            <div className="user-table-glass">
                <table>
                    <thead>
                        <tr>
                            <th>Role Shard</th>
                            <th>Permissions</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {roles.map((role, idx) => {
                                const roleConfig = ROLE_COLORS[idx % ROLE_COLORS.length];
                                return (
                                    <motion.tr 
                                        key={role._id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    >
                                        <td data-label="Role Shard">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                <div style={{ width: 46, height: 46, borderRadius: '14px', background: roleConfig.bg, color: roleConfig.color, display: 'grid', placeItems: 'center' }}>
                                                    <Shield size={22} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 950, color: '#0f172a', fontSize: '1rem' }}>{role.role_name}</div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>ID: {role._id.slice(-6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Permissions">
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {(role.permissions || []).filter(p => p.can_view || p.can_create || p.can_edit || p.can_delete).slice(0, 3).map(p => (
                                                    <div key={p.module_name} style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900 }}>
                                                        {p.module_name}
                                                    </div>
                                                ))}
                                                {(role.permissions || []).length > 3 && (
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', paddingTop: '4px' }}>
                                                        +{role.permissions.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                                <button onClick={() => setEditingRole(role)} className="btn-user-action-edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => setRoleToDelete(role)} 
                                                    className="btn-user-action-delete"
                                                    disabled={role.role_name === 'Super Admin'}
                                                    style={{ opacity: role.role_name === 'Super Admin' ? 0.3 : 1 }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* ── Configure Permissions Modal ──────────────── */}
            <BaseDialog
                open={!!editingRole}
                onClose={() => { setEditingRole(null); setNewRoleName(''); }}
                title={`Configure Authority: ${editingRole?.role_name}`}
                maxWidth="md"
            >
                {editingRole && (
                    <div className="perm-modal-content-ordered">
                        <div className="role-name-field">
                            <label>Identity Label</label>
                            <input 
                                value={editingRole.role_name}
                                onChange={e => setEditingRole({ ...editingRole, role_name: e.target.value })}
                                placeholder="e.g. System Admin"
                            />
                        </div>

                        <div className="table-container-cute">
                            <table className="perm-table-tick">
                                <thead>
                                    <tr>
                                        <th>Module Shard</th>
                                        <th className="center">View</th>
                                        <th className="center">Add</th>
                                        <th className="center">Edit</th>
                                        <th className="center">Del</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MODULES.map(module => {
                                        const perm = editingRole.permissions?.find(p => p.module_name === module) || {};
                                        const isSystemRestricted = editingRole.role_name === 'Super Admin' && (module === 'User Management' || module === 'Role Management');
                                        
                                        return (
                                            <tr key={module} style={{ opacity: isSystemRestricted ? 0.5 : 1 }}>
                                                <td className="module-name-cell">
                                                    {module}
                                                    {isSystemRestricted && <span style={{ fontSize: '0.6rem', color: '#6366f1', marginLeft: '0.5rem' }}>(System Protected)</span>}
                                                </td>
                                                {[
                                                    { id: 'can_view', color: '#6366f1' },
                                                    { id: 'can_create', color: '#10b981' },
                                                    { id: 'can_edit', color: '#f59e0b' },
                                                    { id: 'can_delete', color: '#ef4444' }
                                                ].map(act => (
                                                    <td key={act.id} className="center">
                                                        <label className="tick-checkbox" style={{ cursor: isSystemRestricted ? 'not-allowed' : 'pointer' }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={!!perm[act.id]} 
                                                                onChange={() => !isSystemRestricted && handleTogglePermission(module, act.id)}
                                                                disabled={isSystemRestricted}
                                                            />
                                                            <div className="tick-box" style={{ '--tick-color': act.color }}>
                                                                <CheckCircle2 size={16} className="tick-icon" />
                                                            </div>
                                                        </label>
                                                    </td>
                                                ))}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="modal-footer-cute">
                            <button className="btn-cancel" onClick={() => setEditingRole(null)}>Discard</button>
                            <button className="btn-save" onClick={handleSaveRole}>Commit Authority</button>
                        </div>
                    </div>
                )}
            </BaseDialog>

            {/* ── Add Role Modal ──────────────────────────── */}
            <BaseDialog
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Born a New Role"
                maxWidth="xs"
            >
                <div className="add-role-cute">
                    <div className="cute-icon-pulse">
                        <Shield size={48} color="#6366f1" />
                    </div>
                    <h2>New Identity Shard</h2>
                    <p>Enter a name for this new authority layer. You can configure permissions after creation.</p>
                    
                    <div className="role-name-field" style={{ marginBottom: '2rem' }}>
                        <label>Role Identity</label>
                        <input 
                            placeholder="e.g. Risk Analyst"
                            value={newRoleName}
                            onChange={e => setNewRoleName(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        className="btn-initialize-neon" 
                        onClick={handleSaveRole}
                    >
                        <Plus size={18} /> INITIALIZE ROLE
                    </button>
                </div>
            </BaseDialog>

            {/* ── Delete Confirmation Modal ──────────────── */}
            <BaseDialog
                open={!!roleToDelete}
                onClose={() => setRoleToDelete(null)}
                title="Delete Authority?"
                maxWidth="xs"
            >
                <div className="delete-confirm-cute">
                    <div className="warning-icon-bounce">
                        <Trash2 size={42} color="#ef4444" />
                    </div>
                    <h2>Wait! Are you sure?</h2>
                    <p>Deleting the <b>{roleToDelete?.role_name}</b> role might affect users assigned to it. This action is irreversible.</p>
                    
                    <div className="delete-actions-row">
                        <button className="btn-keep" onClick={() => setRoleToDelete(null)}>No, Keep it</button>
                        <button className="btn-delete-final" onClick={handleDeleteRole}>Yes, Delete it</button>
                    </div>
                </div>
            </BaseDialog>
        </div>
    );
}
