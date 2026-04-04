import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { fetchFinanceData } from './store/financeSlice';
import api from './utils/api';

// Layout & UI Modules
import TopNavbar from './components/layout/TopNavbar';
import ExpenseForm from './components/ui/ExpenseForm';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Grow } from '@mui/material';
import { X } from 'lucide-react';

// Page Modules
import OverviewPage from './pages/OverviewPage';
import SpendingPage from './pages/SpendingPage';
import InvestmentPage from './pages/InvestmentPage';
import CategoryPage from './pages/CategoryPage';

import { useSelector } from 'react-redux';

// Theming
const appleTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#0071e3' },
        secondary: { main: '#6366f1' },
        background: { default: '#f5f5f7', paper: '#ffffff' },
        text: { primary: '#1d1d1f', secondary: '#86868b' }
    },
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    shape: { borderRadius: 14 }
});

export default function App() {
    const dispatch = useDispatch();
    const { categories } = useSelector(state => state.finance);
    const [editingItem, setEditingItem] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
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
            alert("Digital sync failed. Check cloud heartbeat.");
        }
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setShowAddModal(false);
    };

    return (
        <ThemeProvider theme={appleTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <CssBaseline />
                <Router>
                    <div className="app-shell">
                        <TopNavbar onAdd={() => setShowAddModal(true)} showAnalytics={showAnalytics} onToggleAnalytics={() => setShowAnalytics(!showAnalytics)} />

                        <div className="content-shell">
                            <main className="main-content">
                                <AnimatePresence mode="wait">
                                    <Routes>
                                        <Route path="/" element={<OverviewPage />} />
                                        <Route path="/spending" element={<SpendingPage onEdit={(item) => setEditingItem(item)} showAnalytics={showAnalytics} />} />
                                        <Route path="/investments" element={<InvestmentPage />} />
                                        <Route path="/categories" element={<CategoryPage />} />
                                    </Routes>
                                </AnimatePresence>
                            </main>

                            {/* Global High-Fidelity Sync Engine */}
                            <Dialog
                                open={showAddModal || !!editingItem}
                                onClose={handleCloseModal}
                                TransitionComponent={Grow}
                                transitionDuration={450}
                                fullWidth
                                maxWidth="sm"
                                PaperProps={{ 
                                    sx: { 
                                        borderRadius: '28px', 
                                        p: 0, 
                                        overflow: 'hidden', 
                                        width: '100%', 
                                        maxWidth: '480px', 
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' 
                                    } 
                                }}
                                BackdropProps={{
                                    sx: {
                                        backdropFilter: 'blur(4px)',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        transition: '0.4s all ease-in-out'
                                    }
                                }}
                            >
                                <DialogTitle sx={{ p: 4, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.03em', color: '#1d1d1f' }}>
                                            {editingItem ? 'Edit Transaction' : 'Sync New Record'}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        onClick={handleCloseModal}
                                        sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#1d1d1f', borderRadius: '12px', transition: '0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', transform: 'rotate(90deg)' } }}
                                    >
                                        <X size={20} />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent sx={{ p: 0, bgcolor: 'white' }}>
                                    <ExpenseForm 
                                        categories={categories} 
                                        onSubmit={handleExpenseSubmit} 
                                        onCancel={handleCloseModal}
                                        initialData={editingItem}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </Router>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
