import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import dayjs from 'dayjs';
import {
    TrendingUp, TrendingDown, Wallet, Shield, Flame,
    BarChart2, PieChart, ArrowRight, CreditCard, Landmark,
    Activity, Calendar, Clock, Zap, Smartphone, Database
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import './OverviewPage.scss';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ─── Palette ──────────────────────────────────────────────────────
const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const CATEGORY_ICONS = {
    'Food': '🍔', 'Travel': '✈️', 'Shopping': '🛍️', 'Utilities': '⚡',
    'Health': '🏥', 'Entertainment': '🎬', 'Education': '📚',
    'Investments': '📈', 'Rent': '🏠', 'Other': '💰'
};

const ASSET_COLORS = {
    'Stocks': '#6366f1', 'Mutual Funds': '#10b981', 'Gold': '#f59e0b',
    'Crypto': '#ef4444', 'Retirement': '#8b5cf6', 'Chit Fund': '#06b6d4',
    'Property': '#f97316', 'Other': '#94a3b8'
};

function getIcon(category) {
    return CATEGORY_ICONS[category] || '💰';
}

// ─── Period Filter Config ──────────────────────────────────────────
const PERIODS = [
    { key: 'week', label: 'This Week', icon: '📅' },
    { key: 'month', label: 'This Month', icon: '🗓️' },
    { key: 'prev_month', label: 'Prev Month', icon: '⏮️' },
    { key: 'year', label: 'This Year', icon: '📆' },
    { key: 'all', label: 'All Time', icon: '∞' },
];

function getPeriodBounds(key) {
    const now = dayjs();
    switch (key) {
        case 'week': return { start: now.startOf('week'), end: null };
        case 'month': return { start: now.startOf('month'), end: null };
        case 'prev_month':
            const prev = now.subtract(1, 'month');
            return { start: prev.startOf('month'), end: prev.endOf('month') };
        case 'year': return { start: now.startOf('year'), end: null };
        default: return { start: null, end: null };
    }
}

function inPeriod(dateStr, bounds) {
    if (!bounds || !bounds.start) return true;
    const date = dayjs(dateStr);
    let valid = date.isAfter(bounds.start.subtract(1, 'ms'));
    if (bounds.end) {
        valid = valid && date.isBefore(bounds.end.add(1, 'day'));
    }
    return valid;
}

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }
});

const DailyQuoteBox = () => {
    const { dailyQuote, loading } = useSelector(s => s.finance);

    if (loading) return (
        <div className="quote-skeleton">
            <div className="skeleton-line" style={{ width: '80%' }}></div>
            <div className="skeleton-line" style={{ width: '40%' }}></div>
        </div>
    );

    if (!dailyQuote) return null;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="daily-quote-box">
            <div className="quote-icon">“</div>
            <div className="quote-content">
                <p className="quote-text">{dailyQuote.quote}</p>
                <p className="quote-tamil">{dailyQuote.tamil}</p>
                <span className="quote-author">— {dailyQuote.author}</span>
            </div>
        </motion.div>
    );
};



