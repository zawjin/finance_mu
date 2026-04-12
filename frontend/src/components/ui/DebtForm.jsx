import React, { useState } from 'react';
import {
    Box, TextField, Button, Grid, MenuItem,
    Typography, InputAdornment, IconButton, Stack
} from '@mui/material';

import { User, DollarSign, Calendar, FileText, ChevronRight, Hash } from 'lucide-react';
import dayjs from 'dayjs';
import './Forms.scss';

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
        <Box component="form" className="form-container-premium">
            <Stack spacing={3.5}>
                {/* Person */}
                <Box>
                    <Typography className="form-label-premium">Counterparty / Person</Typography>
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
                                    <Box className="form-icon-highlight">
                                        <User size={20} color="#6366f1" />
                                    </Box>
                                </InputAdornment>
                            ),
                            className: "form-input-premium"
                        }}
                    />
                </Box>

                {/* Amount & Direction */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography className="form-label-premium">Amount</Typography>
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
                                className: "form-input-premium"
                            }}
                        />
                    </Box>
                    <Box sx={{ flex: 1.2 }}>
                        <Typography className="form-label-premium">Transaction Type</Typography>
                        <TextField
                            fullWidth
                            select
                            name="direction"
                            value={formData.direction}
                            onChange={handleChange}
                            className="form-input-premium"
                        >
                            <MenuItem value="OWED_TO_ME" sx={{ fontWeight: 800, color: '#10b981' }}>RECEIVABLE (He owes me)</MenuItem>
                            <MenuItem value="I_OWE" sx={{ fontWeight: 800, color: '#ff3b30' }}>LIABILITY (I owe him)</MenuItem>
                        </TextField>
                    </Box>
                </Box>

                {/* Dates */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography className="form-label-premium">Issue Date</Typography>
                        <TextField
                            fullWidth
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="form-input-premium"
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography className="form-label-premium">Payback Target</Typography>
                        <TextField
                            fullWidth
                            name="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="form-input-premium"
                        />
                    </Box>
                </Box>

                {/* Status & Category */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography className="form-label-premium">Status</Typography>
                        <TextField
                            fullWidth
                            select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="form-input-premium"
                        >
                            <MenuItem value="ACTIVE" sx={{ fontWeight: 800 }}>ACTIVE</MenuItem>
                            <MenuItem value="SETTLED" sx={{ fontWeight: 800 }}>SETTLED</MenuItem>
                            <MenuItem value="PARTIAL" sx={{ fontWeight: 800 }}>PARTIAL</MenuItem>
                        </TextField>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography className="form-label-premium">Industry / Tag</Typography>
                        <TextField
                            fullWidth
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="form-input-premium"
                        />
                    </Box>
                </Box>

                {/* Memo */}
                <Box>
                    <Typography className="form-label-premium">Audit Memo / Details</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="form-input-premium"
                    />
                </Box>
            </Stack>

            {/* ACTION SECTION */}
            <Box className="form-actions-row">
                <Button
                    onClick={onCancel}
                    className="btn-dismiss-premium"
                    sx={{ flex: 1 }}
                >
                    ABORT
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    className="btn-submit-premium"
                    sx={{ flex: 1 }}
                >
                    {initialData ? 'SAVE EXPOSURE' : 'COMMIT DEBT'}
                </Button>

            </Box>
        </Box>
    );
}


