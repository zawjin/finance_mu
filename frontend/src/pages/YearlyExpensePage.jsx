import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Replace, Trash2, Edit2, AlertCircle, Bookmark, ShieldAlert, Church, MonitorPlay, Activity, Wallet, CalendarDays, ArrowRightCircle, ArrowUpCircle, RotateCcw, ReceiptText, TrendingUp } from 'lucide-react';
import BaseDialog from '../components/ui/BaseDialog';
import { Box, Typography, Button, IconButton, Dialog, Grow, Table, TableBody, TableCell, TableHead, TableRow, Chip, Select, MenuItem, FormControl, Tab, Tabs, TextField, InputAdornment } from '@mui/material';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';

export default function YearlyExpensePage({ onEdit }) {
    const dispatch = useDispatch();
    const { yearlyExpenses, investments, reserves, spending } = useSelector(state => state.finance);

    const [activeTab, setActiveTab] = useState('YEARLY'); // 'YEARLY' or 'MONTHLY'

    // UI States
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
    const [undoConfirmItem, setUndoConfirmItem] = useState(null);
    const [payModalItem, setPayModalItem] = useState(null);
    const [topUpModal, setTopUpModal] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [paySourceId, setPaySourceId] = useState('');
    const [payMethod, setPayMethod] = useState('BANK');

    const currentYear = new Date().getFullYear();
    const currentMonthPeriod = dayjs().format('YYYY-MM');

    // YEARLY LOGIC
    const yearlyExpensesList = useMemo(() => {
        return yearlyExpenses?.filter(e => e.status === 'ACTIVE' && (e.frequency === 'YEARLY' || !e.frequency)) || [];
    }, [yearlyExpenses]);

    const totalYearlyCost = useMemo(() => yearlyExpensesList.reduce((s, e) => s + (e.amount || 0), 0), [yearlyExpensesList]);
    const yearlyPaid = useMemo(() => yearlyExpensesList.filter(e => e.last_paid_year === currentYear).reduce((s, e) => s + (e.amount || 0), 0), [yearlyExpensesList, currentYear]);
    const yearlyRemaining = totalYearlyCost - yearlyPaid;
    const monthlyObligation = totalYearlyCost / 12;

    const monthOrder = { 'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5, 'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11 };
    const upcomingYearly = useMemo(() => {
        const currentMonthIndex = new Date().getMonth();
        return yearlyExpensesList.filter(e => e.last_paid_year !== currentYear).sort((a, b) => {
            let aDiff = monthOrder[a.due_month] - currentMonthIndex;
            if (aDiff < 0) aDiff += 12;
            let bDiff = monthOrder[b.due_month] - currentMonthIndex;
            if (bDiff < 0) bDiff += 12;
            return aDiff - bDiff;
        });
    }, [yearlyExpensesList, currentYear]);

    // MONTHLY LOGIC
    const monthlyExpensesList = useMemo(() => {
        return yearlyExpenses?.filter(e => e.status === 'ACTIVE' && e.frequency === 'MONTHLY') || [];
    }, [yearlyExpenses]);

    const totalMonthlyCost = useMemo(() => monthlyExpensesList.reduce((s, e) => s + (e.amount || 0), 0), [monthlyExpensesList]);
    const monthlyPaid = useMemo(() => monthlyExpensesList.filter(e => e.last_paid_period === currentMonthPeriod).reduce((s, e) => s + (e.amount || 0), 0), [monthlyExpensesList, currentMonthPeriod]);
    const monthlyRemaining = totalMonthlyCost - monthlyPaid;

    // COMMON HANDLERS
    const handleConfirmPay = async () => {
        if (!payModalItem || !paySourceId) return;
        const item = payModalItem;
        const fund = investments?.find(i => i._id === paySourceId) || reserves?.find(r => r._id === paySourceId);
        if (!fund) return;

        try {
            // Deduct balance
            if (fund.type) {
                await api.put(`/investments/${fund._id}`, { ...fund, value: Math.max(0, fund.value - item.amount) });
            } else {
                await api.put(`/reserves/${fund._id}`, { ...fund, balance: Math.max(0, fund.balance - item.amount) });
            }

            // Log spending
            const today = new Date().toISOString().split('T')[0];
            await api.post('/spending', {
                date: today,
                amount: item.amount,
                category: item.category, // Use actual category (Insurance, etc)
                sub_category: item.frequency === 'MONTHLY' ? 'Monthly Bill' : 'Fixed Expense', // Keep freq info here
                description: item.name,
                payment_method: payMethod,
                payment_source_id: paySourceId, // Track source correctly
                is_settled: true,
                metadata: { is_fixed: true } // Tag for special UI
            });

            // Update item paid status
            if (item.frequency === 'MONTHLY') {
                await api.put(`/yearly-expenses/${item._id}`, { ...item, last_paid_period: currentMonthPeriod });
            } else {
                await api.put(`/yearly-expenses/${item._id}`, { ...item, last_paid_year: currentYear });
            }

            dispatch(fetchFinanceData());
            setPayModalItem(null);
            setPaySourceId('');
        } catch (err) { console.error(err); }
    };

    const handleUndoPay = async (item) => {
        if (!item) return;
        try {
            if (item.frequency === 'MONTHLY') {
                await api.put(`/yearly-expenses/${item._id}`, { ...item, last_paid_period: null });
            } else {
                await api.put(`/yearly-expenses/${item._id}`, { ...item, last_paid_year: null });
            }
            dispatch(fetchFinanceData());
            setUndoConfirmItem(null);
        } catch (err) { console.error(err); }
    };

    const handleTopUp = async () => {
        const amt = parseFloat(topUpAmount);
        if (!amt || amt <= 0) return;
        const fund = investments?.find(i => i.name === 'Nippon india corparate bond');
        if (!fund) return;
        try {
            await api.put(`/investments/${fund._id}`, { ...fund, value: (parseFloat(fund.value || 0) + amt) });
            
            // Synchronize with Audit Log
            await api.post('/spending', {
                date: new Date().toISOString().split('T')[0],
                amount: amt,
                category: 'Investment',
                sub_category: fund.type || 'Mutual Funds',
                description: `Quick Top-up: ${fund.name}`,
                payment_method: payMethod || 'BANK',
                payment_source_id: paySourceId || null, // Optional source
                is_settled: true,
                metadata: { is_investment: true }
            });

            dispatch(fetchFinanceData());
            setTopUpModal(false);
            setTopUpAmount('');
        } catch (err) { console.error(err); }
    };

    const handleRemove = async () => {
        if (!deleteConfirmItem) return;
        try {
            await api.delete(`/yearly-expenses/${deleteConfirmItem._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmItem(null);
        } catch (err) { console.error(err); }
    };

    const getIconForCategory = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes('insurance')) return <ShieldAlert size={20} color="#3b82f6" />;
        if (cat.includes('rent') || cat.includes('housing')) return <ShieldAlert size={20} color="#0ea5e9" />;
        if (cat.includes('utilit')) return <Activity size={20} color="#10b981" />;
        return <Bookmark size={20} color="#8b5cf6" />;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container-super">

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1d1d1f', letterSpacing: '-0.02em' }}>Fixed Expenses</Typography>
                    <Typography sx={{ color: '#86868b', fontWeight: 700 }}>Consolidated tracking for routine and reserve commitments</Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '14px', p: 0.5, display: 'flex' }}>
                    <Button
                        onClick={() => setActiveTab('YEARLY')}
                        sx={{
                            borderRadius: '12px', px: 3, fontWeight: 900, fontSize: '0.8rem',
                            bgcolor: activeTab === 'YEARLY' ? 'white' : 'transparent',
                            color: activeTab === 'YEARLY' ? '#1d1d1f' : '#86868b',
                            boxShadow: activeTab === 'YEARLY' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                            '&:hover': { bgcolor: activeTab === 'YEARLY' ? 'white' : 'rgba(0,0,0,0.02)' }
                        }}
                    >
                        YEARLY RESERVES
                    </Button>
                    <Button
                        onClick={() => setActiveTab('MONTHLY')}
                        sx={{
                            borderRadius: '12px', px: 3, fontWeight: 900, fontSize: '0.8rem',
                            bgcolor: activeTab === 'MONTHLY' ? 'white' : 'transparent',
                            color: activeTab === 'MONTHLY' ? '#1d1d1f' : '#86868b',
                            boxShadow: activeTab === 'MONTHLY' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                            '&:hover': { bgcolor: activeTab === 'MONTHLY' ? 'white' : 'rgba(0,0,0,0.02)' }
                        }}
                    >
                        MONTHLY BILLS
                    </Button>
                </Box>
            </Box>

            {/* KPI ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* YEARLY CARD */}
                <Box sx={{ p: 3, borderRadius: '24px', background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}><CalendarDays size={140} /></div>
                    <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '0.1em', opacity: 0.8 }}>YEARLY OBLIGATIONS</Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
                            {formatCurrency(totalYearlyCost)}
                            <span style={{ fontSize: '1rem', opacity: 0.6, ml: 1 }}>/ year</span>
                        </Typography>
                        <Box sx={{ textAlign: 'right', p: 1.2, px: 2, borderRadius: '14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>MONTHLY SIP</Typography>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 900 }}>{formatCurrency(monthlyObligation)}<span style={{ fontSize: '0.7rem', opacity: 0.5 }}>/mo</span></Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 1, p: 2, background: 'rgba(255,255,255,0.08)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.7 }}>SETTLED</Typography>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 900 }}>{formatCurrency(yearlyPaid)}</Typography>
                        </Box>
                        <Box sx={{ width: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.7 }}>REMAINING</Typography>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 900 }}>{formatCurrency(yearlyRemaining)}</Typography>
                        </Box>
                    </Box>

                    {/* TOP UP SECTION */}
                    {activeTab === 'YEARLY' && (() => {
                        const fund = investments?.find(i => i.name === 'Nippon india corparate bond');
                        const fundBalance = fund ? parseFloat(fund.value || 0) : 0;
                        const topupNeeded = Math.max(0, yearlyRemaining - fundBalance);
                        
                        return (
                            <Box sx={{ mt: 2, p: 2, background: 'rgba(255,255,255,0.06)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.6 }}>AVAILABLE FUND</Typography>
                                        <Typography sx={{ fontSize: '1rem', fontWeight: 900 }}>{formatCurrency(fundBalance)}</Typography>
                                    </Box>
                                    <Button 
                                        size="small" 
                                        onClick={() => setTopUpModal(true)}
                                        sx={{ borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900, bgcolor: 'white', color: '#4c1d95', px: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                                    >
                                        TOP UP
                                    </Button>
                                </Box>
                                {topupNeeded > 0 && (
                                    <Box sx={{ p: 1, px: 1.5, bgcolor: 'rgba(255,59,48,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AlertCircle size={14} color="#ff3b30" />
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#ff8a84' }}> Deficiency: {formatCurrency(topupNeeded)} needed </Typography>
                                    </Box>
                                )}
                            </Box>
                        );
                    })()}
                </Box>

                {/* MONTHLY CARD */}
                <Box sx={{ p: 3, borderRadius: '24px', background: 'linear-gradient(135deg, #0f172a, #334155)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}><Activity size={140} /></div>
                    <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '0.1em', opacity: 0.8 }}>MONTHLY OBLIGATIONS</Typography>
                    <Typography sx={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
                        {formatCurrency(totalMonthlyCost)}
                        <span style={{ fontSize: '1rem', opacity: 0.6, ml: 1 }}>/ month</span>
                    </Typography>

                    <Box sx={{ mt: 3, p: 2, background: 'rgba(255,255,255,0.08)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.7 }}>SETTLED</Typography>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 900 }}>{formatCurrency(monthlyPaid)}</Typography>
                        </Box>
                        <Box sx={{ width: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.7 }}>REMAINING</Typography>
                            <Typography sx={{ fontSize: '1.1rem', fontWeight: 900 }}>{formatCurrency(monthlyRemaining)}</Typography>
                        </Box>
                    </Box>
                </Box>
            </div>

            {/* LIST SECTION */}
            <Box className="glass-effect" sx={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '1.25rem 2rem', background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 900, color: '#1d1d1f' }}>{activeTab} OBLIGATIONS</Typography>
                    <Chip label={`${activeTab === 'YEARLY' ? yearlyExpensesList.length : monthlyExpensesList.length} ITEMS`} size="small" sx={{ fontWeight: 900, bgcolor: 'rgba(0,0,0,0.05)' }} />
                </div>

                <Box sx={{ p: 2 }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            {(activeTab === 'YEARLY' ? yearlyExpensesList : monthlyExpensesList).length === 0 ? (
                                <Box sx={{ p: 10, textAlign: 'center', opacity: 0.5 }}>
                                    <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: '#86868b' }} />
                                    <Typography sx={{ fontWeight: 800 }}>No {activeTab.toLowerCase()} expenses found.</Typography>
                                </Box>
                            ) : (
                                (activeTab === 'YEARLY' ? yearlyExpensesList : monthlyExpensesList).map(item => {
                                    const isPaid = activeTab === 'YEARLY' ? item.last_paid_year === currentYear : item.last_paid_period === currentMonthPeriod;
                                    return (
                                        <Box
                                            key={item._id}
                                            sx={{
                                                display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 1,
                                                bgcolor: 'white', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.06)',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                            }}
                                        >
                                            <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.03)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                {getIconForCategory(item.category)}
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ fontWeight: 900, color: '#1d1d1f' }}>{item.name}</Typography>
                                                <Typography sx={{ fontSize: '0.75rem', color: '#86868b', fontWeight: 700 }}>
                                                    {item.category} • {activeTab === 'YEARLY' 
                                                        ? `Next Pay: ${item.due_month} ${currentYear + (item.last_paid_year === currentYear ? 1 : 0)}` 
                                                        : `Next Due: ${dayjs().date() <= parseInt(item.due_month) 
                                                            ? dayjs().date(parseInt(item.due_month)).format('MMM DD') 
                                                            : dayjs().add(1, 'month').date(parseInt(item.due_month)).format('MMM DD')}`
                                                    }
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right', mr: 2 }}>
                                                <Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>{formatCurrency(item.amount)}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {isPaid ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(16,185,129,0.1)', borderRadius: '10px', px: 1 }}>
                                                        <Typography sx={{ color: '#10b981', fontWeight: 900, fontSize: '0.7rem', px: 1 }}>PAID</Typography>
                                                        <IconButton size="small" onClick={() => setUndoConfirmItem(item)} sx={{ color: '#10b981' }}><RotateCcw size={14} /></IconButton>
                                                    </Box>
                                                ) : (() => {
                                                    const nipponFund = investments?.find(i => i.name === 'Nippon india corparate bond');
                                                    const isInsufficient = activeTab === 'YEARLY' && nipponFund && parseFloat(nipponFund.value || 0) < item.amount;
                                                    
                                                    return (
                                                        <Button 
                                                            variant="contained" 
                                                            size="small" 
                                                            disabled={isInsufficient}
                                                            onClick={() => { 
                                                                setPayModalItem(item); 
                                                                if(activeTab === 'YEARLY' && nipponFund) {
                                                                    setPaySourceId(nipponFund._id);
                                                                } else {
                                                                    setPaySourceId(''); 
                                                                }
                                                            }} 
                                                            sx={{ 
                                                                borderRadius: '10px', fontWeight: 900, 
                                                                bgcolor: isInsufficient ? 'rgba(0,0,0,0.1) !important' : (activeTab === 'YEARLY' ? '#10b981' : '#0ea5e9'), 
                                                                boxShadow: 'none' 
                                                            }}
                                                        >
                                                            {isInsufficient ? 'LOW BAL' : 'PAY'}
                                                        </Button>
                                                    );
                                                })()}
                                                <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: '#86868b' }}><Edit2 size={16} /></IconButton>
                                                <IconButton size="small" onClick={() => setDeleteConfirmItem(item)} sx={{ color: '#ff3b30' }}><Trash2 size={16} /></IconButton>
                                            </Box>
                                        </Box>
                                    );
                                })
                            )}
                        </motion.div>
                    </AnimatePresence>
                </Box>
            </Box>

            {/* AUDIT LOG */}
            <Box className="glass-effect" sx={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', mt: 4, mb: 10 }}>
                <Box sx={{ p: 2.5, px: 4, bgcolor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <ReceiptText size={20} color="#6366f1" />
                    <Typography sx={{ fontWeight: 900, color: '#1d1d1f' }}>RECENT SETTLEMENTS</Typography>
                </Box>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 900, color: '#86868b', fontSize: '0.7rem', pl: 4 }}>DATE</TableCell>
                            <TableCell sx={{ fontWeight: 900, color: '#86868b', fontSize: '0.7rem' }}>DESCRIPTION</TableCell>
                            <TableCell sx={{ fontWeight: 900, color: '#86868b', fontSize: '0.7rem', textAlign: 'right', pr: 4 }}>AMOUNT</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {spending?.filter(s => s.metadata?.is_fixed || s.category === 'Fixed Expense' || s.category === 'Monthly Bill').length === 0 ? (
                            <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', p: 4, color: '#86868b', fontWeight: 700 }}>No recent logs</TableCell></TableRow>
                        ) : (
                            spending?.filter(s => s.metadata?.is_fixed || s.category === 'Fixed Expense' || s.category === 'Monthly Bill').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(log => (
                                <TableRow key={log._id}>
                                    <TableCell sx={{ fontWeight: 800, pl: 4 }}>{dayjs(log.date).format('MMM DD')}</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {log.description}
                                            <Chip label="FIXED" size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 900, bgcolor: 'rgba(0,0,0,0.05)', color: '#86868b' }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '0.65rem', color: '#86868b', fontWeight: 700 }}>{log.category}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 900, textAlign: 'right', pr: 4, color: '#ff3b30' }}>-{formatCurrency(log.amount)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Box>

            {/* PAY DIALOG */}
            <BaseDialog
                open={!!payModalItem}
                onClose={() => setPayModalItem(null)}
                title={activeTab === 'YEARLY' ? 'Authorize Reserve' : 'Pay Monthly Bill'}
                maxWidth="xs"
            >
                {payModalItem && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
                            <Wallet size={32} />
                        </div>
                        <Typography sx={{ color: '#86868b', mb: 3 }}>Deduct <strong>{formatCurrency(payModalItem.amount)}</strong> for {payModalItem.name}?</Typography>

                        <FormControl fullWidth sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#86868b', mb: 1 }}>PAY FROM ACCOUNT</Typography>
                            {activeTab === 'YEARLY' ? (() => {
                                const nipponFund = investments?.find(i => i.name === 'Nippon india corparate bond');
                                const bal = nipponFund ? parseFloat(nipponFund.value || 0) : 0;
                                const isInsufficient = bal < payModalItem.amount;
                                
                                return (
                                    <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'rgba(0,0,0,0.02)' }}>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>📈 {nipponFund?.name || 'Nippon Fund'}</Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: isInsufficient ? '#ff3b30' : '#10b981', fontWeight: 800 }}>
                                            Available: {formatCurrency(bal)} {isInsufficient && '(Insufficient)'}
                                        </Typography>
                                    </Box>
                                );
                            })() : (
                                <Select value={paySourceId} onChange={e => setPaySourceId(e.target.value)} displayEmpty sx={{ borderRadius: '16px' }}>
                                    <MenuItem value="" disabled>Select Source</MenuItem>
                                    {reserves?.map(r => {
                                        const isInsufficient = parseFloat(r.balance || 0) < payModalItem.amount && r.account_type !== 'CREDIT_CARD';
                                        return (
                                            <MenuItem key={r._id} value={r._id} disabled={isInsufficient}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', opacity: isInsufficient ? 0.5 : 1 }}>
                                                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>🏦 {r.account_name}</Typography>
                                                    <Typography sx={{ color: isInsufficient ? '#ff3b30' : '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                                                        {formatCurrency(r.balance || 0)} {isInsufficient && <span style={{fontSize: '0.6rem'}}>LOW</span>}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                    {investments?.map(i => {
                                        const isInsufficient = parseFloat(i.value || 0) < payModalItem.amount;
                                        return (
                                            <MenuItem key={i._id} value={i._id} disabled={isInsufficient}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', opacity: isInsufficient ? 0.5 : 1 }}>
                                                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>📈 {i.name}</Typography>
                                                    <Typography sx={{ color: isInsufficient ? '#ff3b30' : '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                                                        {formatCurrency(i.value || 0)} {isInsufficient && <span style={{fontSize: '0.6rem'}}>LOW</span>}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormControl>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button fullWidth onClick={() => setPayModalItem(null)} sx={{ borderRadius: '50px', fontWeight: 900, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.05)' }}>CANCEL</Button>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                onClick={handleConfirmPay} 
                                disabled={!paySourceId || (activeTab === 'YEARLY' && (investments?.find(i => i.name === 'Nippon india corparate bond')?.value || 0) < payModalItem.amount)} 
                                sx={{ borderRadius: '50px', fontWeight: 900, bgcolor: activeTab === 'YEARLY' ? '#10b981' : '#0ea5e9' }}
                            >
                                CONFIRM
                            </Button>
                        </div>
                    </Box>
                )}
            </BaseDialog>

            {/* DELETE DIALOG */}
            <BaseDialog
                open={!!deleteConfirmItem}
                onClose={() => setDeleteConfirmItem(null)}
                title={`Remove ${activeTab}`}
                maxWidth="xs"
            >
                {deleteConfirmItem && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography sx={{ color: '#86868b', mb: 3 }}>Are you sure you want to stop tracking <strong>{deleteConfirmItem.name}</strong>?</Typography>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} sx={{ borderRadius: '50px', fontWeight: 900, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.05)' }}>CANCEL</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} sx={{ borderRadius: '50px', fontWeight: 900, bgcolor: '#ff3b30' }}>DELETE</Button>
                        </div>
                    </Box>
                )}
            </BaseDialog>

            {/* UNDO DIALOG */}
            <BaseDialog
                open={!!undoConfirmItem}
                onClose={() => setUndoConfirmItem(null)}
                title="Undo Payment"
                maxWidth="xs"
            >
                {undoConfirmItem && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                         <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,158,11,0.1)', color: '#f59e0b', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
                            <RotateCcw size={32} />
                        </div>
                        <Typography sx={{ color: '#86868b', mb: 3 }}>Undo recent payment for <strong>{undoConfirmItem.name}</strong>?</Typography>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button fullWidth onClick={() => setUndoConfirmItem(null)} sx={{ borderRadius: '50px', fontWeight: 900, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.05)' }}>KEEP PAID</Button>
                            <Button fullWidth variant="contained" onClick={() => handleUndoPay(undoConfirmItem)} sx={{ borderRadius: '50px', fontWeight: 900, bgcolor: '#f59e0b' }}>UNDO NOW</Button>
                        </div>
                    </Box>
                )}
            </BaseDialog>

            {/* TOP UP DIALOG */}
            <BaseDialog
                open={topUpModal}
                onClose={() => setTopUpModal(false)}
                title="Top-Up Nippon Fund"
                maxWidth="xs"
            >
                <Box sx={{ p: 4, textAlign: 'center' }}>
                     <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
                        <TrendingUp size={32} />
                    </div>
                    
                    {(() => {
                        const fund = investments?.find(i => i.name === 'Nippon india corparate bond');
                        const fundBalance = fund ? parseFloat(fund.value || 0) : 0;
                        const topupNeeded = Math.max(0, yearlyRemaining - fundBalance);
                        
                        return (
                            <>
                                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '18px' }}>
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#86868b' }}>MINIMUM TOP-UP REQUIRED</Typography>
                                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: topupNeeded > 0 ? '#ff3b30' : '#10b981' }}>
                                        {formatCurrency(topupNeeded)}
                                    </Typography>
                                </Box>

                                <TextField
                                    fullWidth
                                    label="TOP-UP AMOUNT"
                                    type="number"
                                    value={topUpAmount}
                                    onChange={e => setTopUpAmount(e.target.value)}
                                    autoFocus
                                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                    sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                                />

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Button fullWidth onClick={() => setTopUpModal(false)} sx={{ borderRadius: '50px', fontWeight: 900, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.05)' }}>CANCEL</Button>
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        onClick={handleTopUp} 
                                        disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
                                        sx={{ borderRadius: '50px', fontWeight: 900, bgcolor: '#8b5cf6' }}
                                    >
                                        ADD FUNDS
                                    </Button>
                                </div>
                            </>
                        );
                    })()}
                </Box>
            </BaseDialog>

        </motion.div>
    );
}
