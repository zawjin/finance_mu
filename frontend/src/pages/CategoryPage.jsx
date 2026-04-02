import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
    Plus, Edit2, Trash2, Settings, X, PlusCircle, Fingerprint, Layers, Package, Heart, 
    ShoppingCart, Stethoscope, Briefcase, Utensils, ShoppingBag, Car, Zap, Gamepad2, 
    CreditCard, Plane, Home, Music, Tag
} from 'lucide-react';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';

import {
    Card, Button, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, Chip, Box, Tooltip, Stack, Paper, Divider, Avatar, Skeleton
} from '@mui/material';

// Expanded high-res icon map
const IconMap = {
    Package: <Package />, Heart: <Heart />, ShoppingCart: <ShoppingCart />, 
    Stethoscope: <Stethoscope />, Briefcase: <Briefcase />, Utensils: <Utensils />, 
    ShoppingBag: <ShoppingBag />, Car: <Car />, Zap: <Zap />, Gift: <Heart />,
    Gamepad2: <Gamepad2 />, CreditCard: <CreditCard />, Plane: <Plane />, 
    Home: <Home />, Music: <Music />
};

const UI_ICONS = Object.keys(IconMap);
const UI_COLORS = ['#0071e3', '#34c759', '#ff3b30', '#ff9500', '#af52de', '#5856d6', '#ff2d55', '#32ade6', '#00c7be', '#5ac8fa', '#ffcc00', '#8e8e93'];

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
    return { icon: 'Package', color: '#0071e3' };
};

