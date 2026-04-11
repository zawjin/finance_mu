import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Replace, Trash2, Edit2, AlertCircle, Banknote, Wallet, ArrowRightLeft, History, PieChart, Activity, Briefcase, TrendingUp, TrendingDown, Landmark, Receipt, FileText, BarChart3, Handshake, Calendar, CheckCircle2, ArrowRight, Sigma, Sparkles } from 'lucide-react';
import BaseDialog from '../components/ui/BaseDialog';
import { Box, Typography, Button, IconButton, Dialog, Grow, Stack, TextField, InputAdornment, LinearProgress, Skeleton, Grid } from '@mui/material';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';
import { formatCurrency } from '../utils/formatters';
import dayjs from 'dayjs';

// Micro Components
import ReservesSummaryHeader from '../components/reserve/ReservesSummaryHeader';
import AccountLedgerTab from '../components/reserve/AccountLedgerTab';
import BalanceSheetTab from '../components/reserve/BalanceSheetTab';
import DebtLedgerTab from '../components/reserve/DebtLedgerTab';
import ChitFundTab from '../components/reserve/ChitFundTab';

export default function ReservePage({ onEdit, onEditDebt, onEditLending, onSettle, onRevert, onTransfer, onAddFunds }) {
    const dispatch = useDispatch();
    const { reserves, loading, summary, spending, debt, privateLending } = useSelector(state => state.finance);
    const [deleteConfirmItem, setDeleteConfirmItem] = React.useState(null);
    const [deleteConfirmDebt, setDeleteConfirmDebt] = React.useState(null);
    const [deleteConfirmLending, setDeleteConfirmLending] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('local-investment'); // 'accounts' | 'balance-sheet' | 'debt-ledger' | 'local-investment'

    // Debt State
    const [debtSearch, setDebtSearch] = React.useState('');
    const [debtFilterType, setDebtFilterType] = React.useState('ALL');

    // Balance sheet filter state
    const [bsFilterMonth, setBsFilterMonth] = React.useState('ALL');



    // Lending Settlement State
    const [settlementItem, setSettlementItem] = React.useState(null);
    const [settlementSource, setSettlementSource] = React.useState('');
    const [settlementDate, setSettlementDate] = React.useState(dayjs().format('YYYY-MM-DD'));
    const [settling, setSettling] = React.useState(false);
    const [settlementAmount, setSettlementAmount] = React.useState('');

    React.useEffect(() => {
        if (settlementItem) {

            const remaining = (settlementItem.actualValue || 0) - (settlementItem.settled_amount || 0);
            setSettlementAmount(remaining.toString());
        }
    }, [settlementItem]);


const handleRevertSettlement = async (item) => {
        try {
            // Updated logic: DO NOT DELETE THE LOGS.
            // We only reset the status to ACTIVE to allow for re-settling.
            // This ensures historical entries in the finance logs are preserved for audit.

            await api.put(`/private-lending/${item._id}`, {
                ...item,
                status: 'ACTIVE',
                settled_date: null,
                settled_amount: null,
                settled_interest: null,
                payment_source_id: null,
                linked_spending_id: null,
                linked_investment_id: null
            });

            dispatch(fetchFinanceData());
            setSuccessMsg('Record reverted to Active status. Associated logs have been preserved.');
        } catch (error) {
            console.error('Revert failed:', error);
            alert('Revert operation failed.');
        }
    };




    // ── DEBT LEDGER COMPUTATION ──────────────────────────────────────────────
    const filteredDebt = useMemo(() => {
        if (!debt) return [];
        return debt.filter(item => {
            const matchesSearch = item.person.toLowerCase().includes(debtSearch.toLowerCase()) ||
                item.description?.toLowerCase().includes(debtSearch.toLowerCase());
            const matchesType = debtFilterType === 'ALL' ||
                (debtFilterType === 'RECEIVABLE' && item.direction === 'OWED_TO_ME') ||
                (debtFilterType === 'LIABILITY' && item.direction === 'I_OWE');
            return matchesSearch && matchesType;
        });
    }, [debt, debtSearch, debtFilterType]);

    const debtStats = useMemo(() => {
        let receivables = 0;
        let liabilities = 0;
        let localPrincipals = 0;
        let localValuation = 0;

        filteredDebt.forEach(item => {
            if (item.status === 'SETTLED') return;

            // Check if it's a local investment
            const isLocal = item.category === 'LOCAL_INVESTMENT' || item.category === 'PRIVATE_LENDING' || item.type === 'Chit Fund';

            if (isLocal) {
                const acqDate = dayjs(item.date);
                const today = dayjs();
                const diffYears = (today.valueOf() - acqDate.valueOf()) / (1000 * 60 * 60 * 24 * 365.25);
                const interest = item.amount * 0.065 * Math.max(0, diffYears);
                localPrincipals += item.amount;
                localValuation += (item.amount + interest);
            }

            if (item.direction === 'OWED_TO_ME') receivables += item.amount;
            else liabilities += item.amount;
        });
        return { receivables, liabilities, net: receivables - liabilities, localPrincipals, localValuation };
    }, [filteredDebt]);

    // ────────────────────────────────────────────────────────────────────────

    // ────────────────────────────────────────────────────────────────────────

    // ── PRIVATE LENDING REGISTRY (DB BACKED) ──
    const localInvestments = useMemo(() => {
        // Calculate total weighted principal for ALL items
        const totalWeightedPrincipal = (privateLending || []).reduce((acc, curr) => {
            const p = parseFloat(curr.principal || 0);
            return acc + p;
        }, 0);
        const targetTotalInterest = 32250;

        return (privateLending || []).map(item => {
            const principal = parseFloat(item.principal || 0);
            const effectivePrincipal = principal;

            const acqDate = dayjs(item.start_date);
            const today = dayjs();
            let liveVal = principal;

            const weight = totalWeightedPrincipal > 0 ? (effectivePrincipal / totalWeightedPrincipal) : 0;
            const totalInterest = targetTotalInterest * weight;
            const actualValue = effectivePrincipal;


            if (item.fixed_valuation !== undefined && item.fixed_valuation !== null) {
                liveVal = parseFloat(item.fixed_valuation);
            } else {
                // If partial, base it on what is remaining + interest
                const remainingRaw = actualValue - (item.settled_amount || 0);
                liveVal = remainingRaw + totalInterest;
            }

            if (item.status === 'SETTLED') {
                liveVal = item.settled_amount || actualValue;
            }



            return {
                ...item,
                person: item.borrower,
                amount: effectivePrincipal,
                date: item.start_date,
                fixedInterest: 0,
                dailyInterest: 0,
                accruedInterest: totalInterest,
                currentValue: liveVal,
                actualValue: actualValue,
                profitPct: (totalInterest / (actualValue || principal)) * 100
            };
        });
    }, [privateLending]);



    const sortedInvestments = useMemo(() => {
        return [...localInvestments].sort((a, b) => b._id.localeCompare(a._id));
    }, [localInvestments]);

    const lendingStats = useMemo(() => {
        let principalTotal = 0;
        let activeValuation = 0;
        let totalYield = 0;
        let totalMonthlyInst = 0;

        sortedInvestments.forEach(item => {
            principalTotal += item.actualValue;
            activeValuation += item.currentValue;
            totalYield += item.accruedInterest;
            totalMonthlyInst += (item.actualValue / 13.73);
        });

        return { principalTotal, activeValuation, yield: totalYield, totalMonthlyInst };
    }, [sortedInvestments]);

    // ────────────────────────────────────────────────────────────────────────

    // ── BALANCE SHEET COMPUTATION ────────────────────────────────────────────
    const balanceSheetData = useMemo(() => {
        const monthMap = {};

        // Process all spending transactions
        (spending || []).forEach(s => {
            const m = (s.date || '').slice(0, 7); // YYYY-MM
            if (!m) return;
            if (!monthMap[m]) monthMap[m] = { month: m, debits: 0, credits: 0 };
            monthMap[m].debits += parseFloat(s.amount || 0);
            monthMap[m].credits += parseFloat(s.recovered || 0);
        });

        // Sort months ascending
        const sorted = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

        // Compute running balance (cumulative net)
        let running = 0;
        return sorted.map(row => {
            const net = row.credits - row.debits;
            const opening = running;
            running += net;
            return {
                ...row,
                net,
                opening,
                closing: running,
            };
        });
    }, [spending]);

    // Available months for filter
    const availableMonths = useMemo(() => balanceSheetData.map(r => r.month), [balanceSheetData]);

    const filteredRows = useMemo(() => {
        if (bsFilterMonth === 'ALL') return balanceSheetData;
        return balanceSheetData.filter(r => r.month === bsFilterMonth);
    }, [balanceSheetData, bsFilterMonth]);

    // Totals row
    const bsTotals = useMemo(() => ({
        debits: filteredRows.reduce((s, r) => s + r.debits, 0),
        credits: filteredRows.reduce((s, r) => s + r.credits, 0),
        net: filteredRows.reduce((s, r) => s + r.net, 0),
    }), [filteredRows]);
    // ────────────────────────────────────────────────────────────────────────

    const handleRemove = async () => {
        if (!deleteConfirmItem) return;
        try {
            await api.delete(`/reserves/${deleteConfirmItem._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmItem(null);
        } catch (err) {
            console.error(err);
            alert("Removal failed.");
        }
    };

    const handleRemoveLending = async () => {
        if (!deleteConfirmLending) return;
        try {
            await api.delete(`/private-lending/${deleteConfirmLending._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmLending(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDebtStatusUpdate = async (item, newStatus) => {
        try {
            await api.put(`/debt/${item._id}`, { ...item, status: newStatus });
            dispatch(fetchFinanceData());
        } catch (err) {
            console.error(err);
        }
    };



    const getTypeStyle = (type) => {
        if (type === 'BANK') return { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', icon: <Landmark size={18} color="#6366f1" /> };
        if (type === 'WALLET') return { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: <Wallet size={18} color="#10b981" /> };
        return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: <Banknote size={18} color="#f59e0b" /> };
    };

    const totalBank = reserves ? reserves.filter(r => r.account_type === 'BANK').reduce((s, r) => s + parseFloat(r.balance || 0), 0) : 0;
    const totalCash = reserves ? reserves.filter(r => r.account_type === 'CASH').reduce((s, r) => s + parseFloat(r.balance || 0), 0) : 0;
    const totalWallet = reserves ? reserves.filter(r => r.account_type === 'WALLET').reduce((s, r) => s + parseFloat(r.balance || 0), 0) : 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container-super">


            <BaseDialog
                open={!!deleteConfirmItem}
                onClose={() => setDeleteConfirmItem(null)}
                title="Delete Account?"
                maxWidth="xs"
            >
                {deleteConfirmItem && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography sx={{ color: '#86868b', mb: 3 }}>Remove {deleteConfirmItem.account_name} from tracking?</Typography>
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} sx={{ borderRadius: '50px', bgcolor: '#f1f5f9', color: '#1d1d1f' }}>ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} sx={{ borderRadius: '50px', bgcolor: '#ff3b30' }}>DELETE</Button>
                        </Stack>
                    </Box>
                )}
            </BaseDialog>

            {/* SUMMARY HEADER */}
            <ReservesSummaryHeader
                totalLiquidity={totalBank + totalCash + totalWallet}
                activeTab={activeTab}
                onEdit={onEdit}
                onEditDebt={onEditDebt}
                onEditLending={onEditLending}
                localInvestments={localInvestments}
                onTransfer={onTransfer}
            />

            {/* ── TAB SWITCHER ── */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '6px', borderRadius: '18px', width: 'fit-content' }}>
                {[
                    { id: 'accounts', label: 'Account Ledger', icon: <Activity size={15} /> },
                    { id: 'balance-sheet', label: 'Balance Sheet', icon: <BarChart3 size={15} /> },
                    { id: 'debt-ledger', label: 'Debt Ledger', icon: <Handshake size={15} /> },
                    { id: 'local-investment', label: 'Chit Fund', icon: <Landmark size={15} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.4rem',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 900,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            letterSpacing: '0.03em',
                            transition: 'all 0.2s ease',
                            background: activeTab === tab.id ? '#fff' : 'transparent',
                            color: activeTab === tab.id ? '#1d1d1f' : '#94a3b8',
                            boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ── ACCOUNT LEDGER TAB ── */}
            {activeTab === 'accounts' && (
                <AccountLedgerTab
                    reserves={reserves}
                    loading={loading}
                    spending={spending}
                    totalBank={totalBank}
                    totalCash={totalCash}
                    totalWallet={totalWallet}
                    onEdit={onEdit}
                    onDelete={(item) => setDeleteConfirmItem(item)}
                    onAddFunds={onAddFunds}
                    onPayBill={onTransfer}
                />
            )}

            {/* ── BALANCE SHEET TAB ── */}
            {activeTab === 'balance-sheet' && (
                <BalanceSheetTab
                    filteredRows={filteredRows}
                    bsTotals={bsTotals}
                />
            )}

            {/* ── DEBT LEDGER TAB ── */}
            {activeTab === 'debt-ledger' && (
                <DebtLedgerTab
                    debtSearch={debtSearch}
                    setDebtSearch={setDebtSearch}
                    debtFilterType={debtFilterType}
                    setDebtFilterType={setDebtFilterType}
                    debtStats={debtStats}
                    filteredDebt={filteredDebt}
                    onEditDebt={onEditDebt}
                    onDebtStatusUpdate={handleDebtStatusUpdate}
                    setDeleteConfirmDebt={setDeleteConfirmDebt}
                />
            )}

            {/* ── CHIT FUND TAB ── */}
            {activeTab === 'local-investment' && (
                <ChitFundTab
                    lendingStats={lendingStats}
                    sortedInvestments={sortedInvestments}
                    onEditLending={onEditLending}
                    setDeleteConfirmLending={setDeleteConfirmLending}
                    onSettle={onSettle}
                    onRevert={onRevert}
                />
            )}

            <Dialog open={!!deleteConfirmDebt} onClose={() => setDeleteConfirmDebt(null)} TransitionComponent={Grow}>
                {deleteConfirmDebt && (
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'white', borderRadius: '32px', maxWidth: '440px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
                            <Trash2 size={32} />
                        </div>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>PURGE DEBT LOG</Typography>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <Button fullWidth onClick={() => setDeleteConfirmDebt(null)} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.05)', color: '#1d1d1f' }}>ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemoveDebt} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, bgcolor: '#ff3b30' }}>PROCEED</Button>
                        </div>
                    </Box>
                )}
            </Dialog>

            <Dialog open={!!deleteConfirmLending} onClose={() => setDeleteConfirmLending(null)} TransitionComponent={Grow}>
                {deleteConfirmLending && (
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'white', borderRadius: '32px', maxWidth: '440px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
                            <Trash2 size={32} />
                        </div>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>DELETE LENDING RECORD</Typography>
                        <Typography sx={{ color: '#86868b', fontWeight: 600 }}>This will permanently remove the record for {deleteConfirmLending.borrower}.</Typography>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <Button fullWidth onClick={() => setDeleteConfirmLending(null)} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.05)', color: '#1d1d1f' }}>CANCEL</Button>
                            <Button fullWidth variant="contained" onClick={handleRemoveLending} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, bgcolor: '#ff3b30' }}>DELETE</Button>
                        </div>
                    </Box>
                )}
            </Dialog>




        </motion.div >
    );
}
