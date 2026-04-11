import React, { useState, useEffect } from 'react';
import {
    X, Calendar, CreditCard, ChevronDown,
    FileText, LayoutGrid, Tag, TrendingUp, Hash, DollarSign, Zap,
    Landmark, Banknote, Wallet, Gift, Smartphone, CircleDollarSign
} from 'lucide-react';
import dayjs from 'dayjs';
import {
    Box, TextField, Select, MenuItem, Button, Typography,
    InputAdornment, FormHelperText, Stack, CircularProgress, Chip, IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Autocomplete } from '@mui/material';
import api from '../../utils/api';
import { useSelector } from 'react-redux';
export default function InvestmentForm({ assetClasses = [], onSubmit, onCancel, initialData }) {
    const reserves = useSelector(state => state.finance.reserves) || [];
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        value: initialData?.value || '',
        type: initialData?.type || '',
        sub: initialData?.sub_category || '',
        details: initialData?.details || '',
        date: initialData?.date ? dayjs(initialData.date) : dayjs(),
        quantity: initialData?.quantity || '',
        buy_price: initialData?.buy_price || '',
        current_price: initialData?.current_price || '',
        ticker: initialData?.ticker || '',
        withdrawals: initialData?.withdrawals || [],
        epf_employee: initialData?.epf_employee || '',
        epf_employer: initialData?.epf_employer || '',
        contributions: initialData?.contributions || [],
        payment_method: initialData?.payment_method || '',
        payment_source_id: initialData?.payment_source_id || ''
    });

    const [newWithdrawal, setNewWithdrawal] = useState({ amount: '', date: dayjs(), details: '', quantity: '' });
    const [newPurchase, setNewPurchase] = useState({ quantity: '', price: '' });

    const [mfOptions, setMfOptions] = useState([]);
    const [mfLoading, setMfLoading] = useState(false);

    const isMarketAsset = ['Stocks', 'Mutual Funds', 'Gold', 'Crypto'].includes(formData.type);
    const isEPF = ['Retirement', 'EPF', 'EPFO', 'Retirement / EPF'].includes(formData.type);
    const isMF = formData.type === 'Mutual Funds';
    const [fetchingPrice, setFetchingPrice] = useState(false);

    const handleFetchPrice = async () => {
        if (!formData.ticker) return;
        setFetchingPrice(true);
        try {
            const res = await api.get(`/market-price?ticker=${formData.ticker}`);
            const data = res.data;
            setFormData(prev => ({ ...prev, current_price: data.price.toFixed(2), buy_price: prev.buy_price || data.price.toFixed(2) }));
        } catch (e) {
            console.error(e);
            alert("Could not fetch price. Ensure the ticker symbol is correct (e.g. RELIANCE, TCS).");
        } finally {
            setFetchingPrice(false);
        }
    };

    useEffect(() => {
        // Auto-fetch if sub-category looks like a ticker symbol
        const isLikelyTicker = /^[A-Z]{2,10}(\.NS|\.BO)?$/.test(formData.sub);
        if (isLikelyTicker && !formData.ticker) {
            setFormData(prev => ({ ...prev, ticker: formData.sub }));
        }
    }, [formData.sub]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isMF && formData.sub && formData.sub.length > 2) {
                setMfLoading(true);
                api.get(`/mf-search?q=${formData.sub}`)
                    .then(res => res.data)
                    .then(data => {
                        setMfOptions(data.map(m => ({ label: m.schemeName, value: m.schemeCode })));
                        setMfLoading(false);
                    })
                    .catch(() => setMfLoading(false));
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [formData.sub, isMF]);

    const handleMfSelect = async (code) => {
        setFetchingPrice(true);
        try {
            const res = await api.get(`/mf-nav?code=${code}`);
            const data = res.data;

            if (data && typeof data.nav !== 'undefined') {
                setFormData(prev => ({
                    ...prev,
                    current_price: data.nav.toFixed(4),
                    buy_price: prev.buy_price || data.nav.toFixed(4),
                    name: prev.name || data.scheme_name,
                    ticker: code.toString()
                }));
            }
        } catch (e) {
            console.error("MF Fetch Error", e);
        } finally {
            setFetchingPrice(false);
        }
    };

    // Auto-fetch Current Price when Ticker is present
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isMarketAsset && formData.ticker && !formData.current_price) {
                handleFetchPrice();
            }
        }, 1200);
        return () => clearTimeout(timeout);
    }, [formData.ticker, isMarketAsset]);

    useEffect(() => {
        if (isMarketAsset && formData.quantity && formData.current_price) {
            const calculatedVal = parseFloat(formData.quantity) * parseFloat(formData.current_price);
            if (!isNaN(calculatedVal)) {
                // Use a functional update to avoid unnecessary re-renders
                setFormData(prev => {
                    const newVal = calculatedVal.toFixed(2);
                    if (prev.value === newVal) return prev;
                    return { ...prev, value: newVal };
                });
            }
        }
    }, [formData.quantity, formData.current_price, isMarketAsset]);

    const [errors, setErrors] = useState({});

    const activeCat = assetClasses.find(c => c.name === formData.type);
    const activeSubs = activeCat?.sub_categories || [];

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Asset Name is required';
        if (!formData.value || parseFloat(formData.value) <= 0) newErrors.value = 'Value must be greater than 0';
        if (!formData.type) newErrors.type = 'Please select an asset type';
        if (!formData.date) newErrors.date = 'Date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const PAYMENT_METHODS = [
        { key: 'CASH', label: 'Cash', icon: <Banknote size={16} />, color: '#f59e0b', deductsReserve: true },
        { key: 'BANK', label: 'Bank', icon: <Landmark size={16} />, color: '#6366f1', deductsReserve: true },
        { key: 'WALLET', label: 'Wallet', icon: <Wallet size={16} />, color: '#10b981', deductsReserve: true },
        { key: 'UPI', label: 'UPI', icon: <Smartphone size={16} />, color: '#0071e3', deductsReserve: false },
        { key: 'CARD', label: 'Card', icon: <CreditCard size={16} />, color: '#ff3b30', deductsReserve: false },
        { key: 'GIFT', label: 'Gift', icon: <Gift size={16} />, color: '#ff9500', deductsReserve: false },
        { key: 'OTHER', label: 'Other', icon: <CircleDollarSign size={16} />, color: '#86868b', deductsReserve: false },
    ];

    const selectedPayMethod = PAYMENT_METHODS.find(m => m.key === formData.payment_method);
    const showSourcePicker = selectedPayMethod?.deductsReserve && reserves.length > 0;
    const filteredReserves = reserves.filter(r => {
        if (formData.payment_method === 'CASH') return r.account_type === 'CASH';
        if (formData.payment_method === 'BANK') return r.account_type === 'BANK';
        if (formData.payment_method === 'WALLET') return r.account_type === 'WALLET';
        return true;
    });

    const handleFormSubmit = () => {
        if (validate()) {
            onSubmit({
                name: formData.name,
                value: parseFloat(formData.value),
                type: formData.type,
                sub_category: formData.sub || '-',
                details: formData.details || '-',
                date: formData.date.format('YYYY-MM-DD'),
                withdrawals: formData.withdrawals,
                contributions: formData.contributions, // Ensure EPF contribs are passed
                payment_method: formData.payment_method || null,
                payment_source_id: formData.payment_source_id || null,
                recentPurchase: formData._recentPurchaseAmt || null, // Pass top-up amount
                ...(isMarketAsset && {
                    quantity: parseFloat(formData.quantity) || null,
                    buy_price: parseFloat(formData.buy_price) || null,
                    current_price: parseFloat(formData.current_price) || null,
                    ticker: formData.ticker || null,
                })
            });
        }
    };

    const handleAddWithdrawal = () => {
        const amt = parseFloat(newWithdrawal.amount);
        const qty = parseFloat(newWithdrawal.quantity);
        if (!amt || amt <= 0) return;

        let newMasterQty = parseFloat(formData.quantity);
        let updatedMasterQty = formData.quantity;
        let newValue = formData.value;

        if (qty > 0 && newMasterQty > 0) {
            newMasterQty -= qty;
            updatedMasterQty = newMasterQty > 0 ? newMasterQty.toFixed(4).replace(/\.0000$/, '') : "0";
            newValue = (newMasterQty * parseFloat(formData.current_price || 0)).toFixed(2);
        }

        setFormData(prev => ({
            ...prev,
            quantity: updatedMasterQty,
            value: newValue,
            withdrawals: [...prev.withdrawals, { ...newWithdrawal, amount: amt, quantity: qty || 0, date: newWithdrawal.date.format('YYYY-MM-DD') }]
        }));
        setNewWithdrawal({ amount: '', date: dayjs(), details: '', quantity: '' });
    };

    const handleMergePurchase = () => {
        const addQty = parseFloat(newPurchase.quantity);
        const addPrice = parseFloat(newPurchase.price);
        if (!addQty || addQty <= 0 || !addPrice || addPrice <= 0) return;

        const oldQty = parseFloat(formData.quantity) || 0;
        const oldPrice = parseFloat(formData.buy_price) || 0;
        const addAmt = addQty * addPrice;

        const oldTotalCost = oldQty * oldPrice;
        const newTotalCost = addQty * addPrice;

        const finalQty = oldQty + addQty;
        const finalAvgPrice = finalQty > 0 ? (oldTotalCost + newTotalCost) / finalQty : 0;

        setFormData(prev => {
            const currentPrice = parseFloat(prev.current_price || 0);
            return {
                ...prev,
                quantity: finalQty.toFixed(4).replace(/\.0000$/, ''),
                buy_price: finalAvgPrice.toFixed(2),
                value: (finalQty * currentPrice).toFixed(2),
                _recentPurchaseAmt: (prev._recentPurchaseAmt || 0) + addAmt
            };
        });

        setNewPurchase({ quantity: '', price: '' });
    };

    const handleAddContribution = (customAmt = null) => {
        const emp = parseFloat(formData.epf_employee) || 0;
        const mbr = parseFloat(formData.epf_employer) || 0;
        const total = customAmt || (emp + mbr);

        if (total <= 0) return;

        const newEntry = {
            amount: total,
            employee: customAmt ? total : emp,
            employer: customAmt ? 0 : mbr,
            date: dayjs().format('YYYY-MM-DD'),
            details: customAmt ? 'Manual Deposit' : `Monthly Cycle (Emp:${emp} + Mbr:${mbr})`
        };

        setFormData(prev => ({
            ...prev,
            contributions: [...prev.contributions, newEntry],
            value: (parseFloat(prev.value) || 0) + total,
            _recentPurchaseAmt: (prev._recentPurchaseAmt || 0) + total // Accumulate for audit
        }));
    };

    const handleRemoveContribution = (idx) => {
        const removed = formData.contributions[idx];
        setFormData(prev => ({
            ...prev,
            contributions: prev.contributions.filter((_, i) => i !== idx),
            value: (parseFloat(prev.value) || 0) - removed.amount
        }));
    };

    const handleRemoveWithdrawal = (idx) => {
        setFormData(prev => ({ ...prev, withdrawals: prev.withdrawals.filter((_, i) => i !== idx) }));
    };

    const costOfInvestment = parseFloat(formData.quantity) * parseFloat(formData.buy_price) || 0;
    const currentValOfInvestment = parseFloat(formData.quantity) * parseFloat(formData.current_price) || 0;
    const profitPercent = costOfInvestment > 0 ? ((currentValOfInvestment - costOfInvestment) / costOfInvestment) * 100 : 0;

    const globalInputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '14px',
            backgroundColor: 'rgba(0,0,0,0.015)',
            minHeight: '52px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': { borderColor: 'rgba(0,0,0,0.06)', borderWidth: '1px' },
            '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.025)',
                '& fieldset': { borderColor: 'rgba(0,0,0,0.12)' }
            },
            '&.Mui-focused': {
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                '& fieldset': { borderColor: '#1d1d1f', borderWidth: '1.5px' }
            }
        },
        '& .MuiOutlinedInput-input': {
            fontWeight: 700, color: '#1d1d1f', fontSize: '0.92rem',
            letterSpacing: '-0.01em', paddingLeft: '4px'
        },
        '& .MuiInputAdornment-root': { color: '#86868b' }
    };

    const labelStyle = {
        fontSize: '0.68rem', fontWeight: 900, color: '#86868b',
        marginBottom: '0.6rem', marginLeft: '0.4rem', display: 'block',
        letterSpacing: '0.12em', textTransform: 'uppercase'
    };

    return (
        <Box sx={{ p: 4, pt: 1, bgcolor: '#ffffff' }}>
            <Stack spacing={2.5}>
                {/* VALUATION / OPENING BALANCE */}
                <Box>
                    <Typography sx={labelStyle}>{isEPF ? 'OPENING BALANCE (PREVIOUS CORPUS)' : 'ASSET VALUATION'}</Typography>
                    <TextField
                        fullWidth
                        placeholder="0.00"
                        variant="outlined"
                        size="small"
                        value={formData.value}
                        onChange={e => {
                            const val = e.target.value;
                            if (val === '' || /^\d*\.?\d*$/.test(val)) setFormData({ ...formData, value: val });
                        }}
                        error={!!errors.value}
                        helperText={errors.value}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><CreditCard size={18} style={{ color: '#0071e3' }} /><Typography sx={{ fontWeight: 900, ml: 1, color: '#1d1d1f', fontSize: '0.9rem' }}>₹</Typography></InputAdornment>
                        }}
                        sx={globalInputStyle}
                    />
                </Box>

                {/* MARKET ASSET FIELDS */}
                {isMarketAsset && (
                    <Box sx={{ p: 2.5, borderRadius: '16px', bgcolor: 'rgba(0,113,227,0.03)', border: '1px solid rgba(0,113,227,0.1)' }}>
                        <Typography sx={{ ...labelStyle, color: '#0071e3', mb: 2 }}>MARKET METRICS (AUTO-CALCS VALUATION)</Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
                            <TextField
                                fullWidth
                                placeholder="Ticker / Symbol (e.g. RELIANCE)"
                                variant="outlined"
                                size="small"
                                value={formData.ticker}
                                onChange={e => setFormData({ ...formData, ticker: e.target.value })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><TrendingUp size={16} style={{ color: '#0071e3' }} /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button
                                                size="small"
                                                onClick={handleFetchPrice}
                                                disabled={!formData.ticker || fetchingPrice}
                                                sx={{ minWidth: '32px', height: '32px', p: 0, borderRadius: '8px', bgcolor: 'rgba(0,113,227,0.1)', '&:hover': { bgcolor: 'rgba(0,113,227,0.2)' } }}
                                            >
                                                {fetchingPrice ? <CircularProgress size={14} /> : <Zap size={14} color="#0071e3" />}
                                            </Button>
                                        </InputAdornment>
                                    )
                                }}
                                sx={globalInputStyle}
                            />
                            <TextField
                                fullWidth
                                placeholder="Quantity / Units (e.g. 50)"
                                variant="outlined"
                                size="small"
                                value={formData.quantity}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setFormData({ ...formData, quantity: val });
                                }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Hash size={16} style={{ color: '#0071e3' }} /></InputAdornment> }}
                                sx={globalInputStyle}
                            />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                placeholder="Avg Buy Price (₹)"
                                variant="outlined"
                                size="small"
                                value={formData.buy_price}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setFormData({ ...formData, buy_price: val });
                                }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={16} style={{ color: '#ff3b30' }} /></InputAdornment> }}
                                sx={globalInputStyle}
                            />
                            <TextField
                                fullWidth
                                placeholder="Current Price (₹)"
                                variant="outlined"
                                size="small"
                                value={formData.current_price}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setFormData({ ...formData, current_price: val });
                                }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><DollarSign size={16} style={{ color: '#34c759' }} /></InputAdornment> }}
                                sx={globalInputStyle}
                            />
                        </Stack>

                        {costOfInvestment > 0 && (
                            <Box sx={{ mt: 3, p: 2, borderRadius: '12px', bgcolor: 'rgba(0,113,227,0.03)', border: '1px solid rgba(0,113,227,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#0071e3', letterSpacing: '0.05em' }}>PROFIT MARGIN</Typography>
                                    <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: profitPercent >= 0 ? '#34c759' : '#ff3b30' }}>
                                        {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: 'text.secondary', letterSpacing: '0.05em' }}>TOTAL VALUE</Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1d1d1f' }}>
                                        ₹{(currentValOfInvestment).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                {/* EPF CONTRIBUTION CONSOLE */}
                {isEPF && (
                    <Box sx={{
                        p: 3, borderRadius: '28px',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(99,102,241,0.06))',
                        border: '1px solid rgba(99,102,241,0.15)',
                        boxShadow: 'inset 0 0 40px rgba(99,102,241,0.02)'
                    }}>
                        <Typography sx={{ ...labelStyle, color: '#6366f1', mb: 2.5, ml: 0 }}>EPF ACCUMULATION CONSOLE (MONTHLY)</Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
                            <TextField
                                label="Employee Contrib (₹)"
                                fullWidth
                                size="small"
                                value={formData.epf_employee}
                                onChange={e => setFormData({ ...formData, epf_employee: e.target.value })}
                                sx={globalInputStyle}
                            />
                            <TextField
                                label="Employer Contrib (₹)"
                                fullWidth
                                size="small"
                                value={formData.epf_employer}
                                onChange={e => setFormData({ ...formData, epf_employer: e.target.value })}
                                sx={globalInputStyle}
                            />
                        </Stack>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleAddContribution()}
                            startIcon={<Zap size={18} />}
                            sx={{
                                minHeight: '52px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                boxShadow: '0 8px 20px rgba(99,102,241,0.2)',
                                color: '#ffffff',
                                fontWeight: 900, '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 28px rgba(99,102,241,0.3)' },
                                textTransform: 'none', transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
                                mb: 3
                            }}
                        >
                            Commit Monthly EPF Cycle
                        </Button>

                        {/* CONTRIBUTION HISTORY */}
                        <Stack spacing={1.2}>
                            {formData.contributions.map((c, idx) => (
                                <Box key={idx} sx={{
                                    p: 1.5, bgcolor: '#ffffff', borderRadius: '14px',
                                    border: '1px solid rgba(99,102,241,0.1)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 900, fontSize: '0.85rem' }}>+ ₹{c.amount.toLocaleString()}</Typography>
                                        <Typography sx={{ fontSize: '0.62rem', color: '#86868b', fontWeight: 800 }}>{dayjs(c.date).format('MMM YYYY')} • {c.details}</Typography>
                                    </Box>
                                    <IconButton size="small" onClick={() => handleRemoveContribution(idx)} sx={{ color: '#ff3b30' }}>
                                        <X size={14} />
                                    </IconButton>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* NAME */}
                <Box>
                    <Typography sx={labelStyle}>ASSET NAME</Typography>
                    <TextField
                        fullWidth
                        placeholder="e.g. HDFC Liquid Fund..."
                        variant="outlined"
                        size="small"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><LayoutGrid size={18} style={{ color: '#ff9500' }} /></InputAdornment>
                        }}
                        sx={globalInputStyle}
                    />
                </Box>

                {/* TYPE */}
                <Box>
                    <Typography sx={labelStyle}>ASSET CLASS</Typography>
                    <Select
                        fullWidth
                        size="small"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value, sub: '' })}
                        error={!!errors.type}
                        displayEmpty
                        startAdornment={<InputAdornment position="start" sx={{ mr: 1, ml: -0.5 }}><Tag size={18} style={{ color: '#5856d6' }} /></InputAdornment>}
                        sx={globalInputStyle['& .MuiOutlinedInput-root']}
                        IconComponent={ChevronDown}
                    >
                        <MenuItem value="" disabled>Select Class</MenuItem>
                        {assetClasses.map(c => (
                            <MenuItem key={c.name} value={c.name} sx={{ fontWeight: 800, py: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: c.color || '#0071e3' }} />
                                    {c.name}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.type && <FormHelperText error sx={{ ml: 2, fontWeight: 700 }}>{errors.type}</FormHelperText>}
                </Box>

                {/* SUB CATEGORY */}
                <Box>
                    <Typography sx={labelStyle}>{isMF ? 'SEARCH MUTUAL FUND SCHEME' : 'ASSET NODE (SUB-CLASS)'}</Typography>
                    <Autocomplete
                        fullWidth
                        freeSolo
                        options={isMF ? mfOptions : activeSubs}
                        loading={mfLoading}
                        disabled={!formData.type}
                        value={formData.sub}
                        onChange={(event, newValue) => {
                            if (isMF && typeof newValue === 'object') {
                                setFormData({ ...formData, sub: newValue.label });
                                handleMfSelect(newValue.value);
                            } else {
                                setFormData({ ...formData, sub: newValue });
                            }
                        }}
                        onInputChange={(event, newInputValue) => setFormData({ ...formData, sub: newInputValue })}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                placeholder={isMF ? "e.g. Axis Bluechip..." : (formData.type ? "Node specification..." : "Segment first")}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ mr: 1.5, ml: -0.5 }}>
                                            <Tag size={18} style={{ color: '#32ade6' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <React.Fragment>
                                            {mfLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                                sx={globalInputStyle}
                            />
                        )}
                        sx={{
                            '& .MuiAutocomplete-inputRoot': {
                                paddingLeft: '12px !important'
                            },
                            '& .MuiAutocomplete-endAdornment': { top: 'calc(50% - 14px)' }
                        }}
                    />
                </Box>

                {/* TIMESTAMP */}
                <Box>
                    <Typography sx={labelStyle}>ACQUISITION TIMESTAMP</Typography>
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

                {/* DETAILS */}
                <Box>
                    <Typography sx={labelStyle}>METADATA / DETAILS</Typography>
                    <TextField
                        fullWidth
                        placeholder="Additional details..."
                        variant="outlined"
                        size="small"
                        value={formData.details}
                        onChange={e => setFormData({ ...formData, details: e.target.value })}
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ mr: 0.5 }}><FileText size={18} style={{ color: '#32ade6' }} /></InputAdornment>
                        }}
                        sx={globalInputStyle}
                    />
                </Box>

                {/* WITHDRAWALS - ONLY IN EDIT MODE */}
                {initialData && (
                    <Box sx={{
                        mt: 2, p: 3, borderRadius: '28px',
                        background: 'linear-gradient(135deg, rgba(255,149,0,0.03), rgba(255,149,0,0.06))',
                        border: '1px solid rgba(255,149,0,0.15)',
                        boxShadow: 'inset 0 0 40px rgba(255,149,0,0.02)'
                    }}>
                        <Typography sx={{ ...labelStyle, color: '#ff9500', mb: 2.5, ml: 0 }}>CAPITAL EXIT REGISTRY (QUICK SETTLE)</Typography>

                        <Stack spacing={1.5} mb={3.5}>
                            {formData.withdrawals.map((w, idx) => (
                                <Box key={idx} sx={{
                                    p: 2, bgcolor: '#ffffff', borderRadius: '18px',
                                    border: '1px solid rgba(255,149,0,0.1)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                }}>
                                    <Box>
                                        <Typography sx={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.02em', color: '#1d1d1f' }}>- ₹{w.amount.toLocaleString()}</Typography>
                                        <Typography sx={{ fontSize: '0.68rem', color: '#86868b', fontWeight: 700 }}>
                                            {w.date} • {w.details} {w.quantity ? `• Qty Exited: ${w.quantity}` : ''}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Chip label="SETTLED" size="small" sx={{ height: '22px', fontSize: '0.6rem', fontWeight: 900, bgcolor: 'rgba(52,199,89,0.1)', color: '#34c759', borderRadius: '6px' }} />
                                        <IconButton size="small" onClick={() => handleRemoveWithdrawal(idx)} sx={{ color: '#ff3b30', '&:hover': { bgcolor: 'rgba(255,59,48,0.1)' } }}>
                                            <X size={16} />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}
                        </Stack>

                        <Stack spacing={2}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                                {isMarketAsset && (
                                    <TextField
                                        fullWidth
                                        placeholder="Exit Units"
                                        size="small"
                                        value={newWithdrawal.quantity}
                                        onChange={e => {
                                            const qty = e.target.value;
                                            if (qty === '' || /^\d*\.?\d*$/.test(qty)) {
                                                const currentPrice = parseFloat(formData.current_price) || 0;
                                                const calculatedAmt = (parseFloat(qty) * currentPrice).toFixed(2);
                                                setNewWithdrawal({ ...newWithdrawal, quantity: qty, amount: qty ? calculatedAmt : '' });
                                            }
                                        }}
                                        sx={globalInputStyle}
                                        InputProps={{ startAdornment: <Hash size={16} style={{ color: '#ff9500', marginRight: '8px' }} /> }}
                                    />
                                )}
                                <TextField
                                    fullWidth
                                    placeholder="Settle Amount (₹)"
                                    size="small"
                                    value={newWithdrawal.amount}
                                    onChange={e => setNewWithdrawal({ ...newWithdrawal, amount: e.target.value })}
                                    sx={globalInputStyle}
                                    InputProps={{ startAdornment: <Typography sx={{ fontWeight: 900, mr: 1, color: '#ff9500' }}>₹</Typography> }}
                                />
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                                <TextField
                                    fullWidth
                                    placeholder="Exit Justification..."
                                    size="small"
                                    value={newWithdrawal.details}
                                    onChange={e => setNewWithdrawal({ ...newWithdrawal, details: e.target.value })}
                                    sx={globalInputStyle}
                                    InputProps={{ startAdornment: <FileText size={16} style={{ color: '#86868b', marginRight: '8px' }} /> }}
                                />
                                <DatePicker
                                    value={newWithdrawal.date}
                                    onChange={val => setNewWithdrawal({ ...newWithdrawal, date: val })}
                                    slotProps={{ textField: { fullWidth: true, size: 'small', sx: globalInputStyle } }}
                                />
                            </Stack>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleAddWithdrawal}
                                sx={{
                                    minHeight: '52px', borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #ff9500, #ffb347)',
                                    boxShadow: '0 8px 20px rgba(255,149,0,0.2)',
                                    color: '#ffffff',
                                    fontWeight: 900, '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 28px rgba(255,149,0,0.3)' },
                                    textTransform: 'none', transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                Commit Capital Exit
                            </Button>
                        </Stack>
                    </Box>
                )}

                {/* COST AVERAGING MANAGER (BUY MORE TRADING) */}
                {isMarketAsset && initialData && (
                    <Box sx={{
                        mt: 2, p: 3, borderRadius: '28px',
                        background: 'linear-gradient(135deg, rgba(52,199,89,0.03), rgba(52,199,89,0.06))',
                        border: '1px solid rgba(52,199,89,0.15)',
                        boxShadow: 'inset 0 0 40px rgba(52,199,89,0.02)'
                    }}>
                        <Typography sx={{ ...labelStyle, color: '#34c759', mb: 2.5, ml: 0 }}>PORTFOLIO AVERAGING CONSOLE (ADD UNITS)</Typography>
                        <Stack spacing={2}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                                <TextField
                                    fullWidth
                                    placeholder="Add New Units"
                                    size="small"
                                    value={newPurchase.quantity}
                                    onChange={e => {
                                        const qty = e.target.value;
                                        if (qty === '' || /^\d*\.?\d*$/.test(qty)) setNewPurchase({ ...newPurchase, quantity: qty });
                                    }}
                                    sx={globalInputStyle}
                                    InputProps={{ startAdornment: <Hash size={16} style={{ color: '#34c759', marginRight: '8px' }} /> }}
                                />
                                <TextField
                                    fullWidth
                                    placeholder="Purchase Price (₹)"
                                    size="small"
                                    value={newPurchase.price}
                                    onChange={e => setNewPurchase({ ...newPurchase, price: e.target.value })}
                                    sx={globalInputStyle}
                                    InputProps={{ startAdornment: <Typography sx={{ fontWeight: 900, mr: 1, color: '#34c759' }}>₹</Typography> }}
                                />
                            </Stack>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleMergePurchase}
                                sx={{
                                    minHeight: '52px', borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #34c759, #28a745)',
                                    boxShadow: '0 8px 20px rgba(52,199,89,0.2)',
                                    color: '#ffffff',
                                    fontWeight: 900, '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 28px rgba(52,199,89,0.3)' },
                                    textTransform: 'none', transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                Prorate & Merge into Average Buy Price
                            </Button>
                        </Stack>
                    </Box>
                )}

                {/* PAYMENT METHOD */}
                <Box>
                    <Typography sx={labelStyle}>FUNDING METHOD</Typography>
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
                        <Typography sx={labelStyle}>SOURCE ACCOUNT — <span style={{ color: selectedPayMethod.color }}>SELECT TO AUTO-DEDUCT</span></Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={formData.payment_source_id}
                            onChange={e => setFormData({ ...formData, payment_source_id: e.target.value })}
                            displayEmpty
                            sx={{ borderRadius: '14px', backgroundColor: 'rgba(0,0,0,0.015)', fontWeight: 700, fontSize: '0.92rem' }}
                        >
                            <MenuItem value=""><em style={{ color: '#86868b', fontStyle: 'normal', fontWeight: 600 }}>No deduction (track only)</em></MenuItem>
                            {filteredReserves.map(r => {
                                const isInsufficient = parseFloat(r.balance) < (parseFloat(formData.value) || 0) && r.account_type !== 'CREDIT_CARD';
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
            </Stack>

            <Box sx={{
                display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 5, pt: 3,
                borderTop: '1px solid rgba(0,0,0,0.06)'
            }}>
                <Button
                    onClick={onCancel}
                    variant="text"
                    sx={{
                        borderRadius: '16px', px: 4,
                        fontWeight: 800, textTransform: 'none',
                        color: '#86868b', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', color: '#1d1d1f' },
                        transition: '0.2s all ease'
                    }}
                >
                    Dismiss
                </Button>
                <Button
                    variant="contained"
                    onClick={handleFormSubmit}
                    sx={{
                        borderRadius: '16px', px: 6, py: 1.5,
                        fontWeight: 900, textTransform: 'none',
                        bgcolor: '#1d1d1f', color: '#ffffff',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        '&:hover': {
                            bgcolor: '#000',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
                        },
                        '&:active': { transform: 'translateY(0)' },
                        transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {initialData ? 'Synchronize Updates' : 'Commit New Asset'}
                </Button>
            </Box>
        </Box>
    );
}
