import React, { useState } from 'react';
import { Typography, IconButton, Dialog, DialogContent } from '@mui/material';
import { TrendingDown, TrendingUp, Sparkles, Replace, Trash2, X, IndianRupee, History } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const STATUSES = [
    { value: 'ACTIVE', label: 'Active', color: '#2563eb', bg: '#eff6ff' },
    { value: 'PARTIAL', label: 'Partial', color: '#d97706', bg: '#fffbeb' },
    { value: 'SETTLED', label: 'Settled', color: '#16a34a', bg: '#f0fdf4' },
];

// ─── Partial Payment Modal ────────────────────────────────────────────────────
function PartialModal({ item, open, onClose, onSave }) {
    const [paidAmt, setPaidAmt] = useState('');
    if (!item) return null;

    const total = item.amount || 0;
    const alreadyPaid = item.partial_amount || 0;
    const payNow = parseFloat(paidAmt) || 0;
    const balance = Math.max(0, total - alreadyPaid - payNow);
    const isReceivable = item.direction === 'OWED_TO_ME';

    const handleSave = () => {
        if (!paidAmt || payNow <= 0) return;
        onSave(item, payNow);
        setPaidAmt('');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ style: { borderRadius: 20, overflow: 'hidden', margin: 16 } }}
        >
            <div className="partial-modal-root">
                {/* Header */}
                <div className="partial-modal-header">
                    <div>
                        <p className="partial-modal-title">Partial Payment</p>
                        <p className="partial-modal-sub">{item.person}</p>
                    </div>
                    <IconButton size="small" onClick={onClose} className="partial-close-btn">
                        <X size={16} />
                    </IconButton>
                </div>

                {/* Summary Row */}
                <div className="partial-summary-row">
                    <div className="partial-sum-card partial-sum-total">
                        <span className="pscard-label">Total Amount</span>
                        <span className="pscard-val">{formatCurrency(total)}</span>
                    </div>
                    {alreadyPaid > 0 && (
                        <div className="partial-sum-card partial-sum-paid">
                            <span className="pscard-label">Already Paid</span>
                            <span className="pscard-val">{formatCurrency(alreadyPaid)}</span>
                        </div>
                    )}
                    <div className="partial-sum-card partial-sum-balance">
                        <span className="pscard-label">Balance Due</span>
                        <span className="pscard-val pscard-balance">{formatCurrency(total - alreadyPaid)}</span>
                    </div>
                </div>

                {/* Pay Now Input */}
                <div className="partial-input-section">
                    <label className="partial-input-label">How much to pay now?</label>
                    <div className="partial-input-wrap">
                        <span className="partial-rupee">₹</span>
                        <input
                            className="partial-amount-input"
                            type="number"
                            placeholder="0.00"
                            value={paidAmt}
                            onChange={e => setPaidAmt(e.target.value)}
                        />
                    </div>

                    {/* Live balance preview */}
                    {payNow > 0 && (
                        <div className="partial-live-preview">
                            <span className="plp-label">Remaining after this payment</span>
                            <span className={`plp-val ${balance === 0 ? 'plp-cleared' : ''}`}>
                                {balance === 0 ? '✓ Fully Cleared' : formatCurrency(balance)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="partial-modal-actions">
                    <button className="partial-cancel-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="partial-save-btn"
                        onClick={handleSave}
                        disabled={!paidAmt || payNow <= 0}
                    >
                        <IndianRupee size={13} /> Record Payment
                    </button>
                </div>
            </div>
        </Dialog>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DebtLedgerTab({
    debtSearch,
    setDebtSearch,
    debtFilterType,
    setDebtFilterType,
    debtStats,
    filteredDebt,
    onEditDebt,
    onDebtStatusUpdate,
    setDeleteConfirmDebt
}) {
    const [partialItem, setPartialItem] = useState(null);

    const handleStatusClick = (item, newStatus) => {
        if (newStatus === 'PARTIAL') {
            setPartialItem(item);
        } else {
            onDebtStatusUpdate(item, newStatus);
        }
    };

    const handlePartialSave = (item, payNow) => {
        const alreadyPaid = item.partial_amount || 0;
        const newTotal = alreadyPaid + payNow;
        onDebtStatusUpdate(item, 'PARTIAL', newTotal);
        setPartialItem(null);
    };

    return (
        <div className="debt-ledger-viewport">
            {/* ── Stats Row ── */}
            <div className="debt-stats-grid">
                <div className="debt-stat-card card-red">
                    <div className="debt-stat-header">
                        <TrendingDown size={18} />
                        <Typography variant="caption" className="debt-stat-label">TOTAL LIABILITIES</Typography>
                    </div>
                    <Typography variant="h5" className="debt-stat-val">{formatCurrency(debtStats.liabilities)}</Typography>
                </div>
                <div className="debt-stat-card card-green">
                    <div className="debt-stat-header">
                        <TrendingUp size={18} />
                        <Typography variant="caption" className="debt-stat-label">TOTAL RECEIVABLES</Typography>
                    </div>
                    <Typography variant="h5" className="debt-stat-val">{formatCurrency(debtStats.receivables)}</Typography>
                </div>
                <div className="debt-stat-card card-blue">
                    <div className="debt-stat-header">
                        <Sparkles size={18} />
                        <Typography variant="caption" className="debt-stat-label">NET DEBT POSITION</Typography>
                    </div>
                    <Typography variant="h5" className="debt-stat-val">{formatCurrency(debtStats.net)}</Typography>
                </div>
            </div>

            {/* ── Debt Cards ── */}
            <div className="debt-cards-list">
                {filteredDebt.length === 0 ? (
                    <div className="ledger-empty-msg">No debt records found.</div>
                ) : (
                    ['ACTIVE', 'PARTIAL', 'SETTLED'].map(status => {
                        const items = filteredDebt.filter(i => i.status === (status === 'ACTIVE' && !i.status ? 'ACTIVE' : status));
                        if (items.length === 0) return null;

                        return (
                            <>

                                {items.map(item => {
                                    const isReceivable = item.direction === 'OWED_TO_ME';
                                    const statusClass = item.status === 'SETTLED' ? 'ds-settled' : item.status === 'PARTIAL' ? 'ds-partial' : 'ds-active';

                                    const themeClass = item.status === 'SETTLED' ? 'theme-card-wallet' : item.status === 'PARTIAL' ? 'theme-card-cash' : 'theme-card-bank';

                                    return (
                                        <div key={item._id} className={`acct-card-mobile ${themeClass}`}>
                                            {/* TOP ROW */}
                                            <div className="acct-top-row">
                                                <div className={`account-icon-box ${isReceivable ? 'debt-icon-green' : 'debt-icon-red'}`}>
                                                    {isReceivable ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                                </div>
                                                <div className="acct-info">
                                                    <span className="account-main-name">{item.person}</span>
                                                    <div className="acct-badge-row">
                                                        <span className={`account-type-badge ${isReceivable ? 'debt-badge-green' : 'debt-badge-red'}`}>
                                                            {isReceivable ? 'RECEIVABLE' : 'LIABILITY'}
                                                        </span>
                                                        <span className={`debt-status-inline ${statusClass}`} style={{
                                                            background: STATUSES.find(s => s.value === item.status)?.bg,
                                                            color: STATUSES.find(s => s.value === item.status)?.color
                                                        }}>
                                                            {item.status || 'ACTIVE'}
                                                        </span>
                                                    </div>
                                                    {item.description && (
                                                        <span className="debt-memo-text">{item.description}</span>
                                                    )}
                                                </div>
                                                <div className="acct-balance">
                                                    {item.partial_amount > 0 ? (
                                                        <>
                                                            <span className={`account-main-val ${isReceivable ? 'debt-val-green' : 'debt-val-red'}`}>
                                                                {formatCurrency(item.amount - item.partial_amount)}
                                                            </span>
                                                            <span className="account-avail-label" style={{ color: '#d97706' }}>
                                                                Paid {formatCurrency(item.partial_amount)}
                                                            </span>
                                                            <span className="account-avail-label">
                                                                of {formatCurrency(item.amount)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className={`account-main-val ${isReceivable ? 'debt-val-green' : 'debt-val-red'}`}>
                                                            {formatCurrency(item.amount)}
                                                        </span>
                                                    )}
                                                    <span className="account-avail-label">{item.date}</span>
                                                </div>
                                            </div>

                                            {/* STATUS RADIO PILLS */}
                                            <div className="debt-radio-row" style={{
                                                background: status === 'ACTIVE' ? 'rgba(99, 102, 241, 0.12)' :
                                                    status === 'PARTIAL' ? 'rgba(245, 158, 11, 0.12)' :
                                                        'rgba(16, 185, 129, 0.12)'
                                            }}>
                                                {STATUSES.map(s => (
                                                    <button
                                                        key={s.value}
                                                        className={`debt-radio-pill ${item.status === s.value ? 'dpill-active' : ''}`}
                                                        style={item.status === s.value ? { background: '#ffffff', color: s.color, borderColor: s.color } : {}}
                                                        onClick={() => handleStatusClick(item, s.value)}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* BOTTOM ACTION STRIP */}
                                            <div className="acct-action-strip">
                                                <span className="debt-action-label">Actions</span>
                                                <div className="acct-icon-btns">
                                                    <IconButton size="small" onClick={() => onEditDebt(item)} className="bg-faint-grey">
                                                        <Replace size={13} />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => setDeleteConfirmDebt(item)} className="bg-faint-red">
                                                        <Trash2 size={13} />
                                                    </IconButton>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        );
                    })
                )}
            </div>

            {/* UNIFIED DEBT ACTIVITY LOG - SEPARATE CARD AT THE BOTTOM */}
            <div className="spending-split-layout margin-t-1">
                <div className="spending-main-content grid-col-all">
                    <div className="ledger-activity-card">
                        <div className="ledger-activity-header">
                            <div className="ledger-activity-title">
                                <History size={18} color="#d97706" />
                                <span className="ledger-activity-text">CONSOLIDATED PARTIAL PAYMENTS</span>
                            </div>
                            <div className="ledger-activity-divider" />
                            <span className="ledger-activity-meta">RECENT RECOVERIES & PAYMENTS</span>
                        </div>

                        <div className="flex-col-gap-02">
                            {(() => {
                                const unifiedHistory = [];
                                (filteredDebt || []).forEach(item => {
                                    if (item.payments && item.payments.length > 0) {
                                        item.payments.forEach(p => {
                                            unifiedHistory.push({ ...p, person: item.person, direction: item.direction });
                                        });
                                    }
                                });
                                unifiedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

                                if (unifiedHistory.length === 0) {
                                    return (
                                        <div className="ledger-empty-msg">
                                            No partial payments recorded yet.
                                        </div>
                                    );
                                }

                                return unifiedHistory.map((p, idx) => {
                                    const isReceivable = p.direction === 'OWED_TO_ME';
                                    return (
                                        <div key={idx} className="transaction-row-fancy ledger-activity-row">
                                            <div className={`ledger-activity-icon-box ${isReceivable ? 'bg-green-soft' : 'bg-red-soft'}`}>
                                                {isReceivable ? <TrendingUp size={16} color="#34c759" /> : <TrendingDown size={16} color="#ff3b30" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="ledger-activity-desc">{p.note || 'Partial Payment'}</div>
                                                <div className="ledger-activity-meta-row">
                                                    <span className="ledger-activity-date">{new Date(p.date).toLocaleDateString()}</span>
                                                    <div className="ledger-activity-dot" />
                                                    <span className="ledger-activity-to">PERSON: {p.person}</span>
                                                    <div className="ledger-activity-dot" />
                                                    <span className="ledger-activity-from">BALANCE: {p.balance === 0 ? 'Cleared' : `₹${p.balance?.toLocaleString('en-IN')}`}</span>
                                                </div>
                                            </div>
                                            <div className="ledger-activity-actions">
                                                <div className="text-right">
                                                    <div className={`ledger-activity-amt ${isReceivable ? 'color-green' : 'color-red'}`}>
                                                        {isReceivable ? '+' : '-'}₹{p.amount?.toLocaleString('en-IN')}
                                                    </div>
                                                    <div className="ledger-activity-type">
                                                        {isReceivable ? 'Recovery' : 'Paid'}
                                                    </div>
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

            {/* ── Partial Payment Modal ── */}
            <PartialModal
                item={partialItem}
                open={!!partialItem}
                onClose={() => setPartialItem(null)}
                onSave={handlePartialSave}
            />
        </div>
    );
}
