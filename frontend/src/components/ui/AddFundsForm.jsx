import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Stack, Avatar } from '@mui/material';
import { TrendingUp, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function AddFundsForm({ account, onSubmit, onCancel }) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState(`Liquidity Injection: ${account.account_name}`);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;
        onSubmit({
            account_id: account._id,
            amount: parseFloat(amount),
            date,
            description
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'rgba(52,199,89,0.1)', color: '#34c759', width: 56, height: 56, margin: '0 auto 1rem' }}>
                    <Plus size={32} />
                </Avatar>
                <Typography variant="h5" fontWeight="900">Add Liquidity</Typography>
                <Typography variant="body1" color="text.secondary" fontWeight="700">TO: {account.account_name}</Typography>
            </Box>

            <Stack spacing={3}>
                <Box>
                    <Typography variant="overline" sx={{ fontWeight: 900, mb: 1, display: 'block', color: 'text.secondary', letterSpacing: '0.1em' }}>INFLOW AMOUNT</Typography>
                    <TextField
                        autoFocus
                        placeholder="0.00"
                        fullWidth
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: '14px', fontWeight: 900, fontSize: '1.1rem' } }}
                    />
                </Box>
                
                <Box>
                    <Typography variant="overline" sx={{ fontWeight: 900, mb: 1, display: 'block', color: 'text.secondary', letterSpacing: '0.1em' }}>EXECUTION DATE</Typography>
                    <TextField
                        type="date"
                        fullWidth
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: '14px', fontWeight: 800 } }}
                    />
                </Box>

                <Box>
                    <Typography variant="overline" sx={{ fontWeight: 900, mb: 1, display: 'block', color: 'text.secondary', letterSpacing: '0.1em' }}>SOURCE / MEMO</Typography>
                    <TextField
                        placeholder="e.g. Salary, Bonus, Cash Deposit..."
                        fullWidth
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: '14px', fontWeight: 800 } }}
                    />
                </Box>

                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                    <Button onClick={onCancel} fullWidth sx={{ py: 1.5, borderRadius: '50px', fontWeight: 900, bgcolor: 'rgba(0,0,0,0.05)', color: '#1d1d1f' }}>ABORT</Button>
                    <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, borderRadius: '50px', fontWeight: 900, bgcolor: '#34c759', boxShadow: '0 8px 20px rgba(52,199,89,0.2)' }}>FINALIZED INFLOW</Button>
                </Stack>
            </Stack>
        </Box>
    );
}
