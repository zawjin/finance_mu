import React, { useState } from 'react';
import { 
    Box, TextField, Button, Grid, MenuItem, 
    Typography, InputAdornment, IconButton
} from '@mui/material';
import { User, DollarSign, Calendar, FileText, ChevronRight, Hash } from 'lucide-react';
import dayjs from 'dayjs';

export default function DebtForm({ onSubmit, initialData, onCancel }) {
    const [formData, setFormData] = useState({
        person: initialData?.person || '',
        amount: initialData?.amount || '',
        direction: initialData?.direction || 'OWED_TO_ME',
        date: initialData?.date || dayjs().format('YYYY-MM-DD'),
        dueDate: initialData?.dueDate || '',
        status: initialData?.status || 'ACTIVE',
        category: initialData?.category || 'PERSONAL',
        description: initialData?.description || ''
    });

    const [errors, setErrors] = useState({});

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({
                ...formData,
                amount: parseFloat(formData.amount)
            });
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="PERSON / ENTITY"
                        name="person"
                        value={formData.person}
                        onChange={handleChange}
                        error={!!errors.person}
                        helperText={errors.person}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <User size={18} color="#6366f1" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '15px', fontWeight: 800 }
                        }}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="AMOUNT"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        error={!!errors.amount}
                        helperText={errors.amount}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <DollarSign size={18} color="#6366f1" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '15px', fontWeight: 800 }
                        }}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        select
                        label="DIRECTION"
                        name="direction"
                        value={formData.direction}
                        onChange={handleChange}
                        SelectProps={{
                            sx: { borderRadius: '15px', fontWeight: 800 }
                        }}
                    >
                        <MenuItem value="OWED_TO_ME" sx={{ fontWeight: 800 }}>RECEIVABLE (He owes me)</MenuItem>
                        <MenuItem value="I_OWE" sx={{ fontWeight: 800 }}>LIABILITY (I owe him)</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="DATE"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        error={!!errors.date}
                        helperText={errors.date}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Calendar size={18} color="#6366f1" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '15px', fontWeight: 800 }
                        }}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="DUE DATE"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Calendar size={18} color="#fb923c" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '15px', fontWeight: 800 }
                        }}
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        select
                        label="STATUS"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        SelectProps={{
                            sx: { borderRadius: '15px', fontWeight: 800 }
                        }}
                    >
                        <MenuItem value="ACTIVE" sx={{ fontWeight: 800 }}>ACTIVE (Live)</MenuItem>
                        <MenuItem value="SETTLED" sx={{ fontWeight: 800 }}>SETTLED (Paid)</MenuItem>
                        <MenuItem value="PARTIAL" sx={{ fontWeight: 800 }}>PARTIAL (InProgress)</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="CATEGORY"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Hash size={18} color="#6366f1" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '15px', fontWeight: 800 }
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="MEMO / DETAILS"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FileText size={18} color="#6366f1" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '20px', fontWeight: 800 }
                        }}
                    />
                </Grid>
            </Grid>

            {/* ACTION SECTION */}
            <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
                <Button
                    fullWidth
                    onClick={onCancel}
                    sx={{
                        borderRadius: '18px',
                        py: 2,
                        fontWeight: 900,
                        bgcolor: 'rgba(0,0,0,0.04)',
                        color: '#1d1d1f',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
                    }}
                >
                    ABORT
                </Button>
                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{
                        borderRadius: '18px',
                        py: 2,
                        fontWeight: 900,
                        bgcolor: '#0f172a',
                        display: 'flex',
                        gap: 1.5,
                        '&:hover': { bgcolor: '#1e293b' }
                    }}
                >
                    {initialData ? 'COMMIT UPDATE' : 'SYNC DEBT'} <ChevronRight size={18} />
                </Button>
            </Box>
        </Box>
    );
}
