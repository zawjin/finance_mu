import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, InputAdornment } from '@mui/material';
import { useSelector } from 'react-redux';
import { Bookmark, DollarSign, CalendarDays } from 'lucide-react';

export default function MonthlyBillForm({ onSubmit, onCancel, initialData }) {
    const { investments, reserves, categories: allCategories } = useSelector(state => state.finance);

    const categories = useMemo(() => {
        return allCategories && allCategories.length > 0 ? allCategories : [
            { name: 'Utilities', sub_categories: ['Electricity', 'Water', 'Internet', 'Mobile'] },
            { name: 'Housing', sub_categories: ['Rent', 'Maintenance', 'Domestic Help'] },
            { name: 'Subscriptions', sub_categories: ['Netflix', 'Spotify', 'iCloud'] },
            { name: 'Personal', sub_categories: ['Gym', 'Club'] }
        ];
    }, [allCategories]);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: categories[0]?.name || 'Utilities',
        sub_category: categories[0]?.sub_categories?.[0] || 'Electricity',
        due_month: '1',
        description: '',
        status: 'ACTIVE',
        frequency: 'MONTHLY'
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
                category: initialData.category || 'Utilities',
                sub_category: initialData.sub_category || 'General',
                due_month: initialData.due_month || '1',
                description: initialData.description || '',
                status: initialData.status || 'ACTIVE',
                frequency: 'MONTHLY'
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

    const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

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
                        sx={{ borderRadius: '16px', background: 'white', mb: 1.5 }}
                    >
                        {categories.map(c => <MenuItem key={c.name || c} value={c.name || c}>{c.name || c}</MenuItem>)}
                    </Select>

                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Sub-Category</Typography>
                    <Select
                        fullWidth value={formData.sub_category} onChange={e => setFormData({ ...formData, sub_category: e.target.value })}
                        sx={{ borderRadius: '16px', background: 'white' }}
                    >
                        {activeSubs.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </Select>
                </Box>

                <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Monthly Amount</Typography>
                    <TextField
                        fullWidth type="number" placeholder="0.00"
                        InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={16} /></InputAdornment> }}
                        value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        required
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', background: 'white' } }}
                    />
                </Box>

                <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Due Date (Day of Month)</Typography>
                    <Select
                        fullWidth value={formData.due_month} onChange={e => setFormData({ ...formData, due_month: e.target.value })}
                        startAdornment={<InputAdornment position="start"><CalendarDays size={16} /></InputAdornment>}
                        sx={{ borderRadius: '16px', background: 'white' }}
                    >
                        {days.map(d => <MenuItem key={d} value={d}>Day {d}</MenuItem>)}
                    </Select>
                </Box>

                <Box>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Status</Typography>
                    <Select
                        fullWidth value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                        sx={{ borderRadius: '16px', background: 'white' }}
                    >
                        <MenuItem value="ACTIVE">⚡ Active</MenuItem>
                        <MenuItem value="DISABLED">❌ Disabled</MenuItem>
                    </Select>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: '1rem' }}>
                    <Button fullWidth onClick={onCancel} sx={{ py: 2, borderRadius: '50px', fontWeight: 900, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.04)' }}>CANCEL</Button>
                    <Button fullWidth type="submit" variant="contained" sx={{ py: 2, borderRadius: '50px', fontWeight: 900, bgcolor: '#0ea5e9' }}>SAVE BILL</Button>
                </Box>
            </div>
        </Box>
    );
}
