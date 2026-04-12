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
        <div className="debt-ledger-viewport">
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

            <div className="debt-filter-bar">
                <div className="debt-search-wrap">
                    <Search size={18} className="debt-search-icon" />
                    <input
                        className="filter-search-input debt-search-input"
                        placeholder="Search by person or memo..."
                        value={debtSearch}
                        onChange={e => setDebtSearch(e.target.value)}
                    />
                </div>
                <Select
                    size="small"
                    value={debtFilterType}
                    onChange={e => setDebtFilterType(e.target.value)}
                    className="debt-filter-select"
                >
                    <MenuItem value="ALL">ALL LEDGERS</MenuItem>
                    <MenuItem value="RECEIVABLE">RECEIVABLES</MenuItem>
                    <MenuItem value="LIABILITY">LIABILITIES</MenuItem>
                </Select>
            </div>

            <div className="data-table-premium scroll-y-luxury">
                <div className="date-group">
                    <div className="date-header-luxury">
                        <div className="flex-center-gap-1">
                            <Handshake size={14} color="#1d1d1f" />
                            <span className="ledger-portal-label">DEBT LEDGER</span>
                        </div>
                    </div>
                    <div className="investment-items-luxury">
                        {filteredDebt.map(item => (
                            <div key={item._id} className="transaction-row-fancy debt-item-row">
                                <div className={`debt-item-icon-box ${item.direction === 'OWED_TO_ME' ? 'bg-green-soft color-green' : 'bg-red-soft color-red'}`}>
                                    {item.direction === 'OWED_TO_ME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </div>
                                <div className="flex-1">
                                    <div className="debt-item-name-row">
                                        <Typography className="debt-person-name">{item.person}</Typography>
                                        <Chip 
                                            label={item.direction === 'OWED_TO_ME' ? 'RECEIVABLE' : 'LIABILITY'} 
                                            size="small" 
                                            className={`debt-type-chip ${item.direction === 'OWED_TO_ME' ? 'chip-green' : 'chip-red'}`} 
                                        />
                                    </div>
                                    <Typography className="debt-item-desc">{item.description || 'No memo'}</Typography>
                                </div>
                                <div className="debt-item-amt-col">
                                    <Typography className="debt-item-amt">{formatCurrency(item.amount)}</Typography>
                                    <Typography className="debt-item-date">{item.date}</Typography>
                                </div>
                                <div className="debt-item-actions">
                                    <Select
                                        size="small"
                                        value={item.status}
                                        onChange={(e) => onDebtStatusUpdate(item, e.target.value)}
                                        className="debt-status-select"
                                    >
                                        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                        <MenuItem value="PARTIAL">PARTIAL</MenuItem>
                                        <MenuItem value="SETTLED">SETTLED</MenuItem>
                                    </Select>
                                    <IconButton size="small" onClick={() => onEditDebt(item)} className="color-dark"><Replace size={16} /></IconButton>
                                    <IconButton size="small" onClick={() => setDeleteConfirmDebt(item)} className="color-red"><Trash2 size={16} /></IconButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
