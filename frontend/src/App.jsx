import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    NavLink,
    useLocation
} from 'react-router-dom'
import {
    LayoutDashboard,
    Wallet,
    TrendingUp,
    Settings,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Gem,
    Home,
    Activity,
    DollarSign,
    ChevronRight,
    Filter,
    Calendar,
    CalendarDays,
    Clock,
    PieChart,
    Layers,
    History,
    Globe,
    Utensils,
    ShoppingBag,
    Heart,
    Zap,
    Briefcase,
    Lightbulb,
    Truck,
    Download,
    X
} from 'lucide-react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
    Filler
} from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import { motion, AnimatePresence } from 'framer-motion'
import { LocalizationProvider, DatePicker, MobileDatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, Filler);

// MUI Dark Theme Configuration
const appleTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#0071e3' },
        background: { default: '#f5f5f7', paper: '#ffffff' },
        text: { primary: '#1d1d1f', secondary: '#86868b' }
    },
    typography: {
        fontFamily: 'Outfit, sans-serif',
        button: { textTransform: 'none', fontWeight: 600 }
    },
});

// Environment variable and Axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const api = axios.create({ baseURL: API_BASE_URL });

// Axios interceptor for logging/preprocessing
api.interceptors.request.use(config => {
    console.log(`[API ${config.method.toUpperCase()}] ${config.url}`);
    return config;
}, error => Promise.reject(error));

api.interceptors.response.use(response => response, error => {
    console.error('[API Error]', error.response || error.message);
    return Promise.reject(error);
});

function TopNavbar({ onAdd }) {
    const location = useLocation();
    return (
        <nav className="top-navbar">
            <div className="nav-container">
                <div className="logo cursor-pointer" onClick={() => window.location.href = '/'}>FRIDAY</div>

                <div className="nav-links-horizontal">
                    <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="Live Feed" />
                    <SidebarLink to="/spending" icon={<Wallet size={18} />} label="Audit" />
                    <SidebarLink to="/investments" icon={<Gem size={18} />} label="Portfolios" />
                    <SidebarLink to="/categories" icon={<Settings size={18} />} label="Config" />
                </div>

                <div className="nav-actions">
                    {location.pathname === '/spending' && (
                        <button className="btn-primary-mini" onClick={onAdd}>
                            <Plus size={16} /> <span style={{ marginLeft: '0.4rem' }}>Sync Record</span>
                        </button>
                    )}
                    <div className="user-profile-mini">SV</div>
                </div>
            </div>
        </nav>
    );
}

