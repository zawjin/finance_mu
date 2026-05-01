import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Replace, Trash2, Edit2, AlertCircle, Bookmark, ShieldAlert, Church, MonitorPlay, Activity, Wallet, CalendarDays, ArrowRightCircle, ArrowUpCircle, RotateCcw, ReceiptText, TrendingUp } from 'lucide-react';
import BaseDialog from '../components/ui/BaseDialog';
import { Box, Typography, Button, IconButton, Dialog, Grow, Table, TableBody, TableCell, TableHead, TableRow, Chip, Select, MenuItem, FormControl, Tab, Tabs, TextField, InputAdornment, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';
import './YearlyExpensePage.scss';

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
    const [processing, setProcessing] = useState(false);

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

        setProcessing(true);
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
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleUndoPay = async (item) => {
        if (!item) return;
        setProcessing(true);
        try {
            if (item.frequency === 'MONTHLY') {
                await api.put(`/yearly-expenses/${item._id}`, { ...item, last_paid_period: null });
            } else {
                await api.put(`/yearly-expenses/${item._id}`, { ...item, last_paid_year: null });
            }
            dispatch(fetchFinanceData());
            setUndoConfirmItem(null);
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleTopUp = async () => {
        const amt = parseFloat(topUpAmount);
        if (!amt || amt <= 0) return;
        const fund = investments?.find(i => i.name === 'Nippon india corparate bond');
        if (!fund) return;
        setProcessing(true);
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
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleRemove = async () => {
        if (!deleteConfirmItem) return;
        setProcessing(true);
        try {
            await api.delete(`/yearly-expenses/${deleteConfirmItem._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmItem(null);
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
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

            <Box className="expense-header-flex">

                <div className="expense-tab-system">
                    <Button
                        onClick={() => setActiveTab('YEARLY')}
                        className={`tab-btn ${activeTab === 'YEARLY' ? 'active' : ''}`}
                    >
                        YEARLY RESERVES
                    </Button>
                    <Button
                        onClick={() => setActiveTab('MONTHLY')}
                        className={`tab-btn ${activeTab === 'MONTHLY' ? 'active' : ''}`}
                    >
                        MONTHLY BILLS
                    </Button>
                </div>
            </Box>

            {/* KPI ROW */}
            <div className="expense-kpi-grid">
                {/* YEARLY CARD */}
                <div className="expense-card-luxury yearly-gradient">
                    <div className="bg-icon-watermark"><CalendarDays size={140} /></div>
                    <Typography className="card-caption-premium">YEARLY OBLIGATIONS</Typography>

                    <Box className="card-main-stat-wrap">
                        <Typography className="main-stat-text">
                            {formatCurrency(totalYearlyCost)}
                            <span className="stat-unit-text">/ year</span>
                        </Typography>
                        <div className="expense-card-sip-box">
                            <Typography className="sip-label">MONTHLY SIP</Typography>
                            <Typography className="sip-value">{formatCurrency(monthlyObligation)}<span className="sip-unit">/mo</span></Typography>
                        </div>
                    </Box>

                    <div className="expense-card-stat-group">
                        <Box className="flex-1">
                            <Typography className="stat-mini-label">SETTLED</Typography>
                            <Typography className="stat-mini-value">{formatCurrency(yearlyPaid)}</Typography>
                        </Box>
                        <Box className="stat-divider" />
                        <Box className="flex-1">
                            <Typography className="stat-mini-label">REMAINING</Typography>
                            <Typography className="stat-mini-value">{formatCurrency(yearlyRemaining)}</Typography>
                        </Box>
                        {upcomingYearly.length > 0 && (
                            <>
                                <Box className="stat-divider" />
                                <Box className="flex-1">
                                    <Typography className="stat-mini-label">NEXT DUE</Typography>
                                    <Typography component="div" className="stat-mini-value" sx={{ fontSize: '1rem !important' }}>
                                        {upcomingYearly[0].due_month}
                                        <div style={{ fontSize: '0.6rem', opacity: 0.8, fontWeight: 700, marginTop: '-2px' }}>{upcomingYearly[0].name}</div>
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </div>

                    {/* TOP UP SECTION */}
                    {activeTab === 'YEARLY' && (() => {
                        const fund = investments?.find(i => i.name === 'Nippon india corparate bond');
                        const fundBalance = fund ? parseFloat(fund.value || 0) : 0;
                        const topupNeeded = Math.max(0, yearlyRemaining - fundBalance);

                        return (
                            <Box className="expense-fund-console">
                                <Box className="fund-info-row">
                                    <Box>
                                        <Typography className="fund-mini-label">AVAILABLE FUND</Typography>
                                        <Typography className="fund-mini-value">{formatCurrency(fundBalance)}</Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        onClick={() => setTopUpModal(true)}
                                        className="btn-topup-luxury"
                                    >
                                        TOP UP
                                    </Button>
                                </Box>
                                {topupNeeded > 0 && (
                                    <div className="expense-topup-alert">
                                        <AlertCircle size={14} color="#ff3b30" />
                                        <Typography className="deficiency-text"> Deficiency: {formatCurrency(topupNeeded)} needed </Typography>
                                    </div>
                                )}
                            </Box>
                        );
                    })()}
                </div>

                {/* MONTHLY CARD */}
                <div className="expense-card-luxury monthly-gradient">
                    <div className="bg-icon-watermark"><Activity size={140} /></div>
                    <Typography className="card-caption-premium">MONTHLY OBLIGATIONS</Typography>
                    <Typography className="main-stat-text">
                        {formatCurrency(totalMonthlyCost)}
                        <span className="stat-unit-text">/ month</span>
                    </Typography>

                    <div className="expense-card-stat-group flex-end-margin">
                        <Box className="flex-1">
                            <Typography className="stat-mini-label">SETTLED</Typography>
                            <Typography className="stat-mini-value">{formatCurrency(monthlyPaid)}</Typography>
                        </Box>
                        <Box className="stat-divider" />
                        <Box className="flex-1">
                            <Typography className="stat-mini-label">REMAINING</Typography>
                            <Typography className="stat-mini-value">{formatCurrency(monthlyRemaining)}</Typography>
                        </Box>
                    </div>
                </div>
            </div>

            {/* LIST SECTION */}


            <Box sx={{ p: 2 }} className="list-content-box p-0 ">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="debt-cards-list"
                    >
                        {(activeTab === 'YEARLY' ? yearlyExpensesList : monthlyExpensesList).length === 0 ? (
                            <Box className="empty-state-box">
                                <AlertCircle size={48} className="empty-icon" />
                                <Typography className="empty-text">No {activeTab.toLowerCase()} expenses found.</Typography>
                            </Box>
                        ) : (
                            (activeTab === 'YEARLY' ? yearlyExpensesList : monthlyExpensesList).map(item => {
                                const isPaid = activeTab === 'YEARLY' ? item.last_paid_year === currentYear : item.last_paid_period === currentMonthPeriod;

                                const nipponFund = investments?.find(i => i.name === 'Nippon india corparate bond');
                                const isInsufficient = activeTab === 'YEARLY' && nipponFund && parseFloat(nipponFund.value || 0) < item.amount;
                                const isLocked = activeTab === 'YEARLY' && upcomingYearly.length > 0 && item._id !== upcomingYearly[0]._id;

                                return (
                                    <div key={item._id} className="acct-card-mobile">
                                        <div className="acct-top-row">
                                            <div className="account-icon-box">
                                                {getIconForCategory(item.category)}
                                            </div>
                                            <div className="acct-info">
                                                <span className="account-main-name">{item.name}</span>
                                                <div className="acct-badge-row">
                                                    <span className="account-type-badge">{item.category}</span>
                                                    <span className="due-date-badge due-normal">
                                                        {activeTab === 'YEARLY'
                                                            ? `Next Pay: ${item.due_month} ${currentYear + (item.last_paid_year === currentYear ? 1 : 0)}`
                                                            : `Next Due: ${dayjs().date() <= parseInt(item.due_month)
                                                                ? dayjs().date(parseInt(item.due_month)).format('MMM DD')
                                                                : dayjs().add(1, 'month').date(parseInt(item.due_month)).format('MMM DD')}`
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="acct-balance account-val-stack">
                                                <span className="account-main-val">{formatCurrency(item.amount)}</span>
                                                {isPaid && <span className="account-avail-label" style={{ color: '#10b981' }}>PAID</span>}
                                            </div>
                                        </div>

                                        <div className="acct-action-strip">
                                            <div className="debt-action-label">ACTIONS</div>
                                            <div className="acct-icon-btns">
                                                {isPaid ? (
                                                    <IconButton size="small" onClick={() => setUndoConfirmItem(item)} sx={{ color: '#10b981' }}><RotateCcw size={16} /></IconButton>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        disabled={isInsufficient || isLocked}
                                                        onClick={() => {
                                                            setPayModalItem(item);
                                                            if (activeTab === 'YEARLY' && nipponFund) {
                                                                setPaySourceId(nipponFund._id);
                                                            } else {
                                                                setPaySourceId('');
                                                            }
                                                        }}
                                                        className={`btn-pay-bill-small ${isInsufficient ? 'insufficient' : (isLocked ? 'insufficient' : (activeTab === 'YEARLY' ? 'yearly' : 'monthly'))}`}
                                                    >
                                                        {isLocked ? 'Locked' : (isInsufficient ? 'Low Bal' : 'Pay')}
                                                    </Button>
                                                )}
                                                <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: '#86868b' }}><Edit2 size={16} /></IconButton>
                                                <IconButton size="small" onClick={() => setDeleteConfirmItem(item)} sx={{ color: '#f43f5e' }}><Trash2 size={16} /></IconButton>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </motion.div>
                </AnimatePresence>
            </Box>


            {/* AUDIT LOG */}
            <div className="audit-log-section">
                <Box className="audit-log-header">
                    <ReceiptText size={20} color="#6366f1" />
                    <Typography className="audit-header-text">RECENT SETTLEMENTS</Typography>
                </Box>
                <Table>
                    <TableHead className="audit-table-head">
                        <TableRow>
                            <TableCell className="audit-th-cell cell-pl-4">DATE</TableCell>
                            <TableCell className="audit-th-cell">DESCRIPTION</TableCell>
                            <TableCell className="audit-th-cell text-right cell-pr-4">AMOUNT</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {spending?.filter(s => s.metadata?.is_fixed || s.category === 'Fixed Expense' || s.category === 'Monthly Bill').length === 0 ? (
                            <TableRow><TableCell colSpan={3} className="audit-empty-cell">No recent logs</TableCell></TableRow>
                        ) : (
                            spending?.filter(s => s.metadata?.is_fixed || s.category === 'Fixed Expense' || s.category === 'Monthly Bill').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(log => (
                                <TableRow key={log._id}>
                                    <TableCell className="audit-td-cell cell-pl-4">{dayjs(log.date).format('MMM DD')}</TableCell>
                                    <TableCell className="audit-td-cell">
                                        <Box className="flex-center-gap-1">
                                            {log.description}
                                            <Chip label="FIXED" size="small" className="fixed-chip-nano" />
                                        </Box>
                                        <Typography className="audit-cat-text">{log.category}</Typography>
                                    </TableCell>
                                    <TableCell className="audit-td-amount cell-pr-4">-{formatCurrency(log.amount)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAY DIALOG */}
            <BaseDialog
                open={!!payModalItem}
                onClose={() => setPayModalItem(null)}
                title={activeTab === 'YEARLY' ? 'Authorize Reserve' : 'Pay Monthly Bill'}
                maxWidth="xs"
            >
                {payModalItem && (
                    <Box className="dialog-content-premium">
                        <div className="dialog-icon-wrap wallet-bg">
                            <Wallet size={32} />
                        </div>
                        <Typography className="dialog-desc-text">Deduct <strong>{formatCurrency(payModalItem.amount)}</strong> for {payModalItem.name}?</Typography>

                        <FormControl fullWidth className="dialog-form-control">
                            <Typography className="dialog-field-label">PAY FROM ACCOUNT</Typography>
                            {activeTab === 'YEARLY' ? (() => {
                                const nipponFund = investments?.find(i => i.name === 'Nippon india corparate bond');
                                const bal = nipponFund ? parseFloat(nipponFund.value || 0) : 0;
                                const isInsufficient = bal < payModalItem.amount;

                                return (
                                    <Box className="asset-info-tile">
                                        <Typography className="asset-title-text">📈 {nipponFund?.name || 'Nippon Fund'}</Typography>
                                        <Typography className={`asset-bal-text ${isInsufficient ? 'error' : 'success'}`}>
                                            Available: {formatCurrency(bal)} {isInsufficient && '(Insufficient)'}
                                        </Typography>
                                    </Box>
                                );
                            })() : (
                                <Select value={paySourceId} onChange={e => setPaySourceId(e.target.value)} displayEmpty className="dialog-select-premium">
                                    <MenuItem value="" disabled>Select Source</MenuItem>
                                    {reserves?.map(r => {
                                        const isInsufficient = parseFloat(r.balance || 0) < payModalItem.amount && r.account_type !== 'CREDIT_CARD';
                                        return (
                                            <MenuItem key={r._id} value={r._id} disabled={isInsufficient}>
                                                <Box className="select-item-flex">
                                                    <Typography className="select-item-title">🏦 {r.account_name}</Typography>
                                                    <Typography className={`select-item-bal ${isInsufficient ? 'error' : 'success'}`}>
                                                        {formatCurrency(r.balance || 0)} {isInsufficient && <span className="nano-text">LOW</span>}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                    {investments?.map(i => {
                                        const isInsufficient = parseFloat(i.value || 0) < payModalItem.amount;
                                        return (
                                            <MenuItem key={i._id} value={i._id} disabled={isInsufficient}>
                                                <Box className="select-item-flex">
                                                    <Typography className="select-item-title">📈 {i.name}</Typography>
                                                    <Typography className={`select-item-bal ${isInsufficient ? 'error' : 'success'}`}>
                                                        {formatCurrency(i.value || 0)} {isInsufficient && <span className="nano-text">LOW</span>}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            )}
                        </FormControl>

                        <div className="dialog-action-flex">
                            <Button fullWidth onClick={() => setPayModalItem(null)} disabled={processing} className="btn-abort-pill">CANCEL</Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleConfirmPay}
                                disabled={processing || !paySourceId || (activeTab === 'YEARLY' && (investments?.find(i => i.name === 'Nippon india corparate bond')?.value || 0) < payModalItem.amount)}
                                className={`btn-confirm-pill ${activeTab === 'YEARLY' ? 'yearly' : 'monthly'}`}
                                startIcon={processing ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {processing ? 'AUTHORIZING...' : 'CONFIRM'}
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
                    <Box className="dialog-content-premium">
                        <Typography className="dialog-desc-text">Are you sure you want to stop tracking <strong>{deleteConfirmItem.name}</strong>?</Typography>
                        <div className="dialog-action-flex">
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} disabled={processing} className="btn-abort-pill">CANCEL</Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleRemove}
                                disabled={processing}
                                className="btn-delete-pill"
                                startIcon={processing ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {processing ? 'DELETING...' : 'DELETE'}
                            </Button>
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
                    <Box className="dialog-content-premium">
                        <div className="dialog-icon-wrap undo-bg">
                            <RotateCcw size={32} />
                        </div>
                        <Typography className="dialog-desc-text">Undo recent payment for <strong>{undoConfirmItem.name}</strong>?</Typography>
                        <div className="dialog-action-flex">
                            <Button fullWidth onClick={() => setUndoConfirmItem(null)} disabled={processing} className="btn-abort-pill">KEEP PAID</Button>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleUndoPay(undoConfirmItem)}
                                disabled={processing}
                                className="btn-undo-pill"
                                startIcon={processing ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {processing ? 'UNDOING...' : 'UNDO NOW'}
                            </Button>
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
                <Box className="dialog-content-premium">
                    <div className="dialog-icon-wrap topup-bg">
                        <TrendingUp size={32} />
                    </div>

                    {(() => {
                        const fund = investments?.find(i => i.name === 'Nippon india corparate bond');
                        const fundBalance = fund ? parseFloat(fund.value || 0) : 0;
                        const topupNeeded = Math.max(0, yearlyRemaining - fundBalance);

                        return (
                            <>
                                <Box className="mini-info-card">
                                    <Typography className="mini-info-label">MINIMUM TOP-UP REQUIRED</Typography>
                                    <Typography className={`mini-info-value ${topupNeeded > 0 ? 'error' : 'success'}`}>
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
                                    className="dialog-input-premium"
                                />

                                <div className="dialog-action-flex">
                                    <Button fullWidth onClick={() => setTopUpModal(false)} disabled={processing} className="btn-abort-pill">CANCEL</Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleTopUp}
                                        disabled={processing || !topUpAmount || parseFloat(topUpAmount) <= 0}
                                        className="btn-add-fund-pill"
                                        startIcon={processing ? <CircularProgress size={16} color="inherit" /> : null}
                                    >
                                        {processing ? 'ADDING...' : 'ADD FUNDS'}
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
