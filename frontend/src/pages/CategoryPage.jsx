import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Settings, X, PlusCircle, Fingerprint, Layers, Tag
} from 'lucide-react';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';
import BaseDialog from '../components/ui/BaseDialog';
import './CategoryPage.scss';

import {
    Card, Button, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, Chip, Box, Tooltip, Stack, Paper, Divider, Avatar, Skeleton, Grow
} from '@mui/material';

import { getIcon, IconMap } from '../utils/iconMap';

const UI_ICONS = Object.keys(IconMap);
const UI_COLORS = [
    // Primary Vibrant
    '#0071e3', '#34c759', '#ff3b30', '#ff9500', '#af52de', '#5856d6', '#ff2d55',
    '#32ade6', '#00c7be', '#5ac8fa', '#ffcc00', '#8e8e93',
    // High-Fidelity Shades
    '#003366', '#124E27', '#6A0B0B', '#6D4001', '#401A51', '#212053', '#620D20',
    '#1A516C', '#004F4C', '#2C637C', '#6E5800', '#424245',
    // Contemporary Pastels
    '#E3F2FD', '#E8F5E9', '#FFEBEE', '#FFF3E0', '#F3E5F5', '#E8EAF6', '#FCE4EC',
    '#E1F5FE', '#E0F2F1', '#E1F5FE', '#FFFDE7', '#F5F5F7'
];

// Intelligent Branding Engine
const getSuggestedBranding = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('food') || n.includes('eat') || n.includes('rest') || n.includes('dinner')) return { icon: 'Utensils', color: '#ff9500' };
    if (n.includes('shop') || n.includes('cloth') || n.includes('fashion')) return { icon: 'ShoppingBag', color: '#0071e3' };
    if (n.includes('grocer') || n.includes('market')) return { icon: 'ShoppingCart', color: '#34c759' };
    if (n.includes('health') || n.includes('med') || n.includes('dr')) return { icon: 'Stethoscope', color: '#5856d6' };
    if (n.includes('family') || n.includes('baby') || n.includes('love') || n.includes('care')) return { icon: 'Heart', color: '#ff3b30' };
    if (n.includes('off') || n.includes('work') || n.includes('corp')) return { icon: 'Briefcase', color: '#af52de' };
    if (n.includes('leisure') || n.includes('game') || n.includes('fun')) return { icon: 'Gamepad2', color: '#ff2d55' };
    if (n.includes('car') || n.includes('transport') || n.includes('auto') || n.includes('fuel')) return { icon: 'Car', color: '#32ade6' };
    if (n.includes('util') || n.includes('power') || n.includes('elec') || n.includes('zap')) return { icon: 'Zap', color: '#ffcc00' };
    if (n.includes('chit') || n.includes('fund') || n.includes('invest')) return { icon: 'Landmark', color: '#f59e0b' };
    return { icon: 'Package', color: '#0071e3' };
};

