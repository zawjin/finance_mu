import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Stack, Avatar, CircularProgress, InputAdornment } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { TrendingUp, Plus, Calendar, Tag, FileText, Banknote } from 'lucide-react';
import dayjs from 'dayjs';
import './Forms.scss';
import { formatCurrency } from '../../utils/formatters';

export default function AddFundsForm({ account, onSubmit, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(dayjs());
    const [description, setDescription] = useState(`Liquidity Injection: ${account.account_name}`);

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;
        setLoading(true);
        try {
            await onSubmit({
                account_id: account._id,
                amount: parseFloat(amount),
                date: date.format('YYYY-MM-DD'),
                description
            });
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} className="form-container-premium">


            <Stack spacing={1}>
                <Box>
                    <Typography className="form-label-premium">INFLOW AMOUNT</Typography>
                    <TextField
                        autoFocus
                        size="small"
                        placeholder="0.00"
                        fullWidth
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759', border: '1px solid rgba(52, 199, 89, 0.2)' }}><Banknote size={18} /></Box><Typography sx={{ fontWeight: 900, color: '#1d1d1f', ml: 1, fontSize: '1rem' }}>₹</Typography></InputAdornment>
                        }}
                    />
                </Box>

                <Box>
                    <Typography className="form-label-premium">EXECUTION DATE</Typography>
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
                                            <Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 45, 85, 0.1)', color: '#ff2d55', border: '1px solid rgba(255, 45, 85, 0.2)' }}>
                                                <Calendar size={18} />
                                            </Box>
                                        </InputAdornment>
                                    )
                                }
                            }
                        }}
                    />
                </Box>

                <Box>
                    <Typography className="form-label-premium">SOURCE / MEMO</Typography>
                    <TextField
                        size="small"
                        placeholder="e.g. Salary, Bonus, Cash Deposit..."
                        fullWidth
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)' }}><FileText size={18} /></Box></InputAdornment>
                        }}
                    />
                </Box>

                <Box className="form-actions-row">
                    <Button onClick={onCancel} className="btn-dismiss-premium">ABORT</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        className="btn-submit-premium"
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {loading ? 'PROCESSING...' : 'FINALIZED INFLOW'}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
