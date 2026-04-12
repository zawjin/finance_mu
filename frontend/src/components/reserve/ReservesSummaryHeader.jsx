import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { Banknote, Plus, Activity, Handshake, Landmark, BarChart3, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function ReservesSummaryHeader({
    totalLiquidity,
    activeTab,
    onEdit,
    onEditDebt,
    onEditLending,
    onTransfer,
    localInvestments
}) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="glass-effect" style={{
                padding: '1.5rem',
                borderRadius: '1.5rem',
                border: '1.5px solid rgba(52,199,89,0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1.25rem',
                background: 'linear-gradient(135deg, rgba(52,199,89,0.03), rgba(52,199,89,0.06))'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: '#34c759',
                        color: 'white',
                        display: 'grid',
                        placeItems: 'center'
                    }}>
                        <Banknote size={24} />
                    </div>
                    <div>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#34c759', display: 'block', mb: -0.4, opacity: 0.8 }}>TOTAL RESERVE LIQUIDITY</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1d1d1f' }}>{formatCurrency(totalLiquidity)}</Typography>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {activeTab === 'accounts' && (
                        <>
                            <Button
                                onClick={onTransfer}
                                startIcon={<ArrowRightLeft size={18} />}
                                sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', px: 3, py: 1.2, borderRadius: '14px', fontWeight: 900, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                            >
                                MOVE MONEY
                            </Button>
                            <Button
                                onClick={() => onEdit({})}
                                startIcon={<Plus size={18} />}
                                sx={{ bgcolor: 'rgba(52, 199, 89, 0.1)', color: '#34c759', px: 3, py: 1.2, borderRadius: '14px', fontWeight: 900, '&:hover': { bgcolor: 'rgba(52, 199, 89, 0.15)' } }}
                            >
                                SYNC ACCOUNT
                            </Button>
                        </>
                    )}
                    {activeTab === 'debt-ledger' && (
                        <Button
                            onClick={() => onEditDebt({})}
                            startIcon={<Plus size={18} />}
                            sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', px: 3, py: 1.2, borderRadius: '14px', fontWeight: 900, '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' } }}
                        >
                            ADD NEW DEBT
                        </Button>
                    )}
                    {activeTab === 'local-investment' && (
                        <>


                            <Button
                                onClick={() => onEditLending({})}
                                variant="contained"
                                startIcon={<Plus size={18} />}
                                sx={{
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                    borderRadius: '16px', px: 3, py: 1.2,
                                    fontWeight: 900, fontSize: '0.75rem',
                                    boxShadow: '0 10px 30px rgba(99,102,241,0.2)',
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 40px rgba(99,102,241,0.3)' },
                                    transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                NEW INSTRUMENT
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
