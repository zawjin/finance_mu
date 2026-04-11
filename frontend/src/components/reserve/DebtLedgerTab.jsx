import React from 'react';
import { Box, Typography, Stack, Select, MenuItem, TextField, InputAdornment, IconButton, Chip } from '@mui/material';
import { Handshake, Search, Filter, TrendingDown, TrendingUp, Sparkles, PieChart, Briefcase, Replace, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

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
    return (
        <div style={{ paddingBottom: '5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="glass-effect" style={{ padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255,59,48,0.1)', background: 'rgba(255,59,48,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                        <TrendingDown size={18} color="#ff3b30" />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#ff3b30', opacity: 0.8 }}>TOTAL LIABILITIES</Typography>
                    </div>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#1d1d1f' }}>{formatCurrency(debtStats.liabilities)}</Typography>
                </div>
                <div className="glass-effect" style={{ padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(52,199,89,0.1)', background: 'rgba(52,199,89,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                        <TrendingUp size={18} color="#34c759" />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#34c759', opacity: 0.8 }}>TOTAL RECEIVABLES</Typography>
                    </div>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#1d1d1f' }}>{formatCurrency(debtStats.receivables)}</Typography>
                </div>
                <div className="glass-effect" style={{ padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(0,113,227,0.1)', background: 'rgba(0,113,227,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                        <Sparkles size={18} color="#0071e3" />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#0071e3', opacity: 0.8 }}>NET DEBT POSITION</Typography>
                    </div>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#1d1d1f' }}>{formatCurrency(debtStats.net)}</Typography>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '24px', padding: '1.25rem', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#86868b', zIndex: 1 }} />
                    <input
                        className="filter-search-input"
                        placeholder="Search by person or memo..."
                        value={debtSearch}
                        onChange={e => setDebtSearch(e.target.value)}
                        style={{ paddingLeft: '3rem', borderRadius: '16px' }}
                    />
                </div>
                <Select
                    size="small"
                    value={debtFilterType}
                    onChange={e => setDebtFilterType(e.target.value)}
                    sx={{ borderRadius: '14px', minWidth: '160px', fontWeight: 800, fontSize: '0.8rem' }}
                >
                    <MenuItem value="ALL">ALL LEDGERS</MenuItem>
                    <MenuItem value="RECEIVABLE">RECEIVABLES</MenuItem>
                    <MenuItem value="LIABILITY">LIABILITIES</MenuItem>
                </Select>
            </div>

            <div className="data-table-premium scroll-y-luxury">
                <div className="date-group">
                    <div className="date-header-luxury">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Handshake size={14} color="#1d1d1f" />
                            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>DEBT LEDGER</span>
                        </div>
                    </div>
                    <div className="investment-items-luxury">
                        {filteredDebt.map(item => (
                            <div key={item._id} className="transaction-row-fancy" style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.direction === 'OWED_TO_ME' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)', color: item.direction === 'OWED_TO_ME' ? '#34c759' : '#ff3b30', display: 'grid', placeItems: 'center', flexShrink: 0, marginRight: '1rem' }}>
                                    {item.direction === 'OWED_TO_ME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Typography sx={{ fontWeight: 900, color: '#1d1d1f', fontSize: '1rem' }}>{item.person}</Typography>
                                        <Chip label={item.direction === 'OWED_TO_ME' ? 'RECEIVABLE' : 'LIABILITY'} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900, bgcolor: item.direction === 'OWED_TO_ME' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)', color: item.direction === 'OWED_TO_ME' ? '#34c759' : '#ff3b30' }} />
                                    </div>
                                    <Typography sx={{ color: '#86868b', fontSize: '0.75rem', fontWeight: 800 }}>{item.description || 'No memo'}</Typography>
                                </div>
                                <div style={{ textAlign: 'right', marginRight: '2rem' }}>
                                    <Typography sx={{ fontWeight: 900, color: '#1d1d1f', fontSize: '1.1rem' }}>{formatCurrency(item.amount)}</Typography>
                                    <Typography sx={{ color: '#86868b', fontSize: '0.7rem', fontWeight: 900 }}>{item.date}</Typography>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(0,0,0,0.05)', paddingLeft: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Select
                                        size="small"
                                        value={item.status}
                                        onChange={(e) => onDebtStatusUpdate(item, e.target.value)}
                                        sx={{ height: '32px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, minWidth: '100px' }}
                                    >
                                        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                        <MenuItem value="PARTIAL">PARTIAL</MenuItem>
                                        <MenuItem value="SETTLED">SETTLED</MenuItem>
                                    </Select>
                                    <IconButton size="small" onClick={() => onEditDebt(item)} sx={{ color: '#1d1d1f' }}><Replace size={16} /></IconButton>
                                    <IconButton size="small" onClick={() => setDeleteConfirmDebt(item)} sx={{ color: '#ff3b30' }}><Trash2 size={16} /></IconButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
