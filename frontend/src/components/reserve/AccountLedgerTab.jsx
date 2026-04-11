import React from 'react';
import { Box, Typography, Skeleton, Button, IconButton } from '@mui/material';
import { Landmark, Banknote, Wallet, Activity, Edit2, Trash2, Calendar, CreditCard, ArrowRightLeft, TrendingUp, TrendingDown, History, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function AccountLedgerTab({ reserves, loading, spending, totalBank, totalCash, totalWallet, onEdit, onDelete, onAddFunds, onPayBill }) {
    const getTypeStyle = (type) => {
        if (type === 'BANK') return { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', icon: <Landmark size={18} color="#6366f1" /> };
        if (type === 'WALLET') return { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: <Wallet size={18} color="#10b981" /> };
        if (type === 'CREDIT_CARD') return { bg: 'rgba(255,59,48,0.12)', color: '#ff3b30', icon: <CreditCard size={18} color="#ff3b30" /> };
        return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: <Banknote size={18} color="#f59e0b" /> };
    };

    // Filter accounting history per account (Top-ups and Bill Pays only)
    const getAccountHistory = (accountId) => {
        if (!spending) return [];
        return spending.filter(s => 
            (s.payment_source_id === accountId || s.target_account_id === accountId) &&
            (s.amount < 0 || s.category === 'Transfer' || s.category === 'Investment Settlement' || s.category === 'Credit Bill')
        ).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    };

    return (
        <>
            <div style={{ width: '100%', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', padding: '0.5rem 0', scrollbarWidth: 'none' }}>
                    <div className="apple-category-pill glass-effect" style={{ minWidth: '180px' }}>
                        <div className="pill-icon-box" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}><Landmark size={18} /></div>
                        <div className="pill-info-box">
                            <span className="pill-cat-label">BANK</span>
                            <span className="pill-amt-val" style={{ color: '#6366f1' }}>{formatCurrency(totalBank)}</span>
                        </div>
                    </div>
                    <div className="apple-category-pill glass-effect" style={{ minWidth: '180px' }}>
                        <div className="pill-icon-box" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><Banknote size={18} /></div>
                        <div className="pill-info-box">
                            <span className="pill-cat-label">CASH</span>
                            <span className="pill-amt-val" style={{ color: '#f59e0b' }}>{formatCurrency(totalCash)}</span>
                        </div>
                    </div>
                    <div className="apple-category-pill glass-effect" style={{ minWidth: '180px' }}>
                        <div className="pill-icon-box" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><Wallet size={18} /></div>
                        <div className="pill-info-box">
                            <span className="pill-cat-label">WALLETS</span>
                            <span className="pill-amt-val" style={{ color: '#10b981' }}>{formatCurrency(totalWallet)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="spending-split-layout" style={{ marginBottom: '2.5rem' }}>
                <div className="spending-main-content" style={{ gridColumn: '1 / -1' }}>
                    <div className="data-table-premium scroll-y-luxury">
                        {loading ? (
                            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '28px' }} />
                        ) : (
                            <div className="date-group">
                                <div className="date-header-luxury">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Activity size={14} color="#1d1d1f" />
                                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>ACCOUNT LEDGER PORTALS</span>
                                    </div>
                                </div>
                                <div className="investment-items-luxury">
                                    {(reserves || []).map(r => {
                                        const style = getTypeStyle(r.account_type);
                                        return (
                                            <div key={r._id} style={{ marginBottom: '1.5rem' }}>
                                                {/* Main Account Card */}
                                                <div className="transaction-row-fancy" style={{ 
                                                    padding: '1.2rem 1.5rem', 
                                                    borderRadius: '20px',
                                                    background: 'rgba(255,255,255,0.7)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255,255,255,0.5)',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
                                                }}>
                                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: style.bg, display: 'grid', placeItems: 'center', flexShrink: 0, marginRight: '1rem' }}>
                                                        {style.icon}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: r.account_type === 'CREDIT_CARD' ? '0.2rem' : '0' }}>
                                                            <span style={{ fontWeight: 800, color: '#1d1d1f', fontSize: '1.05rem' }}>{r.account_name}</span>
                                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                                <span style={{ px: 1, py: 0.2, fontSize: '0.62rem', fontWeight: 900, background: style.bg, color: style.color, borderRadius: '4px', textTransform: 'uppercase' }}>{r.account_type}</span>
                                                                {r.account_type === 'CREDIT_CARD' && (
                                                                    <div style={{ 
                                                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                                        padding: '0.2rem 0.5rem',
                                                                        fontSize: '0.65rem', fontWeight: 900,
                                                                        borderRadius: '5px',
                                                                        background: (() => {
                                                                            const rawDue = r.due_date;
                                                                            if (!rawDue) return 'rgba(0,0,0,0.04)';
                                                                            const today = new Date().getDate();
                                                                            const due = typeof rawDue === 'string' ? parseInt(rawDue) : rawDue;
                                                                            let diff = due - today;
                                                                            if (diff < 0) {
                                                                                const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                                                                                diff = daysInMonth - today + due;
                                                                            }
                                                                            return diff <= 5 ? 'rgba(255,59,48,0.1)' : 'rgba(99,102,241,0.08)';
                                                                        })(),
                                                                        color: (() => {
                                                                            const rawDue = r.due_date;
                                                                            if (!rawDue) return '#86868b';
                                                                            const today = new Date().getDate();
                                                                            const due = typeof rawDue === 'string' ? parseInt(rawDue) : rawDue;
                                                                            let diff = due - today;
                                                                            if (diff < 0) {
                                                                                const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                                                                                diff = daysInMonth - today + due;
                                                                            }
                                                                            return diff <= 5 ? '#ff3b30' : '#6366f1';
                                                                        })()
                                                                    }}>
                                                                        <Calendar size={11} fill="currentColor" opacity={0.4} />
                                                                        {(() => {
                                                                            const rawDue = r.due_date;
                                                                            if (!rawDue) return 'SET DUE DATE';
                                                                            const today = new Date().getDate();
                                                                            const due = typeof rawDue === 'string' ? parseInt(rawDue) : rawDue;
                                                                            let diff = due - today;
                                                                            if (diff < 0) {
                                                                                const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                                                                                diff = daysInMonth - today + due;
                                                                            }
                                                                            return diff === 0 ? 'Deduct Today' : `${diff} DAYS LEFT`;
                                                                        })()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* PROGRESS BAR */}
                                                        {r.account_type === 'CREDIT_CARD' && (r.credit_limit || 0) > 0 && (
                                                            <div style={{ width: '90%', height: '8px', background: 'rgba(0,0,0,0.04)', borderRadius: '10px', overflow: 'hidden', position: 'relative', marginTop: '0.4rem' }}>
                                                                <div style={{ 
                                                                    width: `${Math.min(100, (r.balance / r.credit_limit) * 100)}%`, 
                                                                    height: '100%', 
                                                                    background: (r.balance / r.credit_limit) > 0.7 ? '#ff3b30' : '#6366f1'
                                                                }} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                            <Typography style={{ fontWeight: 900, color: '#1d1d1f', fontSize: '1.15rem' }}>{formatCurrency(r.balance)}</Typography>
                                                            {r.account_type === 'CREDIT_CARD' && (
                                                                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#86868b' }}>
                                                                    AVAIL: {formatCurrency((r.credit_limit || 0) - (r.balance || 0))}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            {r.account_type === 'CREDIT_CARD' ? (
                                                                <Button 
                                                                    size="small" variant="contained" 
                                                                    onClick={() => onPayBill(r)}
                                                                    startIcon={<CreditCard size={14} />}
                                                                    sx={{ fontSize: '0.65rem', fontWeight: 900, borderRadius: '8px', bgcolor: '#ff3b30', height: '32px' }}
                                                                >PAY BILL</Button>
                                                            ) : (
                                                                <Button 
                                                                    size="small" variant="contained" 
                                                                    onClick={() => onAddFunds(r)}
                                                                    startIcon={<Plus size={14} />}
                                                                    sx={{ fontSize: '0.65rem', fontWeight: 900, borderRadius: '8px', bgcolor: '#34c759', height: '32px' }}
                                                                >ADD MONEY</Button>
                                                            )}
                                                            <IconButton size="small" onClick={() => onEdit(r)} sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}><Edit2 size={13} /></IconButton>
                                                            <IconButton size="small" onClick={() => onDelete(r)} sx={{ bgcolor: 'rgba(255,59,48,0.03)', color: '#ff3b30' }}><Trash2 size={13} /></IconButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* UNIFIED ACCOUNT ACTIVITY LOG - SEPARATE CARD AT THE BOTTOM */}
            <div className="spending-split-layout" style={{ marginTop: '1rem' }}>
                <div className="spending-main-content" style={{ gridColumn: '1 / -1' }}>
                    <div className="data-table-premium" style={{ 
                        borderRadius: '28px', 
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', px: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <History size={18} color="#6366f1" />
                                <span style={{ fontWeight: 900, fontSize: '1rem', color: '#1d1d1f' }}>CONSOLIDATED LEDGER ACTIVITY</span>
                            </div>
                            <div style={{ height: '1px', flex: 1, background: 'rgba(0,0,0,0.04)', margin: '0 1.5rem' }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TOP-UPS & BILL SETTLEMENTS</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            {(() => {
                                const unifiedHistory = (spending || [])
                                    .filter(s => 
                                        reserves.some(r => r._id === s.payment_source_id || r._id === s.target_account_id) &&
                                        (s.amount < 0 || s.category === 'Transfer' || s.category === 'Investment Settlement' || s.category === 'Credit Bill')
                                    )
                                    .sort((a, b) => b.date.localeCompare(a.date))
                                    .slice(0, 15);

                                if (unifiedHistory.length === 0) {
                                    return (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: '#86868b', fontWeight: 800 }}>
                                            No high-value ledger movements detected.
                                        </div>
                                    );
                                }

                                return unifiedHistory.map((item) => {
                                    const sourceAcc = reserves.find(r => r._id === item.payment_source_id);
                                    const targetAcc = reserves.find(r => r._id === item.target_account_id);
                                    return (
                                        <div key={item._id} className="transaction-row-fancy" style={{ padding: '1rem 1.2rem', background: 'transparent', borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                                            <div style={{ 
                                                width: '38px', height: '38px', borderRadius: '12px', 
                                                background: item.amount < 0 ? 'rgba(52,199,89,0.08)' : 'rgba(255,59,48,0.08)',
                                                display: 'grid', placeItems: 'center', flexShrink: 0, marginRight: '1rem'
                                            }}>
                                                {item.amount < 0 ? <TrendingUp size={16} color="#34c759" /> : <TrendingDown size={16} color="#ff3b30" />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 800, color: '#1d1d1f', fontSize: '0.92rem' }}>{item.description}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#86868b' }}>{new Date(item.date).toLocaleDateString()}</span>
                                                    {sourceAcc && (
                                                        <>
                                                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#d1d1d6' }} />
                                                            <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#6366f1' }}>FROM: {sourceAcc.account_name}</span>
                                                        </>
                                                    )}
                                                    {targetAcc && (
                                                        <>
                                                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#d1d1d6' }} />
                                                            <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#34c759' }}>TO: {targetAcc.account_name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 950, color: item.amount < 0 ? '#34c759' : '#ff3b30', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                                                    {item.amount < 0 ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
                                                </div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {item.amount < 0 ? 'Top-Up' : (item.category === 'Transfer' ? 'Movement' : 'Settlement')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ height: '4rem' }} />
        </>
    );
}
