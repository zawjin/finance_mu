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

            {/* NET EXPOSURE GAUGE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <Box className="glass-effect" sx={{ p: 4, borderRadius: '32px', border: '1.5px solid rgba(0,0,0,0.04)', bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(30px)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.03 }}><TrendingUp size={160} /></div>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#34c759', display: 'flex', alignItems: 'center', gap: 1, mb: 1, letterSpacing: '0.1em' }}><ArrowUpRight size={14} /> TOTAL RECEIVABLES</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>{formatCurrency(stats.receivables)}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mt: 1 }}>Money owed to you by others</Typography>
                </Box>

                <Box className="glass-effect" sx={{ p: 4, borderRadius: '32px', border: '1.5px solid rgba(0,0,0,0.04)', bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(30px)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.03 }}><TrendingDown size={160} /></div>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#ff3b30', display: 'flex', alignItems: 'center', gap: 1, mb: 1, letterSpacing: '0.1em' }}><ArrowDownRight size={14} /> TOTAL LIABILITIES</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>{formatCurrency(stats.liabilities)}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mt: 1 }}>Money you owe to others</Typography>
                </Box>

                <Box sx={{
                    p: 4, borderRadius: '32px', border: 'none',
                    bgcolor: stats.net >= 0 ? '#0f172a' : '#ff3b30',
                    color: 'white', position: 'relative', overflow: 'hidden',
                    boxShadow: stats.net >= 0 ? '0 25px 50px rgba(15,23,42,0.2)' : '0 25px 50px rgba(255,59,48,0.2)'
                }}>
                    <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.15 }}><Activity size={160} /></div>
                    <Typography variant="caption" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, mb: 1, opacity: 0.8, letterSpacing: '0.1em' }}><Handshake size={14} /> NET POSITION</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>{formatCurrency(stats.net)}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.8, display: 'block', mt: 1 }}>{stats.net >= 0 ? "You are a net lender" : "You have net debt"}</Typography>
                </Box>
            </div>

            <div className="spending-split-layout">
                {/* FILTERS SIDEBAR */}
                <div className="filters-sidebar-card glass-effect" style={{ padding: '2rem', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#0f172a', color: 'white', display: 'grid', placeItems: 'center' }}>
                            <Filter size={15} fill="white" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>Symmetrizer Filters</span>
                    </div>

                    <div className="filter-section-block">
                        <div className="filter-section-label"><span>SEARCH PEOPLE</span></div>
                        <div style={{ position: 'relative' }}>
                            <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input className="filter-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, description..." style={{ paddingLeft: '2.75rem' }} />
                        </div>
                    </div>

                    <div className="filter-section-block" style={{ marginTop: '2rem' }}>
                        <div className="filter-section-label"><span>EXPOSURE TYPE</span></div>
                        <div className="category-filter-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className={`cat-filter-chip ${filterType === 'ALL' ? 'active' : ''}`} onClick={() => setFilterType('ALL')}>All exposure</div>
                            <div className={`cat-filter-chip ${filterType === 'RECEIVABLE' ? 'active' : ''}`} style={{ borderColor: 'rgba(52,199,89,0.3)', color: filterType === 'RECEIVABLE' ? 'white' : '#34c759' }} onClick={() => setFilterType('RECEIVABLE')}>Receivables (Owed to me)</div>
                            <div className={`cat-filter-chip ${filterType === 'LIABILITY' ? 'active' : ''}`} style={{ borderColor: 'rgba(255,59,48,0.3)', color: filterType === 'LIABILITY' ? 'white' : '#ff3b30' }} onClick={() => setFilterType('LIABILITY')}>Liabilities (I owe)</div>
                        </div>
                    </div>
                </div>

                {/* LEDGER TABLE */}
                <div className="ledger-content-hub">
                    <Box className="glass-effect" sx={{ borderRadius: '32px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ padding: '1.75rem 2.5rem', background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>TRANSACTION LEDGER</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>Showing {filteredDebt.length} events</Typography>
                        </div>

                        <Table>
                            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 900, color: '#86868b', fontSize: '0.75rem', pl: 5 }}>PERSON / ENTITY</TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: '#86868b', fontSize: '0.75rem' }}>TYPE</TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: '#86868b', fontSize: '0.75rem' }}>AMOUNT</TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: '#86868b', fontSize: '0.75rem' }}>STATUS</TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: '#86868b', fontSize: '0.75rem' }}>DUE DATE</TableCell>
                                    <TableCell sx={{ fontWeight: 900, color: '#86868b', fontSize: '0.75rem', textAlign: 'right', pr: 5 }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <AnimatePresence>
                                    {filteredDebt.map((item) => (
                                        <TableRow key={item._id} component={motion.tr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: item.status === 'SETTLED' ? 'rgba(0,0,0,0.01)' : 'transparent' }}>
                                            <TableCell sx={{ pl: 5, py: 2.5 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99,102,241,0.05)', color: '#6366f1', display: 'grid', placeItems: 'center' }}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <Typography variant="body2" sx={{ fontWeight: 900 }}>{item.person}</Typography>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.7 }}>{item.description || "Personal Exposure"}</Typography>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.direction === 'OWED_TO_ME' ? 'RECEIVABLE' : 'LIABILITY'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 900, fontSize: '0.65rem',
                                                        bgcolor: item.direction === 'OWED_TO_ME' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
                                                        color: item.direction === 'OWED_TO_ME' ? '#34c759' : '#ff3b30',
                                                        borderRadius: '8px', border: 'none'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 900, color: item.status === 'SETTLED' ? '#86868b' : (item.direction === 'OWED_TO_ME' ? '#34c759' : '#ff3b30') }}>
                                                    {formatCurrency(item.amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.status}
                                                    size="small"
                                                    icon={item.status === 'SETTLED' ? <CheckCircle2 size={12} /> : (item.status === 'ACTIVE' ? <Activity size={12} /> : <Clock size={12} />)}
                                                    sx={{
                                                        fontWeight: 900, fontSize: '0.65rem', borderRadius: '8px',
                                                        bgcolor: item.status === 'SETTLED' ? 'rgba(0,0,0,0.05)' : (item.status === 'ACTIVE' ? 'rgba(99,102,241,0.1)' : 'rgba(251,146,60,0.1)'),
                                                        color: item.status === 'SETTLED' ? '#86868b' : (item.status === 'ACTIVE' ? '#6366f1' : '#fb923c')
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <CalendarDays size={12} /> {item.dueDate ? dayjs(item.dueDate).format('MMM DD, YYYY') : "No deadline"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ pr: 5, textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                                    {item.status !== 'SETTLED' && (
                                                        <IconButton size="small" onClick={() => handleStatusUpdate(item, 'SETTLED')} sx={{ color: '#34c759', bgcolor: 'rgba(52,199,89,0.05)' }}>
                                                            <CheckCircle2 size={16} />
                                                        </IconButton>
                                                    )}
                                                    <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: '#6366f1', bgcolor: 'rgba(99,102,241,0.05)' }}>
                                                        <Edit2 size={16} />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => setDeleteConfirmItem(item)} sx={{ color: '#ff3b30', bgcolor: 'rgba(255,59,48,0.05)' }}>
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
                            <Box sx={{ p: 10, textAlign: 'center', opacity: 0.5 }}>
                                <AlertCircle size={48} style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                                <Typography variant="body1" sx={{ fontWeight: 800 }}>No exposure found in your ledger.</Typography>
                            </Box>
                        )}
                    </Box>
                </div>
            </div>

            {/* DELETE CONFIRMATION */}
            <Dialog open={!!deleteConfirmItem} onClose={() => setDeleteConfirmItem(null)} TransitionComponent={Grow}>
                {deleteConfirmItem && (
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'white', borderRadius: '32px', maxWidth: '440px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
                            <Trash2 size={32} />
                        </div>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>PURGE DEBT LOG</Typography>
                        <Typography variant="body1" sx={{ color: '#86868b', mb: 3 }}>
                            Permanently remove debt from <strong>{deleteConfirmItem.person}</strong>?
                        </Typography>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.05)', color: '#1d1d1f' }}>ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, bgcolor: '#ff3b30' }}>PROCEED</Button>
                        </div>
                    </Box>
                )}
            </Dialog>
        </motion.div>
    );
}