function App() {
    const [summary, setSummary] = useState(null);
    const [spending, setSpending] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Global Record Modal
    const [showAddSpending, setShowAddSpending] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sumRes, spendRes, invRes, catRes] = await Promise.all([
                api.get('/summary'),
                api.get('/spending'),
                api.get('/investments'),
                api.get('/categories')
            ]);
            setSummary(sumRes.data);
            setSpending(spendRes.data);
            setInvestments(invRes.data);
            setCategories(catRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const addSpending = async (data) => {
        try {
            setLoading(true);
            await api.post('/spending', data);
            await fetchData();
            setShowAddSpending(false);
        } catch (err) {
            console.error(err);
            alert("Sync failed. Check network.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <ThemeProvider theme={appleTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <CssBaseline />
                <Router>
                    <div className="app-shell">
                        <TopNavbar onAdd={() => setShowAddSpending(true)} />

                        <div className="content-shell">

                            {/* Dynamic Route Content */}
                            <main className="main-content">
                                <AnimatePresence mode="wait">
                                    <Routes>
                                        <Route path="/" element={<Overview summary={summary} formatCurrency={formatCurrency} loading={loading} />} />
                                        <Route path="/spending" element={<SpendingPage spending={spending} formatCurrency={formatCurrency} loading={loading} categories={categories} onAdd={() => setShowAddSpending(true)} />} />
                                        <Route path="/investments" element={<InvestmentPage investments={investments} formatCurrency={formatCurrency} loading={loading} />} />
                                        <Route path="/categories" element={<CategoryPage categories={categories} fetchData={fetchData} loading={loading} />} />
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
    )
}

function SidebarLink({ to, icon, label }) {
    return (
        <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icon}
            <span>{label}</span>
        </NavLink>
    )
}

// ---------------- PAGES ----------------

function Overview({ summary, formatCurrency, loading }) {
    const [viewMode, setViewMode] = useState('MONTHLY'); // DAILY, MONTHLY, YEARLY

    const chartData = useMemo(() => {
        if (!summary) return { labels: [], datasets: [] };

        let rawData = {};
        if (viewMode === 'MONTHLY' && summary?.monthly_spending) rawData = summary.monthly_spending;
        else if (viewMode === 'DAILY' && summary?.daily_spending) {
            // Get last 30 days for daily view
            const keys = Object.keys(summary.daily_spending).sort().slice(-30);
            keys.forEach(k => rawData[k] = summary.daily_spending[k]);
        } else if (viewMode === 'YEARLY' && summary?.monthly_spending) {
            // Yearly view - aggregate by year
            Object.keys(summary.monthly_spending).forEach(k => {
                const year = k.split('-')[0];
                rawData[year] = (rawData[year] || 0) + summary.monthly_spending[k];
            });
        }

        const labels = Object.keys(rawData).sort();
        return {
            labels: labels,
            datasets: [{
                label: `${viewMode} Burn`,
                data: labels.map(l => rawData[l]),
                backgroundColor: 'rgba(99, 102, 241, 0.4)',
                borderColor: '#6366f1',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
    }, [summary, viewMode]);

    if (loading) return <div className="loading-state">Syncing Financial Cloud...</div>

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <PageHeader title="Financial Status" subtitle="Everything is looking green!" />
                <div className="chip-selector" style={{ marginBottom: '0.5rem' }}>
                    {['DAILY', 'MONTHLY', 'YEARLY'].map(v => (
                        <div key={v} className={`chip ${viewMode === v ? 'active' : ''}`} onClick={() => setViewMode(v)}>{v}</div>
                    ))}
                </div>
            </div>

            <div className="stats-grid">
                <StatCard title="TOTAL ASSET VALUE" value={formatCurrency(summary?.total_investment || 0)} trend="+18% gain" icon={<TrendingUp size={18} color="var(--success)" />} />
                <StatCard title="CURRENT MONTH BURN" value={formatCurrency(summary?.monthly_spending?.[new Date().toISOString().slice(0, 7)] || 0)} subtitle="Spending in March 2026" icon={<Wallet size={18} color="var(--danger)" />} />
            </div>

            <div className="charts-grid-main" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="chart-container glass-effect">
                    <div style={{ padding: '0.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>{viewMode} SPENDING VELOCITY</div>
                    <div style={{ height: '350px' }}>
                        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
                    </div>
                </div>
                <div className="chart-container glass-effect">
                    <div style={{ padding: '0.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>ASSET ALLOCATION</div>
                    <div style={{ height: '350px' }}>
                        <Doughnut data={{
                            labels: Object.keys(summary?.investment_breakdown || {}),
                            datasets: [{
                                data: Object.values(summary?.investment_breakdown || {}),
                                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
                                borderWidth: 0
                            }]
                        }} options={{ cutout: '75%', plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function SpendingPage({ spending, formatCurrency, loading, categories, onAdd }) {
    const [period, setPeriod] = useState('THIS MONTH');
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('ALL');
    const [selectedSub, setSelectedSub] = useState('ALL');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const filteredSpending = useMemo(() => {
        let list = [...spending];
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // This Week calculation (Starting from Monday)
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const mondayStr = monday.toISOString().split('T')[0];

        const resetNow = new Date(); // Reset now because setDate mutates
        const thisMonth = resetNow.getFullYear() + '-' + String(resetNow.getMonth() + 1).padStart(2, '0');
        const dLast = new Date(resetNow.getFullYear(), resetNow.getMonth() - 1, 1);
        const lastMonth = dLast.getFullYear() + '-' + String(dLast.getMonth() + 1).padStart(2, '0');
        const thisYear = resetNow.getFullYear().toString();
        const lastYear = (resetNow.getFullYear() - 1).toString();

        if (period === 'TODAY') list = list.filter(s => s.date === todayStr);
        else if (period === 'YESTERDAY') list = list.filter(s => s.date === yesterdayStr);
        else if (period === 'THIS WEEK') list = list.filter(s => s.date >= mondayStr && s.date <= todayStr);
        else if (period === 'THIS MONTH') list = list.filter(s => s.date.startsWith(thisMonth));
        else if (period === 'PREVIOUS MONTH') list = list.filter(s => s.date.startsWith(lastMonth));
        else if (period === 'THIS YEAR') list = list.filter(s => s.date.startsWith(thisYear));
        else if (period === 'LAST YEAR') list = list.filter(s => s.date.startsWith(lastYear));
        else if (period === 'CUSTOM' && dateRange.start && dateRange.end) {
            list = list.filter(s => s.date >= dateRange.start && s.date <= dateRange.end);
        }

        if (selectedCat !== 'ALL') list = list.filter(s => s.category === selectedCat);
        if (selectedSub !== 'ALL') list = list.filter(s => s.sub_category === selectedSub);

        if (search) {
            list = list.filter(item =>
                item.description.toLowerCase().includes(search.toLowerCase()) ||
                item.category.toLowerCase().includes(search.toLowerCase()) ||
                item.sub_category.toLowerCase().includes(search.toLowerCase())
            );
        }
        return list;
    }, [spending, search, period, selectedCat, selectedSub, dateRange]);

    const categoryTotals = useMemo(() => {
        const totals = {};
        // Initialize all categories with 0
        categories.forEach(c => totals[c.name] = 0);

        filteredSpending.forEach(s => {
            if (totals[s.category] !== undefined) {
                totals[s.category] += s.amount;
            } else {
                totals[s.category] = s.amount;
            }
        });

        // Return sorted by amount (Descending) then name
        return Object.fromEntries(
            Object.entries(totals).sort((a, b) => {
                if (b[1] !== a[1]) return b[1] - a[1];
                return a[0].localeCompare(b[0]);
            })
        );
    }, [filteredSpending, categories]);

    const getIcon = (cat) => {
        const lower = cat.toLowerCase();
        if (lower.includes('food')) return <Utensils size={18} color="#f87171" />;
        if (lower.includes('shop')) return <ShoppingBag size={18} color="#fbbf24" />;
        if (lower.includes('health')) return <Heart size={18} color="#f43f5e" />;
        if (lower.includes('grocer')) return <Zap size={18} color="#4ade80" />;
        if (lower.includes('office')) return <Briefcase size={18} color="#60a5fa" />;
        if (lower.includes('utilit')) return <Lightbulb size={18} color="#a78bfa" />;
        if (lower.includes('transpo')) return <Truck size={18} color="#fb923c" />;
        return <Activity size={18} color="var(--primary)" />;
    };
    const handleExportCSV = () => {
        if (filteredSpending.length === 0) return;
        const headers = ["Date", "Description", "Category", "Sub-Category", "Amount"];
        const rows = filteredSpending.map(s => [
            s.date,
            s.description,
            s.category,
            s.sub_category,
            s.amount
        ]);
        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.map(h => `"${h}"`).join(",") + "\n"
            + rows.map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `finance_audit_${period.toLowerCase().replace(' ', '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container-super">
            {/* FULL WIDTH CATEGORY SUMMARY */}
            <div className="category-full-wrapper" style={{ width: '100%', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div className="category-horizontal-scroll" style={{
                    display: 'flex',
                    gap: '1.25rem',
                    overflowX: 'auto',
                    padding: '0.5rem 0rem 0rem 0rem',
                    width: '100%',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                    {Object.entries(categoryTotals).map(([cat, amt]) => (
                        <motion.div
                            key={cat}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="apple-category-pill glass-effect"
                        >
                            <div className="pill-icon-box">{getIcon(cat)}</div>
                            <div className="pill-info-box">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span className="pill-cat-label">{cat}</span>
                                    {amt > 0 && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0071e3' }}></div>}
                                </div>
                                <span className="pill-amt-val" style={{ color: amt > 0 ? '#0071e3' : '#1d1d1f' }}>{formatCurrency(amt)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="spending-split-layout">
                {/* LEFT SIDEBAR: FILTERS & TOTALS */}
                <div className="spending-control-panel">
                    <div className="spending-filters-compact glass-effect">
                        <div className="input-group-fancy">
                            <label>SEARCH DETAIL</label>
                            <input className="input-fancy" value={search} onChange={e => setSearch(e.target.value)} placeholder="Type description..." />
                        </div>

                        <div className="input-group-fancy" style={{ marginTop: '2rem' }}>
                            <label style={{ marginBottom: '1rem', display: 'block' }}>CATEGORY</label>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedCat}
                                    onChange={(e) => { setSelectedCat(e.target.value); setSelectedSub('ALL'); }}
                                    displayEmpty
                                    IconComponent={() => <Filter size={14} style={{ marginRight: '1rem', color: '#86868b' }} />}
                                    sx={{
                                        borderRadius: '16px',
                                        backgroundColor: 'white',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        fontFamily: 'Outfit',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                borderRadius: '20px',
                                                marginTop: '8px',
                                                boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                                                border: '1px solid rgba(0,0,0,0.05)',
                                                padding: '0.5rem'
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="ALL" sx={{ borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}>ALL CATEGORIES</MenuItem>
                                    {categories.map(c => (
                                        <MenuItem
                                            key={c.name}
                                            value={c.name}
                                            sx={{ borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', color: '#1d1d1f' }}
                                        >
                                            {c.name.toUpperCase()}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <div className="input-group-fancy" style={{ marginTop: '2.5rem' }}>
                            <label>TIME HORIZON</label>
                            <div className="period-icon-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.75rem',
                                marginTop: '1rem'
                            }}>
                                {[
                                    { id: 'TODAY', label: 'Today', icon: <Zap size={14} /> },
                                    { id: 'YESTERDAY', label: 'Yesterday', icon: <Clock size={14} /> },
                                    { id: 'THIS WEEK', label: 'Week', icon: <Calendar size={14} /> },
                                    { id: 'THIS MONTH', label: 'Month', icon: <PieChart size={14} /> },
                                    { id: 'PREVIOUS MONTH', label: 'Prev', icon: <CalendarDays size={14} /> },
                                    { id: 'THIS YEAR', label: 'Year', icon: <Layers size={14} /> },
                                    { id: 'LAST YEAR', label: 'Last', icon: <History size={14} /> },
                                    { id: 'CUSTOM', label: 'Range', icon: <Filter size={14} /> },
                                    { id: 'ALL', label: 'Total', icon: <Globe size={14} /> }
                                ].map(p => (
                                    <div
                                        key={p.id}
                                        className={`period-icon-pill ${period === p.id ? 'active' : ''}`}
                                        onClick={() => setPeriod(p.id)}
                                    >
                                        <div className="icon-wrapper">{p.icon}</div>
                                        <span className="pill-text">{p.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {period === 'CUSTOM' && (
                            <div className="input-group-fancy" style={{ marginTop: '2rem' }}>
                                <label style={{ marginBottom: '1.25rem', display: 'block' }}>SELECT DATE RANGE</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <DatePicker
                                        label="START DATE"
                                        value={dateRange.start ? dayjs(dateRange.start) : null}
                                        onChange={(val) => setDateRange({ ...dateRange, start: val ? val.format('YYYY-MM-DD') : '' })}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': { borderRadius: '12px', background: 'white' },
                                                    '& .MuiOutlinedInput-input': { color: 'var(--text-main)', fontWeight: 700 }
                                                }
                                            }
                                        }}
                                    />
                                    <DatePicker
                                        label="END DATE"
                                        value={dateRange.end ? dayjs(dateRange.end) : null}
                                        onChange={(val) => setDateRange({ ...dateRange, end: val ? val.format('YYYY-MM-DD') : '' })}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': { borderRadius: '12px', background: 'white' },
                                                    '& .MuiOutlinedInput-input': { color: 'var(--text-main)', fontWeight: 700 }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT CONTENT: TABLE */}
                <div className="spending-main-content">
                    <div className="content-meta-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '1rem 1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                        <div className="badge-status">
                            <div className="dot-pulse"></div>
                            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{filteredSpending.length}</span> TRANSACTIONS FOUND
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSearch('');
                                    setSelectedCat('ALL');
                                    setSelectedSub('ALL');
                                    setPeriod('THIS MONTH');
                                    setDateRange({ start: '', end: '' });
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(14, 165, 233, 0.08))',
                                    color: '#4f46e5',
                                    border: '1px solid rgba(79, 70, 229, 0.1)',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={14} />
                                CLEAR FILTERS
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExportCSV}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    background: 'rgba(0, 113, 227, 0.08)',
                                    color: '#0071e3',
                                    border: 'none',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                <Download size={14} />
                                EXPORT CSV
                            </motion.button>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>LIVE FINANCIAL FEED</div>
                        </div>
                    </div>

                    <div className="data-table-premium scroll-y-luxury">
                        {(() => {
                            const grouped = filteredSpending.reduce((acc, curr) => {
                                if (!acc[curr.date]) acc[curr.date] = [];
                                acc[curr.date].push(curr);
                                return acc;
                            }, {});

                            const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

                            if (dates.length === 0) {
                                return (
                                    <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)', fontWeight: 800 }}>
                                        No entries matching your filter criteria.
                                    </div>
                                );
                            }

                            return dates.map(date => {
                                const dayTotal = grouped[date].reduce((sum, s) => sum + s.amount, 0);
                                return (
                                    <div key={date} className="date-group">
                                        <div className="date-header-luxury">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Calendar size={14} color="var(--primary)" />
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{date}</span>
                                            </div>
                                            <div style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                                Total: <span style={{ color: 'var(--success)' }}>{formatCurrency(dayTotal)}</span>
                                            </div>
                                        </div>
                                        <div className="date-transactions">
                                            {grouped[date].map((s, idx) => {
                                                const catInfo = (() => {
                                                    const lower = s.category.toLowerCase();
                                                    if (lower.includes('food')) return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
                                                    if (lower.includes('shop')) return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' };
                                                    if (lower.includes('health')) return { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' };
                                                    if (lower.includes('grocer')) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
                                                    if (lower.includes('office')) return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
                                                    if (lower.includes('utilit')) return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
                                                    if (lower.includes('transpo')) return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
                                                    return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
                                                })();

                                                return (
                                                    <div key={idx} className="transaction-row-fancy">
                                                        <div style={{ marginRight: '1rem', width: '32px', height: '32px', borderRadius: '8px', background: catInfo.bg, display: 'grid', placeItems: 'center' }}>
                                                            {getIcon(s.category)}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.description}</div>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>{s.sub_category}</div>
                                                        </div>
                                                        <div style={{ width: '130px', textAlign: 'center' }}>
                                                            <span style={{
                                                                padding: '0.35rem 0.75rem',
                                                                background: catInfo.bg,
                                                                color: catInfo.color,
                                                                borderRadius: '50px',
                                                                fontSize: '0.65rem',
                                                                fontWeight: 900,
                                                                letterSpacing: '0.05em',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {s.category}
                                                            </span>
                                                        </div>
                                                        <div style={{ width: '120px', textAlign: 'right', fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                                            {formatCurrency(s.amount)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function InvestmentPage({ investments, formatCurrency, loading }) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="page-container">
            <PageHeader title="Asset Portfolio" subtitle="Managing your wealth classes." />
            <div className="investments-grid">
                {investments.map((inv, idx) => (
                    <div key={idx} className="asset-card-fancy glass-effect">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div className="asset-icon-box">
                                {inv.type === 'Gold' ? <Gem color="#f59e0b" /> : (inv.type === 'Property' ? <Home color="#6366f1" /> : <DollarSign color="#10b981" />)}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="text-dim" style={{ fontSize: '0.7rem', fontWeight: 800 }}>{inv.type.toUpperCase()}</div>
                                <div style={{ fontSize: '0.8rem' }}>{inv.date}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{inv.name}</div>
                        <div className="text-dim" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>{inv.details}</div>
                        <div className="asset-value-label">{formatCurrency(inv.value)}</div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

function CategoryPage({ categories, fetchData, loading }) {
    const [newName, setNewName] = useState('');
    const [newSubs, setNewSubs] = useState('');

    const handleAdd = async () => {
        if (!newName) return;
        const subList = newSubs.split(',').map(s => s.trim()).filter(s => s);
        await api.post('/categories', { name: newName, sub_categories: subList.length > 0 ? subList : ['General'] });
        fetchData();
        setNewName('');
        setNewSubs('');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container">
            <div className="spending-split-layout">
                {/* LEFT: ADD FORM */}
                <div className="spending-control-panel">
                    <PageHeader title="Category Engine" subtitle="Structure your financials." />
                    <div className="spending-filters-compact glass-effect">
                        <div className="input-group-fancy">
                            <label>PRIMARY CATEGORY</label>
                            <input className="input-fancy" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., Entertainment" />
                        </div>
                        <div className="input-group-fancy" style={{ marginTop: '1.5rem' }}>
                            <label>SUB-CATEGORIES (COMMA SEPARATED)</label>
                            <textarea
                                className="input-fancy"
                                style={{ height: '100px', resize: 'none', paddingTop: '0.8rem' }}
                                value={newSubs}
                                onChange={e => setNewSubs(e.target.value)}
                                placeholder="Movies, Gaming, Concerts..."
                            />
                        </div>
                        <button className="btn-primary" onClick={handleAdd} style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>
                            REALIZE CATEGORY
                        </button>
                    </div>
                </div>

                {/* RIGHT: TABLE */}
                <div className="spending-main-content">
                    <div className="data-table-premium glass-effect scroll-y-luxury">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.7rem' }}>CORE CATEGORY</th>
                                    <th style={{ textAlign: 'left', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.7rem' }}>MAPPED SUB-CATEGORIES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '1.5rem', fontWeight: 800, fontSize: '1rem', width: '200px' }}>{cat.name}</td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {cat.sub_categories.map(s => <span key={s} className="badge-luxury-mini">{s}</span>)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ---------------- UI COMPONENTS ----------------

function PageHeader({ title, subtitle }) {
    return (
        <header className="page-header-box">
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </header>
    )
}

function StatCard({ title, value, subtitle, trend, icon }) {
    return (
        <div className="stat-card-luxury glass-effect">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    <div className="stat-label-dim">{title}</div>
                    <div className="stat-main-val">{value}</div>
                </div>
                <div className="premium-icon-badge">{icon}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                {trend && <span className="trend-label">{trend}</span>}
                <span className="text-dim" style={{ fontSize: '0.8rem' }}>{subtitle || "vs last month"}</span>
            </div>
        </div>
    )
}

function Modal({ children, title, onClose }) {
    return (
        <div className="modal-overlay-dark" onClick={onClose}>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modal-box-premium glass-effect" onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>
                {children}
            </motion.div>
        </div>
    )
}

function ExpenseForm({ categories, onSubmit }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [sub, setSub] = useState('');
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));

    const activeSubs = categories.find(c => c.name === category)?.sub_categories || [];

    return (
        <div className="apple-split-form">
            {/* LEFT: 40% - THE AMOUNT PREVIEW */}
            <div className="apple-form-left-viz">
                <div className="apple-viz-glass">
                    <div className="viz-label">PREVIEW AMOUNT</div>
                    <div className="viz-amount">
                        <span className="viz-currency">₹</span>
                        <input
                            type="text"
                            className="apple-ghost-input"
                            value={amount}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    setAmount(val);
                                }
                            }}
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                    <div className="viz-date-badge">{dayjs(date).format('MMMM DD, YYYY')}</div>
                </div>
            </div>

            {/* RIGHT: 60% - THE FORM DETAILS */}
            <div className="apple-form-right-fields">
                <div className="apple-field-group">
                    <label>DESCRIPTION</label>
                    <input className="apple-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Entry details..." />
                </div>

                <div className="apple-field-grid">
                    <div className="apple-field-group">
                        <label>CATEGORY</label>
                        <select className="apple-select" value={category} onChange={e => { setCategory(e.target.value); setSub(''); }}>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="apple-field-group">
                        <label>SUB-TYPE</label>
                        <select className="apple-select" value={sub} onChange={e => setSub(e.target.value)} disabled={!category}>
                            <option value="">Select Sub-Type</option>
                            {activeSubs.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="apple-field-group">
                    <label>TRANSACTION DATE</label>
                    <input
                        type="date"
                        className="apple-input"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>

                <button
                    className="apple-btn-confirm"
                    onClick={() => onSubmit({ amount: parseFloat(amount), description, category, sub_category: sub, date })}
                    disabled={!amount || !description || !category}
                >
                    <Plus size={18} /> COMPLETE TRANSACTION
                </button>
            </div>
        </div>
    )
}

export default App
