import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Stack, Avatar } from '@mui/material';
import { ArrowRightLeft, Landmark, Wallet, Banknote, Calendar, Tag, FileText, Smartphone } from 'lucide-react';
import { InputAdornment } from '@mui/material';
import './Forms.scss';
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
        <Box component="form" onSubmit={handleSubmit} className="form-container-premium">
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1', width: 64, height: 64, margin: '0 auto 1rem', borderRadius: '20px' }}>
                    <ArrowRightLeft size={32} />
                </Box>
                <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: '-0.02em' }}>Transfer Funds</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="700">MOVE LIQUIDITY BETWEEN NODES</Typography>
            </Box>

            <Stack spacing={3}>
                <Box>
                    <Typography className="form-label-premium">SOURCE ACCOUNT</Typography>
                    <TextField
                        select
                        fullWidth
                        value={fromId}
                        onChange={e => setFromId(e.target.value)}
                        className="form-input-premium"
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30' }}><Wallet size={18} /></Box></InputAdornment>
                        }}
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
                    <Typography className="form-label-premium">DESTINATION ACCOUNT</Typography>
                    <TextField
                        select
                        fullWidth
                        value={toId}
                        onChange={e => setToId(e.target.value)}
                        className="form-input-premium"
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}><Landmark size={18} /></Box></InputAdornment>
                        }}
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
                        <Typography className="form-label-premium">AMOUNT</Typography>
                        <TextField
                            placeholder="0.00"
                            fullWidth
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="form-input-premium"
                            InputProps={{ 
                                startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><Banknote size={18} /></Box><Typography sx={{ fontWeight: 900, color: '#1d1d1f', ml: 1, fontSize: '1rem' }}>₹</Typography></InputAdornment>
                            }}
                        />
                    </Box>
                    <Box>
                        <Typography className="form-label-premium">DATE</Typography>
                        <TextField
                            type="date"
                            fullWidth
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="form-input-premium"
                            InputProps={{ 
                                startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)', color: '#ff2d55' }}><Calendar size={18} /></Box></InputAdornment>
                            }}
                        />
                    </Box>
                </Box>

                <Box>
                    <Typography className="form-label-premium">MEMO / DESCRIPTION</Typography>
                    <TextField
                        placeholder="Purpose of transfer..."
                        fullWidth
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="form-input-premium"
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}><FileText size={18} /></Box></InputAdornment>
                        }}
                    />
                </Box>

                <Box className="form-actions-row">
                    <Button onClick={onCancel} className="btn-dismiss-premium">ABORT</Button>
                    <Button type="submit" variant="contained" className="btn-submit-premium">EXECUTE TRANSFER</Button>
                </Box>
            </Stack>
        </Box>
    );
}
