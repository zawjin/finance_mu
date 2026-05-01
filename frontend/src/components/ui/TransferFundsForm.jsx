import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Stack, Avatar, CircularProgress, InputAdornment } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ArrowRightLeft, Landmark, Wallet, Banknote, Calendar, Tag, FileText, Smartphone } from 'lucide-react';
import dayjs from 'dayjs';
import './Forms.scss';
import { formatCurrency } from '../../utils/formatters';

export default function TransferFundsForm({ reserves, onSubmit, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [fromId, setFromId] = useState('');
    const [toId, setToId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(dayjs());
    const [description, setDescription] = useState('Account Transfer');

    const fromAccount = reserves.find(r => r._id === fromId);
    const toAccount = reserves.find(r => r._id === toId);

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!fromId || !toId || !amount || parseFloat(amount) <= 0) return;
        setLoading(true);
        try {
            await onSubmit({
                from_id: fromId,
                to_id: toId,
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
                    <Typography className="form-label-premium">SOURCE ACCOUNT</Typography>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        value={fromId}
                        onChange={e => setFromId(e.target.value)}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', border: '1px solid rgba(255, 59, 48, 0.2)' }}><Wallet size={18} /></Box></InputAdornment>
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
                        size="small"
                        value={toId}
                        onChange={e => setToId(e.target.value)}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759', border: '1px solid rgba(52, 199, 89, 0.2)' }}><Landmark size={18} /></Box></InputAdornment>
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

                <Box>
                    <Typography className="form-label-premium">AMOUNT</Typography>
                    <TextField
                        placeholder="0.00"
                        fullWidth
                        size="small"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }}><Banknote size={18} /></Box><Typography sx={{ fontWeight: 900, color: '#1d1d1f', ml: 1, fontSize: '1rem' }}>₹</Typography></InputAdornment>
                        }}
                    />
                </Box>
                <Box>
                    <Typography className="form-label-premium">DATE</Typography>
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
                    <Typography className="form-label-premium">MEMO / DESCRIPTION</Typography>
                    <TextField
                        placeholder="Purpose of transfer..."
                        fullWidth
                        size="small"
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
                        {loading ? 'EXECUTING...' : 'EXECUTE TRANSFER'}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
