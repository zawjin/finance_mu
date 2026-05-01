import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFinanceData } from './store/financeSlice';
import api from './utils/api';
import {
    ThemeProvider, createTheme, CssBaseline,
    Dialog, DialogTitle, DialogContent,
    Typography, IconButton, Grow, Box, Chip, Button
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { X, CalendarDays, Repeat, Activity } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.scss';
import TopNavbar from './components/layout/TopNavbar';
import OverviewPage from './pages/OverviewPage';
import SpendingPage from './pages/SpendingPage';
import InvestmentPage from './pages/InvestmentPage';
import YearlyExpensePage from './pages/YearlyExpensePage';
import CategoryPage from './pages/CategoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SiteSettingsPage from './pages/SiteSettingsPage';
import SalaryCalcPage from './pages/SalaryCalcPage';
import HealthPage from './pages/HealthPage';
import ReservePage from './pages/ReservePage';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/UserManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';
import DatabaseHealthPage from './pages/DatabaseHealthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { fetchCurrentUser } from './store/authSlice';
import BaseDialog from './components/ui/BaseDialog';
import ExpenseForm from './components/ui/ExpenseForm';
import InvestmentForm from './components/ui/InvestmentForm';
import DebtForm from './components/ui/DebtForm';
import YearlyExpenseForm from './components/ui/YearlyExpenseForm';
import MonthlyBillForm from './components/ui/MonthlyBillForm';
import ReserveForm from './components/ui/ReserveForm';
import LendingForm from './components/ui/LendingForm';
import SettleCardTermForm from './components/ui/SettleCardTermForm';
import TransferFundsForm from './components/ui/TransferFundsForm';
import AddFundsForm from './components/ui/AddFundsForm';
import AiAnalysisModal from './components/ui/AiAnalysisModal';
import Loader from './components/ui/Loader';

const appleTheme = createTheme({
    typography: {
        fontFamily: 'Outfit, sans-serif',
        h1: { fontWeight: 900, letterSpacing: '-0.05em' },
        h2: { fontWeight: 900, letterSpacing: '-0.04em' },
        h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    },
    palette: {
        primary: { main: '#1d1d1f' },
        secondary: { main: '#0071e3' },
        background: { default: '#f0f2f5', paper: '#ffffff' }
    },
    shape: { borderRadius: 24 },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: 14,
                    padding: '10px 24px'
                }
            }
        }
    }
});

