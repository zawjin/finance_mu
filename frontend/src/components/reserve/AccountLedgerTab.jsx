import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { Landmark, Banknote, Wallet, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function AccountLedgerTab({ reserves, loading, totalBank, totalCash, totalWallet }) {
    const getTypeStyle = (type) => {
        if (type === 'BANK') return { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', icon: <Landmark size={18} color="#6366f1" /> };
        if (type === 'WALLET') return { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: <Wallet size={18} color="#10b981" /> };
        return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: <Banknote size={18} color="#f59e0b" /> };
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

            <div className="spending-split-layout" style={{ marginBottom: '4rem' }}>
                <div className="spending-main-content" style={{ gridColumn: '1 / -1' }}>
                    <div className="data-table-premium scroll-y-luxury">
                        {loading ? (
                            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '28px' }} />
                        ) : (
                            <div className="date-group">
                                <div className="date-header-luxury">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Activity size={14} color="#1d1d1f" />
                                        <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>ACCOUNT LEDGER</span>
                                    </div>
                                </div>
                                <div className="investment-items-luxury">
                                    {(reserves || []).map(r => {
                                        const style = getTypeStyle(r.account_type);
                                        return (
                                            <div key={r._id} className="transaction-row-fancy" style={{ padding: '1.2rem 1.5rem' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: style.bg, display: 'grid', placeItems: 'center', flexShrink: 0, marginRight: '1rem' }}>
                                                    {style.icon}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                        <span style={{ fontWeight: 800, color: '#1d1d1f', fontSize: '1rem' }}>{r.account_name}</span>
                                                        <span style={{ px: 1, py: 0.2, fontSize: '0.6rem', fontWeight: 900, background: style.bg, color: style.color, borderRadius: '4px' }}>{r.account_type}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <Typography style={{ fontWeight: 900, color: '#1d1d1f', fontSize: '1.1rem' }}>{formatCurrency(r.balance)}</Typography>
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
        </>
    );
}
