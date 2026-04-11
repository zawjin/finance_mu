import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Stack, Avatar } from '@mui/material';
import { ArrowRightLeft, Landmark, Wallet, Banknote } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function TransferFundsForm({ reserves, onSubmit, onCancel }) {
    const [fromId, setFromId] = useState('');
    const [toId, setToId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('Account Transfer');

    const fromAccount = reserves.find(r => r._id === fromId);
    const toAccount = reserves.find(r => r._id === toId);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fromId || !toId || !amount || parseFloat(amount) <= 0) return;
        onSubmit({
            from_id: fromId,
            to_id: toId,
            amount: parseFloat(amount),
            date,
            description
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1', width: 56, height: 56, margin: '0 auto 1rem' }}>
                    <ArrowRightLeft size={32} />
                </Avatar>
                <Typography variant="h5" fontWeight="900">Transfer Funds</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight="700">MOVE LIQUIDITY BETWEEN NODES</Typography>
            </Box>

            <Stack spacing={3}>
                <Box>
                    <Typography variant="overline" sx={{ fontWeight: 900, mb: 1, display: 'block', color: 'text.secondary', letterSpacing: '0.1em' }}>SOURCE ACCOUNT</Typography>
                    <TextField
                        select
                        fullWidth
                        value={fromId}
                        onChange={e => setFromId(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: '14px', fontWeight: 800 } }}
                    >
                        {reserves.map(r => (
                            <MenuItem key={r._id} value={r._id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <span>{r.account_name}</span>
                                    <span style={{ fontWeight: 900, color: '#6366f1', fontSize: '0.75rem' }}>{formatCurrency(r.balance)}</span>
                                </div>
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Box>
                    <Typography variant="overline" sx={{ fontWeight: 900, mb: 1, display: 'block', color: 'text.secondary', letterSpacing: '0.1em' }}>DESTINATION ACCOUNT</Typography>
                    <TextField
                        select
                        fullWidth
                        value={toId}
                        onChange={e => setToId(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: '14px', fontWeight: 800 } }}
                    >
                        {reserves.filter(r => r._id !== fromId).map(r => (
                            <MenuItem key={r._id} value={r._id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <span>{r.account_name}</span>
                                    <span style={{ fontWeight: 900, color: '#34c759', fontSize: '0.75rem' }}>{formatCurrency(r.balance)}</span>
                                </div>
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                        <Typography variant="overline" sx={{ fontWeight: 900, mb: 1, display: 'block', color: 'text.secondary', letterSpacing: '0.1em' }}>TRANSFER AMOUNT</Typography>
                        <TextField
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
                </Box>

                <Box>
                    <Typography variant="overline" sx={{ fontWeight: 900, mb: 1, display: 'block', color: 'text.secondary', letterSpacing: '0.1em' }}>MEMO / DESCRIPTION</Typography>
                    <TextField
                        placeholder="Purpose of transfer..."
                        fullWidth
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: '14px', fontWeight: 800 } }}
                    />
                </Box>

                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                    <Button onClick={onCancel} fullWidth sx={{ py: 1.5, borderRadius: '50px', fontWeight: 900, bgcolor: 'rgba(0,0,0,0.05)', color: '#1d1d1f' }}>ABORT</Button>
                    <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, borderRadius: '50px', fontWeight: 900, bgcolor: '#6366f1', boxShadow: '0 8px 20px rgba(99,102,241,0.2)' }}>EXECUTE TRANSFER</Button>
                </Stack>
            </Stack>
        </Box>
    );
}
