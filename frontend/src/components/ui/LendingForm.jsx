import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Stack, MenuItem, InputAdornment, CircularProgress, RadioGroup, Radio, FormControlLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { User, Banknote, Calendar, Target, CheckCircle2, ChevronRight, Hash, Tag, FileText, Clock, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import './Forms.scss';

export default function LendingForm({ onSubmit, initialData, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        borrower: initialData?.borrower || '',
        plan: initialData?.plan || '5L',
        start_date: initialData?.start_date ? dayjs(initialData.start_date) : dayjs(),
        status: initialData?.status || 'ACTIVE',
        interest_rate: initialData?.interest_rate || 0.065
    });

    useEffect(() => {
        if (initialData && initialData._id) {
            let detectedPlan = '5L';
            if (initialData.principal === 100000) detectedPlan = '1L';
            else if (initialData.principal === 1000000) detectedPlan = '10L';
            else if (initialData.principal === 1500000) detectedPlan = '15L';

            setFormData({
                borrower: initialData.borrower || '',
                plan: detectedPlan,
                start_date: initialData.start_date ? dayjs(initialData.start_date) : dayjs(),
                status: initialData.status || 'ACTIVE',
                interest_rate: initialData.interest_rate || 0.065
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        let numericPrincipal = 500000;
        if (formData.plan === '1L') numericPrincipal = 100000;
        else if (formData.plan === '10L') numericPrincipal = 1000000;
        else if (formData.plan === '15L') numericPrincipal = 1500000;

        const submissionData = {
            ...formData,
            principal: numericPrincipal,
            start_date: formData.start_date.format('YYYY-MM-DD')
        };

        if (initialData && initialData._id) {
            submissionData._id = initialData._id;
        }

        setLoading(true);
        try {
            await onSubmit(submissionData);
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" className="form-container-premium">
            <Stack spacing={1}>
                {/* IDENTIFIER / NAME */}
                <Box>
                    <Typography className="form-label-premium">IDENTIFIER / NAME</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        name="borrower"
                        placeholder="e.g. Term 1, Investment A"
                        value={formData.borrower}
                        onChange={handleChange}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                    <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <User size={18} />
                                    </Box>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                {/* INVESTMENT PLAN */}
                <Box>
                    <Typography className="form-label-premium">INVESTMENT PLAN</Typography>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        name="plan"
                        value={formData.plan}
                        onChange={handleChange}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                    <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 149, 0, 0.1)', color: '#ff9500', border: '1px solid rgba(255, 149, 0, 0.2)' }}>
                                        <Target size={18} />
                                    </Box>
                                </InputAdornment>
                            )
                        }}
                    >
                        <MenuItem value="1L" sx={{ fontWeight: 800 }}>1L (₹1,00,000 VALUE)</MenuItem>
                        <MenuItem value="5L" sx={{ fontWeight: 800 }}>5L (₹5,00,000 VALUE)</MenuItem>
                        <MenuItem value="10L" sx={{ fontWeight: 800 }}>10L (₹10,00,000 VALUE)</MenuItem>
                        <MenuItem value="15L" sx={{ fontWeight: 800 }}>15L (₹15,00,000 VALUE)</MenuItem>
                    </TextField>
                </Box>

                {/* START DATE */}
                <Box>
                    <Typography className="form-label-premium">START DATE</Typography>
                    <DatePicker
                        value={formData.start_date}
                        onChange={(val) => setFormData({ ...formData, start_date: val })}
                        sx={{ width: '100%' }}
                        slotProps={{
                            textField: {
                                fullWidth: true, size: 'small',
                                inputProps: { readOnly: true },
                                InputProps: {
                                    className: "form-input-premium",
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                            <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
                                                <Calendar size={18} />
                                            </Box>
                                        </InputAdornment>
                                    )
                                }
                            }
                        }}
                    />
                </Box>

                {/* STATUS */}
                <Box>
                    <Typography className="form-label-premium">STATUS</Typography>
                    <RadioGroup
                        row
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        sx={{ gap: 1.5 }}
                    >
                        {[
                            { value: 'ACTIVE', label: 'ACTIVE', icon: <Clock size={14} />, color: '#007aff' },
                            { value: 'SETTLED', label: 'SETTLED', icon: <CheckCircle2 size={14} />, color: '#10b981' },
                            { value: 'CLOSED', label: 'CLOSED', icon: <AlertCircle size={14} />, color: '#af52de' }
                        ].map((s) => (
                            <FormControlLabel
                                key={s.value}
                                value={s.value}
                                control={<Radio sx={{ display: 'none' }} />}
                                label={
                                    <Box sx={{
                                        px: 1.5,
                                        py: 0.8,
                                        borderRadius: '12px',
                                        border: '1.5px solid',
                                        borderColor: formData.status === s.value ? s.color : 'rgba(0,0,0,0.05)',
                                        bgcolor: formData.status === s.value ? `${s.color}08` : 'rgba(0,0,0,0.02)',
                                        color: formData.status === s.value ? s.color : '#86868b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        transition: '0.2s all ease-in-out',
                                        cursor: 'pointer'
                                    }}>
                                        {s.icon}
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.02em' }}>{s.label}</Typography>
                                    </Box>
                                }
                                sx={{ m: 0 }}
                            />
                        ))}
                    </RadioGroup>
                </Box>
            </Stack>

            {/* ACTION SECTION */}
            <Box className="form-actions-row" sx={{ mt: 4 }}>
                <Button
                    onClick={onCancel}
                    className="btn-dismiss-premium"
                >
                    ABORT
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    className="btn-submit-premium"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {loading ? 'PROCESSING...' : (initialData ? 'SAVE CHANGES' : 'COMMIT INVESTMENT')}
                </Button>
            </Box>
        </Box>
    );
}

