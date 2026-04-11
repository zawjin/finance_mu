import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, TextField, Select, MenuItem, InputAdornment } from '@mui/material';
import { Bookmark, DollarSign, CalendarDays, Wallet } from 'lucide-react';

export default function YearlyExpenseForm({ onSubmit, onCancel, initialData }) {
    const { investments, reserves, categories: allCategories } = useSelector(state => state.finance);

    const categories = useMemo(() => {
        return allCategories && allCategories.length > 0 ? allCategories : [
            { name: 'Insurance', sub_categories: ['Term', 'Medical', 'Life'] },
            { name: 'Property', sub_categories: ['Tax', 'Maintenance'] },
            { name: 'Personal', sub_categories: ['Temple', 'Donation'] },
            { name: 'Subscription', sub_categories: ['Software', 'Hosting'] }
        ];
    }, [allCategories]);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: categories[0]?.name || 'Insurance',
        sub_category: categories[0]?.sub_categories?.[0] || 'Term',
        due_month: 'January',
        description: '',
        funding_source: 'Nippon india corparate bond',
        status: 'ACTIVE',
        frequency: 'YEARLY'
    });

    const activeSubs = useMemo(() => {
        const cat = categories.find(c => c.name === formData.category);
        return cat?.sub_categories || ['General'];
    }, [formData.category, categories]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                amount: initialData.amount || '',
                category: initialData.category || 'Insurance',
                sub_category: initialData.sub_category || 'General',
                due_month: initialData.due_month || 'January',
                description: initialData.description || '',
                funding_source: initialData.funding_source || 'Nippon india corparate bond',
                status: initialData.status || 'ACTIVE',
                frequency: initialData.frequency || 'YEARLY'
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            name: formData.sub_category, // Use Sub-Category as Bill Name
            amount: parseFloat(formData.amount)
        });
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const targetFund = investments?.find(inv => inv.name === 'Nippon india corparate bond');
    const targetValueStr = targetFund ? ` (Value: ₹${Number(targetFund.value || 0).toLocaleString()})` : '';

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{
            p: 4,
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
            borderTop: '1px solid rgba(0,0,0,0.02)'
        }}>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Category</Typography>
                    <Select
                        fullWidth value={formData.category}
                        onChange={e => {
                            const newCat = e.target.value;
                            const catObj = categories.find(c => c.name === newCat);
                            setFormData({
                                ...formData,
                                category: newCat,
                                sub_category: catObj?.sub_categories?.[0] || 'General'
                            });
                        }}
                        startAdornment={<InputAdornment position="start"><Bookmark size={16} /></InputAdornment>}
                        sx={{ borderRadius: '16px', background: 'white', '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' }, pl: 1, mb: 1.5 }}
                    >
                        {categories.map(c => <MenuItem key={c.name || c} value={c.name || c}>{c.name || c}</MenuItem>)}
                    </Select>

                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Sub-Category</Typography>
                    <Select
                        fullWidth value={formData.sub_category} onChange={e => setFormData({ ...formData, sub_category: e.target.value })}
                        sx={{ borderRadius: '16px', background: 'white', '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' } }}
                    >
                        {activeSubs.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </Box>

                <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Amount (Yearly)</Typography>
                    <TextField
                        fullWidth type="number" placeholder="0.00"
                        InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={16} /></InputAdornment> }}
                        value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', background: 'white', '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' } } }}
                    />
                </Box>

                <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Due Month</Typography>
                    <Select
                        fullWidth value={formData.due_month} onChange={e => setFormData({ ...formData, due_month: e.target.value })}
                        startAdornment={<InputAdornment position="start"><CalendarDays size={16} /></InputAdornment>}
                        sx={{ borderRadius: '16px', background: 'white', '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' }, pl: 1 }}
                    >
                        {months.map(m => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                        ))}
                    </Select>
                </Box>

                <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Funding Source / Backing Fund</Typography>
                    <Select
                        fullWidth value="Nippon india corparate bond" disabled
                        startAdornment={<InputAdornment position="start"><Wallet size={16} /></InputAdornment>}
                        sx={{ borderRadius: '16px', background: 'rgba(0,0,0,0.02)', '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' }, pl: 1, color: '#1d1d1f' }}
                    >
                        <MenuItem value="Nippon india corparate bond" sx={{ fontWeight: 800 }}>📈 Nippon india corparate bond{targetValueStr}</MenuItem>
                    </Select>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: '1rem' }}>
                    <Button fullWidth onClick={onCancel} sx={{ py: 2, borderRadius: '50px', fontWeight: 900, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}>
                        CANCEL
                    </Button>
                    <Button fullWidth type="submit" variant="contained" sx={{ py: 2, borderRadius: '50px', fontWeight: 900, color: '#fff', bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' }, boxShadow: '0 4px 14px rgba(139,92,246,0.3)' }}>
                        {initialData ? 'UPDATE EXTRACT' : 'REGISTER EXPENSE'}
                    </Button>
                </Box>
            </div>
        </Box>
    );
}
