import React, { useState } from 'react';
import {
    Typography, InputAdornment, IconButton, Stack, CircularProgress,
    Box, TextField, MenuItem, Button, Radio, RadioGroup, FormControlLabel
} from '@mui/material';

import { User, DollarSign, Calendar, FileText, ChevronRight, Hash, Tag, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import './Forms.scss';

export default function DebtForm({ onSubmit, initialData, onCancel }) {
    const [formData, setFormData] = useState({
        person: initialData?.person || '',
        amount: initialData?.amount || '',
        direction: initialData?.direction || 'OWED_TO_ME',
        date: initialData?.date ? dayjs(initialData.date) : dayjs(),
        dueDate: initialData?.dueDate ? dayjs(initialData.dueDate) : null,
        status: initialData?.status || 'ACTIVE',
        category: initialData?.category || 'PERSONAL',
        description: initialData?.description || ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.person) newErrors.person = 'Person/Entity is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
        if (!formData.date) newErrors.date = 'Date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (validate()) {
            setLoading(true);
            try {
                await onSubmit({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    date: formData.date.format('YYYY-MM-DD'),
                    dueDate: formData.dueDate ? formData.dueDate.format('YYYY-MM-DD') : null
                });
            } catch (err) {
                console.error("Submission error:", err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Box component="form" className="form-container-premium">
            <Stack spacing={1}>
                {/* Person */}
                <Box>
                    <Typography className="form-label-premium">Counterparty / Person</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Who is involved?"
                        name="person"
                        value={formData.person}
                        onChange={handleChange}
                        error={!!errors.person}
                        helperText={errors.person}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                    <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <User size={18} />
                                    </Box>
                                </InputAdornment>
                            ),
                            className: "form-input-premium"
                        }}
                    />
                </Box>

                {/* Amount */}
                <Box>
                    <Typography className="form-label-premium">Amount</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        error={!!errors.amount}
                        helperText={errors.amount}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                    <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
                                        <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>₹</Typography>
                                    </Box>
                                </InputAdornment>
                            ),
                            className: "form-input-premium"
                        }}
                    />
                </Box>

                {/* Transaction Type */}
                <Box>
                    <Typography className="form-label-premium">Exposure Archetype</Typography>
                    <RadioGroup
                        row
                        name="direction"
                        value={formData.direction}
                        onChange={handleChange}
                        sx={{ gap: 1.5 }}
                    >
                        <FormControlLabel
                            value="OWED_TO_ME"
                            control={<Radio sx={{ display: 'none' }} />}
                            label={
                                <Box sx={{
                                    p: 1,
                                    borderRadius: '14px',
                                    border: '1.5px solid',
                                    borderColor: formData.direction === 'OWED_TO_ME' ? '#10b981' : 'rgba(0,0,0,0.05)',
                                    bgcolor: formData.direction === 'OWED_TO_ME' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.02)',
                                    color: formData.direction === 'OWED_TO_ME' ? '#10b981' : '#86868b',
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer'
                                }}>
                                    <Box sx={{
                                        width: 28, height: 28, borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        bgcolor: formData.direction === 'OWED_TO_ME' ? '#10b981' : 'rgba(0,0,0,0.05)',
                                        color: formData.direction === 'OWED_TO_ME' ? '#fff' : '#86868b'
                                    }}>
                                        <ArrowUpRight size={16} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.75rem' }}>RECEIVABLE</Typography>
                                </Box>
                            }
                            sx={{ m: 0, flex: 1 }}
                        />
                        <FormControlLabel
                            value="I_OWE"
                            control={<Radio sx={{ display: 'none' }} />}
                            label={
                                <Box sx={{
                                    p: 1,
                                    borderRadius: '14px',
                                    border: '1.5px solid',
                                    borderColor: formData.direction === 'I_OWE' ? '#ff3b30' : 'rgba(0,0,0,0.05)',
                                    bgcolor: formData.direction === 'I_OWE' ? 'rgba(255, 59, 48, 0.08)' : 'rgba(0,0,0,0.02)',
                                    color: formData.direction === 'I_OWE' ? '#ff3b30' : '#86868b',
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer'
                                }}>
                                    <Box sx={{
                                        width: 28, height: 28, borderRadius: '8px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        bgcolor: formData.direction === 'I_OWE' ? '#ff3b30' : 'rgba(0,0,0,0.05)',
                                        color: formData.direction === 'I_OWE' ? '#fff' : '#86868b'
                                    }}>
                                        <ArrowDownLeft size={16} />
                                    </Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.75rem' }}>LIABILITY</Typography>
                                </Box>
                            }
                            sx={{ m: 0, flex: 1 }}
                        />
                    </RadioGroup>
                </Box>

                {/* Issue Date */}
                <Box>
                    <Typography className="form-label-premium">Issue Date</Typography>
                    <DatePicker
                        value={formData.date}
                        onChange={(val) => setFormData({ ...formData, date: val })}
                        sx={{ width: '100%' }}
                        slotProps={{
                            textField: {
                                fullWidth: true, size: 'small', error: !!errors.date,
                                helperText: errors.date,
                                inputProps: { readOnly: true },
                                InputProps: {
                                    className: "form-input-premium",
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                            <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(0, 122, 255, 0.1)', color: '#007aff' }}>
                                                <Calendar size={18} />
                                            </Box>
                                        </InputAdornment>
                                    )
                                }
                            }
                        }}
                    />
                </Box>

                {/* Payback Target */}
                <Box>
                    <Typography className="form-label-premium">Payback Target</Typography>
                    <DatePicker
                        value={formData.dueDate}
                        onChange={(val) => setFormData({ ...formData, dueDate: val })}
                        sx={{ width: '100%' }}
                        slotProps={{
                            textField: {
                                fullWidth: true, size: 'small',
                                inputProps: { readOnly: true },
                                InputProps: {
                                    className: "form-input-premium",
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                            <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30' }}>
                                                <Calendar size={18} />
                                            </Box>
                                        </InputAdornment>
                                    )
                                }
                            }
                        }}
                    />
                </Box>

                {/* Status */}
                <Box>
                    <Typography className="form-label-premium">Audit Status</Typography>
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
                            { value: 'PARTIAL', label: 'PARTIAL', icon: <AlertCircle size={14} />, color: '#ff9500' }
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

                {/* Industry / Tag */}
                <Box>
                    <Typography className="form-label-premium">Industry / Tag</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g. Personal, Business..."
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                    <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(107, 114, 128, 0.1)', color: '#6b7280' }}>
                                        <Tag size={18} />
                                    </Box>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                {/* Memo */}
                <Box>
                    <Typography className="form-label-premium">Audit Memo / Details</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Additional context..."
                        InputProps={{
                            className: "form-input-premium",
                            startAdornment: (
                                <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                    <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>
                                        <FileText size={18} />
                                    </Box>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
            </Stack>

            {/* ACTION SECTION */}
            <Box className="form-actions-row">
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
                    {loading ? 'Processing...' : (initialData ? 'SAVE EXPOSURE' : 'COMMIT DEBT')}
                </Button>
            </Box>
        </Box>
    );
}


