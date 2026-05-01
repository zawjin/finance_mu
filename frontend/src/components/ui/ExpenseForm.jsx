import React, { useState } from 'react';
import {
    X, Calendar, Edit3, ChevronDown, Wallet,
    FileText, LayoutGrid, Tag, CreditCard, TrendingUp, Zap,
    AlertCircle, CheckCircle2, Landmark, Banknote, Gift, Smartphone, CircleDollarSign
} from 'lucide-react';
import dayjs from 'dayjs';
import {
    Box, TextField, Select, MenuItem, Button, Typography,
    InputAdornment, FormHelperText, Stack, Autocomplete, CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useSelector } from 'react-redux';
import { getIcon } from '../../utils/iconMap';
import { predictSmartCategory } from '../../utils/aiUtils';
import './Forms.scss';

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
    const [loading, setLoading] = useState(false);

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

    const handleFormSubmit = async () => {
        if (validate()) {
            setLoading(true);
            try {
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(20);
                }
                await onSubmit({
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
            } catch (err) {
                console.error("Submission error:", err);
            } finally {
                setLoading(false);
            }
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


    return (
        <Box className="form-container-premium">
            <Stack spacing={2.5}>
                {/* RECOVERY TRACK - ONLY IN EDIT MODE */}
                {initialData && (
                    <Stack spacing={2}>
                        <Box>
                            <Typography className="form-label-premium">RECOVERED PORTION (Adjustment)</Typography>
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
                                    startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}><CheckCircle2 size={18} /></Box><Typography sx={{ fontWeight: 900, ml: 1, color: '#34c759', fontSize: '0.9rem' }}>₹</Typography></InputAdornment>
                                }}
                                className="form-input-premium"
                            />
                        </Box>
                        <Box>
                            <Typography className="form-label-premium">ADJUSTMENT Comment</Typography>
                            <TextField
                                fullWidth
                                placeholder="Specific details about this recovery..."
                                variant="outlined"
                                size="small"
                                value={formData.recovery_desc}
                                onChange={e => setFormData({ ...formData, recovery_desc: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(90, 200, 250, 0.1)', color: '#5ac8fa' }}><FileText size={18} /></Box></InputAdornment>
                                }}
                                className="form-input-premium"
                            />
                        </Box>
                    </Stack>
                )}

                {/* VALUATION */}
                <Box>
                    <Typography className="form-label-premium">VALUATION</Typography>
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
                            startAdornment: <InputAdornment position="start"><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(0, 113, 227, 0.1)', color: '#0071e3' }}><CreditCard size={18} /></Box><Typography sx={{ fontWeight: 900, ml: 1, color: '#1d1d1f', fontSize: '0.9rem' }}>₹</Typography></InputAdornment>
                        }}
                        className="form-input-premium"
                    />
                </Box>

                {/* DESCRIPTION */}
                <Box>
                    <Typography className="form-label-premium">ENTRY DESCRIPTION</Typography>
                    <TextField
                        fullWidth
                        placeholder="e.g. AWS Billing..."
                        variant="outlined"
                        size="small"
                        value={formData.description}
                        onChange={e => {
                            const val = e.target.value;
                            setFormData(prev => {
                                const newData = { ...prev, description: val };
                                // Auto-suggest category if not already manually set (or if clearing)
                                const suggested = predictSmartCategory(val, categories);
                                if (suggested) {
                                    newData.category = suggested;
                                }
                                return newData;
                            });
                        }}
                        error={!!errors.description}
                        helperText={errors.description}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 149, 0, 0.1)', color: '#ff9500' }}><FileText size={18} /></Box></InputAdornment>
                        }}
                        className="form-input-premium"
                    />
                </Box>

                {/* TIMESTAMP */}
                <Box>
                    <Typography className="form-label-premium">LEDGER TIMESTAMP</Typography>
                    <DatePicker
                        value={formData.date}
                        onChange={(val) => setFormData({ ...formData, date: val })}
                        sx={{ width: '100%' }}
                        slotProps={{
                            textField: {
                                fullWidth: true, size: 'small', error: !!errors.date,
                                helperText: errors.date, className: "form-input-premium",
                                inputProps: { readOnly: true },
                                InputProps: {
                                    startAdornment: <InputAdornment position="start"><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)', color: '#ff2d55' }}><Calendar size={18} /></Box></InputAdornment>
                                }
                            }
                        }}
                    />
                </Box>

                {/* CATEGORY */}
                <Box>
                    <Typography className="form-label-premium">CATEGORY ENTITY</Typography>
                    <Select
                        fullWidth
                        size="small"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value, sub: '' })}
                        error={!!errors.category}
                        displayEmpty
                        renderValue={(selected) => {
                            if (!selected) return <span style={{ opacity: 0.6 }}>Select Segment</span>;
                            return selected;
                        }}
                        startAdornment={
                            <InputAdornment position="start" sx={{ ml: -0.5, mr: 1 }}>
                                <Box className="form-icon-vibrant" sx={{
                                    bgcolor: formData.category ? `${categories.find(c => c.name === formData.category)?.color}15` : 'rgba(88, 86, 214, 0.1)',
                                    color: formData.category ? categories.find(c => c.name === formData.category)?.color : '#5856d6'
                                }}>
                                    {formData.category ? getIcon(formData.category, categories, { size: 18 }) : <LayoutGrid size={18} />}
                                </Box>
                            </InputAdornment>
                        }
                        className="form-input-premium"
                    // IconComponent={ChevronDown}
                    >
                        <MenuItem value="" disabled>Select Segment</MenuItem>
                        {categories.map(c => (
                            <MenuItem key={c.name} value={c.name} sx={{ fontWeight: 800, py: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box className="form-icon-vibrant" sx={{ bgcolor: `${c.color}12`, color: c.color, width: 32, height: 32 }}>
                                        {getIcon(c.name, categories, { size: 18 })}
                                    </Box>
                                    {c.name}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.category && <FormHelperText error sx={{ ml: 2, fontWeight: 700 }}>{errors.category}</FormHelperText>}
                </Box>

                {/* GRANULAR MAPPING (Architecturally Stabilized) */}
                <Box>
                    <Typography className="form-label-premium">GRANULAR MAPPING</Typography>
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
                                        <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                            <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(50, 173, 230, 0.1)', color: '#32ade6' }}>
                                                <Tag size={18} />
                                            </Box>
                                        </InputAdornment>
                                    )
                                }}
                                className="form-input-premium"
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
                    <Typography className="form-label-premium">PAYMENT METHOD</Typography>
                    <Box className="payment-method-pill-group">
                        {PAYMENT_METHODS.map(m => (
                            <Box
                                key={m.key}
                                onClick={() => setFormData({ ...formData, payment_method: m.key, payment_source_id: '' })}
                                className={`method-pill ${formData.payment_method === m.key ? `active method-${m.key.toLowerCase()}` : `method-${m.key.toLowerCase()}`}`}
                            >
                                <Box className="pill-icon">{m.icon}</Box>
                                <Typography className="pill-label">{m.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* SOURCE ACCOUNT (only for Cash/Bank/Wallet) */}
                {showSourcePicker && (
                    <Box>
                        <Typography className="form-label-premium">SOURCE ACCOUNT — <span style={{ color: selectedMethod.color }}>DEBIT FROM</span></Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={formData.payment_source_id}
                            onChange={e => setFormData({ ...formData, payment_source_id: e.target.value })}
                            displayEmpty
                            renderValue={(selected) => {
                                if (!selected) return <span style={{ opacity: 0.6 }}>No deduction (manual only)</span>;
                                const account = filteredReserves.find(r => r._id === selected);
                                return account ? account.account_name : selected;
                            }}
                            startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Landmark size={18} /></Box></InputAdornment>}
                            className="form-input-premium"
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
                        <Typography className="form-label-premium">TARGET SETTLEMENT — <span style={{ color: '#6366f1' }}>CREDIT TO / PAY OFF</span></Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={formData.target_account_id}
                            onChange={e => setFormData({ ...formData, target_account_id: e.target.value })}
                            displayEmpty
                            renderValue={(selected) => {
                                if (!selected) return <span style={{ opacity: 0.6 }}>None (Standard Expense)</span>;
                                const account = reserves.find(r => r._id === selected);
                                return account ? account.account_name : selected;
                            }}
                            className="form-input-premium"
                            startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><CreditCard size={18} /></Box></InputAdornment>}
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

            <Box className="form-actions-row">
                <Button
                    onClick={onCancel}
                    className="btn-dismiss-premium"
                >
                    Dismiss
                </Button>
                <Button
                    variant="contained"
                    onClick={handleFormSubmit}
                    disabled={loading}
                    className="btn-submit-premium"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {loading ? 'Processing...' : (initialData ? 'Update Entry' : 'Complete Entry')}
                </Button>
            </Box>
        </Box>
    );
}
