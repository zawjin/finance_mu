import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { TrendingUp, TrendingDown, Landmark, Briefcase, ShieldAlert } from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import './NetWorthChart.scss';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function NetWorthChart() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/net-worth-timeline')
            .then(res => setData(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="nwc-loading">Loading Net Worth Timeline...</div>;
    if (!data) return null;

    const { timeline, current } = data;
    const isPositiveTrend = timeline.length >= 2
        ? timeline[timeline.length - 1].net_worth >= timeline[0].net_worth
        : true;

    const chartData = {
        labels: timeline.map(t => t.month),
        datasets: [{
            label: 'Net Worth',
            data: timeline.map(t => t.net_worth),
            fill: true,
            tension: 0.45,
            borderColor: isPositiveTrend ? '#10b981' : '#ef4444',
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: isPositiveTrend ? '#10b981' : '#ef4444',
            pointBorderWidth: 2,
            backgroundColor: (ctx) => {
                const chart = ctx.chart;
                const { ctx: canvas, chartArea } = chart;
                if (!chartArea) return 'transparent';
                const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                if (isPositiveTrend) {
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                } else {
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.12)');
                    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
                }
                return gradient;
            }
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 12,
                cornerRadius: 12,
                callbacks: {
                    label: ctx => ` Net Worth: ${formatCurrency(ctx.raw)}`,
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 10, weight: '700' }, color: '#94a3b8' }
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
                ticks: {
                    font: { size: 10, weight: '700' },
                    color: '#94a3b8',
                    callback: v => `₹${(v / 100000).toFixed(0)}L`
                }
            }
        }
    };

    const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
    const trendColor = isPositiveTrend ? '#10b981' : '#ef4444';

    return (
        <div className="net-worth-chart">
            <div className="nwc-header">
                <div className="nwc-title-group">
                    <span className="nwc-title">Net Worth Timeline</span>
                    <span className="nwc-sub">12-month reconstruction</span>
                </div>
                <div className="nwc-trend" style={{ color: trendColor }}>
                    <TrendIcon size={16} />
                    <span>{isPositiveTrend ? 'Growing' : 'Declining'}</span>
                </div>
            </div>

            <div className="nwc-current-row">
                <div className="nwc-stat">
                    <div className="nwc-stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                        <Briefcase size={16} />
                    </div>
                    <div>
                        <div className="nwc-stat-val">{formatCurrency(current.investments)}</div>
                        <div className="nwc-stat-lbl">Investments</div>
                    </div>
                </div>
                <div className="nwc-stat">
                    <div className="nwc-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                        <Landmark size={16} />
                    </div>
                    <div>
                        <div className="nwc-stat-val">{formatCurrency(current.reserves)}</div>
                        <div className="nwc-stat-lbl">Reserves</div>
                    </div>
                </div>
                <div className="nwc-stat">
                    <div className="nwc-stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                        <ShieldAlert size={16} />
                    </div>
                    <div>
                        <div className="nwc-stat-val">{formatCurrency(current.debt)}</div>
                        <div className="nwc-stat-lbl">Liabilities</div>
                    </div>
                </div>
                <div className="nwc-stat highlight" style={{ '--c': trendColor }}>
                    <div>
                        <div className="nwc-stat-val big" style={{ color: trendColor }}>{formatCurrency(current.net_worth)}</div>
                        <div className="nwc-stat-lbl">Current Net Worth</div>
                    </div>
                </div>
            </div>

            <div className="nwc-chart-area">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}
