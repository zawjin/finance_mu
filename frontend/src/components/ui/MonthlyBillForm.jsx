import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, InputAdornment } from '@mui/material';
import { useSelector } from 'react-redux';
import { Bookmark, DollarSign, CalendarDays, Tag, Layers, Activity, FileText } from 'lucide-react';
import './Forms.scss';

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
                    <Typography className="form-label-premium">Monthly Amount</Typography>
                    <TextField
                        fullWidth type="number" placeholder="0.00"
                        className="form-input-premium"
                        InputProps={{ startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}><Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>₹</Typography></Box></InputAdornment> }}
                        value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                </Box>

                <Box>
                    <Typography className="form-label-premium">Due Date (Day of Month)</Typography>
                    <Select
                        fullWidth value={formData.due_month} onChange={e => setFormData({ ...formData, due_month: e.target.value })}
                        className="form-input-premium"
                        startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 149, 0, 0.1)', color: '#ff9500' }}><CalendarDays size={18} /></Box></InputAdornment>}
                    >
                        {days.map(d => <MenuItem key={d} value={d}>Day {d}</MenuItem>)}
                    </Select>
                </Box>

                <Box>
                    <Typography className="form-label-premium">Status</Typography>
                    <Select
                        fullWidth value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="form-input-premium"
                        startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}><Activity size={18} /></Box></InputAdornment>}
                    >
                        <MenuItem value="ACTIVE">⚡ Active</MenuItem>
                        <MenuItem value="DISABLED">❌ Disabled</MenuItem>
                    </Select>
                </Box>

                <Box className="form-actions-row">
                    <Button onClick={onCancel} className="btn-dismiss-premium">CANCEL</Button>
                    <Button type="submit" variant="contained" className="btn-submit-premium">SAVE BILL</Button>
                </Box>
            </Stack>
        </Box>
    );
}
