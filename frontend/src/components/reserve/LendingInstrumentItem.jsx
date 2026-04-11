import React from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Stack, IconButton, Chip, LinearProgress, Button } from '@mui/material';
import { Edit2, Trash2, Banknote, CheckCircle2, HandCoins, RotateCcw } from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils/formatters';

const CHIT_SCHEDULE_5L = [
    25000, 18750, 19000, 19250, 19500, 19750, 20000, 20500, 21000, 21500,
    22000, 22500, 23000, 23500, 24000, 24250, 24500, 24750, 25000, 25000
];

export default function LendingInstrumentItem({ lending, onEdit, onDelete, onSettle, onRevert, idx }) {
    // Determine plan and data
    let planType = '5L';
    let multiplier = 1;
    let planColor = '#1d1d1f';

    const principal = parseFloat(lending.principal || 0);

    if (principal === 100000) {
        planType = '1L';
        multiplier = 0.2;
        planColor = '#94a3b8';
    } else if (principal === 1000000) {
        planType = '10L';
        multiplier = 2;
        planColor = '#6366f1';
    } else if (principal === 1500000) {
        planType = '15L';
        multiplier = 3;
        planColor = '#8b5cf6';
    }

    const scheduleData = CHIT_SCHEDULE_5L.map(v => v * multiplier);
    const dividend = 1612 * multiplier;
    const totalPaid = (lending.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const limit = principal || (multiplier * 500000);
    const progress = Math.min((totalPaid / limit) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
            style={{ width: '100%', marginBottom: '4rem' }}
        >
            <Box sx={{
                bgcolor: 'white',
                borderRadius: '32px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.04)',
                position: 'relative'
            }}>
                {/* PREMIUM ADAPTIVE HEADER */}
                <Box sx={{
                    p: 4,
                    background: `linear-gradient(135deg, ${planColor}08 0%, ${planColor}03 100%)`,
                    borderBottom: '1px solid rgba(0,0,0,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                }}>
                    <Box>
                        <Typography sx={{ fontWeight: 900, color: '#1d1d1f', fontSize: '1.8rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                            {lending.borrower}
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                            <Chip
                                label={`${planType} ${planType === '1L' ? 'LITE' : planType === '5L' ? 'STANDARD' : planType === '10L' ? 'PREMIUM' : 'ULTRA'}`}
                                size="small"
                                sx={{
                                    bgcolor: planColor, color: '#fff',
                                    fontWeight: 900, fontSize: '0.65rem', height: '22px',
                                    boxShadow: `0 4px 12px ${planColor}33`
                                }}
                            />
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Chit Fund Asset
                            </Typography>
                            <Box sx={{ width: '4px', height: '4px', borderRadius: '50%', bgcolor: '#d2d2d7' }} />
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#1d1d1f' }}>
                                Term: 20 Months
                            </Typography>
                        </Stack>
                    </Box>

                    <Stack spacing={1.5} alignItems="flex-end">
                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => onEdit(lending)} sx={{
                                color: '#1d1d1f', bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.08)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                '&:hover': { bgcolor: '#f5f5f7' }
                            }}>
                                <Edit2 size={16} />
                            </IconButton>
                            <IconButton 
                                onClick={() => onDelete(lending)} 
                                disabled={progress >= 100}
                                sx={{
                                    color: '#ff3b30', bgcolor: '#fff', border: '1px solid rgba(255,59,48,0.1)',
                                    boxShadow: '0 2px 8px rgba(255,59,48,0.04)',
                                    '&:hover': { bgcolor: '#fff1f0' },
                                    '&.Mui-disabled': { color: '#d2d2d7', border: '1px solid #e2e2e7', bgcolor: '#f5f5f7', opacity: 0.6 }
                                }}
                            >
                                <Trash2 size={16} />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Box>

                {/* FULL WIDTH COLLECTION PROGRESS BAR - CINEMATIC BELT */}
                <Box sx={{ 
                    width: '100%', px: 4, py: 2, 
                    background: `linear-gradient(135deg, ${planColor}08 0%, ${planColor}03 100%)`,
                    borderBottom: '1px solid rgba(0,0,0,0.03)'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#86868b', letterSpacing: '0.1em' }}>CAPITAL RECOVERY PROGRESS</Typography>
                            <Chip 
                                label={`${progress.toFixed(1)}% RECLAIMED`}
                                size="small"
                                sx={{ 
                                    height: '20px', fontSize: '0.6rem', fontWeight: 900, 
                                    bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981',
                                    borderRadius: '6px'
                                }}
                            />
                        </div>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#1d1d1f' }}>
                            {formatCurrency(totalPaid)} Collected / {formatCurrency(multiplier * 475000)} Expected
                        </Typography>
                    </Box>
                    <div style={{ 
                        width: '100%', height: '14px', background: 'rgba(0,0,0,0.04)', 
                        borderRadius: '20px', overflow: 'hidden', position: 'relative' 
                    }}>
                        <div 
                            style={{ 
                                width: `${progress}%`, 
                                height: '100%', 
                                background: `linear-gradient(90deg, ${planColor} 0%, #10b981 100%)`,
                                transition: 'width 1.5s cubic-bezier(1, 0, 0, 1)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                borderRadius: '20px'
                            }} 
                        />
                    </div>
                </Box>

                <Box sx={{ bgcolor: '#1d1d1f', px: 3, py: 1.5, display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1fr 1fr 1.2fr 1fr 80px', alignItems: 'center' }}>
                    {['TERM', 'MONTH', 'EXPECTED', 'CUMULATIVE', 'INTEREST', 'MATURITY PROJ', 'STATUS', 'ACTION'].map(h => (
                        <Box key={h} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>{h}</Typography>
                            {h === 'ACTION' && <HandCoins size={12} color="rgba(255,255,255,0.4)" />}
                        </Box>
                    ))}
                </Box>

                <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {scheduleData.map((val, i) => {
                        const termNum = i + 1;
                        const cumul = scheduleData.slice(0, i + 1).reduce((a, b) => a + b, 0);
                        const isLast = i === scheduleData.length - 1;
                        const requiredAmount = val;
                        const rowValue = isLast ? (multiplier * 475000) : (cumul + dividend);

                        const termPayments = (lending.payments || []).filter(p => p.term_number === termNum);
                        const totalTermPaid = termPayments.reduce((acc, p) => acc + p.amount, 0);

                        let status = 'UNPAID';
                        let statusColor = '#fef3c7'; // Amber
                        let textColor = '#92400e';

                        if (totalTermPaid >= requiredAmount) {
                            status = 'PAID';
                            statusColor = '#dcfce7'; // green
                            textColor = '#166534';
                        } else if (totalTermPaid > 0) {
                            status = 'PARTIAL';
                            statusColor = '#e0f2fe'; // blue
                            textColor = '#075985';
                        }

                        const nextToPayIndex = scheduleData.findIndex((_, idx) => {
                            const tp = (lending.payments || []).filter(p => p.term_number === (idx + 1));
                            const ttp = tp.reduce((a, b) => a + b.amount, 0);
                            return ttp < (scheduleData[idx] || 0);
                        });

                        const canPay = i === nextToPayIndex;
                        const monthDate = dayjs(lending.start_date).add(i, 'month');
                        const rowMonth = monthDate.format('MMM YYYY');

                        return (
                            <Box key={i} sx={{
                                display: 'grid',
                                gridTemplateColumns: '50px 1fr 1fr 1fr 1fr 1.2fr 1fr 80px',
                                px: 3, py: 1.8, alignItems: 'center',
                                borderBottom: '1px solid rgba(0,0,0,0.04)',
                                bgcolor: status === 'PAID' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                                transition: '0.1s', '&:hover': { bgcolor: status === 'PAID' ? 'rgba(16, 185, 129, 0.16)' : 'rgba(0,0,0,0.01)' }
                            }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#94a3b8' }}>{termNum}</Typography>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#6366f1', textTransform: 'uppercase' }}>{rowMonth}</Typography>
                                <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: '#1d1d1f' }}>₹{val.toLocaleString()}</Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#64748b' }}>₹{cumul.toLocaleString()}</Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#94a3b8' }}>₹{dividend.toLocaleString()}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{
                                        fontWeight: 900, fontSize: '0.9rem',
                                        color: isLast ? '#10b981' : '#1d1d1f'
                                    }}>
                                        ₹{rowValue.toLocaleString()}
                                    </Typography>
                                    {isLast && <CheckCircle2 size={16} color="#10b981" />}
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Chip
                                        label={status}
                                        size="small"
                                        icon={status === 'PAID' ? <CheckCircle2 size={12} color="#166534" /> : undefined}
                                        sx={{
                                            height: 18, fontSize: '0.55rem', fontWeight: 900,
                                            bgcolor: statusColor, color: textColor,
                                            borderRadius: '6px', width: 'fit-content',
                                            '& .MuiChip-icon': { ml: 0.5, mr: -0.5 }
                                        }}
                                    />
                                    {totalTermPaid > 0 && totalTermPaid < requiredAmount && (
                                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: '#ef4444' }}>
                                            ₹{(requiredAmount - totalTermPaid).toLocaleString()} PENDING
                                        </Typography>
                                    )}
                                </Box>
                                <Box>
                                    {status === 'PAID' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <CheckCircle2 size={20} color="#10b981" />
                                            <IconButton 
                                                size="small" 
                                                onClick={() => onRevert(lending, termNum)}
                                                sx={{ 
                                                    color: '#f59e0b', 
                                                    background: 'rgba(245,158,11,0.05)',
                                                    '&:hover': { background: 'rgba(245,158,11,0.15)', transform: 'rotate(-45deg)' },
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <RotateCcw size={14} />
                                            </IconButton>
                                        </div>
                                    ) : (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            disabled={!canPay}
                                            startIcon={<HandCoins size={12} />}
                                            onClick={() => onSettle({
                                                card: lending,
                                                type: 'LENDING',
                                                term: termNum,
                                                requiredAmount,
                                                alreadyPaid: totalTermPaid
                                            })}
                                            sx={{
                                                fontSize: '0.6rem', fontWeight: 900,
                                                bgcolor: '#1d1d1f', py: 0.6, px: 2,
                                                borderRadius: '20px', minWidth: 'unset',
                                                textTransform: 'uppercase',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                                '&:hover': { bgcolor: '#000', transform: 'translateY(-1px)' },
                                                '&.Mui-disabled': { bgcolor: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.2)', boxShadow: 'none' },
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            PAY
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

                <Box sx={{
                    px: 3, py: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid rgba(0,0,0,0.08)',
                    display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1fr 1fr 1.2fr 1fr 80px', alignItems: 'center'
                }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#ef4444', letterSpacing: '0.05em' }}>TOTALS</Typography>
                    <Box />
                    <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#1d1d1f' }}>
                        ₹{scheduleData.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#64748b' }}>
                        ₹{(lending.payments || []).reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#64748b' }}>
                        ₹{(dividend * 20).toLocaleString()}
                    </Typography>
                    <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#10b981' }}>
                            ₹{(multiplier * 475000).toLocaleString()}
                        </Typography>
                        <CheckCircle2 size={20} color="#10b981" />
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
}
