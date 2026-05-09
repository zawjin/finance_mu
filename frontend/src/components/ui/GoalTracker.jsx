import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Target, Plus, Trash2, Calendar, 
    TrendingUp, CheckCircle2, ChevronRight, X, Sparkles
} from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';
import dayjs from 'dayjs';
import './GoalTracker.scss';

export default function GoalTracker() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', deadline: '', current_amount: 0 });
    const [topUpAmount, setTopUpAmount] = useState('');
    const [activeTopUp, setActiveTopUp] = useState(null);

    useEffect(() => { fetchGoals(); }, []);

    const fetchGoals = async () => {
        try { const res = await api.get('/goals'); setGoals(res.data); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!newGoal.name || !newGoal.target_amount) return;
        const payload = { ...newGoal, target_amount: parseFloat(newGoal.target_amount), current_amount: parseFloat(newGoal.current_amount || 0) };
        
        if (editingGoal) {
            await api.put(`/goals/${editingGoal._id}`, payload);
        } else {
            await api.post('/goals', payload);
        }
        
        resetModal();
        fetchGoals();
    };

    const resetModal = () => {
        setNewGoal({ name: '', target_amount: '', deadline: '', current_amount: 0 });
        setEditingGoal(null);
        setShowModal(false);
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setNewGoal({
            name: goal.name,
            target_amount: goal.target_amount,
            deadline: goal.deadline,
            current_amount: goal.current_amount
        });
        setShowModal(true);
    };

    const handleTopUp = async (goal) => {
        if (!topUpAmount) return;
        const updatedAmount = parseFloat(goal.current_amount) + parseFloat(topUpAmount);
        await api.put(`/goals/${goal._id}`, { ...goal, current_amount: updatedAmount });
        setTopUpAmount('');
        setActiveTopUp(null);
        fetchGoals();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            await api.delete(`/goals/${id}`);
            fetchGoals();
        }
    };

    if (loading) return <div className="goal-tracker-loading">Initializing Goal Vision...</div>;

    return (
        <div className="goal-tracker-premium">
            <div className="gt-header">
                <div className="gt-title">
                    <Target size={18} color="#6366f1" />
                    <span>FINANCIAL GOALS</span>
                </div>
                <button className="btn-add-goal" onClick={() => { resetModal(); setShowModal(true); }}>
                    <Plus size={14} /> NEW GOAL
                </button>
            </div>

            <div className="goals-grid">
                {goals.length === 0 ? (
                    <div className="goals-empty">
                        <Sparkles size={32} color="#e2e8f0" />
                        <p>No goals set yet. Define your future targets!</p>
                    </div>
                ) : (
                    goals.map(goal => {
                        const pct = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
                        const daysLeft = dayjs(goal.deadline).diff(dayjs(), 'day');
                        const isTopUp = activeTopUp === goal._id;
                        
                        return (
                            <motion.div layout key={goal._id} className="goal-card-v2">
                                <div className="gc-top">
                                    <div className="gc-info" onClick={() => handleEdit(goal)} style={{ cursor: 'pointer' }}>
                                        <div className="gc-name">{goal.name}</div>
                                        <div className="gc-deadline">
                                            <Calendar size={10} />
                                            <span>{dayjs(goal.deadline).format('MMM YYYY')} ({daysLeft > 0 ? `${daysLeft} days` : 'Overdue'})</span>
                                        </div>
                                    </div>
                                    <div className="gc-actions">
                                        <button className="gc-btn edit" onClick={() => handleEdit(goal)}><Plus size={12} style={{ transform: 'rotate(45deg)' }} /></button>
                                        <button className="gc-btn del" onClick={() => handleDelete(goal._id)}><Trash2 size={12} /></button>
                                    </div>
                                </div>

                                <div className="gc-progress-wrap">
                                    <div className="gc-progress-bar">
                                        <motion.div 
                                            initial={{ width: 0 }} 
                                            animate={{ width: `${pct}%` }} 
                                            className="gc-fill" 
                                            style={{ background: pct >= 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                                        />
                                    </div>
                                    <div className="gc-pct" style={{ color: pct >= 100 ? '#10b981' : '#6366f1' }}>{Math.round(pct)}%</div>
                                </div>

                                <div className="gc-bottom">
                                    <div className="gc-stat">
                                        <span className="lbl">SAVED</span>
                                        <span className="val">{formatCurrency(goal.current_amount)}</span>
                                    </div>
                                    <div className="gc-stat right">
                                        <span className="lbl">TARGET</span>
                                        <span className="val">{formatCurrency(goal.target_amount)}</span>
                                    </div>
                                </div>

                                <div className="gc-topup-section">
                                    {isTopUp ? (
                                        <div className="topup-input-wrap fade-in">
                                            <input 
                                                autoFocus
                                                type="number" 
                                                placeholder="Add Amount" 
                                                value={topUpAmount} 
                                                onChange={e => setTopUpAmount(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleTopUp(goal)}
                                            />
                                            <button className="btn-confirm-up" onClick={() => handleTopUp(goal)}>ADD</button>
                                            <button className="btn-cancel-up" onClick={() => setActiveTopUp(null)}><X size={12} /></button>
                                        </div>
                                    ) : (
                                        <button className="btn-topup-trigger" onClick={() => setActiveTopUp(goal._id)}>
                                            <TrendingUp size={12} /> ADD FUNDS
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Goal Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="gt-modal-overlay" onClick={resetModal}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0 }}
                            className="gt-modal" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <span>{editingGoal ? 'Update Financial Goal' : 'Create Financial Goal'}</span>
                                <button onClick={resetModal}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <label>GOAL NAME</label>
                                <input type="text" placeholder="e.g. Dream House" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} />
                                
                                <label>TARGET AMOUNT (₹)</label>
                                <input type="number" placeholder="5,000,000" value={newGoal.target_amount} onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})} />

                                <label>CURRENT SAVINGS (₹)</label>
                                <input type="number" placeholder="500,000" value={newGoal.current_amount} onChange={e => setNewGoal({...newGoal, current_amount: e.target.value})} />

                                <label>DEADLINE</label>
                                <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
                            </div>
                            <div className="modal-footer">
                                <button className="btn-save-goal" onClick={handleSave}>
                                    {editingGoal ? 'UPDATE GOAL' : 'INITIALIZE GOAL'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
