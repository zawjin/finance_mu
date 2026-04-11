import React, { useState } from 'react';
import { Box, Button, Typography, TextField, MenuItem, Stack } from '@mui/material';
import { Banknote, Calendar, CreditCard, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';

const inputStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '24px',
        bgcolor: '#ffffff',
        fontWeight: 900,
        fontSize: '1.2rem',
        '& fieldset': { border: '2px solid rgba(0,0,0,0.1)' },
        '&:hover fieldset': { borderColor: '#1d1d1f' },
        '&.Mui-focused fieldset': { borderColor: '#1d1d1f' },
    }
};

const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: 900,
    color: '#1d1d1f',
    letterSpacing: '0.02em',
    mb: 1,
    textTransform: 'uppercase'
};

export default function SettleCardTermForm({ term, requiredAmount, alreadyPaid, reserves, onSubmit, onCancel }) {
    const remaining = requiredAmount - alreadyPaid;
    const [amount, setAmount] = useState(remaining);
    const [sourceId, setSourceId] = useState('');
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        const sourceAccount = reserves.find(r => r._id === sourceId);
        onSubmit({
            term_number: term,
            amount: parseFloat(amount),
            date,
            source_id: sourceId,
            source_name: sourceAccount?.account_name || 'Direct Pay',
            comment: comment || `Settle Term #${term}`
        });
    };

    return (
        <Box sx={{ p: 3, pt: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ textAlign: 'center', mb: 0.5 }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
                    SETTLE LENDING RECORD
                </Typography>
            </Box>

            {/* TOTAL STAKE BOX - PREMIUM VIBRANT ORANGE */}
            <Box sx={{
                p: 2.5, bgcolor: '#fffaf5', borderRadius: '20px',
                border: '1px solid #fee2e2',
                boxShadow: '0 10px 30px rgba(255,153,0,0.05)'
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                    <Box>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', mb: 0.5 }}>
                            TOTAL STAKE REQUIRED
                        </Typography>
                        <Typography sx={{ fontSize: '1.9rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
                            ₹{requiredAmount.toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', mb: 0.5 }}>
                            REMAINING
                        </Typography>
                        <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>
                            ₹{remaining.toLocaleString()}
                        </Typography>
                    </Box>
                </Stack>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', mt: 2 }}>
                    Already Paid: <span style={{ color: '#10b981', fontWeight: 900 }}>₹{alreadyPaid.toLocaleString()}</span>
                </Typography>
            </Box>

            {/* AMOUNT INPUT */}
            <Box>
                <Typography sx={labelStyle}>AMOUNT TO PAY NOW</Typography>
                <TextField
                    fullWidth
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    InputProps={{
                        startAdornment: <Typography sx={{ mr: 1, fontWeight: 900, color: '#86868b', fontSize: '1.1rem' }}>₹</Typography>
                    }}
                    sx={{
                        ...inputStyle,
                        '& .MuiOutlinedInput-root': { ...inputStyle['& .MuiOutlinedInput-root'], borderRadius: '18px', fontSize: '1.1rem' }
                    }}
                />
            </Box>

            {/* SOURCE SELECT */}
            <Box>
                <Typography sx={labelStyle}>DEBIT SOURCE ACCOUNT</Typography>
                <TextField
                    select
                    fullWidth
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    sx={{
                        ...inputStyle,
                        '& .MuiOutlinedInput-root': { ...inputStyle['& .MuiOutlinedInput-root'], borderRadius: '18px', fontSize: '0.95rem' }
                    }}
                    SelectProps={{
                        displayEmpty: true,
                        IconComponent: () => <ChevronDown size={18} style={{ marginRight: 16 }} />
                    }}
                >
                    <MenuItem value="" disabled sx={{ fontWeight: 800 }}>Select Source Account</MenuItem>
                    {reserves.map(r => (
                        <MenuItem key={r._id} value={r._id} sx={{ fontWeight: 800 }}>
                            {r.account_name} (₹{(r.balance || r.current_value || 0).toLocaleString()})
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {/* DATE INPUT */}
            <Box>
                <Typography sx={labelStyle}>PAYMENT DATE</Typography>
                <TextField
                    fullWidth
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    sx={{
                        ...inputStyle,
                        '& .MuiOutlinedInput-root': { ...inputStyle['& .MuiOutlinedInput-root'], borderRadius: '18px', fontSize: '0.95rem' }
                    }}
                    InputProps={{
                        endAdornment: <Calendar size={18} color="#86868b" style={{ marginLeft: 8 }} />
                    }}
                />
            </Box>

            {/* COMMENT INPUT */}
            <Box>
                <Typography sx={labelStyle}>TRANSACTION NOTE / COMMENT</Typography>
                <TextField
                    fullWidth
                    placeholder="e.g. Partial pay for this month"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{
                        ...inputStyle,
                        '& .MuiOutlinedInput-root': { ...inputStyle['& .MuiOutlinedInput-root'], borderRadius: '18px', fontSize: '0.9rem' }
                    }}
                />
            </Box>

            {/* DYNAMIC CONFIRMATION BOX */}
            <Box sx={{
                p: 2, borderRadius: '20px', border: '2px dashed #10b981', bgcolor: '#f0fdf4',
                textAlign: 'center'
            }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#065f46', lineHeight: 1.5 }}>
                    Confirming will settle this term with <br />
                    <span style={{ fontWeight: 900, fontSize: '1rem' }}>₹{parseFloat(amount || 0).toLocaleString()}</span>
                </Typography>
            </Box>

            {/* BUTTONS */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                    fullWidth
                    onClick={onCancel}
                    sx={{
                        py: 1.5, borderRadius: '50px', fontWeight: 900, color: '#1d1d1f',
                        fontSize: '0.85rem',
                        bgcolor: 'rgba(0,0,0,0.06)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' }
                    }}
                >
                    ABORT
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                        py: 1.5, borderRadius: '50px', fontWeight: 900, bgcolor: '#e2e2e2',
                        color: '#a3a3a3', fontSize: '0.85rem',
                        '&:hover': { bgcolor: '#d1d1d1' }
                    }}
                >
                    CONFIRM PAY
                </Button>
            </Box>
        </Box>
    );
}
