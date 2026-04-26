import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ChevronLeft, ChevronRight, Calendar, Type, CheckSquare, TableProperties, Sigma, Flame, Trophy, Activity, Target, Clock, Zap, LineChart, Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import api from '../utils/api';
import BaseDialog from '../components/ui/BaseDialog';
import HealthHabitForm from '../components/ui/HealthHabitForm';
import './HealthPage.scss';

dayjs.extend(isSameOrAfter);

export default function HealthPage({ showAnalytics }) {
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);
    const [viewType, setViewType] = useState('Daily');

    // Calendar Pager State
    const [pageDate, setPageDate] = useState(dayjs());
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);

    const fetchHabitsAndLogs = async () => {
        try {
            const hRes = await api.get('/health/habits');
            setHabits(hRes.data);

            // Allow logs up to 1 year back
            const start = dayjs().subtract(365, 'day').format('YYYY-MM-DD');
            const end = dayjs().add(1, 'month').format('YYYY-MM-DD');
            const lRes = await api.get(`/health/logs?start_date=${start}&end_date=${end}`);
            setLogs(lRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchHabitsAndLogs();
    }, []);

    const completedSet = useMemo(() => {
        const s = new Set();
        logs.forEach(l => {
            if (l.completed) s.add(`${l.habit_id}_${l.date}`);
        });
        return s;
    }, [logs]);

    const handleToggle = async (habitId, dateStr) => {
        // Prevent toggling future dates
        if (dayjs(dateStr).isAfter(dayjs(), 'day')) return;

        const key = `${habitId}_${dateStr}`;
        const isCompleted = completedSet.has(key);
        const newState = !isCompleted;

        if (newState) {
            setLogs(prev => [...prev, { habit_id: habitId, date: dateStr, completed: true }]);
        } else {
            setLogs(prev => prev.filter(l => !(l.habit_id === habitId && l.date === dateStr)));
        }

        try {
            await api.post('/health/logs', { habit_id: habitId, date: dateStr, completed: newState });
        } catch (e) {
            fetchHabitsAndLogs();
        }
    };

    const handleAddHabit = async (habitData) => {
        try {
            await api.post('/health/habits', habitData);
            setShowAddModal(false);
            fetchHabitsAndLogs();
        } catch (e) {
            console.error(e);
        }
    };

    const handleEditHabit = async (habitData) => {
        try {
            await api.put(`/health/habits/${editingHabit._id}`, habitData);
            setEditingHabit(null);
            fetchHabitsAndLogs();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteHabit = async (habitId) => {
        if (!window.confirm('Archive this habit? It will be hidden from the tracker.')) return;
        try {
            await api.delete(`/health/habits/${habitId}`);
            fetchHabitsAndLogs();
        } catch (e) {
            console.error(e);
        }
    };

    const currentHabits = habits.filter(h => h.status !== 'ARCHIVED' && h.type === (viewType === 'Graph' ? 'Daily' : viewType));

    // Calendar & Chronological Pagination Generator
    const paginatedPeriods = useMemo(() => {
        let arr = [];
        if (viewType === 'Daily') {
            const daysInMonth = pageDate.daysInMonth();
            for (let i = daysInMonth; i >= 1; i--) {
                arr.push(pageDate.date(i));
            }
        } else if (viewType === 'Weekly') {
            let current = pageDate.endOf('year');
            for (let i = 0; i < 52; i++) {
                arr.push(current.subtract(i, 'week').startOf('week'));
            }
        } else if (viewType === 'Monthly') {
            for (let i = 11; i >= 0; i--) {
                arr.push(pageDate.month(i).startOf('month'));
            }
        } else if (viewType === 'Yearly') {
            let startYear = pageDate.year();
            for (let i = 0; i < 10; i++) {
                arr.push(pageDate.year(startYear - i).startOf('year'));
            }
        }
        // Strip any dates mathematically strictly after today to enforce clean 'Today' cutoff
        return arr.filter(d => !d.isAfter(dayjs(), 'day'));
    }, [viewType, pageDate]);

    // Data generation for Graph View
    const chartData = useMemo(() => {
        if (!showAnalytics) return [];
        let arr = [];
        const targetHabits = habits.filter(h => h.status !== 'ARCHIVED' && h.type === viewType);

        if (viewType === 'Daily') {
            for (let i = 0; i < 30; i++) {
                const dObj = dayjs().subtract(i, 'day');
                const dStr = dObj.format('YYYY-MM-DD');
                const dayName = dObj.format('dddd');
                let sched = 0;
                let done = 0;

                targetHabits.forEach(h => {
                    const isScheduled = (!h.frequency_days || h.frequency_days.length === 0 || h.frequency_days.includes(dayName));
                    if (isScheduled) {
                        sched++;
                        if (completedSet.has(`${h._id}_${dStr}`)) done++;
                    }
                });
                const pct = sched > 0 ? Math.round((done / sched) * 100) : 0;
                arr.push({ label: dObj.format('MMM D'), day: dObj.format('ddd'), pct, isToday: i === 0 });
            }
        }
        else if (viewType === 'Weekly') {
            // Last 12 weeks
            for (let i = 0; i < 12; i++) {
                const dObj = dayjs().subtract(i, 'week').startOf('week');
                const dStr = dObj.format('YYYY-MM-DD');
                let sched = targetHabits.length;
                let done = 0;
                targetHabits.forEach(h => { if (completedSet.has(`${h._id}_${dStr}`)) done++; });
                const pct = sched > 0 ? Math.round((done / sched) * 100) : 0;
                arr.push({ label: dObj.format('MMM D'), day: 'Week', pct, isToday: i === 0 });
            }
        }
        else if (viewType === 'Monthly') {
            // Last 12 months
            for (let i = 0; i < 12; i++) {
                const dObj = dayjs().subtract(i, 'month').startOf('month');
                const dStr = dObj.format('YYYY-MM-DD');
                let sched = targetHabits.length;
                let done = 0;
                targetHabits.forEach(h => { if (completedSet.has(`${h._id}_${dStr}`)) done++; });
                const pct = sched > 0 ? Math.round((done / sched) * 100) : 0;
                arr.push({ label: dObj.format('MMM YYYY'), day: dObj.format('YYYY'), pct, isToday: i === 0 });
            }
        }
        else {
            // Yearly - Last 7 Years
            for (let i = 0; i < 7; i++) {
                const dObj = dayjs().subtract(i, 'year').startOf('year');
                const dStr = dObj.format('YYYY-MM-DD');
                let sched = targetHabits.length;
                let done = 0;
                targetHabits.forEach(h => { if (completedSet.has(`${h._id}_${dStr}`)) done++; });
                const pct = sched > 0 ? Math.round((done / sched) * 100) : 0;
                arr.push({ label: dObj.format('YYYY'), day: 'Year', pct, isToday: i === 0 });
            }
        }

        return arr;
    }, [habits, completedSet, viewType, showAnalytics]);

    // Graph overall metric
    const avg30DayCompletion = chartData.length ? Math.round(chartData.reduce((acc, curr) => acc + curr.pct, 0) / chartData.length) : 0;

    const renderSecondaryHeader = () => {
        if (viewType === 'Daily') return 'Interval';
        if (viewType === 'Weekly') return 'Week Period';
        if (viewType === 'Monthly') return 'Monthly Node';
        return 'Yearly Period';
    };

    const habitStats = useMemo(() => {
        const stats = {};
        if (showAnalytics) return stats;

        currentHabits.forEach(h => {
            let totalEligible = 0;
            let totalChecked = 0;
            paginatedPeriods.forEach(dateObj => {
                const dateStr = dateObj.format('YYYY-MM-DD');
                if (dateObj.isAfter(dayjs(), 'day')) return; // ignore unused future

                const dayName = dateObj.format('dddd');
                let isScheduled = true;
                if (viewType === 'Daily') {
                    isScheduled = (!h.frequency_days || h.frequency_days.length === 0 || h.frequency_days.includes(dayName));
                }
                if (isScheduled) {
                    totalEligible++;
                    if (completedSet.has(`${h._id}_${dateStr}`)) totalChecked++;
                }
            });
            stats[h._id] = totalEligible > 0 ? ((totalChecked / totalEligible) * 100).toFixed(1) : "0.0";
        });
        return stats;
    }, [currentHabits, paginatedPeriods, completedSet, viewType]);

    const analytics = useMemo(() => {
        let currentStreak = 0; let perfectDays = 0; let eligibleDays = 0; let showUpDays = 0; let isStreakBroken = false;
        const dailyHabits = habits.filter(h => h.status !== 'ARCHIVED' && h.type === 'Daily');

        for (let i = 0; i < 30; i++) {
            const dObj = dayjs().subtract(i, 'day');
            const dStr = dObj.format('YYYY-MM-DD');
            const dayName = dObj.format('dddd');
            let dayScheduled = 0; let dayDone = 0;

            dailyHabits.forEach(h => {
                const isScheduled = (!h.frequency_days || h.frequency_days.length === 0 || h.frequency_days.includes(dayName));
                if (isScheduled) {
                    dayScheduled++;
                    if (completedSet.has(`${h._id}_${dStr}`)) dayDone++;
                }
            });

            if (dayScheduled > 0) {
                eligibleDays++;
                if (dayDone > 0) showUpDays++;
                if (dayDone === dayScheduled) perfectDays++;

                if (!isStreakBroken) {
                    if (dayDone > 0) currentStreak++;
                    else if (i !== 0) isStreakBroken = true;
                }
            }
        }
        const consistency = eligibleDays > 0 ? Math.round((showUpDays / eligibleDays) * 100) : 0;
        return { currentStreak, perfectDays, consistency };
    }, [habits, completedSet]);

    const todayEnergy = useMemo(() => {
        if (!habits.length) return 0;
        const todayStr = dayjs().format('YYYY-MM-DD');
        const todayName = dayjs().format('dddd');
        let sched = 0; let done = 0;
        habits.filter(h => h.status !== 'ARCHIVED' && h.type === 'Daily').forEach(h => {
            const isScheduled = (!h.frequency_days || h.frequency_days.length === 0 || h.frequency_days.includes(todayName));
            if (isScheduled) {
                sched++;
                if (completedSet.has(`${h._id}_${todayStr}`)) done++;
            }
        });
        return sched > 0 ? Math.round((done / sched) * 100) : 0;
    }, [habits, completedSet]);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSetView = (t) => {
        setViewType(t);
        setPageDate(dayjs()); // Snap to today when changing views
    };

    // Pager controls
    const getPagingUnit = () => {
        if (viewType === 'Daily') return 'month';
        return 'year';
    };

    const isFuturePage = () => {
        if (viewType === 'Yearly') return pageDate.year() >= dayjs().year();
        return pageDate.isSameOrAfter(dayjs(), getPagingUnit());
    };

    const getPagingLabel = () => {
        if (viewType === 'Daily') return pageDate.format('MMMM YYYY');
        if (viewType === 'Weekly' || viewType === 'Monthly') return pageDate.format('YYYY');
        return `${pageDate.year() - 9} - ${pageDate.year()}`;
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="super-health-page">
            <header className="page-header">
                <div className="header-left">
                    <div className="super-icon-wrap" style={{ position: 'relative' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0f172a', position: 'relative', zIndex: 2 }}>
                            <path d="M2 12h4l3-9 5 18 3-9h5" />
                        </svg>
                        <svg width="52" height="52" style={{ position: 'absolute', top: -2, left: -2, transform: 'rotate(-90deg)', pointerEvents: 'none' }}>
                            <circle cx="26" cy="26" r="24" stroke="#e2e8f0" strokeWidth="2.5" fill="none" />
                            <motion.circle
                                cx="26" cy="26" r="24"
                                stroke={todayEnergy === 100 ? "#10b981" : "#0ea5e9"}
                                strokeWidth="2.5"
                                fill="none"
                                strokeDasharray="151"
                                strokeDashoffset={151 - (151 * todayEnergy) / 100}
                                strokeLinecap="round"
                                initial={{ strokeDashoffset: 151 }}
                                animate={{ strokeDashoffset: 151 - (151 * todayEnergy) / 100 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                        </svg>
                    </div>
                    <div className="header-title-block">
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            Habit Tracker
                            {todayEnergy === 100 && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: '#10b981', display: 'flex' }}>
                                    <Zap size={18} fill="#10b981" />
                                </motion.span>
                            )}
                        </h1>
                        <p>{todayEnergy}% daily energy captured · {analytics.currentStreak} day streak</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-add-habit" onClick={() => setShowAddModal(true)}>
                        <Plus size={15} /> New Habit
                    </button>
                </div>
            </header>

            <div className="premium-widgets-row">
                <motion.div whileHover={{ y: -3 }} className="metric-card orange-tint">
                    <div className="metric-icon"><Flame size={20} /></div>
                    <div className="metric-info">
                        <span>Current Streak</span>
                        <h3>{analytics.currentStreak} <small>Days</small></h3>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -3 }} className="metric-card gold-tint">
                    <div className="metric-icon"><Trophy size={20} /></div>
                    <div className="metric-info">
                        <span>Perfect Days (30D)</span>
                        <h3>{analytics.perfectDays} <small>Days</small></h3>
                    </div>
                </motion.div>

                <motion.div whileHover={{ y: -3 }} className="metric-card blue-tint">
                    <div className="metric-icon"><Activity size={20} /></div>
                    <div className="metric-info">
                        <span>Consistency (30D)</span>
                        <h3>{analytics.consistency}<small>%</small></h3>
                    </div>
                </motion.div>
            </div>

            <div className="tab-group-container">
                {[
                    { id: 'Daily', label: 'Daily View', icon: <Target size={15} /> },
                    { id: 'Weekly', label: 'Weekly View', icon: <Calendar size={15} /> },
                    { id: 'Monthly', label: 'Monthly View', icon: <TableProperties size={15} /> },
                    { id: 'Yearly', label: 'Yearly View', icon: <Sigma size={15} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleSetView(tab.id)}
                        className={`tab-btn-luxury ${viewType === tab.id ? 'active' : ''}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {showAnalytics && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', marginBottom: '2rem' }}
                    >
                        <div className="glass-table-container graph-board-container" style={{ margin: 0 }}>
                            <div className="graph-header">
                                <div>
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        Performance Trajectory
                                    </h2>
                                    <p>Macro visualization of trailing aggregate success for {viewType} habits</p>
                                </div>
                                <div className="graph-stat">
                                    <h1>{avg30DayCompletion}%</h1>
                                    <span>{viewType === 'Daily' ? '30D' : viewType === 'Weekly' ? '12W' : viewType === 'Monthly' ? '12M' : '7Y'} AVERAGE</span>
                                </div>
                            </div>
                            <div className="chart-bars-wrap">
                                {chartData.map((d, i) => (
                                    <div key={i} className="chart-bar-group">
                                        <div className="chart-bar-bg">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${d.pct}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.02, type: "spring" }}
                                                className={`chart-fill ${d.pct === 100 ? 'perfect-fill' : ''}`}
                                            />
                                        </div>
                                        <span className="chart-label-day">{d.day}</span>
                                        {d.isToday && <span className="chart-label-today">Today</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="glass-table-container">
                {currentHabits.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state-container">
                        <Activity size={48} color="#cbd5e1" strokeWidth={1} />
                        <h3>No {viewType} Patterns Discovered</h3>
                        <p>Initialize your tracking grid by configuring a new {viewType.toLowerCase()} habit framework.</p>
                        <button onClick={() => setShowAddModal(true)}>
                            Initialize Definition
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {isMobile ? (
                            <div className="mobile-health-grid">
                                {paginatedPeriods.map((dateObj) => {
                                    const dateStr = dateObj.format('YYYY-MM-DD');
                                    const dayName = dateObj.format('dddd');
                                    let scheduledTotal = 0;
                                    let doneTotal = 0;

                                    const habitsForThisDate = currentHabits.map(h => {
                                        let isScheduled = true;
                                        if (viewType === 'Daily') {
                                            isScheduled = (!h.frequency_days || h.frequency_days.length === 0 || h.frequency_days.includes(dayName));
                                        }
                                        const isDone = completedSet.has(`${h._id}_${dateStr}`);
                                        if (isScheduled) {
                                            scheduledTotal++;
                                            if (isDone) doneTotal++;
                                        }
                                        return { ...h, isScheduled, isDone };
                                    });

                                    const progressPct = scheduledTotal > 0 ? Math.round((doneTotal / scheduledTotal) * 100) : 0;
                                    const isPerfect = progressPct === 100;
                                    const isToday = dateObj.isSame(dayjs(), 'day');

                                    return (
                                        <div key={dateStr} className={`mobile-date-card ${isToday ? 'is-today' : ''} ${isPerfect ? 'is-perfect' : ''}`}>
                                            <div className="card-header">
                                                <div className="date-info">
                                                    <span className="label">
                                                        {viewType === 'Daily' ? dayName : 
                                                         viewType === 'Weekly' ? `Week of ${dateObj.format('MMM D')}` :
                                                         viewType === 'Monthly' ? dateObj.format('MMMM YYYY') :
                                                         dateObj.format('YYYY')}
                                                    </span>
                                                    <span className="sub">
                                                        {viewType === 'Daily' ? dateObj.format('MMM D, YYYY') : ''}
                                                    </span>
                                                </div>
                                                <div className="progress-info">
                                                    <div className="premium-progress">
                                                        <span className="p-text" style={{ fontWeight: isPerfect ? 800 : 600, color: isPerfect ? '#10b981' : '#64748b' }}>
                                                            {progressPct}%
                                                        </span>
                                                        <div className="p-bar-bg" style={{ background: isPerfect ? 'rgba(16,185,129,0.1)' : '#f1f5f9' }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progressPct}%` }}
                                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                                                className={`p-bar-fill ${isPerfect ? 'perfect' : ''}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                {habitsForThisDate.filter(h => h.isScheduled).map(h => (
                                                    <div key={h._id} className="mobile-habit-row" onClick={() => handleToggle(h._id, dateStr)}>
                                                        <div className="habit-meta">
                                                            <div className={`habit-icon-circle ${h.isDone ? 'checked' : ''}`}>
                                                                <CheckSquare size={16} />
                                                            </div>
                                                            <div className="name-stack">
                                                                <span className="name">{h.name}</span>
                                                                {h.duration > 0 && (
                                                                    <span className="time"><Clock size={10} /> {h.duration} min</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className={`mobile-check-box ${h.isDone ? 'checked' : ''}`}>
                                                            {h.isDone && <Check size={18} strokeWidth={4} />}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="table-scroll">
                                <table className="super-table">
                                    <thead>
                                        <tr>
                                            <th className="col-date"><Calendar size={14} /> <span>{renderSecondaryHeader()}</span></th>
                                            {currentHabits.map(h => (
                                                <th key={h._id} className="col-habit">
                                                    <div className="th-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <CheckSquare size={14} style={{ marginRight: '0.4rem' }} />
                                                                <span>{h.name}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.3rem', opacity: 0.4, transition: 'opacity 0.2s' }} className="habit-actions">
                                                                <button
                                                                    onClick={() => setEditingHabit(h)}
                                                                    title="Edit habit"
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#0ea5e9', display: 'flex', alignItems: 'center' }}
                                                                >
                                                                    <Pencil size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteHabit(h._id)}
                                                                    title="Archive habit"
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#f43f5e', display: 'flex', alignItems: 'center' }}
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {h.duration > 0 && (
                                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: '1.25rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                                                                <Clock size={10} /> {h.duration} MINS
                                                            </div>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                            <th className="col-progress"><Sigma size={14} /> <span>Calculated Target Score</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {paginatedPeriods.map((dateObj) => {
                                                const dateStr = dateObj.format('YYYY-MM-DD');
                                                let label1, label2;
                                                const dayName = dateObj.format('dddd');
                                                const isFuture = false;

                                                if (viewType === 'Daily') {
                                                    label1 = dayName;
                                                    label2 = dateObj.format('MMM D, YYYY');
                                                } else if (viewType === 'Weekly') {
                                                    label1 = dateObj.format('MMM D');
                                                    label2 = `${dateObj.format('MMM D')} - ${dateObj.endOf('week').format('MMM D')}`;
                                                } else if (viewType === 'Monthly') {
                                                    label1 = dateObj.format('MMMM');
                                                    label2 = dateObj.format('YYYY');
                                                } else {
                                                    label1 = dateObj.format('YYYY');
                                                    label2 = 'All Year interval';
                                                }

                                                let scheduledTotal = 0;
                                                let doneTotal = 0;

                                                const habitCells = currentHabits.map(h => {
                                                    let isScheduled = true;
                                                    if (viewType === 'Daily') {
                                                        isScheduled = (!h.frequency_days || h.frequency_days.length === 0 || h.frequency_days.includes(dayName));
                                                    }
                                                    const isDone = completedSet.has(`${h._id}_${dateStr}`);

                                                    if (isScheduled && !isFuture) {
                                                        scheduledTotal++;
                                                        if (isDone) doneTotal++;
                                                    }

                                                    return (
                                                        <td key={h._id} className="cell-habit">
                                                            {isScheduled ? (
                                                                <motion.div
                                                                    whileTap={!isFuture ? { scale: 0.85 } : {}}
                                                                    className={`super-checkbox ${isDone ? 'checked' : ''} ${isFuture ? 'disabled' : ''}`}
                                                                    onClick={() => !isFuture && handleToggle(h._id, dateStr)}
                                                                >
                                                                    <AnimatePresence>
                                                                        {isDone && (
                                                                            <motion.div
                                                                                initial={{ scale: 0 }}
                                                                                animate={{ scale: 1 }}
                                                                                exit={{ scale: 0 }}
                                                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                                            >
                                                                                <Check size={14} strokeWidth={4} />
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </motion.div>
                                                            ) : (
                                                                <div className="super-checkbox disabled"></div>
                                                            )}
                                                        </td>
                                                    );
                                                });

                                                const progressPct = (!isFuture && scheduledTotal > 0) ? Math.round((doneTotal / scheduledTotal) * 100) : null;
                                                const isPerfect = progressPct === 100;

                                                return (
                                                    <motion.tr
                                                        key={dateStr}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className={`${dateObj.isSame(dayjs(), 'day') ? 'is-today' : ''} ${isPerfect ? 'is-perfect' : ''}`}
                                                    >
                                                        <td className="cell-date">
                                                            <div className="day-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                    {dateObj.isSame(dayjs(), 'day') && <div className="today-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 8px rgba(14,165,233,0.5)' }}></div>}
                                                                    <strong style={{ color: isPerfect ? '#10b981' : (isFuture ? '#cbd5e1' : '#0f172a'), fontWeight: 600, transition: '0.3s' }}>{label1}</strong>
                                                                </div>
                                                                <span style={{ fontSize: '0.75rem', color: isFuture ? '#e2e8f0' : '#64748b', fontWeight: 500, letterSpacing: '0.02em', marginLeft: dateObj.isSame(dayjs(), 'day') ? '12px' : '0' }}>{label2}</span>
                                                            </div>
                                                        </td>

                                                        {habitCells}

                                                        <td className="cell-progress">
                                                            {progressPct !== null ? (
                                                                <div className="premium-progress">
                                                                    <span className="p-text" style={{ fontWeight: isPerfect ? 800 : 600, color: isPerfect ? '#10b981' : '#64748b' }}>
                                                                        {progressPct}%
                                                                    </span>
                                                                    <div className="p-bar-bg" style={{ background: isPerfect ? 'rgba(16,185,129,0.1)' : '#f1f5f9' }}>
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${progressPct}%` }}
                                                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                                                            className={`p-bar-fill ${isPerfect ? 'perfect' : ''}`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 500 }}>{isFuture ? 'Future Timeline' : ''}</div>
                                                            )}
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </tbody>

                                    {currentHabits.length > 0 && paginatedPeriods.length > 0 && (
                                        <tfoot>
                                            <tr>
                                                <td className="footer-count"><span>COUNT {paginatedPeriods.length}</span></td>
                                                {currentHabits.map(h => (
                                                    <td key={h._id} className="footer-stat">
                                                        <span>AVG {habitStats[h._id]}%</span>
                                                    </td>
                                                ))}
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}


                        {/* Calendar Chronological Navigation */}
                        <div className="chrono-pagination">
                            <button onClick={() => setPageDate(p => p.subtract(viewType === 'Yearly' ? 10 : 1, getPagingUnit()))}>
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <div className="chrono-label">
                                {getPagingLabel()}
                            </div>
                            <button onClick={() => setPageDate(p => p.add(viewType === 'Yearly' ? 10 : 1, getPagingUnit()))} disabled={isFuturePage()}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <BaseDialog open={showAddModal} onClose={() => setShowAddModal(false)} title="Configure New Habit">
                <HealthHabitForm
                    onSubmit={handleAddHabit}
                    onCancel={() => setShowAddModal(false)}
                />
            </BaseDialog>

            <BaseDialog open={!!editingHabit} onClose={() => setEditingHabit(null)} title="Edit Habit">
                <HealthHabitForm
                    initialHabit={editingHabit}
                    onSubmit={handleEditHabit}
                    onCancel={() => setEditingHabit(null)}
                />
            </BaseDialog>
        </motion.div>
    );
}
