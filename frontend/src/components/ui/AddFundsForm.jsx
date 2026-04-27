import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Stack, Avatar } from '@mui/material';
import { TrendingUp, Plus, Calendar, Tag, FileText, Banknote } from 'lucide-react';
import { InputAdornment } from '@mui/material';
import './Forms.scss';
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
        <Box component="form" onSubmit={handleSubmit} className="form-container-premium">
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52,199,89,0.1)', color: '#34c759', width: 64, height: 64, margin: '0 auto 1rem', borderRadius: '20px' }}>
                    <Plus size={32} />
                </Box>
                <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: '-0.02em' }}>Add Liquidity</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="700">TO: {account.account_name}</Typography>
            </Box>

            <Stack spacing={3}>
                <Box>
                    <Typography className="form-label-premium">INFLOW AMOUNT</Typography>
                    <TextField
                        autoFocus
                        placeholder="0.00"
                        fullWidth
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="form-input-premium"
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}><Banknote size={18} /></Box><Typography sx={{ fontWeight: 900, color: '#1d1d1f', ml: 1, fontSize: '1rem' }}>₹</Typography></InputAdornment>
                        }}
                    />
                </Box>
                
                <Box>
                    <Typography className="form-label-premium">EXECUTION DATE</Typography>
                    <TextField
                        type="date"
                        fullWidth
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="form-input-premium"
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)', color: '#ff2d55' }}><Calendar size={18} /></Box></InputAdornment>
                        }}
                    />
                </Box>

                <Box>
                    <Typography className="form-label-premium">SOURCE / MEMO</Typography>
                    <TextField
                        placeholder="e.g. Salary, Bonus, Cash Deposit..."
                        fullWidth
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="form-input-premium"
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}><FileText size={18} /></Box></InputAdornment>
                        }}
                    />
                </Box>

                <Box className="form-actions-row">
                    <Button onClick={onCancel} className="btn-dismiss-premium">ABORT</Button>
                    <Button type="submit" variant="contained" className="btn-submit-premium">FINALIZED INFLOW</Button>
                </Box>
            </Stack>
        </Box>
    );
}
