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
import Modal from './components/ui/Modal';
import ExpenseForm from './components/ui/ExpenseForm';

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
    const [showAddSpending, setShowAddSpending] = useState(false);

    useEffect(() => {
        dispatch(fetchFinanceData());
    }, [dispatch]);

    const addSpending = async (data) => {
        try {
            await api.post('/spending', data);
            dispatch(fetchFinanceData());
            setShowAddSpending(false);
        } catch (err) {
            console.error(err);
            alert("Sync failed. Check network.");
        }
    };

    return (
        <ThemeProvider theme={appleTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <CssBaseline />
                <Router>
                    <div className="app-shell">
                        <TopNavbar onAdd={() => setShowAddSpending(true)} />

                        <div className="content-shell">
                            <main className="main-content">
                                <AnimatePresence mode="wait">
                                    <Routes>
                                        <Route path="/" element={<OverviewPage />} />
                                        <Route path="/spending" element={<SpendingPage onAdd={() => setShowAddSpending(true)} />} />
                                        <Route path="/investments" element={<InvestmentPage />} />
                                        <Route path="/categories" element={<CategoryPage />} />
                                    </Routes>
                                </AnimatePresence>
                            </main>

                            {/* Global Modals */}
                            {showAddSpending && (
                                <Modal onClose={() => setShowAddSpending(false)} title="New Spending Record">
                                    <ExpenseForm categories={categories} onSubmit={addSpending} />
                                </Modal>
                            )}
                        </div>
                    </div>
                </Router>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
