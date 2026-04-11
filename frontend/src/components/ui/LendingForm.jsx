import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Stack, MenuItem, InputAdornment, Grid } from '@mui/material';
import { User, Banknote, Calendar, Target, CheckCircle2, XCircle } from 'lucide-react';
import dayjs from 'dayjs';

const inputStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        bgcolor: 'rgba(0,0,0,0.02)',
        fontWeight: 600,
        fontSize: '0.95rem',
        '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
        '&:hover fieldset': { borderColor: '#1d1d1f' },
        '&.Mui-focused fieldset': { borderColor: '#1d1d1f' },
    }
};

const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 900,
    color: '#86868b',
    letterSpacing: '0.05em',
    ml: 1,
    mb: 1,
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: 1
};

export default function LendingForm({ onSubmit, initialData, onCancel }) {
    const [formData, setFormData] = useState({
        borrower: '',
        plan: '5L',
        start_date: dayjs().format('YYYY-MM-DD'),
        status: 'ACTIVE',
        interest_rate: 0.065
    });

    useEffect(() => {
        if (initialData && initialData._id) {
            // Detect plan from principal if possible
            let detectedPlan = '5L';
            if (initialData.principal === 100000) detectedPlan = '1L';
            else if (initialData.principal === 1000000) detectedPlan = '10L';
            else if (initialData.principal === 1500000) detectedPlan = '15L';

            setFormData({
                borrower: initialData.borrower || '',
                plan: detectedPlan,
                start_date: initialData.start_date || dayjs().format('YYYY-MM-DD'),
                status: initialData.status || 'ACTIVE',
                interest_rate: initialData.interest_rate || 0.065
            });
        }
    }, [initialData]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        let numericPrincipal = 500000;
        if (formData.plan === '1L') numericPrincipal = 100000;
        else if (formData.plan === '10L') numericPrincipal = 1000000;
        else if (formData.plan === '15L') numericPrincipal = 1500000;

        const submissionData = {
            ...formData,
            principal: numericPrincipal
        };

        if (initialData && initialData._id) {
            submissionData._id = initialData._id;
        }

        onSubmit(submissionData);
    };

    const termOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

    return (
        <Box sx={{ p: 4, pt: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* IDENTIFIER / NAME */}
            <Box>
                <Typography sx={labelStyle}><User size={14} /> IDENTIFIER / NAME</Typography>
                <TextField
                    fullWidth
                    placeholder="e.g. Term 1, Investment A"
                    value={formData.borrower}
                    onChange={e => handleChange('borrower', e.target.value)}
                    sx={inputStyle}
                />
            </Box>

            {/* INVESTMENT PLAN */}
            <Box>
                <Typography sx={labelStyle}><Target size={14} /> INVESTMENT PLAN</Typography>
                <TextField
                    select
                    fullWidth
                    value={formData.plan}
                    onChange={e => handleChange('plan', e.target.value)}
                    sx={inputStyle}
                >
                    <MenuItem value="1L" sx={{ fontWeight: 800 }}>1L (₹1,00,000 VALUE)</MenuItem>
                    <MenuItem value="5L" sx={{ fontWeight: 800 }}>5L (₹5,00,000 VALUE)</MenuItem>
                    <MenuItem value="10L" sx={{ fontWeight: 800 }}>10L (₹10,00,000 VALUE)</MenuItem>
                    <MenuItem value="15L" sx={{ fontWeight: 800 }}>15L (₹15,00,000 VALUE)</MenuItem>
                </TextField>
            </Box>

            {/* START DATE */}
            <Box>
                <Typography sx={labelStyle}><Calendar size={14} /> START DATE</Typography>
                <TextField
                    fullWidth
                    type="date"
                    value={formData.start_date}
                    onChange={e => handleChange('start_date', e.target.value)}
                    sx={inputStyle}
                />
            </Box>

            {/* ACTIONS */}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                    fullWidth
                    onClick={onCancel}
                    sx={{
                        py: 2, borderRadius: '50px', fontWeight: 900, fontSize: '0.9rem', color: '#1d1d1f',
                        bgcolor: '#f2f2f2', '&:hover': { bgcolor: '#e5e5e5' }
                    }}
                >
                    ABORT
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                        py: 2, borderRadius: '50px', fontWeight: 900, fontSize: '0.9rem', bgcolor: '#1d1d1f',
                        color: '#fff', '&:hover': { bgcolor: '#000' }
                    }}
                >
                    {initialData?._id ? 'COMMIT UPDATE' : 'COMMIT LOG'}
                </Button>
            </Box>
        </Box>
    );
}