export default function App() {
    const dispatch = useDispatch();
    const { categories, assetClasses, reserves } = useSelector(state => state.finance);

    const [editingItem, setEditingItem] = useState(null);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [editingDebt, setEditingDebt] = useState(null);
    const [editingLending, setEditingLending] = useState(null);
    const [editingReserve, setEditingReserve] = useState(null);
    const [editingYearly, setEditingYearly] = useState(null);
    const [settlingTerm, setSettlingTerm] = useState(null);
    const [addingFrequency, setAddingFrequency] = useState('YEARLY');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
    const [showAddDebtModal, setShowAddDebtModal] = useState(false);
    const [showAddLendingModal, setShowAddLendingModal] = useState(false);
    const [showAddReserveModal, setShowAddReserveModal] = useState(false);
    const [addingFundsTo, setAddingFundsTo] = useState(null);
    const [showAddYearlyModal, setShowAddYearlyModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [reserveActiveTab, setReserveActiveTab] = useState('accounts');

    const { user, token } = useSelector(state => state.auth);

    useEffect(() => {
        if (token) {
            dispatch(fetchCurrentUser());
        }
        dispatch(fetchFinanceData());
    }, [dispatch, token]);

    const handleExpenseSubmit = async (data) => {
        try {
            if (editingItem) {
                await api.put(`/spending/${editingItem._id}`, data);
            } else {
                await api.post('/spending', data);
            }
            dispatch(fetchFinanceData());
            setEditingItem(null);
            setShowAddModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInvestmentSubmit = async (data) => {
        try {
            if (editingInvestment) {
                await api.put(`/investments/${editingInvestment._id}`, data);
            } else {
                await api.post('/investments', data);
            }

            dispatch(fetchFinanceData());
            setEditingInvestment(null);
            setShowAddInvestmentModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDebtSubmit = async (data) => {
        try {
            if (editingDebt && editingDebt._id) {
                await api.put(`/debt/${editingDebt._id}`, data);
            } else {
                await api.post('/debt', data);
            }
            dispatch(fetchFinanceData());
            setEditingDebt(null);
            setShowAddDebtModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLendingSubmit = async (data) => {
        try {
            if (editingLending && editingLending._id) {
                await api.put(`/private-lending/${editingLending._id}`, data);
            } else {
                await api.post('/private-lending', data);
            }


            dispatch(fetchFinanceData());
            setEditingLending(null);
            setShowAddLendingModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReserveSubmit = async (data) => {
        try {
            if (editingReserve && editingReserve._id) {
                await api.put(`/reserves/${editingReserve._id}`, data);
            } else {
                await api.post('/reserves', data);
            }
            dispatch(fetchFinanceData());
            setEditingReserve(null);
            setShowAddReserveModal(false);
        } catch (err) {
            console.error(err);
            alert("Submission failed. Cloud link unstable.");
        }
    };


    const handleAddFundsSubmit = async (data) => {
        try {
            const acc = reserves.find(r => r._id === data.account_id);
            // Log as Inflow (Negative amount in spending signifies inflow)
            // The backend auto-reconciles: for non-card source, balance += -amount.
            // Since amount is negative, balance += abs(amount).
            await api.post('/spending', {
                date: data.date,
                amount: -Math.abs(data.amount),
                category: 'Inflow',
                sub_category: 'Direct Deposit',
                description: data.description,
                payment_method: acc.account_type,
                payment_source_id: acc._id,
                is_settled: true
            });
            dispatch(fetchFinanceData());
            setAddingFundsTo(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTransferSubmit = async (data) => {
        try {
            const fromAcc = reserves.find(r => r._id === data.from_id);
            const toAcc = reserves.find(r => r._id === data.to_id);

            // Create Audit Log (Spending) - Backend handles the reserve adjustments
            await api.post('/spending', {
                date: data.date,
                amount: data.amount,
                category: 'Transfer',
                sub_category: 'Internal',
                description: data.description || `Transfer from ${fromAcc.account_name} to ${toAcc.account_name}`,
                payment_method: fromAcc.account_type,
                payment_source_id: fromAcc._id,
                target_account_id: toAcc._id,
                is_settled: true
            });

            dispatch(fetchFinanceData());
            setShowTransferModal(false);
        } catch (err) {
            console.error("Transfer failed:", err);
        }
    };

    const handleTermSettle = async (paymentData) => {
        try {
            const { card, type } = settlingTerm;
            const endpoint = type === 'LENDING' ? '/private-lending' : '/cards';
            const logCategory = type === 'LENDING' ? 'Investment Settlement' : 'Credit Bill';
            const instrumentName = type === 'LENDING' ? card.borrower : card.account_name;

            // 1. Update the record with new payment
            const updatedPayments = [...(card.payments || []), paymentData];
            await api.put(`${endpoint}/${card._id}`, { ...card, payments: updatedPayments });

            // 2. Create a Spending Log entry - Backend handles Reserve deduction
            await api.post('/spending', {
                date: paymentData.date,
                amount: paymentData.amount,
                category: 'Investment',
                sub_category: 'Chit fund',
                description: `Settle Term #${paymentData.term_number} for ${instrumentName}`,
                payment_method: 'BANK',
                payment_source_id: paymentData.source_id,
                is_settled: true
            });

            // 3. Create an Investment Portfolio entry
            await api.post('/investments', {
                type: 'Chit Fund',
                name: 'Chit fund',
                value: paymentData.amount,
                date: paymentData.date,
                details: `Term #${paymentData.term_number} settlement for ${instrumentName}`,
                sub_category: instrumentName,
                withdrawals: [],
                payment_method: 'BANK',
                payment_source_id: paymentData.source_id
            });

            dispatch(fetchFinanceData());
            setSettlingTerm(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTermRevert = async (lending, termNumber) => {
        try {
            // 1. Filter out the payment for this term
            const paymentToRevert = (lending.payments || []).find(p => p.term_number === termNumber);
            if (!paymentToRevert) return;

            const updatedPayments = (lending.payments || []).filter(p => p.term_number !== termNumber);
            await api.put(`/private-lending/${lending._id}`, { ...lending, payments: updatedPayments });

            // 2. Purge associated Spending & Investment logs
            // Backend handle reserve revert when spending log is deleted
            const instrumentName = lending.borrower;
            const searchSpending = `Settle Term #${termNumber} for ${instrumentName}`;
            const searchInvest = `Term #${termNumber} settlement for ${instrumentName}`;

            const [spendingRes, investRes] = await Promise.all([
                api.get('/spending'),
                api.get('/investments')
            ]);
            
            const spendItem = (spendingRes.data || []).find(s => s.description === searchSpending);
            const investItem = (investRes.data || []).find(i => i.details === searchInvest);

            if (spendItem) await api.delete(`/spending/${spendItem._id}`);
            if (investItem) await api.delete(`/investments/${investItem._id}`);

            dispatch(fetchFinanceData());
        } catch (err) {
            console.error("Revert failed:", err);
            alert("Partial revert occurred. Check logs.");
        }
    };

    const handleYearlySubmit = async (data) => {
        try {
            if (editingYearly && editingYearly._id) {
                await api.put(`/yearly-expenses/${editingYearly._id}`, data);
            } else {
                await api.post('/yearly-expenses', data);
            }
            dispatch(fetchFinanceData());
            setEditingYearly(null);
            setShowAddYearlyModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setEditingInvestment(null);
        setEditingDebt(null);
        setEditingLending(null);
        setEditingReserve(null);
        setEditingYearly(null);
        setShowAddModal(false);
        setShowAddInvestmentModal(false);
        setShowAddDebtModal(false);
        setShowAddLendingModal(false);
        setShowAddReserveModal(false);
        setAddingFundsTo(null);
        setShowAddYearlyModal(false);
        setSettlingTerm(null);
        setShowTransferModal(false);
    };

    const handleGlobalAdd = () => {
        const path = window.location.pathname;
        if (path === '/investments') {
            setShowAddInvestmentModal(true);
        } else if (path === '/fixed-expenses' || path === '/monthly-bills') {
            setShowAddYearlyModal(true);
        } else if (path.startsWith('/admin/users')) {
            window.dispatchEvent(new CustomEvent('trigger-add-user'));
        } else if (path.startsWith('/admin/roles')) {
            window.dispatchEvent(new CustomEvent('trigger-add-role'));
        } else if (path === '/reserves') {
            if (reserveActiveTab === 'local-investment') {
                setShowAddLendingModal(true);
            } else if (reserveActiveTab === 'debt-ledger') {
                setShowAddDebtModal(true);
            } else {
                setShowAddReserveModal(true);
            }
        } else {
            setShowAddModal(true);
        }
    };

    const getDynamicAddLabel = () => {
        const path = window.location.pathname;
        if (path === '/reserves') {
            if (reserveActiveTab === 'local-investment') return 'ADD CHIT';
            if (reserveActiveTab === 'debt-ledger') return 'ADD DEBT';
            return 'ADD ACCOUNT';
        }
        if (path === '/investments') return 'ADD ASSET';
        if (path === '/fixed-expenses' || path === '/monthly-bills') return 'ADD BILL';
        if (path === '/admin/users') return 'PROVISION';
        if (path === '/admin/roles') return 'BORN';
        return 'SYNC';
    };


    return (
        <ThemeProvider theme={appleTheme}>
            <Router>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <CssBaseline />
                    <AnimatePresence mode="wait">
                        <Routes>
                            <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" replace />} />
                            
                            <Route path="/*" element={
                                <ProtectedRoute>
                                    <div className="app-shell">
                                        <TopNavbar
                                            onAdd={handleGlobalAdd}
                                            addLabel={getDynamicAddLabel()}
                                            onOpenAiModal={() => setShowAiModal(true)}
                                            onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
                                            showAnalytics={showAnalytics}
                                        />

                                        <div className="content-shell">
                                            <main className="main-content">
                                                <Routes>
                                                    <Route path="/" element={<ProtectedRoute module="Dashboard"><OverviewPage /></ProtectedRoute>} />
                                                    <Route path="/overview" element={<Navigate to="/" replace />} />
                                                    <Route path="/spending" element={<ProtectedRoute module="Audit Ledger"><SpendingPage onEdit={(item) => setEditingItem(item)} showAnalytics={showAnalytics} onToggleAnalytics={() => setShowAnalytics(!showAnalytics)} /></ProtectedRoute>} />
                                                    <Route path="/investments" element={<ProtectedRoute module="Asset Portfolio"><InvestmentPage onEdit={(item) => setEditingInvestment(item)} showAnalytics={showAnalytics} onToggleAnalytics={() => setShowAnalytics(!showAnalytics)} /></ProtectedRoute>} />
                                                    <Route path="/fixed-expenses" element={<ProtectedRoute module="Fixed Costs"><YearlyExpensePage onEdit={(item) => setEditingYearly(item)} /></ProtectedRoute>} />
                                                    <Route path="/yearly-expenses" element={<Navigate to="/fixed-expenses" replace />} />
                                                    <Route path="/reserves" element={<ProtectedRoute module="Cash Reserves"><ReservePage activeTab={reserveActiveTab} setActiveTab={setReserveActiveTab} onEdit={(item) => setEditingReserve(item)} onEditDebt={(item) => setEditingDebt(item || {})} onEditLending={(item) => setEditingLending(item)} onSettle={(data) => setSettlingTerm(data)} onRevert={handleTermRevert} onTransfer={() => setShowTransferModal(true)} onAddFunds={(acc) => setAddingFundsTo(acc)} /></ProtectedRoute>} />
                                                    <Route path="/categories" element={<ProtectedRoute module="Settings"><CategoryPage /></ProtectedRoute>} />
                                                    <Route path="/profile" element={<ProfilePage />} />
                                                    <Route path="/settings" element={<ProtectedRoute module="Settings"><SettingsPage /></ProtectedRoute>} />
                                                    <Route path="/site-settings" element={<ProtectedRoute module="Role Management"><SiteSettingsPage /></ProtectedRoute>} />
                                                    <Route path="/salary-calculation" element={<ProtectedRoute module="Salary Calculation"><SalaryCalcPage /></ProtectedRoute>} />
                                                    <Route path="/health" element={<ProtectedRoute module="Health"><HealthPage showAnalytics={showAnalytics} /></ProtectedRoute>} />
                                                    
                                                    {/* RBAC Protected Modules */}
                                                    <Route path="/admin/users" element={<ProtectedRoute module="User Management"><UserManagementPage /></ProtectedRoute>} />
                                                    <Route path="/admin/roles" element={<ProtectedRoute module="Role Management"><RoleManagementPage /></ProtectedRoute>} />
                                                    <Route path="/admin/database" element={<ProtectedRoute module="System Settings"><DatabaseHealthPage /></ProtectedRoute>} />
                                                </Routes>
                                            </main>
                                        </div>
                                    </div>
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </AnimatePresence>

                    {/* REFACTORED DYNAMIC MODALS */}

                            <BaseDialog
                                open={showAddModal || !!editingItem}
                                onClose={handleCloseModal}
                                title={editingItem ? 'Edit Audit Log' : 'Sync Audit Log'}
                            >
                                <ExpenseForm categories={categories} onSubmit={handleExpenseSubmit} onCancel={handleCloseModal} initialData={editingItem} />
                            </BaseDialog>

                            <BaseDialog
                                open={showAddInvestmentModal || !!editingInvestment}
                                onClose={handleCloseModal}
                                title={editingInvestment ? 'Edit Asset' : 'Sync Asset'}
                            >
                                <InvestmentForm assetClasses={assetClasses} onSubmit={handleInvestmentSubmit} onCancel={handleCloseModal} initialData={editingInvestment} />
                            </BaseDialog>

                            <BaseDialog
                                open={showAddDebtModal || !!editingDebt}
                                onClose={handleCloseModal}
                                title={editingDebt ? 'Edit Debt Exposure' : 'Sync Debt Exposure'}
                            >
                                <DebtForm onSubmit={handleDebtSubmit} onCancel={handleCloseModal} initialData={editingDebt} />
                            </BaseDialog>

                            <BaseDialog
                                open={showAddLendingModal || !!editingLending}
                                onClose={handleCloseModal}
                                title={editingLending ? 'Update Chit Fund Card' : 'Add New Chit Fund Card'}
                            >
                                <LendingForm onSubmit={handleLendingSubmit} onCancel={handleCloseModal} initialData={editingLending} />
                            </BaseDialog>

                            <BaseDialog
                                open={showAddReserveModal || !!editingReserve}
                                onClose={handleCloseModal}
                                title={editingReserve ? 'Add New Account' : 'Add New Account'}
                            >
                                <ReserveForm onSubmit={handleReserveSubmit} onCancel={handleCloseModal} initialData={editingReserve} />
                            </BaseDialog>

                            <BaseDialog
                                open={showAddYearlyModal || !!editingYearly}
                                onClose={handleCloseModal}
                                title={editingYearly ? 'Modify obligation' : 'Register obligation'}
                                borderRadius="32px"
                            >
                                {!editingYearly && (
                                    <div className="modal-switcher-wrap">
                                        <div className="switcher-pill-group">
                                            <Button
                                                onClick={() => setAddingFrequency('YEARLY')}
                                                startIcon={<CalendarDays size={16} />}
                                                className={`switcher-btn ${addingFrequency === 'YEARLY' ? 'active' : 'inactive'}`}
                                            >
                                                YEARLY RESERVE
                                            </Button>
                                            <Button
                                                onClick={() => setAddingFrequency('MONTHLY')}
                                                startIcon={<Repeat size={16} />}
                                                className={`switcher-btn ${addingFrequency === 'MONTHLY' ? 'active' : 'inactive'}`}
                                            >
                                                MONTHLY BILL
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {(editingYearly?.frequency === 'MONTHLY' || (!editingYearly && addingFrequency === 'MONTHLY')) ? (
                                    <MonthlyBillForm onSubmit={handleYearlySubmit} onCancel={handleCloseModal} initialData={editingYearly} />
                                ) : (
                                    <YearlyExpenseForm onSubmit={handleYearlySubmit} onCancel={handleCloseModal} initialData={editingYearly} />
                                )}
                            </BaseDialog>

                            <BaseDialog
                                open={!!settlingTerm}
                                onClose={handleCloseModal}
                                title="Settle Outstanding Term"
                                maxWidth="xs"
                            >
                                {settlingTerm && (
                                    <SettleCardTermForm
                                        term={settlingTerm.term}
                                        requiredAmount={settlingTerm.requiredAmount}
                                        alreadyPaid={settlingTerm.alreadyPaid}
                                        reserves={reserves}
                                        onSubmit={handleTermSettle}
                                        onCancel={handleCloseModal}
                                    />
                                )}
                            </BaseDialog>

                            <BaseDialog
                                open={showTransferModal}
                                onClose={handleCloseModal}
                                title="Bill Pay"
                                maxWidth="xs"
                            >
                                <TransferFundsForm reserves={reserves} onSubmit={handleTransferSubmit} onCancel={handleCloseModal} />
                            </BaseDialog>

                            <BaseDialog
                                open={!!addingFundsTo}
                                onClose={handleCloseModal}
                                title="Add Liquidity"
                                maxWidth="xs"
                            >
                                {addingFundsTo && <AddFundsForm account={addingFundsTo} onSubmit={handleAddFundsSubmit} onCancel={handleCloseModal} />}
                            </BaseDialog>

                            <AiAnalysisModal open={showAiModal} onClose={() => setShowAiModal(false)} />
                        </LocalizationProvider>
                    </Router>
                </ThemeProvider>
            );
}
