import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import {
    Plus, Edit2, Trash2, ShieldCheck, AlertCircle,
    TrendingDown, Flame, Zap, X, CheckCircle2
} from 'lucide-react';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';
import { formatCurrency } from '../utils/formatters';
import './BudgetPage.scss';

const PRESET_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#84cc16'
];

const CATEGORY_EMOJIS = {
    'Food': '🍔', 'Travel': '✈️', 'Shopping': '🛍️', 'Utilities': '⚡',
    'Health': '🏥', 'Entertainment': '🎬', 'Education': '📚',
    'Office': '💼', 'Rent': '🏠', 'Other': '💰', 'Personal': '👤'
};

function BudgetFormModal({ open, onClose, onSave, categories, initialData }) {
    const [form, setForm] = useState({ category: '', monthly_limit: '', color: '#6366f1' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) setForm({ category: initialData.category, monthly_limit: initialData.monthly_limit, color: initialData.color || '#6366f1' });
        else setForm({ category: categories[0]?.name || '', monthly_limit: '', color: '#6366f1' });
    }, [initialData, open]);

    const handleSave = async () => {
        if (!form.category || !form.monthly_limit) return;
        setSaving(true);
        try { await onSave({ ...form, monthly_limit: parseFloat(form.monthly_limit) }); onClose(); }
        finally { setSaving(false); }
    };

    if (!open) return null;
    return (
        <div className="budget-modal-overlay" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="budget-modal"
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <span>{initialData ? 'Edit Envelope' : 'New Budget Envelope'}</span>
                    <button onClick={onClose}><X size={18} /></button>
                </div>
                <div className="modal-body">
                    <label className="field-label">CATEGORY</label>
                    <select className="field-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                        {categories.map(c => <option key={c.name || c} value={c.name || c}>{c.name || c}</option>)}
                    </select>

                    <label className="field-label">MONTHLY LIMIT (₹)</label>
                    <input className="field-input" type="number" placeholder="e.g. 5000" value={form.monthly_limit} onChange={e => setForm({ ...form, monthly_limit: e.target.value })} />

                    <label className="field-label">COLOR</label>
                    <div className="color-grid">
                        {PRESET_COLORS.map(c => (
                            <div key={c} className={`color-dot ${form.color === c ? 'active' : ''}`}
                                style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Envelope'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function BudgetPage() {
    const dispatch = useDispatch();
    const { spending, categories: allCategories } = useSelector(s => s.finance);

    const [budgets, setBudgets] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const categories = useMemo(() => allCategories?.length > 0 ? allCategories : [
        { name: 'Food' }, { name: 'Travel' }, { name: 'Shopping' }, { name: 'Utilities' },
        { name: 'Health' }, { name: 'Entertainment' }, { name: 'Office' }, { name: 'Personal' }
    ], [allCategories]);

    const currentMonth = dayjs().format('YYYY-MM');

    useEffect(() => { fetchBudgets(); }, []);

    const fetchBudgets = async () => {
        try { const res = await api.get('/budgets'); setBudgets(res.data); }
        catch (e) { console.error(e); }
    };

    // Calculate this month's spend per category
    const monthlySpend = useMemo(() => {
        const map = {};
        (spending || []).filter(s => (s.date || '').startsWith(currentMonth)).forEach(s => {
            const cat = s.category || 'Other';
            map[cat] = (map[cat] || 0) + (parseFloat(s.amount) - parseFloat(s.recovered || 0));
        });
        return map;
    }, [spending, currentMonth]);

    // Overall budget stats
    const stats = useMemo(() => {
        const totalLimit = budgets.reduce((s, b) => s + b.monthly_limit, 0);
        const totalSpent = budgets.reduce((s, b) => s + (monthlySpend[b.category] || 0), 0);
        const overBudget = budgets.filter(b => (monthlySpend[b.category] || 0) > b.monthly_limit).length;
        return { totalLimit, totalSpent, overBudget, savings: Math.max(0, totalLimit - totalSpent) };
    }, [budgets, monthlySpend]);

    const handleSave = async (data) => {
        if (editItem) {
            await api.put(`/budgets/${editItem._id}`, data);
        } else {
            await api.post('/budgets', data);
        }
        await fetchBudgets();
        dispatch(fetchFinanceData());
        setEditItem(null);
    };

    const handleDelete = async (id) => {
        await api.delete(`/budgets/${id}`);
        setDeletingId(null);
        await fetchBudgets();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="budget-page">

            {/* Header */}
            <div className="budget-page-header">
                <div className="header-left">
                    <div className="header-title">Budget Envelopes</div>
                    <div className="header-sub">{dayjs().format('MMMM YYYY')} · {budgets.length} envelopes active</div>
                </div>
                <button className="btn-new-envelope" onClick={() => { setEditItem(null); setModalOpen(true); }}>
                    <Plus size={16} /> New Envelope
                </button>
            </div>

            {/* KPI Row */}
            <div className="budget-kpi-row">
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}><Zap size={18} /></div>
                    <div className="kpi-body">
                        <div className="kpi-val">{formatCurrency(stats.totalLimit)}</div>
                        <div className="kpi-lbl">Total Budget</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><TrendingDown size={18} /></div>
                    <div className="kpi-body">
                        <div className="kpi-val">{formatCurrency(stats.totalSpent)}</div>
                        <div className="kpi-lbl">Spent This Month</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><CheckCircle2 size={18} /></div>
                    <div className="kpi-body">
                        <div className="kpi-val">{formatCurrency(stats.savings)}</div>
                        <div className="kpi-lbl">Remaining</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><Flame size={18} /></div>
                    <div className="kpi-body">
                        <div className="kpi-val">{stats.overBudget}</div>
                        <div className="kpi-lbl">Over Budget</div>
                    </div>
                </div>
            </div>

            {/* Envelope Cards */}
            {budgets.length === 0 ? (
                <div className="budget-empty">
                    <AlertCircle size={48} color="#e2e8f0" />
                    <p>No budget envelopes yet.<br />Create your first one to start tracking spending by category.</p>
                    <button className="btn-new-envelope" onClick={() => setModalOpen(true)}><Plus size={16} /> Create Envelope</button>
                </div>
            ) : (
                <div className="envelope-grid">
                    {budgets.map(b => {
                        const spent = monthlySpend[b.category] || 0;
                        const pct = Math.min(100, (spent / b.monthly_limit) * 100);
                        const isOver = spent > b.monthly_limit;
                        const isWarning = pct > 75 && !isOver;
                        const remaining = b.monthly_limit - spent;
                        const emoji = CATEGORY_EMOJIS[b.category] || '💡';
                        const statusColor = isOver ? '#ef4444' : isWarning ? '#f59e0b' : b.color;

                        return (
                            <motion.div
                                key={b._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`envelope-card ${isOver ? 'over-budget' : ''}`}
                                style={{ '--accent': b.color }}
                            >
                                <div className="env-top">
                                    <div className="env-icon">{emoji}</div>
                                    <div className="env-info">
                                        <div className="env-name">{b.category}</div>
                                        <div className="env-limit">Limit: {formatCurrency(b.monthly_limit)}</div>
                                    </div>
                                    <div className="env-actions">
                                        <button onClick={() => { setEditItem(b); setModalOpen(true); }}><Edit2 size={13} /></button>
                                        <button onClick={() => setDeletingId(b._id)} className="del"><Trash2 size={13} /></button>
                                    </div>
                                </div>

                                <div className="env-progress-wrap">
                                    <div className="env-progress-bar">
                                        <div className="env-progress-fill"
                                            style={{ width: `${pct}%`, background: statusColor }} />
                                    </div>
                                    <div className="env-pct-label" style={{ color: statusColor }}>{Math.round(pct)}%</div>
                                </div>

                                <div className="env-bottom">
                                    <div className="env-stat">
                                        <span className="stat-label">SPENT</span>
                                        <span className="stat-val" style={{ color: isOver ? '#ef4444' : '#1d1d1f' }}>{formatCurrency(spent)}</span>
                                    </div>
                                    <div className="env-stat right">
                                        <span className="stat-label">LEFT</span>
                                        <span className="stat-val" style={{ color: isOver ? '#ef4444' : '#10b981' }}>
                                            {isOver ? `-${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
                                        </span>
                                    </div>
                                </div>

                                {isOver && (
                                    <div className="env-alert">
                                        <Flame size={11} /> Over by {formatCurrency(Math.abs(remaining))} this month!
                                    </div>
                                )}
                                {isWarning && (
                                    <div className="env-alert warning">
                                        <AlertCircle size={11} /> Over 75% used. Slow down!
                                    </div>
                                )}
                                {!isOver && !isWarning && pct > 0 && (
                                    <div className="env-alert ok">
                                        <ShieldCheck size={11} /> On track this month.
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Delete confirm */}
            <AnimatePresence>
                {deletingId && (
                    <div className="budget-modal-overlay" onClick={() => setDeletingId(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="budget-modal small" onClick={e => e.stopPropagation()}>
                            <div className="modal-header"><span>Remove Envelope?</span></div>
                            <div className="modal-body"><p style={{ color: '#64748b', fontSize: '0.85rem' }}>This will permanently remove the budget limit for this category.</p></div>
                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={() => setDeletingId(null)}>Keep It</button>
                                <button className="btn-delete" onClick={() => handleDelete(deletingId)}>Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalOpen && (
                    <BudgetFormModal
                        open={modalOpen}
                        onClose={() => { setModalOpen(false); setEditItem(null); }}
                        onSave={handleSave}
                        categories={categories}
                        initialData={editItem}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
