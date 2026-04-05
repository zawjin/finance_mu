import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFinanceData } from './store/financeSlice';
import api from './utils/api';
import { 
    ThemeProvider, createTheme, CssBaseline, 
    Dialog, DialogTitle, DialogContent, 
    Typography, IconButton, Grow 
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import TopNavbar from './components/layout/TopNavbar';
import OverviewPage from './pages/OverviewPage';
import SpendingPage from './pages/SpendingPage';
import InvestmentPage from './pages/InvestmentPage';
import DebtPage from './pages/DebtPage';
import CategoryPage from './pages/CategoryPage';
import ExpenseForm from './components/ui/ExpenseForm';
import InvestmentForm from './components/ui/InvestmentForm';
import DebtForm from './components/ui/DebtForm';
import AiAnalysisModal from './components/ui/AiAnalysisModal';

const appleTheme = createTheme({
    typography: { fontFamily: 'Outfit, sans-serif' },
    palette: {
        primary: { main: '#1d1d1f' },
        background: { default: '#f8fafc' }
    }
});

export default function App() {
    const dispatch = useDispatch();
    const { categories, assetClasses } = useSelector(state => state.finance);
    
    const [editingItem, setEditingItem] = useState(null);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [editingDebt, setEditingDebt] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
    const [showAddDebtModal, setShowAddDebtModal] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    useEffect(() => {
        dispatch(fetchFinanceData());
    }, [dispatch]);

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
            if (editingDebt) {
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

    const handleCloseModal = () => {
        setEditingItem(null);
        setEditingInvestment(null);
        setEditingDebt(null);
        setShowAddModal(false);
        setShowAddInvestmentModal(false);
        setShowAddDebtModal(false);
    };

    const handleGlobalAdd = () => {
        const path = window.location.pathname;
        if (path === '/investments') {
            setShowAddInvestmentModal(true);
        } else if (path === '/debt') {
            setShowAddDebtModal(true);
        } else {
            setShowAddModal(true);
        }
    };

    return (
        <ThemeProvider theme={appleTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <CssBaseline />
                <Router>
                    <div className="app-shell" style={{ background: '#f8fafc', minHeight: '100vh' }}>
                        <TopNavbar 
                            onAdd={handleGlobalAdd} 
                            onOpenAiModal={() => setShowAiModal(true)}
                            onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
                            showAnalytics={showAnalytics}
                        />

                        <div className="content-shell">
                            <main className="main-content" style={{ padding: '3.5rem' }}>
                                <AnimatePresence mode="wait">
                                    <Routes>
                                        <Route path="/" element={<OverviewPage />} />
                                        <Route path="/spending" element={<SpendingPage onEdit={(item) => setEditingItem(item)} showAnalytics={showAnalytics} onToggleAnalytics={() => setShowAnalytics(!showAnalytics)} />} />
                                        <Route path="/investments" element={<InvestmentPage onEdit={(item) => setEditingInvestment(item)} showAnalytics={showAnalytics} onToggleAnalytics={() => setShowAnalytics(!showAnalytics)} />} />
                                        <Route path="/debt" element={<DebtPage onEdit={(item) => setEditingDebt(item)} />} />
                                        <Route path="/categories" element={<CategoryPage />} />
                                    </Routes>
                                </AnimatePresence>
                            </main>

                            {/* Forms Modals */}
                            <Dialog open={showAddModal || !!editingItem} onClose={handleCloseModal} TransitionComponent={Grow} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '28px' } }}>
                                <DialogTitle sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 900 }}>{editingItem ? 'Edit Audit Log' : 'Sync Audit Log'}</Typography>
                                    <IconButton onClick={handleCloseModal}><X size={20} /></IconButton>
                                </DialogTitle>
                                <DialogContent sx={{ p: 0 }}>
                                    <ExpenseForm categories={categories} onSubmit={handleExpenseSubmit} onCancel={handleCloseModal} initialData={editingItem} />
                                </DialogContent>
                            </Dialog>

                            <Dialog open={showAddInvestmentModal || !!editingInvestment} onClose={handleCloseModal} TransitionComponent={Grow} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '28px' } }}>
                                <DialogTitle sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 900 }}>{editingInvestment ? 'Edit Asset' : 'Sync Asset'}</Typography>
                                    <IconButton onClick={handleCloseModal}><X size={20} /></IconButton>
                                </DialogTitle>
                                <DialogContent sx={{ p: 0 }}>
                                    <InvestmentForm assetClasses={assetClasses} onSubmit={handleInvestmentSubmit} onCancel={handleCloseModal} initialData={editingInvestment} />
                                </DialogContent>
                            </Dialog>

                            <Dialog open={showAddDebtModal || !!editingDebt} onClose={handleCloseModal} TransitionComponent={Grow} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '28px' } }}>
                                <DialogTitle sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 900 }}>{editingDebt ? 'Edit Debt Exposure' : 'Sync Debt Exposure'}</Typography>
                                    <IconButton onClick={handleCloseModal}><X size={20} /></IconButton>
                                </DialogTitle>
                                <DialogContent sx={{ p: 0 }}>
                                    <DebtForm onSubmit={handleDebtSubmit} onCancel={handleCloseModal} initialData={editingDebt} />
                                </DialogContent>
                            </Dialog>

                            <AiAnalysisModal open={showAiModal} onClose={() => setShowAiModal(false)} />
                        </div>
                    </div>
                </Router>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
