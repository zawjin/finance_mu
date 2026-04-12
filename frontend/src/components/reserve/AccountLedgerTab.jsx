import React from 'react';
import { Box, Typography, Skeleton, Button, IconButton } from '@mui/material';
import { Landmark, Banknote, Wallet, Activity, Edit2, Trash2, Calendar, CreditCard, ArrowRightLeft, TrendingUp, TrendingDown, History, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function AccountLedgerTab({ reserves, loading, spending, totalBank, totalCash, totalWallet, onEdit, onDelete, onAddFunds, onPayBill, onDeleteTransaction }) {
    const getTypeStyle = (type) => {
        if (type === 'BANK') return { className: 'type-style-bank', icon: <Landmark size={18} /> };
        if (type === 'WALLET') return { className: 'type-style-wallet', icon: <Wallet size={18} /> };
        if (type === 'CREDIT_CARD') return { className: 'type-style-red', icon: <CreditCard size={18} /> };
        return { className: 'type-style-cash', icon: <Banknote size={18} /> };
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
        <div className="ledger-pill-scroll-wrap">
            <div className="ledger-pill-scroll">
                <div className="apple-category-pill glass-effect min-w-180">
                    <div className="pill-icon-box type-style-bank"><Landmark size={18} /></div>
                    <div className="pill-info-box">
                        <span className="pill-cat-label">BANK</span>
                        <span className="pill-amt-val color-blue">{formatCurrency(totalBank)}</span>
                    </div>
                </div>
                <div className="apple-category-pill glass-effect min-w-180">
                    <div className="pill-icon-box type-style-cash"><Banknote size={18} /></div>
                    <div className="pill-info-box">
                        <span className="pill-cat-label">CASH</span>
                        <span className="pill-amt-val color-amber">{formatCurrency(totalCash)}</span>
                    </div>
                </div>
                <div className="apple-category-pill glass-effect min-w-180">
                    <div className="pill-icon-box type-style-wallet"><Wallet size={18} /></div>
                    <div className="pill-info-box">
                        <span className="pill-cat-label">WALLETS</span>
                        <span className="pill-amt-val color-green">{formatCurrency(totalWallet)}</span>
                    </div>
                </div>
            </div>
        </div>

            <div className="spending-split-layout margin-b-25">
                <div className="spending-main-content grid-col-all">
                    <div className="data-table-premium scroll-y-luxury">
                        {loading ? (
                            <Skeleton variant="rectangular" width="100%" height={200} className="radius-28" />
                        ) : (
                            <div className="date-group">
                                <div className="date-header-luxury">
                                    <div className="flex-center-gap-1">
                                        <Activity size={14} color="#1d1d1f" />
                                        <span className="ledger-portal-label">ACCOUNT LEDGER PORTALS</span>
                                    </div>
                                </div>
                                <div className="investment-items-luxury">
                                    {(reserves || []).map(r => {
                                        const style = getTypeStyle(r.account_type);
                                        return (
                                            <div key={r._id} className="margin-b-15">
                                                {/* Main Account Card */}
                                                <div className="transaction-row-fancy account-card-glass">
                                                    <div className={`account-icon-box ${style.className}`}>
                                                        {style.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`account-name-row ${r.account_type === 'CREDIT_CARD' ? 'margin-b-02' : 'margin-b-0'}`}>
                                                            <span className="account-main-name">{r.account_name}</span>
                                                            <div className="flex-gap-04">
                                                                <span className={`account-type-badge ${style.className}`}>{r.account_type}</span>
                                                                {r.account_type === 'CREDIT_CARD' && (
                                                                    <div className={`due-date-badge ${(() => {
                                                                            const rawDue = r.due_date;
                                                                            if (!rawDue) return 'due-faint';
                                                                            const today = new Date().getDate();
                                                                            const due = typeof rawDue === 'string' ? parseInt(rawDue) : rawDue;
                                                                            let diff = due - today;
                                                                            if (diff < 0) {
                                                                                const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                                                                                diff = daysInMonth - today + due;
                                                                            }
                                                                            return diff <= 5 ? 'due-urgent' : 'due-normal';
                                                                        })()}`}>
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
                                                            <div className="account-progress-track">
                                                                <div 
                                                                    className="account-progress-fill"
                                                                    style={{ 
                                                                        width: `${Math.min(100, (r.balance / r.credit_limit) * 100)}%`, 
                                                                        backgroundColor: (r.balance / r.credit_limit) > 0.7 ? '#ff3b30' : '#6366f1'
                                                                    }} 
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="account-actions-col">
                                                        <div className="account-val-stack">
                                                            <Typography className="account-main-val">{formatCurrency(r.balance)}</Typography>
                                                            {r.account_type === 'CREDIT_CARD' && (
                                                                <span className="account-avail-label">
                                                                    AVAIL: {formatCurrency((r.credit_limit || 0) - (r.balance || 0))}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-gap-05">
                                                            {r.account_type === 'CREDIT_CARD' ? (
                                                                <Button 
                                                                    size="small" variant="contained" 
                                                                    onClick={() => onPayBill(r)}
                                                                    startIcon={<CreditCard size={14} />}
                                                                    className="btn-pay-bill-small"
                                                                >PAY BILL</Button>
                                                            ) : (
                                                                <Button 
                                                                    size="small" variant="contained" 
                                                                    onClick={() => onAddFunds(r)}
                                                                    startIcon={<Plus size={14} />}
                                                                    className="btn-add-money-small"
                                                                >ADD MONEY</Button>
                                                            )}
                                                            <IconButton size="small" onClick={() => onEdit(r)} className="bg-faint-grey"><Edit2 size={13} /></IconButton>
                                                            <IconButton size="small" onClick={() => onDelete(r)} className="bg-faint-red"><Trash2 size={13} /></IconButton>
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
            <div className="spending-split-layout margin-t-1">
                <div className="spending-main-content grid-col-all">
                    <div className="ledger-activity-card">
                        <div className="ledger-activity-header">
                            <div className="ledger-activity-title">
                                <History size={18} color="#6366f1" />
                                <span className="ledger-activity-text">CONSOLIDATED LEDGER ACTIVITY</span>
                            </div>
                            <div className="ledger-activity-divider" />
                            <span className="ledger-activity-meta">TOP-UPS & BILL SETTLEMENTS</span>
                        </div>

                        <div className="flex-col-gap-02">
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
                                        <div className="ledger-empty-msg">
                                            No high-value ledger movements detected.
                                        </div>
                                    );
                                }

                                return unifiedHistory.map((item) => {
                                    const sourceAcc = reserves.find(r => r._id === item.payment_source_id);
                                    const targetAcc = reserves.find(r => r._id === item.target_account_id);
                                    return (
                                        <div key={item._id} className="transaction-row-fancy ledger-activity-row">
                                            <div className={`ledger-activity-icon-box ${item.amount < 0 ? 'bg-green-soft' : 'bg-red-soft'}`}>
                                                {item.amount < 0 ? <TrendingUp size={16} color="#34c759" /> : <TrendingDown size={16} color="#ff3b30" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="ledger-activity-desc">{item.description}</div>
                                                <div className="ledger-activity-meta-row">
                                                    <span className="ledger-activity-date">{new Date(item.date).toLocaleDateString()}</span>
                                                    {sourceAcc && (
                                                        <>
                                                            <div className="ledger-activity-dot" />
                                                            <span className="ledger-activity-from">FROM: {sourceAcc.account_name}</span>
                                                        </>
                                                    )}
                                                    {targetAcc && (
                                                        <>
                                                            <div className="ledger-activity-dot" />
                                                            <span className="ledger-activity-to">TO: {targetAcc.account_name}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ledger-activity-actions">
                                                <div className="text-right">
                                                    <div className={`ledger-activity-amt ${item.amount < 0 ? 'color-green' : 'color-red'}`}>
                                                        {item.amount < 0 ? '+' : '-'}{formatCurrency(Math.abs(item.amount))}
                                                    </div>
                                                    <div className="ledger-activity-type">
                                                        {item.amount < 0 ? 'Top-Up' : (item.category === 'Transfer' ? 'Movement' : 'Settlement')}
                                                    </div>
                                                </div>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => onDeleteTransaction(item)}
                                                    className="btn-delete-activity"
                                                >
                                                    <Trash2 size={13} />
                                                </IconButton>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="ledger-spacer" />
        </>
    );
}
