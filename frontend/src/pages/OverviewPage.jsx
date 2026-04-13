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
    Activity, Calendar, Clock
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
    { key: 'year', label: 'This Year', icon: '📆' },
    { key: 'all', label: 'All Time', icon: '∞' },
];

function getPeriodStart(key) {
    const now = dayjs();
    switch (key) {
        case 'week': return now.startOf('week');
        case 'month': return now.startOf('month');
        case 'year': return now.startOf('year');
        default: return null;
    }
}

function inPeriod(dateStr, periodStart) {
    if (!periodStart) return true;
    return dayjs(dateStr).isAfter(periodStart.subtract(1, 'day'));
}

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }
});

export default function OverviewPage() {
    const { loading, spending, reserves, investments, debt, yearlyExpenses } = useSelector(s => s.finance);
    const [activePeriod, setActivePeriod] = useState('month');

    const now = dayjs();
    const periodStart = getPeriodStart(activePeriod);

    // ─── Financial Pulse ──────────────────────────────────────────
    const pulse = useMemo(() => {
        let liquidity = 0, creditDebt = 0, owedToMe = 0, iOwe = 0;
        let totalValuation = 0, totalCost = 0;

        (reserves || []).forEach(r => {
            const bal = parseFloat(r.balance || 0);
            if (r.account_type === 'CREDIT_CARD') creditDebt += bal;
            else liquidity += bal;
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

        const totalYearly = (yearlyExpenses || []).reduce((a, c) => a + parseFloat(c.amount || 0), 0);
        const grossLiabilities = creditDebt + iOwe;
        const netWorth = (liquidity + owedToMe + totalValuation) - grossLiabilities;
        const yieldPct = totalCost > 0 ? ((totalValuation - totalCost) / totalCost) * 100 : 0;

        return {
            netWorth, liquidity, creditDebt, owedToMe, iOwe,
            totalValuation, grossLiabilities,
            yield: yieldPct,
            totalYearly,
            monthlyObligation: totalYearly / 12
        };
    }, [reserves, debt, investments, yearlyExpenses]);

    // ─── Period-Filtered Spending Analytics ───────────────────────
    const spendingAnalytics = useMemo(() => {
        const byCategory = {};
        let total = 0;

        (spending || []).forEach(s => {
            if (s.metadata?.is_investment) return;
            if (!inPeriod(s.date, periodStart)) return;
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
            if (s.metadata?.is_investment) return;
            if (!inPeriod(s.date, periodStart)) return;
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="ov-hero__greeting">
                                👋 Good {now.hour() < 12 ? 'Morning' : now.hour() < 17 ? 'Afternoon' : 'Evening'}
                            </div>
                            <h1 className="ov-hero__title">Financial Overview</h1>
                        </div>
                        <div className="ov-hero__date">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', marginBottom: '0.2rem' }}>
                                <Calendar size={11} color="#94a3b8" />
                                <span>{now.format('DD MMM YYYY')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                                <Clock size={11} color="#94a3b8" />
                                <span>{now.format('hh:mm A')}</span>
                            </div>
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

            {/* ── Net Worth Card ────────────────────────────── */}
            <motion.div {...fadeUp(0.05)}>
                <div className="ov-networth">
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
            </motion.div>

            {/* ── Key Metrics ───────────────────────────────── */}
            <motion.div {...fadeUp(0.1)}>
                <div className="ov-section-title">Key Metrics</div>
                <div className="ov-stats-row">
                    {[
                        {
                            label: 'Liquidity', val: pulse.liquidity,
                            icon: <Wallet size={16} />, cls: 'brand',
                            iconBg: 'rgba(99,102,241,0.12)', iconColor: '#6366f1',
                        },
                        {
                            label: 'Portfolio', val: pulse.totalValuation,
                            icon: <TrendingUp size={16} />, cls: 'success',
                            iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981',
                            change: pulse.yield !== 0 ? `${pulse.yield >= 0 ? '+' : ''}${pulse.yield.toFixed(2)}% yield` : null,
                            changeType: pulse.yield >= 0 ? 'positive' : 'negative'
                        },
                        {
                            label: 'Liabilities', val: pulse.grossLiabilities,
                            icon: <CreditCard size={16} />, cls: 'danger',
                            iconBg: 'rgba(239,68,68,0.12)', iconColor: '#ef4444',
                        },
                        {
                            label: `${activePeriodLabel} Spend`,
                            val: spendingAnalytics.total,
                            icon: <Flame size={16} />, cls: 'warning',
                            iconBg: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b',
                        }
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

            {/* ── Yearly Obligations ────────────────────────── */}
            {pulse.totalYearly > 0 && (
                <motion.div {...fadeUp(0.15)}>
                    <div className="ov-obligations">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Calendar size={18} color="#92400e" />
                            </div>
                            <div className="ov-obligations__info">
                                <div className="ov-obligations__label">Fixed Yearly Obligations</div>
                                <div className="ov-obligations__total">{formatCurrency(pulse.totalYearly)}</div>
                                <div className="ov-obligations__sub">Annual recurring overheads</div>
                            </div>
                        </div>
                        <div className="ov-obligations__sip">
                            <span className="sip-lbl">Monthly Reserve</span>
                            <span className="sip-val">{formatCurrency(pulse.monthlyObligation)}</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ── Analytics Charts ──────────────────────────── */}
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

            {/* ── Portfolio Allocation ──────────────────────── */}
            {investAlloc.data.length > 0 && (
                <motion.div {...fadeUp(0.25)}>
                    <div className="ov-section-title">Portfolio Allocation</div>
                    <div style={{ padding: '0 1.25rem', marginBottom: '1.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                                <Shield size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />Debt Exposure
                            </span>
                            <span className="ov-ledger-card__total" style={{ color: pulse.grossLiabilities > 0 ? '#ef4444' : '#10b981' }}>
                                {formatCurrency(pulse.grossLiabilities)}
                            </span>
                        </div>
                        <div className="ov-ledger-card__body">
                            {(debt || []).filter(d => d.status !== 'SETTLED').length === 0 ? (
                                <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                                    ✅ No active debt exposure
                                </div>
                            ) : (
                                (debt || []).filter(d => d.status !== 'SETTLED').slice(0, 6).map(d => (
                                    <div className="ov-ledger-card__row" key={d._id}>
                                        <div className="ov-ledger-card__icon" style={{
                                            background: d.direction === 'OWED_TO_ME' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: d.direction === 'OWED_TO_ME' ? '#10b981' : '#ef4444'
                                        }}>
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
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

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
                                .filter(tx => inPeriod(tx.date, periodStart))
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
