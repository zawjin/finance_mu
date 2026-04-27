import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, TextField, Select, MenuItem, InputAdornment } from '@mui/material';
import { Bookmark, DollarSign, CalendarDays, Wallet, Tag, Layers, Activity, FileText } from 'lucide-react';
import { Stack } from '@mui/material';
import './Forms.scss';

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
        <Box component="form" onSubmit={handleSubmit} className="form-container-premium">
            <Stack spacing={2.5}>
                <Box>
                    <Typography className="form-label-premium">Category</Typography>
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
                        className="form-input-premium"
                        startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><Tag size={18} /></Box></InputAdornment>}
                    >
                        {categories.map(c => <MenuItem key={c.name || c} value={c.name || c}>{c.name || c}</MenuItem>)}
                    </Select>
                </Box>

                <Box>
                    <Typography className="form-label-premium">Sub-Category</Typography>
                    <Select
                        fullWidth value={formData.sub_category} onChange={e => setFormData({ ...formData, sub_category: e.target.value })}
                        className="form-input-premium"
                        startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Layers size={18} /></Box></InputAdornment>}
                    >
                        {activeSubs.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </Box>

                <Box>
                    <Typography className="form-label-premium">Amount (Yearly)</Typography>
                    <TextField
                        fullWidth type="number" placeholder="0.00"
                        className="form-input-premium"
                        InputProps={{ startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}><Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>₹</Typography></Box></InputAdornment> }}
                        value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                </Box>

                <Box>
                    <Typography className="form-label-premium">Due Month</Typography>
                    <Select
                        fullWidth value={formData.due_month} onChange={e => setFormData({ ...formData, due_month: e.target.value })}
                        className="form-input-premium"
                        startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 149, 0, 0.1)', color: '#ff9500' }}><CalendarDays size={18} /></Box></InputAdornment>}
                    >
                        {months.map(m => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                        ))}
                    </Select>
                </Box>

                <Box>
                    <Typography className="form-label-premium">Funding Source / Backing Fund</Typography>
                    <Select
                        fullWidth value="Nippon india corparate bond" disabled
                        className="form-input-premium"
                        startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}><Wallet size={18} /></Box></InputAdornment>}
                        sx={{ color: '#1d1d1f' }}
                    >
                        <MenuItem value="Nippon india corparate bond" sx={{ fontWeight: 800 }}>📈 Nippon india corparate bond{targetValueStr}</MenuItem>
                    </Select>
                </Box>

                <Box className="form-actions-row">
                    <Button onClick={onCancel} className="btn-dismiss-premium">
                        CANCEL
                    </Button>
                    <Button type="submit" variant="contained" className="btn-submit-premium">
                        {initialData ? 'UPDATE EXTRACT' : 'REGISTER EXPENSE'}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
