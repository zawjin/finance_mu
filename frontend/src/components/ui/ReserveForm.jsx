import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Stack, IconButton, MenuItem, CircularProgress, InputAdornment } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { X, Landmark, Wallet, Banknote, CreditCard, Calendar, Tag, FileText, Activity } from 'lucide-react';
import dayjs from 'dayjs';
import './Forms.scss';


export default function ReserveForm({ onSubmit, onCancel, initialData }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        account_name: '',
        account_type: 'BANK',
        balance: '',
        credit_limit: '0',
        due_date: '',
        last_updated: dayjs(),
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
                last_updated: initialData.last_updated ? dayjs(initialData.last_updated) : dayjs(),
                description: initialData.description || ''
            });
        }
    }, [initialData]);

    const handleSubmit = async () => {
        const nameValid = formData.account_name && formData.account_name.trim() !== '';
        const balanceValid = formData.balance !== '' && formData.balance !== undefined && formData.balance !== null;

        if (!nameValid || !balanceValid) {
            alert("REQUIRED: Please provide both an Account Name and a Balance (0 is allowed).");
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                balance: parseFloat(formData.balance),
                credit_limit: parseFloat(formData.credit_limit) || 0,
                last_updated: formData.last_updated.format('YYYY-MM-DD'),
                due_date: formData.due_date || null
            });
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setLoading(false);
        }
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
            <Stack spacing={1}>
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

                <Box>
                    <Typography className="form-label-premium">ACCOUNT DEFINITION / ALIAS</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. HDFC Salary, PayTM, Vault Cash"
                        value={formData.account_name}
                        onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }}><Activity size={18} /></Box></InputAdornment>
                        }}
                    />
                </Box>

                <Box>
                    <Typography className="form-label-premium">AS OF DATE</Typography>
                    <DatePicker
                        value={formData.last_updated}
                        onChange={(val) => setFormData({ ...formData, last_updated: val })}
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

                <Stack direction="row" spacing={1}>
                    <Box sx={{ flex: 1 }}>
                        <Typography className="form-label-premium">{isCard ? 'OUTSTANDING BALANCE (₹)' : 'LIQUID BALANCE (₹)'}</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            placeholder="0.00"
                            value={formData.balance}
                            onChange={e => setFormData({ ...formData, balance: e.target.value })}
                            className="form-input-premium"
                            InputProps={{
                                startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759', border: '1px solid rgba(52, 199, 89, 0.2)' }}><Banknote size={18} /></Box><Typography sx={{ fontWeight: 900, color: '#1d1d1f', ml: 1, fontSize: '0.9rem' }}>₹</Typography></InputAdornment>
                            }}
                        />
                    </Box>
                    {isCard && (
                        <Box sx={{ flex: 1 }}>
                            <Typography className="form-label-premium">TOTAL CREDIT LIMIT (₹)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                placeholder="0.00"
                                value={formData.credit_limit}
                                onChange={e => setFormData({ ...formData, credit_limit: e.target.value })}
                                className="form-input-premium"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(0, 113, 227, 0.1)', color: '#0071e3', border: '1px solid rgba(0, 113, 227, 0.2)' }}><CreditCard size={18} /></Box><Typography sx={{ fontWeight: 900, color: '#1d1d1f', ml: 1, fontSize: '0.9rem' }}>₹</Typography></InputAdornment>
                                }}
                            />
                        </Box>
                    )}
                </Stack>

                {isCard && (
                    <Box>
                        <Typography className="form-label-premium">BILL PAYMENT DATE (DAY OF MONTH)</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            placeholder="e.g. 4"
                            value={formData.due_date}
                            onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                            className="form-input-premium"
                            InputProps={{
                                startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(255, 149, 0, 0.1)', color: '#ff9500', border: '1px solid rgba(255, 149, 0, 0.2)' }}><Calendar size={18} /></Box></InputAdornment>,
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

                <Box>
                    <Typography className="form-label-premium">NOTES / CONTEXT</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder={isCard ? "E.g., Monthly limit, statement date..." : "E.g., Emergency funds, operating capital..."}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="form-input-premium"
                        InputProps={{
                            startAdornment: <InputAdornment position="start" sx={{ ml: -0.5 }}><Box className="form-icon-vibrant" sx={{ bgcolor: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.2)' }}><FileText size={18} /></Box></InputAdornment>
                        }}
                    />
                </Box>
            </Stack>

            <Box className="form-actions-row">
                <Button onClick={onCancel} className="btn-dismiss-premium">
                    ABORT
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-submit-premium"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                    {loading ? 'Processing...' : 'SUBMIT'}
                </Button>
            </Box>
        </Box>
    );
}
