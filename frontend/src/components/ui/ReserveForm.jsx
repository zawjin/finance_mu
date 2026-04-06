import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Stack, IconButton, MenuItem } from '@mui/material';
import { X, Landmark, Wallet, Banknote, CreditCard, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

const inputStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        bgcolor: 'rgba(0,0,0,0.02)',
        fontWeight: 600,
        fontSize: '0.95rem',
        '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
        '&:hover fieldset': { borderColor: '#6366f1' },
    }
};

const labelStyle = { fontSize: '0.75rem', fontWeight: 900, color: '#86868b', letterSpacing: '0.05em', ml: 1, mb: 1, textTransform: 'uppercase' };

export default function ReserveForm({ onSubmit, onCancel, initialData }) {
    const [formData, setFormData] = useState({
        account_name: '',
        account_type: 'BANK',
        balance: '',
        credit_limit: '0',
        last_updated: dayjs().format('YYYY-MM-DD'),
        description: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                account_name: initialData.account_name || '',
                account_type: initialData.account_type || 'BANK',
                balance: initialData.balance || '',
                credit_limit: initialData.credit_limit || '0',
                last_updated: initialData.last_updated || dayjs().format('YYYY-MM-DD'),
                description: initialData.description || ''
            });
        }
    }, [initialData]);

    const handleSubmit = () => {
        if (!formData.account_name || !formData.balance) return;
        onSubmit({
            ...formData,
            balance: parseFloat(formData.balance),
            credit_limit: parseFloat(formData.credit_limit) || 0
        });
    };

    const getTypeIcon = (t) => {
        if (t === 'BANK') return <Landmark size={20} />;
        if (t === 'WALLET') return <Wallet size={20} />;
        if (t === 'CREDIT_CARD') return <CreditCard size={20} />;
        return <Banknote size={20} />;
    };

    const isCard = formData.account_type === 'CREDIT_CARD';

    return (
        <Box sx={{ p: 4, pt: 2, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <Box>
                <Typography sx={labelStyle}>ACCOUNT / FUNDING SYSTEM</Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1.5}>
                    {['BANK', 'WALLET', 'CASH', 'CREDIT_CARD'].map(type => (
                        <Box
                            key={type}
                            onClick={() => setFormData({ ...formData, account_type: type })}
                            sx={{
                                flex: '1 1 100px', py: 2, px: 1, borderRadius: '18px', textAlign: 'center', cursor: 'pointer',
                                border: '2px solid',
                                borderColor: formData.account_type === type ? '#6366f1' : 'rgba(0,0,0,0.04)',
                                bgcolor: formData.account_type === type ? 'rgba(99,102,241,0.05)' : '#fff',
                                transition: '0.2s', '&:hover': { bgcolor: 'rgba(99,102,241,0.02)' }
                            }}
                        >
                            <Box sx={{ color: formData.account_type === type ? '#6366f1' : '#86868b', mb: 1, display: 'flex', justifyContent: 'center' }}>
                                {getTypeIcon(type)}
                            </Box>
                            <Typography sx={{ fontWeight: 900, fontSize: '0.7rem', color: formData.account_type === type ? '#6366f1' : '#1d1d1f' }}>
                                {type.replace('_', ' ')}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Box>

            <Box>
                <Typography sx={labelStyle}>ACCOUNT DEFINITION / ALIAS</Typography>
                <TextField
                    fullWidth
                    placeholder="e.g. HDFC Salary, PayTM, Vault Cash"
                    value={formData.account_name}
                    onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                    sx={inputStyle}
                />
            </Box>

            <Box>
                <Typography sx={labelStyle}>AS OF DATE</Typography>
                <TextField
                    fullWidth
                    type="date"
                    value={formData.last_updated}
                    onChange={e => setFormData({ ...formData, last_updated: e.target.value })}
                    sx={inputStyle}
                />
            </Box>

            <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                    <Typography sx={labelStyle}>{isCard ? 'OUTSTANDING BALANCE (₹)' : 'LIQUID BALANCE (₹)'}</Typography>
                    <TextField
                        fullWidth
                        type="number"
                        placeholder="0.00"
                        value={formData.balance}
                        onChange={e => setFormData({ ...formData, balance: e.target.value })}
                        sx={inputStyle}
                        InputProps={{
                            startAdornment: <Typography sx={{ fontWeight: 900, color: '#86868b', mr: 1, fontSize: '1.2rem' }}>₹</Typography>
                        }}
                    />
                </Box>
                {isCard && (
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={labelStyle}>CREDIT LIMIT (₹)</Typography>
                        <TextField
                            fullWidth
                            type="number"
                            placeholder="0.00"
                            value={formData.credit_limit}
                            onChange={e => setFormData({ ...formData, credit_limit: e.target.value })}
                            sx={inputStyle}
                            InputProps={{
                                startAdornment: <Typography sx={{ fontWeight: 900, color: '#86868b', mr: 1, fontSize: '1.2rem' }}>₹</Typography>
                            }}
                        />
                    </Box>
                )}
            </Stack>

            <Box>
                <Typography sx={labelStyle}>NOTES / CONTEXT</Typography>
                <TextField
                    fullWidth
                    placeholder={isCard ? "E.g., Monthly limit, statement date..." : "E.g., Emergency funds, operating capital..."}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    sx={inputStyle}
                />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button fullWidth onClick={onCancel} sx={{ py: 2, borderRadius: '50px', fontWeight: 800, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}>
                    ABORT
                </Button>
                <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ py: 2, borderRadius: '50px', fontWeight: 800, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}>
                    {initialData ? 'COMMIT UPDATE' : 'ESTABLISH ACCOUNT'}
                </Button>
            </Box>
        </Box>
    );
}
