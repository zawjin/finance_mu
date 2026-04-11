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
    onSettle,
    onRevert
}) {
    const [selectedPlan, setSelectedPlan] = React.useState('ALL');

    const plans = [
        { label: 'ALL ASSETS', type: 'ALL', color: '#1d1d1f' },
        { label: '1L LITE', type: '1L', color: '#94a3b8' },
        { label: '5L STANDARD', type: '5L', color: '#1d1d1f' },
        { label: '10L PREMIUM', type: '10L', color: '#6366f1' },
        { label: '15L ULTRA', type: '15L', color: '#8b5cf6' }
    ];

    const filteredInvestments = React.useMemo(() => {
        if (selectedPlan === 'ALL') return sortedInvestments;
        return sortedInvestments.filter(inv => {
            const principal = parseFloat(inv.principal || 0);
            if (selectedPlan === '1L') return principal === 100000;
            if (selectedPlan === '5L') return principal === 500000;
            if (selectedPlan === '10L') return principal === 1000000;
            if (selectedPlan === '15L') return principal === 1500000;
            return false;
        });
    }, [sortedInvestments, selectedPlan]);

    const dynamicStats = React.useMemo(() => {
        let principal = 0;
        let active = 0;
        let yieldCount = 0;
        filteredInvestments.forEach(inv => {
            principal += (inv.actualValue || 0);
            active += (inv.currentValue || 0);
            yieldCount += (inv.accruedInterest || 0);
        });
        return { principal, active, yieldCount };
    }, [filteredInvestments]);

    return (
        <div style={{ paddingBottom: '5rem' }}>


            <Box>
                {filteredInvestments.map((lending, idx) => (
                    <LendingInstrumentItem
                        key={lending._id || idx}
                        lending={lending}
                        idx={idx}
                        onEdit={onEditLending}
                        onDelete={setDeleteConfirmLending}
                        onSettle={onSettle}
                        onRevert={onRevert}
                    />
                ))}
            </Box>
        </div>
    );
}
