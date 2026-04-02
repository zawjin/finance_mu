import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, ArcElement, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, ArcElement, Filler);

import { formatCurrency } from '../utils/formatters';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import Loader from '../components/ui/Loader';

export default function OverviewPage() {
    const { summary, loading } = useSelector(state => state.finance);
    const [viewMode, setViewMode] = useState('MONTHLY'); // DAILY, MONTHLY, YEARLY

    if (loading) return <Loader message="Generating Intelligence Reports..." />;

    const chartData = useMemo(() => {
        if (!summary) return { labels: [], datasets: [] };

        let rawData = {};
        if (viewMode === 'MONTHLY' && summary?.monthly_spending) rawData = summary.monthly_spending;
        else if (viewMode === 'DAILY' && summary?.daily_spending) {
            const keys = Object.keys(summary.daily_spending).sort().slice(-30);
            keys.forEach(k => rawData[k] = summary.daily_spending[k]);
        } else if (viewMode === 'YEARLY' && summary?.monthly_spending) {
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
