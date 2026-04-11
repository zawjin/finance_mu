import React, { useState } from 'react';
import {
    X, Calendar, Edit3, ChevronDown, Wallet,
    FileText, LayoutGrid, Tag, CreditCard,
    AlertCircle, CheckCircle2, Landmark, Banknote, Gift, Smartphone, CircleDollarSign
} from 'lucide-react';
import dayjs from 'dayjs';
import {
    Box, TextField, Select, MenuItem, Button, Typography,
    InputAdornment, FormHelperText, Stack, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useSelector } from 'react-redux';

export default function ExpenseForm({ categories, onSubmit, onCancel, initialData }) {
    const reserves = useSelector(state => state.finance.reserves) || [];
    const [formData, setFormData] = useState({
        amount: initialData?.amount || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        sub: initialData?.sub_category || '',
        date: initialData?.date ? dayjs(initialData.date) : dayjs(),
        recovered: initialData?.recovered || '',
        recovery_desc: initialData?.recovery_description || '',
        payment_method: initialData?.payment_method || '',
        payment_source_id: initialData?.payment_source_id || '',
        target_account_id: initialData?.target_account_id || ''
    });

    const [errors, setErrors] = useState({});

    const activeCat = categories.find(c => c.name === formData.category);
    const activeSubs = activeCat?.sub_categories || [];

    const validate = () => {
        const newErrors = {};
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
        if (!formData.category) newErrors.category = 'Please select a category';
        if (!formData.date) newErrors.date = 'Date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = () => {
        if (validate()) {
            onSubmit({
                amount: parseFloat(formData.amount),
                description: formData.description,
                category: formData.category,
                sub_category: formData.sub || '-',
                date: formData.date.format('YYYY-MM-DD'),
                recovered: parseFloat(formData.recovered) || 0,
                recovery_description: formData.recovery_desc || "",
                payment_method: formData.payment_method || null,
                payment_source_id: formData.payment_source_id || null,
                target_account_id: formData.target_account_id || null
            });
        }
    };

    const PAYMENT_METHODS = [
        { key: 'CASH', label: 'Cash', icon: <Banknote size={18} />, color: '#f59e0b', deductsReserve: true },
        { key: 'BANK', label: 'Bank', icon: <Landmark size={18} />, color: '#6366f1', deductsReserve: true },
        { key: 'WALLET', label: 'Wallet', icon: <Wallet size={18} />, color: '#10b981', deductsReserve: true },
        { key: 'CARD', label: 'Card', icon: <CreditCard size={18} />, color: '#ff3b30', deductsReserve: true },
        { key: 'UPI', label: 'UPI', icon: <Smartphone size={18} />, color: '#0071e3', deductsReserve: false },
        { key: 'GIFT', label: 'Gift', icon: <Gift size={18} />, color: '#ff9500', deductsReserve: false },
        { key: 'OTHER', label: 'Other', icon: <CircleDollarSign size={18} />, color: '#86868b', deductsReserve: false },
    ];

    const selectedMethod = PAYMENT_METHODS.find(m => m.key === formData.payment_method);
    const showSourcePicker = selectedMethod?.deductsReserve && reserves.length > 0;
    const filteredReserves = reserves.filter(r => {
        if (formData.payment_method === 'CASH') return r.account_type === 'CASH';
        if (formData.payment_method === 'BANK') return r.account_type === 'BANK';
        if (formData.payment_method === 'WALLET') return r.account_type === 'WALLET';
        if (formData.payment_method === 'CARD') return r.account_type === 'CREDIT_CARD';
        return true;
    });

    const globalInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(0,0,0,0.01)',
            minHeight: '48px',
            paddingLeft: '12px', // Standardized left padding
            '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
            '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.16)' },
            '&.Mui-focused fieldset': { borderColor: '#1d1d1f', borderWidth: '1.5px' }
        },
        '& .MuiOutlinedInput-input': { fontWeight: 600, color: '#1d1d1f', fontSize: '0.95rem' }
    };

    const labelStyle = {
        fontSize: '0.75rem', fontWeight: 800, color: 'text.secondary',
        marginBottom: '0.5rem', display: 'block', letterSpacing: '0.05em'
    };

    const iconStyle = { color: 'rgba(0,0,0,0.4)', strokeWidth: 2.5 };

    return (
        <Box sx={{ p: 4, pt: 1, bgcolor: '#ffffff' }}>
            <Stack spacing={2.5}>
                {/* RECOVERY TRACK - ONLY IN EDIT MODE */}
                {initialData && (
                    <Stack spacing={2}>
                        <Box>
                            <Typography sx={labelStyle}>RECOVERED PORTION (Adjustment)</Typography>
                            <TextField
                                fullWidth
                                placeholder="e.g. Someone returned 50.00..."
                                variant="outlined"
                                size="small"
                                value={formData.recovered}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setFormData({ ...formData, recovered: val });
                                }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><CheckCircle2 size={18} style={{ color: '#34c759' }} /><Typography sx={{ fontWeight: 900, ml: 1, color: '#34c759', fontSize: '0.9rem' }}>₹</Typography></InputAdornment>
                                }}
                                sx={globalInputStyle}
                            />
                        </Box>
                        <Box>
                            <Typography sx={labelStyle}>ADJUSTMENT Comment</Typography>
                            <TextField
                                fullWidth
                                placeholder="Specific details about this recovery..."
                                variant="outlined"
                                size="small"
                                value={formData.recovery_desc}
                                onChange={e => setFormData({ ...formData, recovery_desc: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><FileText size={18} style={{ color: '#5ac8fa' }} /></InputAdornment>
                                }}
                                sx={globalInputStyle}
                            />
                        </Box>
                    </Stack>
                )}

                {/* VALUATION */}
                <Box>
                    <Typography sx={labelStyle}>VALUATION</Typography>
                    <TextField
                        fullWidth
                        placeholder="0.00"
                        variant="outlined"
                        size="small"
                        value={formData.amount}
                        onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^\d*\.?\d*$/.test(val)) setFormData({ ...formData, amount: val });
                        }}
                        error={!!errors.amount}
                        helperText={errors.amount}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><CreditCard size={18} style={{ color: '#0071e3' }} /><Typography sx={{ fontWeight: 900, ml: 1, color: '#1d1d1f', fontSize: '0.9rem' }}>₹</Typography></InputAdornment>
                        }}
                        sx={globalInputStyle}
                    />
                </Box>

                {/* DESCRIPTION */}
                <Box>
                    <Typography sx={labelStyle}>ENTRY DESCRIPTION</Typography>
                    <TextField
                        fullWidth
                        placeholder="e.g. AWS Billing..."
                        variant="outlined"
                        size="small"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        error={!!errors.description}
                        helperText={errors.description}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><FileText size={18} style={{ color: '#ff9500' }} /></InputAdornment>
                        }}
                        sx={globalInputStyle}
                    />
                </Box>

                {/* TIMESTAMP */}
                <Box>
                    <Typography sx={labelStyle}>LEDGER TIMESTAMP</Typography>
                    <DatePicker
                        value={formData.date}
                        onChange={(val) => setFormData({ ...formData, date: val })}
                        slotProps={{
                            textField: {
                                fullWidth: true, size: 'small', error: !!errors.date,
                                helperText: errors.date, sx: globalInputStyle,
                                InputProps: {
                                    startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><Calendar size={18} style={{ color: '#ff2d55' }} /></InputAdornment>,
                                    sx: { pl: '12px' }
                                }
                            }
                        }}
                    />
                </Box>

                {/* CATEGORY */}
                <Box>
                    <Typography sx={labelStyle}>CATEGORY ENTITY</Typography>
                    <Select
                        fullWidth
                        size="small"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value, sub: '' })}
                        error={!!errors.category}
                        displayEmpty
                        startAdornment={<InputAdornment position="start" sx={{ mr: 1, ml: -0.5 }}><LayoutGrid size={18} style={{ color: '#5856d6' }} /></InputAdornment>}
                        sx={globalInputStyle['& .MuiOutlinedInput-root']}
                        IconComponent={ChevronDown}
                    >
                        <MenuItem value="" disabled>Select Segment</MenuItem>
                        {categories.map(c => (
                            <MenuItem key={c.name} value={c.name} sx={{ fontWeight: 800, py: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: c.color || '#0071e3' }} />
                                    {c.name}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.category && <FormHelperText error sx={{ ml: 2, fontWeight: 700 }}>{errors.category}</FormHelperText>}
                </Box>

                {/* GRANULAR MAPPING (Architecturally Stabilized) */}
                <Box>
                    <Typography sx={labelStyle}>GRANULAR MAPPING</Typography>
                    <Autocomplete
                        fullWidth
                        freeSolo
                        options={activeSubs}
                        disabled={!formData.category}
                        value={formData.sub}
                        onChange={(event, newValue) => setFormData({ ...formData, sub: newValue })}
                        onInputChange={(event, newInputValue) => setFormData({ ...formData, sub: newInputValue })}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                placeholder={formData.category ? "Node specification..." : "Segment first"}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ mr: 1.5, ml: -0.5 }}>
                                            <Tag size={18} style={{ color: '#32ade6' }} />
                                        </InputAdornment>
                                    )
                                }}
                                sx={globalInputStyle}
                            />
                        )}
                        sx={{
                            '& .MuiAutocomplete-inputRoot': {
                                paddingLeft: '12px !important' // Force standard left alignment
                            },
                            '& .MuiAutocomplete-endAdornment': { top: 'calc(50% - 14px)' }
                        }}
                    />
                </Box>

                {/* PAYMENT METHOD */}
                <Box>
                    <Typography sx={labelStyle}>PAYMENT METHOD</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {PAYMENT_METHODS.map(m => (
                            <Box
                                key={m.key}
                                onClick={() => setFormData({ ...formData, payment_method: m.key, payment_source_id: '' })}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.8,
                                    px: 1.5, py: 0.9, borderRadius: '12px', cursor: 'pointer',
                                    border: '1.5px solid',
                                    borderColor: formData.payment_method === m.key ? m.color : 'rgba(0,0,0,0.07)',
                                    bgcolor: formData.payment_method === m.key ? `${m.color}15` : '#fafafa',
                                    transition: '0.15s',
                                    '&:hover': { borderColor: m.color, bgcolor: `${m.color}08` }
                                }}
                            >
                                <Box sx={{ color: formData.payment_method === m.key ? m.color : '#86868b', display: 'flex' }}>{m.icon}</Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: formData.payment_method === m.key ? m.color : '#86868b' }}>{m.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* SOURCE ACCOUNT (only for Cash/Bank/Wallet) */}
                {showSourcePicker && (
                    <Box>
                        <Typography sx={labelStyle}>SOURCE ACCOUNT — <span style={{ color: selectedMethod.color }}>DEBIT FROM</span></Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={formData.payment_source_id}
                            onChange={e => setFormData({ ...formData, payment_source_id: e.target.value })}
                            displayEmpty
                            sx={{ ...globalInputStyle['& .MuiOutlinedInput-root'], borderRadius: '12px' }}
                        >
                            <MenuItem value=""><em style={{ color: '#86868b', fontStyle: 'normal', fontWeight: 600 }}>No deduction (manual only)</em></MenuItem>
                            {filteredReserves.map(r => {
                                const isInsufficient = parseFloat(r.balance) < (parseFloat(formData.amount) || 0) && r.account_type !== 'CREDIT_CARD';
                                return (
                                    <MenuItem key={r._id} value={r._id} disabled={isInsufficient}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', opacity: isInsufficient ? 0.5 : 1 }}>
                                            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.account_name}</Typography>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: isInsufficient ? '#ff3b30' : '#10b981' }}>
                                                    ₹{parseFloat(r.balance).toLocaleString('en-IN')}
                                                </Typography>
                                                {isInsufficient && <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#ff3b30' }}>INSUFFICIENT</Typography>}
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </Box>
                )}

                {/* TARGET ACCOUNT (For Settlements/Transfers) */}
                {formData.category === 'Financial' || formData.payment_method === 'BANK' ? (
                    <Box>
                        <Typography sx={labelStyle}>TARGET SETTLEMENT — <span style={{ color: '#6366f1' }}>CREDIT TO / PAY OFF</span></Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={formData.target_account_id}
                            onChange={e => setFormData({ ...formData, target_account_id: e.target.value })}
                            displayEmpty
                            sx={{ ...globalInputStyle['& .MuiOutlinedInput-root'], borderRadius: '12px' }}
                            startAdornment={<InputAdornment position="start" sx={{ mr: 1, ml: -0.5 }}><CreditCard size={18} style={{ color: '#6366f1' }} /></InputAdornment>}
                        >
                            <MenuItem value=""><em style={{ color: '#86868b', fontStyle: 'normal', fontWeight: 600 }}>None (Standard Expense)</em></MenuItem>
                            {reserves.filter(r => r.account_type === 'CREDIT_CARD').map(r => (
                                <MenuItem key={r._id} value={r._id}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.account_name}</Typography>
                                        <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#ff3b30' }}>
                                            ₹{parseFloat(r.balance).toLocaleString('en-IN')} DUO
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText sx={{ fontWeight: 700, ml: 1, mt: 1 }}>Selecting a card will automatically reduce its debt by the valuation amount.</FormHelperText>
                    </Box>
                ) : null}
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 5, pt: 3, borderTop: '1.5px solid rgba(0,0,0,0.04)' }}>
                <Button
                    onClick={onCancel}
                    variant="text"
                    sx={{
                        borderRadius: '12px', px: 4,
                        fontWeight: 800, textTransform: 'none',
                        color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                    }}
                >
                    Dismiss
                </Button>
                <Button
                    variant="contained"
                    onClick={handleFormSubmit}
                    sx={{
                        borderRadius: '12px', px: 5, py: 1.2,
                        fontWeight: 900, textTransform: 'none',
                        bgcolor: '#1d1d1f', color: '#ffffff',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#000', transform: 'translateY(-1px)' },
                        transition: '0.2s all ease-in-out'
                    }}
                >
                    {initialData ? 'Update Entry' : 'Complete Entry'}
                </Button>
            </Box>
        </Box>
    );
}
