import React, { useState } from 'react';
import { 
    X, Calendar, Edit3, ChevronDown, Wallet,
    FileText, LayoutGrid, Tag, CreditCard,
    AlertCircle, CheckCircle2
} from 'lucide-react';
import dayjs from 'dayjs';
import { 
    Box, TextField, Select, MenuItem, Button, Typography, 
    InputAdornment, FormHelperText, Stack, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

export default function ExpenseForm({ categories, onSubmit, onCancel, initialData }) {
    const [formData, setFormData] = useState({
        amount: initialData?.amount || '',
        description: initialData?.description || '',
        category: initialData?.category || '',
        sub: initialData?.sub_category || '',
        date: initialData?.date ? dayjs(initialData.date) : dayjs(),
        recovered: initialData?.recovered || '',
        recovery_desc: initialData?.recovery_description || ''
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
                recovery_description: formData.recovery_desc || ""
            });
        }
    };

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
