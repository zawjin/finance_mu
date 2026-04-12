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
import './ReservePage.scss';

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

    const handleRemoveSpending = async (item) => {
        if (!window.confirm(`Permanently delete transaction: ${item.description}?`)) return;
        try {
            await api.delete(`/spending/${item._id}`);
            dispatch(fetchFinanceData());
        } catch (err) {
            console.error(err);
            alert("Delete failed.");
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

    const handleRemoveDebt = async () => {
        if (!deleteConfirmDebt) return;
        try {
            await api.delete(`/debt/${deleteConfirmDebt._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmDebt(null);
        } catch (err) {
            console.error(err);
        }
    };



    const getTypeStyle = (type) => {
        if (type === 'BANK') return { className: 'type-style-bank', icon: <Landmark size={18} /> };
        if (type === 'WALLET') return { className: 'type-style-wallet', icon: <Wallet size={18} /> };
        return { className: 'type-style-cash', icon: <Banknote size={18} /> };
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
                    <Box className="dialog-content-premium text-center">
                        <Typography className="dialog-desc-text">Remove {deleteConfirmItem.account_name} from tracking?</Typography>
                        <div className="dialog-action-flex">
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} className="btn-abort-pill">ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} className="btn-delete-pill">DELETE</Button>
                        </div>
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
            <div className="tab-group-container">
                {[
                    { id: 'accounts', label: 'Account Ledger', icon: <Activity size={15} /> },
                    { id: 'balance-sheet', label: 'Balance Sheet', icon: <BarChart3 size={15} /> },
                    { id: 'debt-ledger', label: 'Debt Ledger', icon: <Handshake size={15} /> },
                    { id: 'local-investment', label: 'Chit Fund', icon: <Landmark size={15} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-btn-luxury ${activeTab === tab.id ? 'active' : ''}`}
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
                    onDeleteTransaction={handleRemoveSpending}
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
                    <Box className="dialog-purge-wrap">
                        <div className="dialog-purge-icon-box">
                            <Trash2 size={32} />
                        </div>
                        <Typography className="dialog-title-purge">PURGE DEBT LOG</Typography>
                        <div className="dialog-action-flex margin-t-2">
                            <Button fullWidth onClick={() => setDeleteConfirmDebt(null)} className="btn-purge-abort">ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemoveDebt} className="btn-purge-confirm">PROCEED</Button>
                        </div>
                    </Box>
                )}
            </Dialog>

            <Dialog open={!!deleteConfirmLending} onClose={() => setDeleteConfirmLending(null)} TransitionComponent={Grow}>
                {deleteConfirmLending && (
                    <Box className="dialog-purge-wrap">
                        <div className="dialog-purge-icon-box">
                            <Trash2 size={32} />
                        </div>
                        <Typography className="dialog-title-purge">DELETE LENDING RECORD</Typography>
                        <Typography className="dialog-desc-purge">This will permanently remove the record for {deleteConfirmLending.borrower}.</Typography>
                        <div className="dialog-action-flex margin-t-2">
                            <Button fullWidth onClick={() => setDeleteConfirmLending(null)} className="btn-purge-abort">CANCEL</Button>
                            <Button fullWidth variant="contained" onClick={handleRemoveLending} className="btn-purge-confirm">DELETE</Button>
                        </div>
                    </Box>
                )}
            </Dialog>




        </motion.div >
    );
}
