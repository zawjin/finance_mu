import React from 'react';
import { Box, Typography } from '@mui/material';
import { Landmark, Briefcase, TrendingUp, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import LendingInstrumentItem from './LendingInstrumentItem';

export default function LocalInvestmentTab({ 
    lendingStats, 
    sortedInvestments, 
    onEditLending, 
    setDeleteConfirmLending, 
    onSettle 
}) {
    return (
        <div style={{ paddingBottom: '5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <div className="glass-effect" style={{ padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                        <Briefcase size={18} color="#1d1d1f" />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#86868b' }}>TOTAL INVESTED</Typography>
                    </div>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{formatCurrency(lendingStats.principalTotal)}</Typography>
                </div>
                <div className="glass-effect" style={{ padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid rgba(16,185,129,0.1)', background: 'rgba(16,185,129,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                        <TrendingUp size={18} color="#10b981" />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#10b981' }}>LIVE VALUATION</Typography>
                    </div>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#1d1d1f' }}>{formatCurrency(lendingStats.activeValuation)}</Typography>
                </div>
                <div className="glass-effect" style={{ padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                        <PieChart size={18} color="#6366f1" />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#6366f1' }}>ACCRUED YIELD</Typography>
                    </div>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{formatCurrency(lendingStats.yield)}</Typography>
                </div>
                <div className="glass-effect" style={{ padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                        <Landmark size={18} color="#1d1d1f" />
                        <Typography variant="caption" sx={{ fontWeight: 900, color: '#86868b' }}>AVG MONTHLY ROI</Typography>
                    </div>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{formatCurrency(lendingStats.totalMonthlyInst)}</Typography>
                </div>
            </div>

            <Box>
                {sortedInvestments.map((lending, idx) => (
                    <LendingInstrumentItem
                        key={lending._id || idx}
                        lending={lending}
                        idx={idx}
                        onEdit={onEditLending}
                        onDelete={setDeleteConfirmLending}
                        onSettle={onSettle}
                    />
                ))}
            </Box>
        </div>
    );
}
