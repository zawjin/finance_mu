import React, { useState } from 'react';
import {
    Box, TextField, Button, Grid, MenuItem,
    Typography, InputAdornment, IconButton, Stack
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
        if (e && e.preventDefault) e.preventDefault();
        console.log("Submitting Debt Form:", formData);
        if (validate()) {
            onSubmit({
                ...formData,
                amount: parseFloat(formData.amount)
            });
        } else {
            console.log("Validation Errors:", errors);
            alert("Please fill in all required fields (Person, Amount, Date).");
        }
    };

    return (
        <Box component="form" sx={{ p: 4 }}>
            <Stack spacing={3.5}>
                {/* Person */}
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Counterparty / Person</Typography>
                    <TextField
                        fullWidth
                        placeholder="Who is involved?"
                        name="person"
                        value={formData.person}
                        onChange={handleChange}
                        error={!!errors.person}
                        helperText={errors.person}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box sx={{ p: 1, bgcolor: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex' }}>
                                        <User size={20} color="#6366f1" />
                                    </Box>
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '20px', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.03)' }
                        }}
                    />
                </Box>

                {/* Amount & Direction */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Amount</Typography>
                        <TextField
                            fullWidth
                            name="amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleChange}
                            error={!!errors.amount}
                            helperText={errors.amount}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Typography sx={{ fontWeight: 900, color: '#6366f1' }}>₹</Typography>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '20px', fontWeight: 900, bgcolor: 'rgba(0,0,0,0.01)' }
                            }}
                        />
                    </Box>
                    <Box sx={{ flex: 1.2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Transaction Type</Typography>
                        <TextField
                            fullWidth
                            select
                            name="direction"
                            value={formData.direction}
                            onChange={handleChange}
                            SelectProps={{ sx: { borderRadius: '20px', fontWeight: 800 } }}
                        >
                            <MenuItem value="OWED_TO_ME" sx={{ fontWeight: 800, color: '#10b981' }}>RECEIVABLE (He owes me)</MenuItem>
                            <MenuItem value="I_OWE" sx={{ fontWeight: 800, color: '#ff3b30' }}>LIABILITY (I owe him)</MenuItem>
                        </TextField>
                    </Box>
                </Box>

                {/* Dates */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Issue Date</Typography>
                        <TextField
                            fullWidth
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            InputProps={{ sx: { borderRadius: '20px', fontWeight: 800 } }}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Payback Target</Typography>
                        <TextField
                            fullWidth
                            name="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={handleChange}
                            InputProps={{ sx: { borderRadius: '20px', fontWeight: 800 } }}
                        />
                    </Box>
                </Box>

                {/* Status & Category */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Status</Typography>
                        <TextField
                            fullWidth
                            select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            SelectProps={{ sx: { borderRadius: '20px', fontWeight: 800 } }}
                        >
                            <MenuItem value="ACTIVE" sx={{ fontWeight: 800 }}>ACTIVE</MenuItem>
                            <MenuItem value="SETTLED" sx={{ fontWeight: 800 }}>SETTLED</MenuItem>
                            <MenuItem value="PARTIAL" sx={{ fontWeight: 800 }}>PARTIAL</MenuItem>
                        </TextField>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Industry / Tag</Typography>
                        <TextField
                            fullWidth
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            InputProps={{ sx: { borderRadius: '20px', fontWeight: 800 } }}
                        />
                    </Box>
                </Box>

                {/* Memo */}
                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#64748b', ml: 1, mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Audit Memo / Details</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        InputProps={{
                            sx: { borderRadius: '24px', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.01)' }
                        }}
                    />
                </Box>
            </Stack>

            {/* ACTION SECTION */}
            <Box sx={{ mt: 6, display: 'flex', gap: 2.5 }}>
                <Button
                    fullWidth
                    onClick={onCancel}
                    sx={{
                        borderRadius: '100px',
                        py: 2.2,
                        fontWeight: 900,
                        bgcolor: 'rgba(0,0,0,0.05)',
                        color: '#64748b',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
                    }}
                >
                    ABORT
                </Button>
                <Button
                    fullWidth
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                        borderRadius: '100px',
                        py: 2.2,
                        fontWeight: 900,
                        bgcolor: '#1d1d1f',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                        '&:hover': { bgcolor: '#000', transform: 'translateY(-1px)' }
                    }}

                >
                    {initialData ? 'SAVE EXPOSURE' : 'COMMIT DEBT'}
                </Button>

            </Box>
        </Box>
    );
}


