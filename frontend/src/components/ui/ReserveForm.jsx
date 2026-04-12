import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Stack, IconButton, MenuItem } from '@mui/material';
import { X, Landmark, Wallet, Banknote, CreditCard, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import './Forms.scss';


export default function ReserveForm({ onSubmit, onCancel, initialData }) {
    const [formData, setFormData] = useState({
        account_name: '',
        account_type: 'BANK',
        balance: '',
        credit_limit: '0',
        due_date: '',
        last_updated: dayjs().format('YYYY-MM-DD'),
        description: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                account_name: initialData.account_name || '',
                account_type: initialData.account_type || 'BANK',
                balance: (initialData.balance !== undefined && initialData.balance !== null) ? initialData.balance : '',
                credit_limit: initialData.credit_limit || '0',
                due_date: initialData.due_date || '',
                last_updated: initialData.last_updated || dayjs().format('YYYY-MM-DD'),
                description: initialData.description || ''
            });
        }
    }, [initialData]);

    const handleSubmit = () => {
        const nameValid = formData.account_name && formData.account_name.trim() !== '';
        const balanceValid = formData.balance !== '' && formData.balance !== undefined && formData.balance !== null;

        if (!nameValid || !balanceValid) {
            alert("REQUIRED: Please provide both an Account Name and a Balance (0 is allowed).");
            return;
        }

        onSubmit({
            ...formData,
            balance: parseFloat(formData.balance),
            credit_limit: parseFloat(formData.credit_limit) || 0,
            due_date: formData.due_date || null
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
        <Box className="form-container-premium">
            <Box>
                <Typography className="form-label-premium">ACCOUNT / FUNDING SYSTEM</Typography>
                <Box className="acc-type-pill-group">
                    {['BANK', 'WALLET', 'CASH', 'CREDIT_CARD'].map(type => (
                        <Box
                            key={type}
                            onClick={() => setFormData({ ...formData, account_type: type })}
                            className={`acc-type-pill ${formData.account_type === type ? 'active' : ''}`}
                        >
                            <Box className="pill-icon-wrap">
                                {getTypeIcon(type)}
                            </Box>
                            <Typography className="pill-label-text">
                                {type.replace('_', ' ')}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box className="margin-v-lg">
                <Typography className="form-label-premium">ACCOUNT DEFINITION / ALIAS</Typography>
                <TextField
                    fullWidth
                    placeholder="e.g. HDFC Salary, PayTM, Vault Cash"
                    value={formData.account_name}
                    onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                    className="form-input-premium"
                />
            </Box>

            <Box className="margin-v-lg">
                <Typography className="form-label-premium">AS OF DATE</Typography>
                <TextField
                    fullWidth
                    type="date"
                    value={formData.last_updated}
                    onChange={e => setFormData({ ...formData, last_updated: e.target.value })}
                    className="form-input-premium"
                />
            </Box>

            <Stack direction="row" spacing={2} className="margin-v-lg">
                <Box sx={{ flex: 1 }}>
                    <Typography className="form-label-premium">{isCard ? 'OUTSTANDING BALANCE (₹)' : 'LIQUID BALANCE (₹)'}</Typography>
                    <TextField
                        fullWidth
                        type="number"
                        placeholder="0.00"
                        value={formData.balance}
                        onChange={e => setFormData({ ...formData, balance: e.target.value })}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: <Typography sx={{ fontWeight: 900, color: '#86868b', mr: 1, fontSize: '1.2rem' }}>₹</Typography>
                        }}
                    />
                </Box>
                {isCard && (
                    <Box sx={{ flex: 1 }}>
                        <Typography className="form-label-premium">TOTAL CREDIT LIMIT (₹)</Typography>
                        <TextField
                            fullWidth
                            type="number"
                            placeholder="0.00"
                            value={formData.credit_limit}
                            onChange={e => setFormData({ ...formData, credit_limit: e.target.value })}
                            className="form-input-premium"
                            InputProps={{
                                startAdornment: <Typography sx={{ fontWeight: 900, color: '#86868b', mr: 1, fontSize: '1.2rem' }}>₹</Typography>
                            }}
                        />
                    </Box>
                )}
            </Stack>

            {isCard && (
                <Box className="margin-v-lg">
                    <Typography className="form-label-premium">BILL PAYMENT DATE (DAY OF MONTH)</Typography>
                    <TextField
                        fullWidth
                        type="number"
                        placeholder="e.g. 4"
                        value={formData.due_date}
                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                        className="form-input-premium"
                        InputProps={{
                            inputProps: { min: 1, max: 31 },
                            endAdornment: formData.due_date && (
                                <Typography sx={{ fontWeight: 800, color: '#6366f1', fontSize: '0.8rem', whiteSpace: 'nowrap', pr: 1 }}>
                                    {(() => {
                                        const d = parseInt(formData.due_date);
                                        if (d > 3 && d < 21) return 'th';
                                        switch (d % 10) {
                                            case 1: return "st";
                                            case 2: return "nd";
                                            case 3: return "rd";
                                            default: return "th";
                                        }
                                    })()} OF EVERY MONTH
                                </Typography>
                            )
                        }}
                    />
                </Box>
            )}

            <Box className="margin-v-lg">
                <Typography className="form-label-premium">NOTES / CONTEXT</Typography>
                <TextField
                    fullWidth
                    placeholder={isCard ? "E.g., Monthly limit, statement date..." : "E.g., Emergency funds, operating capital..."}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="form-input-premium"
                />
            </Box>

            <Box className="form-actions-row">
                <Button fullWidth onClick={onCancel} className="btn-form-abort">
                    ABORT
                </Button>
                <Button fullWidth variant="contained" onClick={handleSubmit} className="btn-form-submit">
                    SUBMIT
                </Button>
            </Box>
        </Box>
    );
}