export default function CategoryPage() {
    const { categories, loading } = useSelector(state => state.finance);
    const dispatch = useDispatch();
    
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
    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [categories]);

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
        
        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, payload);
            } else {
                await api.post('/categories', payload);
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
        try {
            await api.delete(`/categories/${id}`);
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.2, bgcolor: 'primary.main', borderRadius: '12px', color: 'white', display: 'flex' }}><Settings size={22}/></Box>
                    <Box>
                        <Typography variant="h5" fontWeight="900" letterSpacing="-0.02em">Category Architecture</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="700">MASTER TAXONOMY ENGINE</Typography>
                    </Box>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<Plus size={18} />} 
                    onClick={openAddForm}
                    sx={{ borderRadius: '12px', px: 3, fontWeight: '800', textTransform: 'none', boxShadow: 'none' }}
                >
                    Add Architecture
                </Button>
            </Box>

            {/* List Table View */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#fbfcfd' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2.5, pl: 4, letterSpacing: '0.05rem', fontSize: '0.7rem' }}>ENTITY CONTEXT</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2.5, letterSpacing: '0.05rem', fontSize: '0.7rem' }}>GRANULAR NODES</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 2.5, pr: 4, letterSpacing: '0.05rem', fontSize: '0.7rem' }}>OPERATIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {showLoading ? (
                            // Inline Skeleton Rows
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell sx={{ pl: 4, py: 2.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                            <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: '12px' }} />
                                            <Box sx={{ width: '100px' }}>
                                                <Skeleton variant="text" width="100%" height={24} />
                                                <Skeleton variant="text" width="60%" height={16} />
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '8px' }} />
                                            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '8px' }} />
                                            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '8px' }} />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
                                    <TableRow key={cat._id || cat.name} hover>
                                        <TableCell sx={{ py: 2.5, pl: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                <Avatar sx={{ 
                                                    width: 48, height: 48, 
                                                    bgcolor: `${branding.color}12`, 
                                                    color: branding.color, 
                                                    border: `1.5px solid ${branding.color}20`,
                                                    borderRadius: '16px'
                                                }}>
                                                    {React.cloneElement(IconMap[branding.icon] || <Package />, { size: 24, strokeWidth: 2.5 })}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1rem' }}>
                                                        {cat.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.7 }}>
                                                        {cat.sub_categories?.length || 0} active mappings
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                                                {[...(cat.sub_categories || [])].slice().sort((a, b) => a.localeCompare(b)).map(s => (
                                                    <Chip key={s} label={s} variant="outlined" size="small" sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem', bgcolor: 'white', color: 'text.secondary', borderColor: 'rgba(0,0,0,0.06)', px: 0.5 }} />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={{ pr: 4 }}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <IconButton onClick={() => openEditForm(cat)} sx={{ color: branding.color, bgcolor: `${branding.color}08`, borderRadius: '10px' }} size="small"><Edit2 size={16} /></IconButton>
                                                <IconButton onClick={() => handleDelete(cat._id)} sx={{ color: 'error.main', bgcolor: 'rgba(255, 59, 48, 0.06)', borderRadius: '10px' }} size="small"><Trash2 size={16} /></IconButton>
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
            <Dialog open={isFormOpen} onClose={closeForm} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
                <DialogTitle sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: `${newColor}15`, color: newColor, border: `1.5px solid ${newColor}25`, borderRadius: '14px', width: 48, height: 48 }}>
                            {React.cloneElement(IconMap[newIcon] || <Fingerprint />, { size: 24, strokeWidth: 2.5 })}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                {newName || 'New Entity'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="700">ENTITY BRANDING</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={closeForm} sx={{ bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '10px' }} size="small"><X size={20}/></IconButton>
                </DialogTitle>
                
                <DialogContent sx={{ p: 3, pt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="overline" sx={{ fontWeight: 900, mb: 0.5, color: 'text.secondary', letterSpacing: '0.1em', display: 'block' }}>ENTITY NAME</Typography>
                            <TextField
                                autoFocus
                                placeholder="e.g. Healthcare..."
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                InputProps={{ sx: { borderRadius: '12px', fontWeight: 800, fontSize: '1rem', bgcolor: 'rgba(0,0,0,0.01)' } }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 900, mb: 0.8, color: 'text.secondary', letterSpacing: '0.1em', display: 'block' }}>COLOUR</Typography>
                            <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', maxWidth: '160px' }}>
                                {UI_COLORS.map(c => (
                                    <Box 
                                        key={c} 
                                        onClick={() => { setNewColor(c); setAutoSuggestEnabled(false); }}
                                        sx={{ 
                                            width: 22, height: 22, borderRadius: '6px', cursor: 'pointer', bgcolor: c, 
                                            border: newColor === c ? '2px solid white' : 'none',
                                            boxShadow: newColor === c ? `0 0 0 2px ${c}` : 'none',
                                            transition: '0.2s', '&:hover': { transform: 'scale(1.2)' }
                                        }} 
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, mb: 1, color: 'text.secondary', letterSpacing: '0.1em', display: 'block' }}>ICON ARCHETYPE</Typography>
                        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                            {UI_ICONS.slice(0, 16).map(icon => (
                                <IconButton 
                                    key={icon} 
                                    onClick={() => { setNewIcon(icon); setAutoSuggestEnabled(false); }}
                                    sx={{ 
                                        p: 1.2, borderRadius: '12px',
                                        bgcolor: newIcon === icon ? `${newColor}15` : 'rgba(0,0,0,0.02)',
                                        color: newIcon === icon ? newColor : 'text.secondary',
                                        transition: '0.2s all ease',
                                        '&:hover': { bgcolor: `${newColor}08` }
                                    }}
                                >
                                    {React.cloneElement(IconMap[icon], { size: 18, strokeWidth: 2.5 })}
                                </IconButton>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}>SUB-NODES ({newSubs.length})</Typography>
                        <Button variant="text" size="small" startIcon={<PlusCircle size={16}/>} onClick={() => setNewSubs(['', ...newSubs])} sx={{ fontWeight: 800, textTransform: 'none', color: newColor }}>Add Node</Button>
                    </Box>
                    
                    <Box sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'rgba(0,0,0,0.01)' }}>
                        <Stack divider={<Divider sx={{ opacity: 0.4 }} />}>
                            {newSubs.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center', opacity: 0.4 }}><Typography variant="caption" fontWeight="800">NO NODES DEFINED</Typography></Box>
                            ) : (
                                newSubs.map((sub, idx) => (
                                    <Box key={idx} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: 'white' } }}>
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
                                            InputProps={{ disableUnderline: true, sx: { fontWeight: 800, fontSize: '0.9rem', color: 'text.primary' } }}
                                        />
                                        <IconButton size="small" onClick={() => {
                                            const updated = [...newSubs];
                                            updated.splice(idx, 1);
                                            setNewSubs(updated);
                                        }} sx={{ color: 'text.secondary' }}><Trash2 size={16} /></IconButton>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'space-between' }}>
                    <Button onClick={closeForm} color="inherit" sx={{ fontWeight: 800, textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
                    <Button 
                        onClick={handleSave} 
                        variant="contained" 
                        disabled={!newName} 
                        sx={{ px: 4, py: 1, borderRadius: '12px', textTransform: 'none', fontWeight: 900, bgcolor: newColor, boxShadow: `0 8px 24px ${newColor}25` }}
                    >
                        {editingId ? "Update Identity" : "Finalize Infrastructure"}
                    </Button>
                </DialogActions>
            </Dialog>

        </motion.div>
    );
}