export default function OverviewPage() {
    const { loading, spending, reserves, investments, debt, yearlyExpenses, categories, summary } = useSelector(s => s.finance);
    const [activePeriod, setActivePeriod] = useState('month');
    const [currentTime, setCurrentTime] = useState(dayjs());

    const { user } = useSelector(s => s.auth);

    const hasModule = (moduleName) => {
        if (user?.role?.role_name === 'Super Admin') return true;
        return user?.role?.permissions?.some(p => p.module_name === moduleName && p.can_view);
    };

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(dayjs()), 10000);
        return () => clearInterval(timer);
    }, []);

    const now = currentTime;
    const periodBounds = getPeriodBounds(activePeriod);

    // ─── Financial Pulse ──────────────────────────────────────────
    const pulse = useMemo(() => {
        let liquidity = 0, creditDebt = 0, owedToMe = 0, iOwe = 0;
        let totalValuation = 0, totalCost = 0;
        let creditCardNames = [];

        (reserves || []).forEach(r => {
            const bal = parseFloat(r.balance || 0);
            if (r.account_type === 'CREDIT_CARD') {
                creditDebt += bal;
                if (bal > 0) creditCardNames.push(r.account_name.replace('BANK', '').trim());
            } else {
                liquidity += bal;
            }
        });

        (debt || []).forEach(d => {
            if (d.status !== 'SETTLED') {
                const amt = parseFloat(d.amount || 0);
                if (d.direction === 'OWED_TO_ME') owedToMe += amt;
                else iOwe += amt;
            }
        });

        (investments || []).forEach(i => {
            totalValuation += parseFloat(i.value || 0);
            const qty = parseFloat(i.quantity || 0);
            const price = parseFloat(i.buy_price || 0);
            totalCost += (qty && price) ? qty * price : parseFloat(i.value || 0);
        });

        let totalYearly = 0;
        let totalMonthly = 0;

        (yearlyExpenses || []).forEach(e => {
            if (e.status === 'ACTIVE') {
                if (e.frequency === 'YEARLY' || !e.frequency) {
                    totalYearly += parseFloat(e.amount || 0);
                } else if (e.frequency === 'MONTHLY') {
                    totalMonthly += parseFloat(e.amount || 0);
                }
            }
        });

        const grossLiabilities = creditDebt + iOwe;
        const netWorth = (liquidity + owedToMe + totalValuation) - grossLiabilities;
        const yieldPct = totalCost > 0 ? ((totalValuation - totalCost) / totalCost) * 100 : 0;

        return {
            netWorth, liquidity, creditDebt, owedToMe, iOwe,
            totalValuation, grossLiabilities,
            yield: yieldPct,
            totalYearly,
            totalMonthly,
            monthlyObligation: totalYearly / 12,
            creditCardNames: creditCardNames.join(' + ')
        };
    }, [reserves, debt, investments, yearlyExpenses]);

    // ─── Period-Filtered Spending Analytics ───────────────────────
    const spendingAnalytics = useMemo(() => {
        const byCategory = {};
        let total = 0;

        (spending || []).forEach(s => {
            const investmentCategories = [
                'investment', 'investments', 'investment settlement', 'stocks',
                'mutual funds', 'gold', 'property', 'crypto', 'fixed deposit',
                'chit fund', 'local investment', 'transfer', 'inflow'
            ];
            if (s.metadata?.is_investment || investmentCategories.includes((s.category || '').toLowerCase())) return;
            if (!inPeriod(s.date, periodBounds)) return;
            const amt = parseFloat(s.amount || 0) - parseFloat(s.recovered || 0);
            const cat = s.category || 'Other';
            byCategory[cat] = (byCategory[cat] || 0) + amt;
            total += amt;
        });

        const labels = Object.keys(byCategory).sort((a, b) => byCategory[b] - byCategory[a]).slice(0, 6);
        const data = labels.map(l => byCategory[l]);

        return { labels, data, total };
    }, [spending, activePeriod]);

    // ─── Investment Allocation ────────────────────────────────────
    const investAlloc = useMemo(() => {
        const byType = {};
        (investments || []).forEach(i => {
            const t = i.type === 'Local Investment' ? 'Chit Fund' : (i.type || 'Other');
            byType[t] = (byType[t] || 0) + parseFloat(i.value || 0);
        });
        const labels = Object.keys(byType).sort((a, b) => byType[b] - byType[a]);
        const data = labels.map(l => byType[l]);
        const total = data.reduce((a, b) => a + b, 0);
        return { labels, data, total };
    }, [investments]);

    // ─── Period-Filtered Trend ────────────────────────────────────
    const trend = useMemo(() => {
        const dailyNet = {};

        (spending || []).forEach(s => {
            const investmentCategories = [
                'investment', 'investments', 'investment settlement', 'stocks',
                'mutual funds', 'gold', 'property', 'crypto', 'fixed deposit',
                'chit fund', 'local investment', 'transfer', 'inflow'
            ];
            if (s.metadata?.is_investment || investmentCategories.includes((s.category || '').toLowerCase())) return;
            if (!inPeriod(s.date, periodBounds)) return;
            const amt = parseFloat(s.amount || 0) - parseFloat(s.recovered || 0);
            dailyNet[s.date] = (dailyNet[s.date] || 0) + amt;
        });

        const dates = Object.keys(dailyNet).sort();
        const labelFmt = activePeriod === 'week' ? 'ddd' : activePeriod === 'year' ? 'MMM' : 'DD MMM';
        let cum = 0;

        return {
            labels: dates.map(d => dayjs(d).format(labelFmt)),
            daily: dates.map(d => dailyNet[d]),
            cumulative: dates.map(d => { cum += dailyNet[d]; return cum; })
        };
    }, [spending, activePeriod]);

    // ─── Source-Filtered Spending Analytics ─────────────────────
    const sourceAnalytics = useMemo(() => {
        const bySource = { credit: 0, bank: 0, cash: 0, upi: 0, wallet: 0, other: 0 };
        const breakdowns = { credit: {}, bank: {}, cash: {}, upi: {}, wallet: {}, other: {} };
        const sourcesCache = {};

        (reserves || []).forEach(r => {
            sourcesCache[r._id] = { type: r.account_type, name: r.account_name };
            if (r.account_type === 'CREDIT_CARD') breakdowns.credit[r.account_name] = 0;
            if (r.account_type === 'BANK') breakdowns.bank[r.account_name] = 0;
            if (r.account_type === 'UPI') breakdowns.upi[r.account_name] = 0;
            if (r.account_type === 'WALLET') breakdowns.wallet[r.account_name] = 0;
        });

        (spending || []).forEach(s => {
            const investmentCategories = [
                'investment', 'investments', 'investment settlement', 'stocks',
                'mutual funds', 'gold', 'property', 'crypto', 'fixed deposit',
                'chit fund', 'local investment', 'transfer', 'inflow'
            ];
            if (s.metadata?.is_investment || investmentCategories.includes((s.category || '').toLowerCase())) return;
            if (!inPeriod(s.date, periodBounds)) return;

            const amt = parseFloat(s.amount || 0) - parseFloat(s.recovered || 0);

            let type = 'other';
            const sourceAcc = sourcesCache[s.payment_source_id];
            const sourceAccType = sourceAcc ? sourceAcc.type : null;
            const sourceAccName = sourceAcc ? sourceAcc.name : 'Unknown';

            if (sourceAccType === 'CREDIT_CARD') type = 'credit';
            else if (sourceAccType === 'BANK') type = 'bank';
            else if (sourceAccType === 'CASH') type = 'cash';
            else if (sourceAccType === 'UPI') type = 'upi';
            else if (sourceAccType === 'WALLET') type = 'wallet';

            bySource[type] += amt;
            breakdowns[type][sourceAccName] = (breakdowns[type][sourceAccName] || 0) + amt;
        });

        const total = Object.values(bySource).reduce((a, b) => a + b, 0);
        return { ...bySource, breakdowns, total };
    }, [spending, activePeriod, reserves]);

    // ─── Chart Data ───────────────────────────────────────────────
    const lineChartData = {
        labels: trend.labels,
        datasets: [{
            data: trend.cumulative,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5
        }]
    };

    const barChartData = {
        labels: trend.labels,
        datasets: [{
            data: trend.daily,
            backgroundColor: trend.daily.map(v =>
                v > (spendingAnalytics.total / (trend.daily.length || 1)) * 1.5
                    ? 'rgba(239,68,68,0.65)'
                    : 'rgba(99,102,241,0.5)'
            ),
            borderColor: 'transparent',
            borderRadius: 5,
            borderSkipped: false
        }]
    };

    const spendDonutData = {
        labels: spendingAnalytics.labels,
        datasets: [{
            data: spendingAnalytics.data,
            backgroundColor: PALETTE.map(c => c + '25'),
            borderColor: PALETTE,
            borderWidth: 2,
            hoverOffset: 8,
            cutout: '70%'
        }]
    };

    const investDonutData = {
        labels: investAlloc.labels,
        datasets: [{
            data: investAlloc.data,
            backgroundColor: investAlloc.labels.map(l => (ASSET_COLORS[l] || '#94a3b8') + '25'),
            borderColor: investAlloc.labels.map(l => ASSET_COLORS[l] || '#94a3b8'),
            borderWidth: 2,
            hoverOffset: 8,
            cutout: '70%'
        }]
    };

    const chartOpts = (scales = true) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#94a3b8',
                bodyColor: '#f8fafc',
                bodyFont: { weight: '700', size: 12 },
                padding: 10,
                cornerRadius: 10,
                displayColors: false
            }
        },
        scales: scales ? {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: '#94a3b8', font: { size: 9, weight: '600' }, maxTicksLimit: 8 }
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
                border: { display: false },
                ticks: { color: '#94a3b8', font: { size: 9, weight: '600' }, maxTicksLimit: 5 }
            }
        } : {}
    });

    if (loading) return (
        <div className="ov-loading">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Activity size={36} color="#6366f1" />
            </motion.div>
            <span className="loading-text">Loading dashboard…</span>
        </div>
    );

    const activePeriodLabel = PERIODS.find(p => p.key === activePeriod)?.label || 'Period';

    return (
        <div className="ov-root">

            {/* ── Hero Header ─────────────────────────────────── */}
            <motion.div {...fadeUp(0)}>
                <div className="ov-hero">
                    <div className="ov-hero-card">
                        <div className="ov-hero-top">
                            <div className="ov-hero-left">
                                <span className="ov-hero-greeting">
                                    {now.hour() < 12 ? '☀️ Good Morning' : now.hour() < 17 ? '🌤️ Good Afternoon' : '🌙 Good Evening'}
                                </span>
                                <h1 className="ov-hero-title">Financial Overview</h1>
                            </div>
                            <div className="ov-hero-right">
                                <div className="ov-hero-clock">
                                    <div className="clock-time">{now.format('hh:mm')} <small>{now.format('A')}</small></div>
                                    <div className="clock-date">{now.format('DD MMMM YYYY')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="ov-hero-bottom">
                            <DailyQuoteBox />
                        </div>
                    </div>

                    {/* Period Filter Pills */}
                    <div className="ov-period-bar">
                        {PERIODS.map(p => (
                            <button
                                key={p.key}
                                className={`ov-period-pill${activePeriod === p.key ? ' active' : ''}`}
                                onClick={() => setActivePeriod(p.key)}
                            >
                                <span className="pill-icon">{p.icon}</span>
                                <span className="pill-text">{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Neural Pulse (AI Command) ────────────────── */}

            {/* ── Net Worth Card ────────────────────────────── */}
            {hasModule('Cash Reserves') && hasModule('Asset Portfolio') && (
                <motion.div {...fadeUp(0.05)}>
                    <div className="ov-networth" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div className="ov-networth__label" style={{ position: 'relative', zIndex: 1 }}>
                                <Activity size={12} /> Total Net Worth
                            </div>
                            <div className="ov-networth__value" style={{ position: 'relative', zIndex: 1 }}>
                                {formatCurrency(pulse.netWorth)}
                            </div>
                            <div className="ov-networth__pills">
                                <div className="ov-networth__pill positive">
                                    <TrendingUp size={12} color="#6ee7b7" />
                                    <span className="pill-val">{formatCurrency(pulse.liquidity)}</span>
                                    <span className="pill-lbl">Liquid</span>
                                </div>
                                <div className="ov-networth__pill">
                                    <BarChart2 size={12} color="rgba(255,255,255,0.6)" />
                                    <span className="pill-val">{formatCurrency(pulse.totalValuation)}</span>
                                    <span className="pill-lbl">Invested</span>
                                </div>
                                {pulse.grossLiabilities > 0 && (
                                    <div className="ov-networth__pill negative">
                                        <TrendingDown size={12} color="#fca5a5" />
                                        <span className="pill-val">{formatCurrency(pulse.grossLiabilities)}</span>
                                        <span className="pill-lbl">Liability</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ position: 'relative', zIndex: 1, textAlign: 'right', padding: '1.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', letterSpacing: '0.05em' }}>
                                <Calendar size={12} /> Next Month Est. Outflow
                            </div>
                            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fca5a5' }}>
                                -{formatCurrency(Number(pulse.monthlyObligation || 0) + Number(pulse.totalMonthly || 0) + Number(sourceAnalytics.credit || 0))}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem', maxWidth: '160px', marginLeft: 'auto', lineHeight: 1.4 }}>
                                SIP + Bills + Credit Cards
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Key Metrics ───────────────────────────────── */}
            <motion.div {...fadeUp(0.1)}>
                <div className="ov-section-title">Key Metrics</div>
                <div className="ov-stats-row">
                    {[
                        ...(hasModule('Cash Reserves') ? [{
                            label: 'Liquidity', val: pulse.liquidity,
                            icon: <Wallet size={16} />, cls: 'brand',
                            iconBg: 'rgba(99,102,241,0.12)', iconColor: '#6366f1',
                        }] : []),
                        ...(hasModule('Asset Portfolio') ? [{
                            label: 'Portfolio', val: pulse.totalValuation,
                            icon: <TrendingUp size={16} />, cls: 'success',
                            iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981',
                            change: pulse.yield !== 0 ? `${pulse.yield >= 0 ? '+' : ''}${pulse.yield.toFixed(2)}% yield` : null,
                            changeType: pulse.yield >= 0 ? 'positive' : 'negative'
                        }] : []),
                        ...(hasModule('Cash Reserves') ? [{
                            label: 'Liabilities', val: pulse.grossLiabilities,
                            icon: <CreditCard size={16} />, cls: 'danger',
                            iconBg: 'rgba(239,68,68,0.12)', iconColor: '#ef4444',
                        }] : []),
                        ...(hasModule('Audit Ledger') ? [{
                            label: `${activePeriodLabel} Spend`,
                            val: spendingAnalytics.total,
                            icon: <Flame size={16} />, cls: 'warning',
                            iconBg: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b',
                        }] : [])
                    ].map((card, i) => (
                        <motion.div key={i} {...fadeUp(0.1 + i * 0.05)}>
                            <div className={`ov-stat-card ${card.cls}`}>
                                <div className="ov-stat-card__icon" style={{ background: card.iconBg, color: card.iconColor }}>
                                    {card.icon}
                                </div>
                                <div className="ov-stat-card__label">{card.label}</div>
                                <div className="ov-stat-card__value">{formatCurrency(card.val)}</div>
                                {card.change && (
                                    <div className={`ov-stat-card__change ${card.changeType}`}>{card.change}</div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── Source Breakdown ──────────────────────────── */}
            {hasModule('Audit Ledger') && (
                <motion.div {...fadeUp(0.12)}>
                    <div className="ov-section-title">Spending by Source — {activePeriodLabel}</div>
                    <div className="ov-stats-row source-breakdown-row" style={{ marginTop: '0.5rem', marginBottom: '1.5rem', gap: '1rem', display: 'flex', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Credit Cards', val: sourceAnalytics.credit, breakdown: sourceAnalytics.breakdowns.credit, icon: <CreditCard size={16} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                            { label: 'Bank / Debit', val: sourceAnalytics.bank, breakdown: sourceAnalytics.breakdowns.bank, icon: <Landmark size={16} />, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
                            { label: 'UPI apps', val: sourceAnalytics.upi, breakdown: sourceAnalytics.breakdowns.upi, icon: <Zap size={16} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                            { label: 'Wallets', val: sourceAnalytics.wallet, breakdown: sourceAnalytics.breakdowns.wallet, icon: <Smartphone size={16} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                            { label: 'Cash', val: sourceAnalytics.cash, breakdown: sourceAnalytics.breakdowns.cash, icon: <Wallet size={16} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                            ...(sourceAnalytics.other > 0 ? [{ label: 'Other', val: sourceAnalytics.other, breakdown: sourceAnalytics.breakdowns.other, icon: <Activity size={16} />, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }] : [])
                        ].filter(item => item.val > 0).map((bItem, i) => (
                            <div key={bItem.label} style={{ flex: '1 1 min-content', minWidth: '220px', background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: bItem.bg, color: bItem.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {bItem.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#86868b', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{bItem.label}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1d1d1f' }}>{formatCurrency(bItem.val)}</div>
                                    </div>
                                </div>

                                {/* Breakdown List */}
                                {Object.keys(bItem.breakdown || {}).filter(k => bItem.breakdown[k] > 0).length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                                        {Object.entries(bItem.breakdown || {})
                                            .filter(([k, v]) => v > 0)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([name, amount]) => (
                                                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                                                    <span style={{ fontWeight: 600, color: '#64748b' }}>{name}</span>
                                                    <span style={{ fontWeight: 800, color: '#1d1d1f' }}>{formatCurrency(amount)}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        ))}
                        {sourceAnalytics.total === 0 && (
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '1.5rem', width: '100%', background: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}>No spending from sources in this period</div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* ── Yearly & Monthly Obligations ────────────────────────── */}
            {hasModule('Fixed Costs') && (pulse.totalYearly > 0 || pulse.totalMonthly > 0) && (
                <motion.div {...fadeUp(0.15)}>
                    <div className='ov-stats-row source-breakdown-row' style={{ display: 'flex', gap: '1rem', width: '100%', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        {/* Left Half: Yearly */}
                        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(245,158,11,0.1) 100%)', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Calendar size={20} color="#92400e" />
                            </div>
                            <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#78350f', marginTop: '0.1rem' }}>{formatCurrency(pulse.totalYearly)}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#92400e', opacity: 0.8, marginTop: '0.15rem' }}>Annual recurring overheads</div>
                                </div>
                                <div style={{ textAlign: 'right', background: 'rgba(245,158,11,0.1)', padding: '0.5rem 0.85rem', borderRadius: '12px' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#92400e', opacity: 0.7, textTransform: 'uppercase' }}>Monthly SIP</div>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#78350f' }}>{formatCurrency(pulse.monthlyObligation)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Half: Monthly */}
                        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0.1) 100%)', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Clock size={20} color="#4338ca" />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#312e81', marginTop: '0.1rem' }}>{formatCurrency(pulse.totalMonthly)}</div>
                                <div style={{ fontSize: '0.7rem', color: '#4338ca', opacity: 0.8, marginTop: '0.15rem' }}>Fixed monthly bills</div>
                            </div>
                        </div>

                        {/* Third Box: Credit Cards */}
                        {sourceAnalytics.credit > 0 && (
                            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(239,68,68,0.1) 100%)', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <CreditCard size={20} color="#b91c1c" />
                                </div>
                                <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credit Card Bills</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7f1d1d', marginTop: '0.1rem' }}>{formatCurrency(sourceAnalytics.credit)}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#b91c1c', opacity: 0.8, marginTop: '0.15rem' }}>
                                            {Object.keys(sourceAnalytics.breakdowns.credit).filter(k => sourceAnalytics.breakdowns.credit[k] > 0).map(k => k.replace('BANK', '').trim()).join(' + ') || 'No pending bills'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* ── Analytics Charts ──────────────────────────── */}
            {hasModule('Audit Ledger') && (
                <motion.div {...fadeUp(0.2)}>
                    <div className="ov-section-title">Analytics — {activePeriodLabel}</div>
                    <div className="ov-charts-grid">
                        {/* Spending Trend - Line */}
                        <div className="ov-chart-card">
                            <div className="ov-chart-card__header">
                                <div>
                                    <div className="ov-chart-card__title">
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <TrendingUp size={12} color="#6366f1" /> Spending Trend
                                        </span>
                                    </div>
                                    <div className="ov-chart-card__value">
                                        {formatCurrency(trend.cumulative.slice(-1)[0] || 0)}
                                    </div>
                                </div>
                                <span className="ov-chart-card__badge neutral">{activePeriodLabel}</span>
                            </div>
                            <div className="ov-chart-card__canvas">
                                <Line data={lineChartData} options={chartOpts(true)} />
                            </div>
                        </div>

                        {/* Daily Burn - Bar */}
                        <div className="ov-chart-card">
                            <div className="ov-chart-card__header">
                                <div>
                                    <div className="ov-chart-card__title">
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <BarChart2 size={12} color="#6366f1" /> Daily Burn
                                        </span>
                                    </div>
                                    <div className="ov-chart-card__value">
                                        {formatCurrency(trend.daily.length ? trend.daily.reduce((a, b) => a + b, 0) / trend.daily.length : 0)}/d
                                    </div>
                                </div>
                                <span className="ov-chart-card__badge neutral">Avg/Day</span>
                            </div>
                            <div className="ov-chart-card__canvas">
                                <Bar data={barChartData} options={chartOpts(true)} />
                            </div>
                        </div>

                        {/* By Category - Donut */}
                        <div className="ov-chart-card">
                            <div className="ov-chart-card__header">
                                <div>
                                    <div className="ov-chart-card__title">
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <PieChart size={12} color="#6366f1" /> By Category
                                        </span>
                                    </div>
                                    <div className="ov-chart-card__value">{formatCurrency(spendingAnalytics.total)}</div>
                                </div>
                                <span className="ov-chart-card__badge negative">Spent</span>
                            </div>
                            <div className="ov-chart-card__donut-wrap">
                                {spendingAnalytics.data.length > 0 ? (
                                    <>
                                        <Doughnut data={spendDonutData} options={chartOpts(false)} />
                                        <div className="ov-chart-card__donut-center">
                                            <span className="center-val">₹{(spendingAnalytics.total / 1000).toFixed(0)}k</span>
                                            <span className="center-lbl">Total</span>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                                        No spending in this period
                                    </div>
                                )}
                            </div>
                            <div className="ov-chart-card__legend">
                                {spendingAnalytics.labels.slice(0, 4).map((l, i) => (
                                    <div className="ov-chart-card__legend-row" key={l}>
                                        <div className="leg-dot" style={{ background: PALETTE[i] }} />
                                        <span className="leg-label">{l}</span>
                                        <span className="leg-val">{formatCurrency(spendingAnalytics.data[i])}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Portfolio Allocation ──────────────────────── */}
            {hasModule('Asset Portfolio') && investAlloc.data.length > 0 && (
                <motion.div {...fadeUp(0.25)}>
                    <div className="ov-section-title">Portfolio Allocation</div>
                    <div className="ov-portfolio-grid">
                        <div className="ov-chart-card" style={{ flex: '0 0 auto', width: 'clamp(200px, 35%, 280px)' }}>
                            <div className="ov-chart-card__header">
                                <div>
                                    <div className="ov-chart-card__title"><PieChart size={12} color="#10b981" /> Investment Mix</div>
                                    <div className="ov-chart-card__value">{formatCurrency(investAlloc.total)}</div>
                                </div>
                                <span className="ov-chart-card__badge positive">AUM</span>
                            </div>
                            <div className="ov-chart-card__donut-wrap">
                                <Doughnut data={investDonutData} options={chartOpts(false)} />
                                <div className="ov-chart-card__donut-center">
                                    <span className="center-val">{investAlloc.labels.length}</span>
                                    <span className="center-lbl">Types</span>
                                </div>
                            </div>
                        </div>

                        <div className="ov-chart-card" style={{ flex: 1, minWidth: '200px' }}>
                            <div className="ov-chart-card__header">
                                <div className="ov-chart-card__title"><BarChart2 size={12} color="#10b981" /> Weight Distribution</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {investAlloc.labels.slice(0, 6).map((l, i) => {
                                    const pct = ((investAlloc.data[i] / investAlloc.total) * 100).toFixed(1);
                                    const color = ASSET_COLORS[l] || PALETTE[i] || '#94a3b8';
                                    return (
                                        <div key={l}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{l}</span>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(investAlloc.data[i])}</span>
                                                    <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#94a3b8', marginLeft: '0.35rem' }}>{pct}%</span>
                                                </div>
                                            </div>
                                            <div className="ov-alloc-card__bar-bg">
                                                <motion.div
                                                    className="ov-alloc-card__bar-fill"
                                                    style={{ background: color }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.08 }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Ledger ────────────────────────────────────── */}
            {hasModule('Cash Reserves') && (
                <motion.div {...fadeUp(0.3)}>
                    <div className="ov-section-title">Ledger</div>
                    <div className="ov-ledger-grid">
                        {/* Accounts */}
                        <div className="ov-ledger-card">
                            <div className="ov-ledger-card__head">
                                <span className="ov-ledger-card__title">
                                    <Landmark size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Accounts
                                </span>
                                <span className="ov-ledger-card__total">{formatCurrency(pulse.liquidity)}</span>
                            </div>
                            <div className="ov-ledger-card__body">
                                {(reserves || []).filter(r => r.account_type !== 'CREDIT_CARD').slice(0, 6).map(r => (
                                    <div className="ov-ledger-card__row" key={r._id}>
                                        <div className="ov-ledger-card__icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                                            <Landmark size={14} />
                                        </div>
                                        <div className="ov-ledger-card__info">
                                            <div className="ov-ledger-card__name">{r.account_name}</div>
                                            <div className="ov-ledger-card__meta">{r.account_type?.replace('_', ' ')}</div>
                                        </div>
                                        <div className="ov-ledger-card__amount" style={{ color: parseFloat(r.balance) >= 0 ? '#10b981' : '#ef4444' }}>
                                            {formatCurrency(r.balance)}
                                        </div>
                                    </div>
                                ))}
                                {(reserves || []).filter(r => r.account_type === 'CREDIT_CARD').slice(0, 3).map(r => (
                                    <div className="ov-ledger-card__row" key={r._id}>
                                        <div className="ov-ledger-card__icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                            <CreditCard size={14} />
                                        </div>
                                        <div className="ov-ledger-card__info">
                                            <div className="ov-ledger-card__name">{r.account_name}</div>
                                            <div className="ov-ledger-card__meta">Credit Card</div>
                                        </div>
                                        <div className="ov-ledger-card__amount" style={{ color: '#ef4444' }}>
                                            -{formatCurrency(r.balance)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Debt */}
                        <div className="ov-ledger-card">
                            <div className="ov-ledger-card__head">
                                <span className="ov-ledger-card__title">
                                    <Shield size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Debt & Lending
                                </span>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="ov-ledger-card__total" style={{ color: '#ef4444' }}>-{formatCurrency(pulse.iOwe)}</div>
                                    <div className="ov-ledger-card__total" style={{ color: '#10b981', fontSize: '0.7rem', marginTop: '-2px' }}>+{formatCurrency(pulse.owedToMe)}</div>
                                </div>
                            </div>
                            <div className="ov-ledger-card__body">
                                {(debt || []).filter(d => d.status !== 'SETTLED').slice(0, 6).map(d => (
                                    <div className="ov-ledger-card__row" key={d._id}>
                                        <div className="ov-ledger-card__icon" style={{ background: d.direction === 'OWED_TO_ME' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: d.direction === 'OWED_TO_ME' ? '#10b981' : '#ef4444' }}>
                                            {d.direction === 'OWED_TO_ME' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        </div>
                                        <div className="ov-ledger-card__info">
                                            <div className="ov-ledger-card__name">{d.person}</div>
                                            <div className="ov-ledger-card__meta">{d.direction === 'OWED_TO_ME' ? 'Receivable' : 'Payable'}</div>
                                        </div>
                                        <div className="ov-ledger-card__amount" style={{ color: d.direction === 'OWED_TO_ME' ? '#10b981' : '#ef4444' }}>
                                            {d.direction === 'OWED_TO_ME' ? '+' : '-'}{formatCurrency(d.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Recent Transactions ───────────────────────── */}
            <motion.div {...fadeUp(0.35)}>
                <div className="ov-section-title">Recent Activity — {activePeriodLabel}</div>
                <div className="ov-tx-section">
                    <div className="ov-tx-card">
                        <div className="ov-tx-card__head">
                            <span className="ov-tx-card__title">
                                <Activity size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Audit Log
                            </span>
                            <span className="ov-tx-card__more">View all <ArrowRight size={10} style={{ display: 'inline' }} /></span>
                        </div>
                        {(() => {
                            const filtered = (spending || [])
                                .filter(tx => {
                                    const investmentCategories = [
                                        'investment', 'investments', 'investment settlement', 'stocks',
                                        'mutual funds', 'gold', 'property', 'crypto', 'fixed deposit',
                                        'chit fund', 'local investment', 'transfer', 'inflow'
                                    ];
                                    if (tx.metadata?.is_investment || investmentCategories.includes((tx.category || '').toLowerCase())) return false;
                                    return inPeriod(tx.date, periodBounds);
                                })
                                .slice(0, 8);

                            if (filtered.length === 0) return (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600 }}>
                                    No transactions in {activePeriodLabel.toLowerCase()}
                                </div>
                            );

                            return filtered.map((tx, i) => {
                                const isInvestment = tx.metadata?.is_investment;
                                const iconEmoji = getIcon(tx.category);
                                const color = isInvestment ? '#10b981' : '#6366f1';
                                const bg = isInvestment ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)';
                                return (
                                    <motion.div
                                        key={tx._id}
                                        className="ov-tx-card__row"
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.35 + i * 0.03 }}
                                    >
                                        <div className="ov-tx-card__icon" style={{ background: bg, fontSize: '1rem' }}>
                                            {iconEmoji}
                                        </div>
                                        <div className="ov-tx-card__desc">
                                            <div className="ov-tx-card__name">{tx.description}</div>
                                            <div className="ov-tx-card__sub">{tx.category} • {tx.sub_category}</div>
                                        </div>
                                        <div className="ov-tx-card__right">
                                            <div className="ov-tx-card__amount" style={{ color }}>
                                                -{formatCurrency(tx.amount)}
                                            </div>
                                            <div className="ov-tx-card__date">{dayjs(tx.date).format('DD MMM')}</div>
                                        </div>
                                    </motion.div>
                                );
                            });
                        })()}
                    </div>
                </div>
            </motion.div>

        </div>
    );
}
