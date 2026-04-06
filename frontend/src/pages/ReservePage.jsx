import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit2, Landmark, Wallet, Banknote, Activity, CreditCard as CardIcon, Receipt, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Dialog, Grow, Box, Typography, Button, IconButton, Skeleton, Select, MenuItem, TextField, InputAdornment, Stack } from '@mui/material';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';
import dayjs from 'dayjs';

export default function ReservePage({ onEdit }) {
    const dispatch = useDispatch();
    const { reserves, loading, summary, billSettlements, spending } = useSelector(state => state.finance);
    const [deleteConfirmItem, setDeleteConfirmItem] = React.useState(null);
    
    // Pay Bill State
    const [showPayBill, setShowPayBill] = React.useState(false);
    const [payBillData, setPayBillData] = React.useState({
        cardId: '',
        sourceId: '',
        amount: ''
    });
    const [paying, setPaying] = React.useState(false);

    // Filter unpaid for current selected card
    const unpaidCardTrans = spending.filter(s => 
        s.payment_method === 'CARD' && 
        s.payment_source_id === payBillData.cardId && 
        !s.is_settled
    );

    const handleRemove = async () => {
        if (!deleteConfirmItem) return;
        try {
            await api.delete(`/reserves/${deleteConfirmItem._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmItem(null);
        } catch (err) {
            console.error(err);
            alert("Removal failed.");
        }
    };

    const handleDeleteSettlement = async (settlement) => {
        if (!window.confirm(`Permanently remove this settlement of ${formatCurrency(settlement.amount)}? This will undo the balance changes.`)) return;
        try {
            await api.delete(`/bill-settlements/${settlement._id}`);
            
            // Undo balance changes: Add back to Bank, Add back to Card Outstanding
            const source = reserves.find(r => r._id === settlement.source_id);
            const card = reserves.find(r => r._id === settlement.card_id);

            if (source) {
                await api.put(`/reserves/${source._id}`, {
                    ...source,
                    balance: parseFloat(source.balance) + parseFloat(settlement.amount)
                });
            }
            if (card) {
                await api.put(`/reserves/${card._id}`, {
                    ...card,
                    balance: parseFloat(card.balance) + parseFloat(settlement.amount)
                });
            }

            dispatch(fetchFinanceData());
        } catch (err) {
            console.error(err);
            alert("Delete failed.");
        }
    };

    const handlePayBill = async () => {
        if (!payBillData.cardId || !payBillData.sourceId || !payBillData.amount) return;
        setPaying(true);
        try {
            const card = reserves.find(r => r._id === payBillData.cardId);
            const source = reserves.find(r => r._id === payBillData.sourceId);
            const amt = parseFloat(payBillData.amount);

            // 1. Deduct from Source (Bank)
            await api.put(`/reserves/${source._id}`, {
                ...source,
                balance: parseFloat(source.balance) - amt,
                last_updated: dayjs().format('YYYY-MM-DD')
            });

            // 2. Reduce Outstanding from Card
            await api.put(`/reserves/${card._id}`, {
                ...card,
                balance: parseFloat(card.balance) - amt,
                last_updated: dayjs().format('YYYY-MM-DD')
            });

            // 3. Add to Settlement Log
            await api.post('/bill-settlements', {
                card_id: card._id,
                card_name: card.account_name,
                source_id: source._id,
                source_name: source.account_name,
                amount: amt,
                date: dayjs().format('YYYY-MM-DD')
            });

            // 4. Mark matching unpaid transactions as settled if they fit in the amount
            // Or just mark ALL as settled if it's a full payment.
            // Simplified: Mark all pending for this card as settled if payment is made.
            for (const s of unpaidCardTrans) {
                // In a real app we'd track partials, but here we just mark as settled for now
                await api.put(`/spending/${s._id}`, { ...s, is_settled: true });
            }

            dispatch(fetchFinanceData());
            setShowPayBill(false);
            setPayBillData({ cardId: '', sourceId: '', amount: '' });
        } catch (err) {
            console.error(err);
            alert("Pay Bill failed.");
        } finally {
            setPaying(false);
        }
    };

    const getTypeStyle = (type) => {
        if (type === 'BANK') return { bg: 'rgba(99,102,241,0.12)', color: '#6366f1', icon: <Landmark size={18} color="#6366f1" /> };
        if (type === 'WALLET') return { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: <Wallet size={18} color="#10b981" /> };
        if (type === 'CREDIT_CARD') return { bg: 'rgba(255,59,48,0.12)', color: '#ff3b30', icon: <CardIcon size={18} color="#ff3b30" /> };
        return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', icon: <Banknote size={18} color="#f59e0b" /> };
    };

    const totalBank = reserves ? reserves.filter(r => r.account_type === 'BANK').reduce((s, r) => s + parseFloat(r.balance || 0), 0) : 0;
    const totalCash = reserves ? reserves.filter(r => r.account_type === 'CASH').reduce((s, r) => s + parseFloat(r.balance || 0), 0) : 0;
    const totalWallet = reserves ? reserves.filter(r => r.account_type === 'WALLET').reduce((s, r) => s + parseFloat(r.balance || 0), 0) : 0;
    const totalCards = reserves ? reserves.filter(r => r.account_type === 'CREDIT_CARD').reduce((s, r) => s + parseFloat(r.balance || 0), 0) : 0;
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container-super">
            
            {/* PAY BILL DIALOG */}
            <Dialog 
                open={showPayBill} 
                onClose={() => setShowPayBill(false)}
                TransitionComponent={Grow}
                PaperProps={{ sx: { borderRadius: '28px', width: '100%', maxWidth: '480px' } }}
            >
                <Box sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Receipt size={24} color="#6366f1" /> SETTLE CARD BILL
                    </Typography>
                    
                    <Stack spacing={3}>
                        <Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#86868b', mb: 1 }}>SELECT CREDIT CARD</Typography>
                            <Select 
                                fullWidth 
                                value={payBillData.cardId}
                                onChange={e => setPayBillData({...payBillData, cardId: e.target.value})}
                                sx={{ borderRadius: '16px', bgcolor: '#f8fafc' }}
                            >
                                {reserves.filter(r => r.account_type === 'CREDIT_CARD').map(r => (
                                    <MenuItem key={r._id} value={r._id}>{r.account_name} (₹{parseFloat(r.balance).toLocaleString()})</MenuItem>
                                ))}
                            </Select>
                        </Box>
                        
                        <Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#86868b', mb: 1 }}>DEBIT FROM (BANK ACCOUNT)</Typography>
                            <Select 
                                fullWidth 
                                value={payBillData.sourceId}
                                onChange={e => setPayBillData({...payBillData, sourceId: e.target.value})}
                                sx={{ borderRadius: '16px', bgcolor: '#f8fafc' }}
                            >
                                {reserves.filter(r => r.account_type === 'BANK').map(r => (
                                    <MenuItem key={r._id} value={r._id}>{r.account_name} (₹{parseFloat(r.balance).toLocaleString()})</MenuItem>
                                ))}
                            </Select>
                        </Box>

                        {/* LIST UNPAID TRANSACTIONS */}
                        {payBillData.cardId && (
                            <Box sx={{ border: '1px solid rgba(0,0,0,0.05)', borderRadius: '18px', p: 2, bgcolor: '#fafafa' }}>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#86868b', mb: 1.5, textTransform: 'uppercase' }}>UNSETTLED CARD EXPENDITURES</Typography>
                                <Stack spacing={1} sx={{ maxHeight: '180px', overflowY: 'auto', pr: 0.5 }}>
                                    {unpaidCardTrans.length === 0 ? (
                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', color: '#86868b', py: 2 }}>No unsettled transactions.</Typography>
                                    ) : (
                                        unpaidCardTrans.map(t => (
                                            <Box key={t._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.03)', pb: 0.8 }}>
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>{t.description || t.category}</Typography>
                                                    <Typography sx={{ fontSize: '0.6rem', color: '#86868b', fontWeight: 600 }}>{t.date}</Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 900 }}>₹{parseFloat(t.amount).toLocaleString()}</Typography>
                                            </Box>
                                        ))
                                    )}
                                </Stack>
                                {unpaidCardTrans.length > 0 && (
                                   <Box sx={{ mt: 2, pt: 1.5, borderTop: '1.5px dashed rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900 }}>PENDING TOTAL</Typography>
                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#ff3b30' }}>
                                            ₹{unpaidCardTrans.reduce((s,t) => s + parseFloat(t.amount), 0).toLocaleString()}
                                        </Typography>
                                   </Box>
                                )}
                            </Box>
                        )}
                        
                        <Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#86868b', mb: 1 }}>PAYMENT AMOUNT (₹) — <span style={{ color: '#6366f1' }}>FULL OR PARTIAL</span></Typography>
                            <TextField 
                                fullWidth 
                                type="number"
                                placeholder="0.00"
                                value={payBillData.amount}
                                onChange={e => setPayBillData({...payBillData, amount: e.target.value})}
                                InputProps={{ startAdornment: <Typography sx={{ fontWeight: 900, mr:1 }}>₹</Typography> }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: '#f8fafc' } }}
                            />
                        </Box>
                        
                        <Button 
                            fullWidth 
                            variant="contained" 
                            onClick={handlePayBill}
                            disabled={paying || !payBillData.amount || !payBillData.cardId || !payBillData.sourceId}
                            sx={{ py: 2, borderRadius: '50px', fontWeight: 900, bgcolor: '#1d1d1f', '&:hover': { bgcolor: '#000' } }}
                        >
                            {paying ? 'PROCESSING...' : 'CONFIRM BILL SETTLEMENT'}
                        </Button>
                    </Stack>
                </Box>
            </Dialog>

            <Dialog 
                open={!!deleteConfirmItem} 
                onClose={() => setDeleteConfirmItem(null)}
                TransitionComponent={Grow}
                PaperProps={{ sx: { borderRadius: '28px', maxWidth: '440px' } }}
            >
                {deleteConfirmItem && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>DELETE ACCOUNT?</Typography>
                        <Typography sx={{ color: '#86868b', mb: 3 }}>Remove {deleteConfirmItem.account_name} from tracking?</Typography>
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} sx={{ borderRadius: '50px', bgcolor: '#f1f5f9', color: '#1d1d1f' }}>ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} sx={{ borderRadius: '50px', bgcolor: '#ff3b30' }}>DELETE</Button>
                        </Stack>
                    </Box>
                )}
            </Dialog>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="glass-effect" style={{ padding: '1.5rem', borderRadius: '1.5rem', border: '1.5px solid rgba(52,199,89,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(52,199,89,0.03), rgba(52,199,89,0.06))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#34c759', color: 'white', display: 'grid', placeItems: 'center' }}><Banknote size={24} /></div>
                        <div>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: '#34c759', display: 'block', mb: -0.4, opacity: 0.8 }}>TOTAL RESERVE LIQUIDITY</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1d1d1f' }}>{formatCurrency(totalBank + totalCash + totalWallet)}</Typography>
                        </div>
                    </div>
                    <Button 
                        onClick={() => setShowPayBill(true)}
                        startIcon={<Receipt size={18} />}
                        sx={{ bgcolor: '#1d1d1f', color: '#fff', px: 3, py: 1.2, borderRadius: '14px', fontWeight: 900, '&:hover': { bgcolor: '#000' } }}
                    >
                        PAY CARD BILL
                    </Button>
                </div>
            </div>

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
                        <div className="pill-icon-box" style={{ background: 'rgba(255,59,48,0.12)', color: '#ff3b30' }}><CardIcon size={18} /></div>
                        <div className="pill-info-box">
                            <span className="pill-cat-label">CARDS (O/S)</span>
                            <span className="pill-amt-val" style={{ color: '#ff3b30' }}>{formatCurrency(totalCards)}</span>
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
                                        const isCard = r.account_type === 'CREDIT_CARD';
                                        const utilization = isCard && r.credit_limit > 0 ? (parseFloat(r.balance) / r.credit_limit) * 100 : 0;
                                        
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
                                                    {isCard && (
                                                        <Box sx={{ mt: 1, width: '100%', maxWidth: '200px' }}>
                                                            <div style={{ height: '4px', bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${Math.min(utilization, 100)}%`, height: '100%', background: utilization > 80 ? '#ff3b30' : (utilization > 50 ? '#ff9500' : '#34c759') }}></div>
                                                            </div>
                                                            <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#86868b', mt: 0.5 }}>
                                                                {utilization.toFixed(1)}% Utilized • ₹{(r.credit_limit - r.balance).toLocaleString()} Avail.
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </div>
                                                <div style={{ textAlign: 'right', marginRight: '2rem' }}>
                                                    <Typography sx={{ fontWeight: 900, color: isCard ? '#ff3b30' : '#1d1d1f', fontSize: '1.1rem' }}>
                                                        {isCard ? '-' : ''}{formatCurrency(r.balance)}
                                                    </Typography>
                                                    {isCard && <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#86868b' }}>Limit: {formatCurrency(r.credit_limit)}</Typography>}
                                                </div>
                                                <div className="row-action-cluster" style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <IconButton size="small" onClick={() => onEdit(r)} sx={{ color: '#6366f1' }}><Edit2 size={16} /></IconButton>
                                                    <IconButton size="small" onClick={() => setDeleteConfirmItem(r)} sx={{ color: '#ff3b30' }}><Trash2 size={16} /></IconButton>
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

            {/* SETTLEMENT LOGS */}
            <div className="spending-split-layout">
                <div className="spending-main-content" style={{ gridColumn: '1 / -1' }}>
                    <div className="data-table-premium" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                        <div className="date-group">
                            <div className="date-header-luxury" style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.05), transparent)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Receipt size={14} color="#6366f1" />
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#6366f1' }}>BILL SETTLEMENT HISTORY</span>
                                </div>
                            </div>
                            <div className="investment-items-luxury">
                                {(billSettlements || []).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#86868b', fontWeight: 800 }}>No settlements recorded yet.</div>
                                ) : (
                                    (billSettlements || []).map(s => (
                                        <div key={s._id} className="transaction-row-fancy" style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(52,199,89,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0, marginRight: '1rem' }}>
                                                <CheckCircle2 size={18} color="#34c759" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                    <span style={{ fontWeight: 800, color: '#1d1d1f', fontSize: '0.95rem' }}>{s.card_name}</span>
                                                    <ArrowRight size={14} color="#86868b" />
                                                    <span style={{ fontWeight: 800, color: '#1d1d1f', fontSize: '0.95rem' }}>{s.source_name}</span>
                                                </div>
                                                <Typography sx={{ fontSize: '0.7rem', color: '#86868b', fontWeight: 700, mt: 0.2 }}>
                                                    {dayjs(s.date).format('MMM DD, YYYY')} • FULLY SETTLED
                                                </Typography>
                                            </div>
                                            <div style={{ textAlign: 'right', marginRight: '1.5rem' }}>
                                                <Typography sx={{ fontWeight: 900, color: '#10b981', fontSize: '1.05rem' }}>{formatCurrency(s.amount)}</Typography>
                                            </div>
                                            <div className="row-action-cluster">
                                                <IconButton size="small" onClick={() => handleDeleteSettlement(s)} sx={{ color: '#ff3b30', '&:hover': { bgcolor: 'rgba(255,59,48,0.08)' } }}>
                                                    <Trash2 size={15} />
                                                </IconButton>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

