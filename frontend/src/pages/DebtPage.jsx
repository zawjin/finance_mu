import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Calendar, Filter, Handshake, Users, TrendingUp,
    TrendingDown, Plus, Trash2, Edit2, AlertCircle, CheckCircle2,
    Clock, Activity, ArrowUpRight, ArrowDownRight, ChevronRight,
    User, DollarSign, CalendarDays
} from 'lucide-react';
import {
    Box, Typography, Button, IconButton, Grid,
    Skeleton, Table, TableBody, TableCell, TableHead,
    TableRow, Chip, Dialog, Grow, TextField, InputAdornment
} from '@mui/material';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';
import './DebtPage.scss';

export default function DebtPage({ onEdit }) {
    const dispatch = useDispatch();
    const { debt, loading } = useSelector(state => state.finance);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, RECEIVABLE, LIABILITY
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

    const filteredDebt = useMemo(() => {
        return debt.filter(item => {
            const matchesSearch = item.person.toLowerCase().includes(search.toLowerCase()) ||
                item.description?.toLowerCase().includes(search.toLowerCase());
            const matchesType = filterType === 'ALL' ||
                (filterType === 'RECEIVABLE' && item.direction === 'OWED_TO_ME') ||
                (filterType === 'LIABILITY' && item.direction === 'I_OWE');
            return matchesSearch && matchesType;
        });
    }, [debt, search, filterType]);

    const stats = useMemo(() => {
        let receivables = 0;
        let liabilities = 0;
        filteredDebt.forEach(item => {
            if (item.status === 'SETTLED') return;
            if (item.direction === 'OWED_TO_ME') receivables += item.amount;
            else liabilities += item.amount;
        });
        return { receivables, liabilities, net: receivables - liabilities };
    }, [filteredDebt]);

    const handleRemove = async () => {
        if (!deleteConfirmItem) return;
        try {
            await api.delete(`/debt/${deleteConfirmItem._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmItem(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusUpdate = async (item, newStatus) => {
        try {
            await api.put(`/debt/${item._id}`, { ...item, status: newStatus });
            dispatch(fetchFinanceData());
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container-super">

            {/* NET EXPOSURE GAUGE - Responsive Fluid Grid */}
            <div className="stats-grid">
                <div className="stat-card-exposure">
                    <div className="bg-icon-watermark"><TrendingUp size={160} /></div>
                    <Typography className="exposure-label-positive"><ArrowUpRight size={14} /> TOTAL RECEIVABLES</Typography>
                    <Typography className="exposure-value-text">{formatCurrency(stats.receivables)}</Typography>
                    <Typography className="exposure-helper-text">Money owed to you by others</Typography>
                </div>

                <div className="stat-card-exposure">
                    <div className="bg-icon-watermark"><TrendingDown size={160} /></div>
                    <Typography className="exposure-label-negative"><ArrowDownRight size={14} /> TOTAL LIABILITIES</Typography>
                    <Typography className="exposure-value-text">{formatCurrency(stats.liabilities)}</Typography>
                    <Typography className="exposure-helper-text">Money you owe to others</Typography>
                </div>

                <div className={`stat-card-net ${stats.net >= 0 ? 'positive' : 'negative'}`}>
                    <div className="bg-icon-watermark"><Activity size={160} /></div>
                    <Typography className="net-label-premium"><Handshake size={14} /> NET POSITION</Typography>
                    <Typography className="net-value-text">{formatCurrency(stats.net)}</Typography>
                    <Typography className="net-helper-text">{stats.net >= 0 ? "You are a net lender" : "You have net debt"}</Typography>
                </div>
            </div>

            <div className="spending-split-layout">
                {/* FILTERS SIDEBAR */}
                <div className="filters-sidebar-card glass-effect">
                    <div className="sidebar-header-flex">
                        <div className="filter-icon-box">
                            <Filter size={15} fill="white" />
                        </div>
                        <span className="sidebar-title-text">Symmetrizer Filters</span>
                    </div>

                    <div className="filter-section-block">
                        <div className="filter-section-label"><span>SEARCH PEOPLE</span></div>
                        <div className="search-input-wrap">
                            <Search size={15} className="search-icon-pos" />
                            <input className="filter-search-input pl-2-75" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, description..." />
                        </div>
                    </div>

                    <div className="filter-section-block margin-t-2">
                        <div className="filter-section-label"><span>EXPOSURE TYPE</span></div>
                        <div className="category-filter-grid grid-1-col">
                            <div className={`cat-filter-chip ${filterType === 'ALL' ? 'active' : ''}`} onClick={() => setFilterType('ALL')}>All exposure</div>
                            <div className={`cat-filter-chip receivable-chip ${filterType === 'RECEIVABLE' ? 'active' : ''}`} onClick={() => setFilterType('RECEIVABLE')}>Receivables (Owed to me)</div>
                            <div className={`cat-filter-chip liability-chip ${filterType === 'LIABILITY' ? 'active' : ''}`} onClick={() => setFilterType('LIABILITY')}>Liabilities (I owe)</div>
                        </div>
                    </div>
                </div>

                {/* LEDGER TABLE */}
                <div className="ledger-content-hub">
                    <Box className="glass-effect main-table-container">
                        <div className="table-header-premium">
                            <Typography className="table-header-title">TRANSACTION LEDGER</Typography>
                            <Typography className="table-header-meta">Showing {filteredDebt.length} events</Typography>
                        </div>

                        <Table className="min-w-900">
                            <TableHead className="table-head-premium">
                                <TableRow>
                                    <TableCell className="th-cell cell-pl-5">PERSON / ENTITY</TableCell>
                                    <TableCell className="th-cell">TYPE</TableCell>
                                    <TableCell className="th-cell">AMOUNT</TableCell>
                                    <TableCell className="th-cell">STATUS</TableCell>
                                    <TableCell className="th-cell">DUE DATE</TableCell>
                                    <TableCell className="th-cell text-right cell-pr-5">ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <AnimatePresence>
                                    {filteredDebt.map((item) => (
                                        <TableRow key={item._id} component={motion.tr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`table-row-premium ${item.status === 'SETTLED' ? 'settled' : ''}`}>
                                            <TableCell className="td-cell cell-pl-5 cell-py-2-5">
                                                <div className="debt-person-cell">
                                                    <div className="debt-icon-box">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <Typography className="person-name-text">{item.person}</Typography>
                                                        <Typography className="person-desc-text">{item.description || "Personal Exposure"}</Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.direction === 'OWED_TO_ME' ? 'RECEIVABLE' : 'LIABILITY'}
                                                    size="small"
                                                    className={`type-chip ${item.direction === 'OWED_TO_ME' ? 'receivable' : 'liability'}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography className={`amount-text ${item.status === 'SETTLED' ? 'settled' : (item.direction === 'OWED_TO_ME' ? 'positive' : 'negative')}`}>
                                                    {formatCurrency(item.amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.status}
                                                    size="small"
                                                    icon={item.status === 'SETTLED' ? <CheckCircle2 size={12} /> : (item.status === 'ACTIVE' ? <Activity size={12} /> : <Clock size={12} />)}
                                                    className={`status-chip ${item.status.toLowerCase()}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography className="due-date-text">
                                                    <CalendarDays size={12} /> {item.dueDate ? dayjs(item.dueDate).format('MMM DD, YYYY') : "No deadline"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell className="td-cell cell-pr-5 text-right">
                                                <div className="ledger-action-cluster">
                                                    {item.status !== 'SETTLED' && (
                                                        <IconButton size="small" onClick={() => handleStatusUpdate(item, 'SETTLED')} className="btn-action-settle">
                                                            <CheckCircle2 size={16} />
                                                        </IconButton>
                                                    )}
                                                    <IconButton size="small" onClick={() => onEdit(item)} className="btn-action-edit">
                                                        <Edit2 size={16} />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => setDeleteConfirmItem(item)} className="btn-action-delete">
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>

                        {filteredDebt.length === 0 && (
                            <Box className="empty-ledger-box">
                                <AlertCircle size={48} className="empty-ledger-icon" />
                                <Typography className="empty-ledger-text">No exposure found in your ledger.</Typography>
                            </Box>
                        )}
                    </Box>
                </div>
            </div>

            {/* DELETE CONFIRMATION */}
            <Dialog open={!!deleteConfirmItem} onClose={() => setDeleteConfirmItem(null)} TransitionComponent={Grow}>
                {deleteConfirmItem && (
                    <Box className="dialog-purge-wrap">
                        <div className="dialog-purge-icon-box">
                            <Trash2 size={32} />
                        </div>
                        <Typography className="dialog-title-purge">PURGE DEBT LOG</Typography>
                        <Typography className="dialog-desc-purge">
                            Permanently remove debt from <strong>{deleteConfirmItem.person}</strong>?
                        </Typography>
                        <div className="day-totals-flex">
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} className="btn-purge-abort">ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} className="btn-purge-confirm">PROCEED</Button>
                        </div>
                    </Box>
                )}
            </Dialog>
        </motion.div>
    );
}
