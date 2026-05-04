import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, InputAdornment, Stack, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { Bookmark, DollarSign, CalendarDays, Tag, Layers, Activity, FileText, ShieldCheck, Wallet, Banknote, Landmark, CreditCard, Smartphone, Gift, CircleDollarSign } from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils/formatters';
import './Forms.scss';

export default function MonthlyBillForm({ onSubmit, onCancel, initialData }) {
    const [loading, setLoading] = useState(false);
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
        frequency: 'MONTHLY',
        last_paid_period: null,
        funding_source: reserves?.[0]?.account_name || '',
        payment_method: 'BANK'
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
                frequency: 'MONTHLY',
                last_paid_period: initialData.last_paid_period || null,
                funding_source: initialData.funding_source || reserves?.[0]?.account_name || '',
                payment_method: initialData.payment_method || 'BANK'
            });
        }
    }, [initialData, reserves]);

    const PAYMENT_METHODS = [
        { key: 'CASH', label: 'Cash', icon: <Banknote size={16} />, color: '#f59e0b', deductsReserve: true },
        { key: 'BANK', label: 'Bank', icon: <Landmark size={16} />, color: '#6366f1', deductsReserve: true },
        { key: 'WALLET', label: 'Wallet', icon: <Wallet size={16} />, color: '#10b981', deductsReserve: true },
        { key: 'CARD', label: 'Card', icon: <CreditCard size={16} />, color: '#ff3b30', deductsReserve: true },
        { key: 'UPI', label: 'UPI', icon: <Smartphone size={16} />, color: '#0071e3', deductsReserve: false },
        { key: 'GIFT', label: 'Gift', icon: <Gift size={16} />, color: '#ff9500', deductsReserve: false },
        { key: 'OTHER', label: 'Other', icon: <CircleDollarSign size={16} />, color: '#86868b', deductsReserve: false },
    ];

    const selectedMethod = PAYMENT_METHODS.find(m => m.key === formData.payment_method);
    const filteredReserves = reserves.filter(r => {
        if (formData.payment_method === 'CASH') return r.account_type === 'CASH';
        if (formData.payment_method === 'BANK') return r.account_type === 'BANK';
        if (formData.payment_method === 'WALLET') return r.account_type === 'WALLET';
        if (formData.payment_method === 'CARD') return r.account_type === 'CREDIT_CARD';
        return true;
    });
    const showSourcePicker = selectedMethod?.deductsReserve && filteredReserves.length > 1;

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                name: formData.sub_category, // Use Sub-Category as Bill Name
                amount: parseFloat(formData.amount)
            });
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setLoading(false);
        }
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
                    <Typography className="form-label-premium">Mark as Settled (Month)</Typography>
                    <Select
                        fullWidth value={formData.last_paid_period || ''} 
                        onChange={e => setFormData({ ...formData, last_paid_period: e.target.value || null })}
                        className="form-input-premium"
                        displayEmpty
                        startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><ShieldCheck size={18} /></Box></InputAdornment>}
                    >
                        <MenuItem value="">NOT SETTLED</MenuItem>
                        <MenuItem value={dayjs().format('YYYY-MM')}>{dayjs().format('MMMM YYYY')} (CURRENT)</MenuItem>
                        <MenuItem value={dayjs().subtract(1, 'month').format('YYYY-MM')}>{dayjs().subtract(1, 'month').format('MMMM YYYY')}</MenuItem>
                    </Select>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b', mt: 0.5, px: 1 }}>
                        Manual override to mark this bill as "Already Done" for the selected month.
                    </Typography>
                </Box>

                {/* PAYMENT METHOD */}
                <Box>
                    <Typography className="form-label-premium">PAYMENT METHOD</Typography>
                    <Box className="payment-method-pill-group">
                        {PAYMENT_METHODS.map(m => {
                            let matchingReserves = [];
                            if (m.key === 'CASH') matchingReserves = reserves.filter(r => r.account_type === 'CASH');
                            if (m.key === 'BANK') matchingReserves = reserves.filter(r => r.account_type === 'BANK');
                            if (m.key === 'WALLET') matchingReserves = reserves.filter(r => r.account_type === 'WALLET');
                            if (m.key === 'CARD') matchingReserves = reserves.filter(r => r.account_type === 'CREDIT_CARD');

                            const isSingleAccount = matchingReserves.length === 1;
                            const isSelected = formData.payment_method === m.key;

                            return (
                                <Box
                                    key={m.key}
                                    onClick={() => setFormData({ 
                                        ...formData, 
                                        payment_method: m.key, 
                                        funding_source: isSingleAccount ? matchingReserves[0].account_name : '' 
                                    })}
                                    className={`method-pill ${isSelected ? `active method-${m.key.toLowerCase()}` : `method-${m.key.toLowerCase()}`}`}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box className="pill-icon">{m.icon}</Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <Typography className="pill-label">{m.label}</Typography>
                                            {isSelected && isSingleAccount && (
                                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, mt: -0.2, opacity: 0.9 }}>
                                                    ₹{parseFloat(matchingReserves[0].balance).toLocaleString('en-IN')}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                {/* FUNDING SOURCE */}
                {showSourcePicker && (
                    <Box>
                        <Typography className="form-label-premium">FUNDING SOURCE — <span style={{ color: selectedMethod?.color || '#94a3b8' }}>DEDUCT FROM</span></Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mt: 1 }}>
                            {filteredReserves.map(r => {
                                const isSelected = formData.funding_source === r.account_name;
                                return (
                                    <Box
                                        key={r._id}
                                        onClick={() => setFormData({ ...formData, funding_source: r.account_name })}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            padding: '10px 8px',
                                            borderRadius: '12px',
                                            border: `1.5px solid ${isSelected ? selectedMethod?.color : '#e2e8f0'}`,
                                            backgroundColor: isSelected ? `${selectedMethod?.color}10` : '#f8fafc',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                borderColor: !isSelected ? '#cbd5e1' : undefined,
                                                transform: !isSelected ? 'translateY(-2px)' : 'none',
                                                boxShadow: !isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, width: '100%' }}>
                                            <Box sx={{ color: isSelected ? selectedMethod?.color : '#94a3b8' }}>
                                                {r.account_type === 'BANK' ? <Landmark size={14} /> : <CreditCard size={14} />}
                                            </Box>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: isSelected ? '#1d1d1f' : '#64748b', textTransform: 'uppercase', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {r.account_name}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#1d1d1f' }}>
                                            ₹{parseFloat(r.balance).toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}

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
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        className="btn-submit-premium"
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {loading ? 'SAVING...' : 'SAVE BILL'}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
