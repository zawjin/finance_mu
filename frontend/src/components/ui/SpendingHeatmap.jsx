import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, Info } from 'lucide-react';
import './SpendingHeatmap.scss';

const WEEKS = 26; // ~6 months

export default function SpendingHeatmap({ spending }) {
    // Build a daily spend map
    const dailyMap = useMemo(() => {
        const map = {};
        (spending || []).forEach(s => {
            const d = s.date;
            if (d) map[d] = (map[d] || 0) + (parseFloat(s.amount) - parseFloat(s.recovered || 0));
        });
        return map;
    }, [spending]);

    const maxSpend = useMemo(() => Math.max(...Object.values(dailyMap), 1), [dailyMap]);

    // Build grid: last WEEKS*7 days
    const today = dayjs();
    const startDay = today.subtract(WEEKS * 7 - 1, 'day');

    // Align to Monday
    const startMonday = startDay.startOf('week');
    const cells = [];
    let d = startMonday;
    while (d.isBefore(today.add(1, 'day'))) {
        cells.push(d);
        d = d.add(1, 'day');
    }

    // Group by week
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    // Month labels
    const monthLabels = useMemo(() => {
        const labels = [];
        weeks.forEach((week, wi) => {
            const firstDay = week[0];
            if (wi === 0 || firstDay.date() <= 7) {
                labels.push({ week: wi, label: firstDay.format('MMM') });
            }
        });
        return labels;
    }, [weeks]);

    const getColor = (spend) => {
        if (!spend || spend === 0) return 'var(--cell-empty)';
        const intensity = spend / maxSpend;
        if (intensity < 0.15) return 'var(--cell-1)';
        if (intensity < 0.35) return 'var(--cell-2)';
        if (intensity < 0.60) return 'var(--cell-3)';
        if (intensity < 0.85) return 'var(--cell-4)';
        return 'var(--cell-5)';
    };

    const [hoverData, setHoverData] = useState(null);

    return (
        <div className="spending-heatmap">
            <div className="heatmap-header">
                <div className="heatmap-title-group">
                    <span className="heatmap-title">Spending Heatmap</span>
                    <div className="active-info">
                        {hoverData ? (
                            <div className="info-content fade-in">
                                <Calendar size={12} />
                                <span className="date">{dayjs(hoverData.date).format('DD MMM YYYY')}</span>
                                <span className="separator">·</span>
                                <span className="amt">{hoverData.amount > 0 ? `₹${Math.round(hoverData.amount).toLocaleString('en-IN')}` : 'No Spend'}</span>
                            </div>
                        ) : (
                            <div className="info-placeholder">
                                <Info size={12} />
                                <span>Hover cells to see daily spend audit</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="heatmap-legend">
                    <span>Less</span>
                    {['var(--cell-empty)', 'var(--cell-1)', 'var(--cell-2)', 'var(--cell-3)', 'var(--cell-4)', 'var(--cell-5)'].map((c, i) => (
                        <div key={i} className="legend-cell" style={{ background: c }} />
                    ))}
                    <span>More</span>
                </div>
            </div>

            <div className="heatmap-scroll-wrap">
                <div className="heatmap-body">
                    {/* Month labels */}
                    <div className="month-label-row">
                        <div className="day-labels-spacer" />
                        {weeks.map((week, wi) => {
                            const lbl = monthLabels.find(m => m.week === wi);
                            return <div key={wi} className="month-label">{lbl ? lbl.label : ''}</div>;
                        })}
                    </div>

                    {/* Grid */}
                    <div className="heatmap-grid-wrap">
                        {/* Day labels */}
                        <div className="day-labels">
                            {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((d, i) => (
                                <div key={i} className="day-label">{d}</div>
                            ))}
                        </div>

                        {/* Cells */}
                        <div className="heatmap-grid">
                            {weeks.map((week, wi) => (
                                <div key={wi} className="heatmap-week-col">
                                    {week.map((day, di) => {
                                        const key = day.format('YYYY-MM-DD');
                                        const spend = dailyMap[key] || 0;
                                        const isFuture = day.isAfter(today);
                                        const isToday = day.format('YYYY-MM-DD') === today.format('YYYY-MM-DD');
                                        return (
                                            <div
                                                key={di}
                                                className={`heatmap-cell ${isFuture ? 'future' : ''} ${isToday ? 'today' : ''}`}
                                                style={{ background: isFuture ? 'transparent' : getColor(spend) }}
                                                onMouseEnter={() => !isFuture && setHoverData({ date: key, amount: spend })}
                                                onMouseLeave={() => setHoverData(null)}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