export default function CategoryPage() {
    const { categories, assetClasses, loading } = useSelector(state => state.finance);
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'asset_classes'

    // Form Dialog State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newName, setNewName] = useState('');
    const [newSubs, setNewSubs] = useState([]);
    const [newIcon, setNewIcon] = useState('Package');
    const [newColor, setNewColor] = useState('#0071e3');
    const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);

    // Save State
    const [isSaving, setIsSaving] = useState(false);

    // Sorted Categories A-Z
    const activeDataList = activeTab === 'categories' ? categories : (assetClasses || []);

    const sortedCategories = useMemo(() => {
        return [...activeDataList].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [activeDataList]);

    useEffect(() => {
        if (!editingId && autoSuggestEnabled && newName.length > 2) {
            const branding = getSuggestedBranding(newName);
            setNewIcon(branding.icon);
            setNewColor(branding.color);
        }
    }, [newName, editingId, autoSuggestEnabled]);

    const openAddForm = () => {
        setEditingId(null);
        setNewName('');
        setNewSubs(['']);
        setNewIcon('Package');
        setNewColor('#0071e3');
        setAutoSuggestEnabled(true);
        setIsFormOpen(true);
    };

    const openEditForm = (cat) => {
        setEditingId(cat._id);
        setNewName(cat.name);
        setNewSubs(cat.sub_categories || []);
        setNewIcon(cat.icon || 'Package');
        setNewColor(cat.color || '#0071e3');
        setAutoSuggestEnabled(false);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setNewName('');
    };

    const handleSave = async () => {
        if (!newName) return;
        const subList = newSubs.map(s => s.trim()).filter(s => s);
        const payload = {
            name: newName,
            sub_categories: subList.length > 0 ? subList : ['General'],
            icon: newIcon,
            color: newColor
        };

        // Immediate UI Close for perceived speed
        setIsFormOpen(false);
        setIsSaving(true);


        const apiPath = activeTab === 'categories' ? '/categories' : '/asset_classes';

        try {
            if (editingId) {
                await api.put(`${apiPath}/${editingId}`, payload);
            } else {
                await api.post(apiPath, payload);
            }
            // Once data is returned, Redux will update and clear loading
            await dispatch(fetchFinanceData());
        } catch (err) {
            console.error("Failed to save category", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setIsSaving(true);
        const apiPath = activeTab === 'categories' ? '/categories' : '/asset_classes';
        try {
            await api.delete(`${apiPath}/${id}`);
            await dispatch(fetchFinanceData());
        } catch (err) {
            console.error("Failed to delete", err);
        } finally {
            setIsSaving(false);
        }
    };

    const showLoading = loading || isSaving;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem' }}>

            {/* Header Section */}
            <Box className="category-header-flex">
                <Box className="header-brand-wrap">
                    <Box className="header-icon-square"><Settings size={24} /></Box>
                    <Box>
                        <Typography className="header-title-main">Architecture Central</Typography>
                        <Typography className="header-overline-premium">MASTER TAXONOMY ENGINE</Typography>
                    </Box>
                </Box>
                <Box className="header-actions-flex">
                    <div className="tab-pill-group">
                        <button
                            className={`tab-pill-btn ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={() => setActiveTab('categories')}
                        >
                            Spending Categories
                        </button>
                        <button
                            className={`tab-pill-btn ${activeTab === 'asset_classes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('asset_classes')}
                        >
                            Asset Classes
                        </button>
                    </div>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        onClick={openAddForm}
                        className="btn-new-entry-premium"
                    >
                        New Entry
                    </Button>
                </Box>
            </Box>

            {/* List Table View - Horizontal Scroll Enabled for Mobile */}
            <TableContainer component={Paper} elevation={0} className="taxonomy-table-wrapper">
                <Table className="min-w-800">
                    <TableHead className="taxonomy-table-head">
                        <TableRow>
                            <TableCell className="th-cell cell-pl-4">ENTITY CONTEXT</TableCell>
                            <TableCell className="th-cell">GRANULAR NODES</TableCell>
                            <TableCell align="right" className="th-cell cell-pr-4 text-right">OPERATIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {showLoading ? (
                            // Inline Skeleton Rows
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell className="td-cell cell-pl-4">
                                        <Box className="skeleton-context-flex">
                                            <Skeleton variant="rectangular" width={48} height={48} className="skeleton-icon-square" />
                                            <Box className="w-100">
                                                <Skeleton variant="text" width="100%" height={24} />
                                                <Skeleton variant="text" width="60%" height={16} />
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box className="skeleton-node-flex">
                                            <Skeleton variant="rectangular" width={60} height={24} className="skeleton-node-pill" />
                                            <Skeleton variant="rectangular" width={60} height={24} className="skeleton-node-pill" />
                                            <Skeleton variant="rectangular" width={60} height={24} className="skeleton-node-pill" />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" className="cell-pr-4">
                                        <Box className="skeleton-ops-flex">
                                            <Skeleton variant="circular" width={32} height={32} />
                                            <Skeleton variant="circular" width={32} height={32} />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            sortedCategories.map((cat) => {
                                const branding = cat.icon ? { icon: cat.icon, color: cat.color } : getSuggestedBranding(cat.name);
                                return (
                                    <TableRow key={cat._id || cat.name} hover className="taxonomy-row-premium">
                                        <TableCell className="td-cell cell-pl-4">
                                            <Box className="entity-context-flex">
                                                <Avatar 
                                                    style={{
                                                        backgroundColor: `${branding.color}12`,
                                                        color: branding.color,
                                                        borderColor: `${branding.color}20`
                                                    }}
                                                    className="entity-avatar-base"
                                                >
                                                    {React.cloneElement(IconMap[branding.icon] || <Package />, { size: 24, strokeWidth: 2.5 })}
                                                </Avatar>
                                                <Box>
                                                    <Typography className="entity-name-text">
                                                        {cat.name}
                                                    </Typography>
                                                    <Typography className="entity-meta-text">
                                                        {cat.sub_categories?.length || 0} active mappings
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box className="granular-node-flex">
                                                {[...(cat.sub_categories || [])].slice().sort((a, b) => a.localeCompare(b)).map(s => (
                                                    <Chip key={s} label={s} variant="outlined" size="small" className="node-chip-nano" />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" className="cell-pr-4">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <IconButton 
                                                    onClick={() => openEditForm(cat)} 
                                                    style={{ color: branding.color, backgroundColor: `${branding.color}08` }} 
                                                    className="btn-op-edit" 
                                                    size="small"
                                                >
                                                    <Edit2 size={16} />
                                                </IconButton>
                                                <IconButton 
                                                    onClick={() => handleDelete(cat._id)} 
                                                    className="btn-op-delete" 
                                                    size="small"
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Redesigned Slimmer Dialog */}
            <BaseDialog
                open={isFormOpen}
                onClose={closeForm}
                title={editingId ? 'Update Entity' : 'Create Entity'}
                maxWidth="sm"
            >
                <Box className="dialog-master-ledger">
                    <Box className="dialog-branding-header">
                        <Avatar 
                            style={{ backgroundColor: `${newColor}15`, color: newColor, borderColor: `${newColor}25` }}
                            className="dialog-branding-avatar"
                        >
                            {React.cloneElement(IconMap[newIcon] || <Fingerprint />, { size: 24, strokeWidth: 2.5 })}
                        </Avatar>
                        <Box>
                            <Typography className="dialog-branding-title">
                                {newName || 'New Entity'}
                            </Typography>
                            <Typography className="dialog-branding-overline">ENTITY BRANDING</Typography>
                        </Box>
                    </Box>

                    <Stack spacing={3} className="margin-b-4">
                        <Box>
                            <Typography className="dialog-field-label">ENTITY NAME</Typography>
                            <TextField
                                autoFocus
                                placeholder="e.g. Healthcare..."
                                fullWidth
                                variant="outlined"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="dialog-input-premium"
                            />
                        </Box>

                        <Box>
                            <Typography className="dialog-field-label">BRAND COLOR</Typography>
                            <div className="color-swatch-grid">
                                {UI_COLORS.map(c => (
                                    <div
                                        key={c}
                                        className={`color-swatch-item ${newColor === c ? 'active' : ''}`}
                                        onClick={() => { setNewColor(c); setAutoSuggestEnabled(false); }}
                                        style={{ backgroundColor: c, color: c }}
                                    />
                                ))}
                            </div>
                        </Box>

                        <Box className="margin-b-4">
                            <Typography className="dialog-field-label">ICON ARCHETYPE SELECTION</Typography>
                            <div className="icon-archetype-grid">
                                {UI_ICONS.map(icon => (
                                    <IconButton
                                        key={icon}
                                        onClick={() => { setNewIcon(icon); setAutoSuggestEnabled(false); }}
                                        sx={{
                                            p: 1.2, borderRadius: '12px',
                                            bgcolor: newIcon === icon ? `${newColor}20` : 'rgba(255,255,255,0.8)',
                                            color: newIcon === icon ? newColor : 'text.secondary',
                                            boxShadow: newIcon === icon ? `0 4px 12px ${newColor}30` : 'none',
                                            transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': { bgcolor: `${newColor}12`, transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        {React.cloneElement(IconMap[icon], { size: 20, strokeWidth: 2.5 })}
                                    </IconButton>
                                ))}
                            </div>
                        </Box>

                        <Box className="sub-node-header">
                            <Typography className="sub-node-label">SUB-NODES ({newSubs.length})</Typography>
                            <Button 
                                variant="text" 
                                size="small" 
                                startIcon={<PlusCircle size={16} />} 
                                onClick={() => setNewSubs(['', ...newSubs])} 
                                style={{ color: newColor }}
                                className="btn-add-node-nano"
                            >
                                Add Node
                            </Button>
                        </Box>

                        <div className="sub-node-list-box">
                            {newSubs.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center', opacity: 0.4 }}><Typography variant="caption" fontWeight="800">NO NODES DEFINED</Typography></Box>
                            ) : (
                                newSubs.map((sub, idx) => (
                                    <div key={idx} className="sub-node-row">
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant="standard"
                                            placeholder="Label..."
                                            value={sub}
                                            onChange={(e) => {
                                                const updated = [...newSubs];
                                                updated[idx] = e.target.value;
                                                setNewSubs(updated);
                                            }}
                                            className="sub-node-input-raw"
                                            InputProps={{ disableUnderline: true }}
                                        />
                                        <IconButton size="small" onClick={() => {
                                            const updated = [...newSubs];
                                            updated.splice(idx, 1);
                                            setNewSubs(updated);
                                        }} sx={{ color: 'text.secondary' }}><Trash2 size={16} /></IconButton>
                                    </div>
                                ))
                            )}
                        </div>
                    </Stack>

                    <Stack direction="row" spacing={2} className="margin-t-5">
                        <Button fullWidth onClick={closeForm} className="btn-abort-pill">CANCEL</Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleSave}
                            disabled={!newName}
                            style={{ backgroundColor: newColor, boxShadow: `0 8px 24px ${newColor}25` }}
                            className="btn-finalize-pill"
                        >
                            {editingId ? "Update Identity" : "Finalize Infrastructure"}
                        </Button>
                    </Stack>
                </Box>
            </BaseDialog>

        </motion.div>
    );
}
