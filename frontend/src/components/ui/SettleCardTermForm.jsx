import React, { useState } from 'react';
import { Box, Button, Typography, TextField, MenuItem, Stack, CircularProgress, InputAdornment } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Banknote, Calendar, CreditCard, ChevronDown, FileText, Tag, Wallet, Landmark } from 'lucide-react';
import './Forms.scss';
import dayjs from 'dayjs';


export default function SettleCardTermForm({ term, requiredAmount, alreadyPaid, reserves, onSubmit, onCancel }) {
    const remaining = requiredAmount - alreadyPaid;
    const [amount, setAmount] = useState(remaining);
    const [loading, setLoading] = useState(false);
    const [sourceId, setSourceId] = useState('');
    const [date, setDate] = useState(dayjs());
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        const sourceAccount = reserves.find(r => r._id === sourceId);
        setLoading(true);
        try {
            await onSubmit({
                term_number: term,
                amount: parseFloat(amount),
                date: date.format('YYYY-MM-DD'),
                source_id: sourceId,
                source_name: sourceAccount?.account_name || 'Direct Pay',
                comment: comment || `Settle Term #${term}`
            });
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" className="form-container-premium">
            {/* TOTAL STAKE BOX - PREMIUM VIBRANT ORANGE */}
            <Box sx={{
                p: 2, bgcolor: '#fffaf5', borderRadius: '18px',
                border: '1px solid #fee2e2', mb: 1
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                    <Box>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', mb: 0.2 }}>
                            TOTAL STAKE REQUIRED
                        </Typography>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
                            ₹{requiredAmount.toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', mb: 0.2 }}>
                            REMAINING
                        </Typography>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>
                            ₹{remaining.toLocaleString()}
                        </Typography>
                    </Box>
                </Stack>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', mt: 1.5 }}>
                    Already Paid: <span style={{ color: '#10b981', fontWeight: 900 }}>₹{alreadyPaid.toLocaleString()}</span>
                </Typography>
            </Box>

            {/* AMOUNT INPUT */}
            <Box>
                <Typography className="form-label-premium">AMOUNT TO PAY NOW</Typography>
                <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="form-input-premium"
                    InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 149, 0, 0.1)', color: '#ff9500' }}><Banknote size={18} /></Box><Typography sx={{ fontWeight: 900, ml: 1, color: '#1d1d1f', fontSize: '1rem' }}>₹</Typography></InputAdornment>
                    }}
                />
            </Box>

            {/* SOURCE SELECT */}
            <Box>
                <Typography className="form-label-premium">DEBIT SOURCE ACCOUNT</Typography>
                <TextField
                    select
                    fullWidth
                    size="small"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    className="form-input-premium"
                    InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}><Landmark size={18} /></Box></InputAdornment>
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
                <Typography className="form-label-premium">PAYMENT DATE</Typography>
                <DatePicker
                    value={date}
                    onChange={(val) => setDate(val)}
                    sx={{ width: '100%' }}
                    slotProps={{
                        textField: {
                            fullWidth: true, size: 'small',
                            inputProps: { readOnly: true },
                            InputProps: {
                                className: "form-input-premium",
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ ml: -0.5 }}>
                                        <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)', color: '#ff2d55' }}>
                                            <Calendar size={18} />
                                        </Box>
                                    </InputAdornment>
                                )
                            }
                        }
                    }}
                />
            </Box>

            {/* COMMENT INPUT */}
            <Box>
                <Typography className="form-label-premium">TRANSACTION NOTE / COMMENT</Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Partial pay for this month"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input-premium"
                    InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}><FileText size={18} /></Box></InputAdornment>
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
            <Box className="form-actions-row">
                <Button
                    onClick={onCancel}
                    className="btn-dismiss-premium"
                >
                    ABORT
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-submit-premium"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {loading ? 'CONFIRMING...' : 'CONFIRM PAY'}
                </Button>
            </Box>
        </Box>
    );
}
