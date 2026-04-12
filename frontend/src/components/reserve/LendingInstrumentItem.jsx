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
            className="chit-card-wrapper"
        >
            <Box className="chit-card-premium">
                {/* PREMIUM ADAPTIVE HEADER */}
                <Box 
                    className="chit-header-premium"
                    style={{ background: `linear-gradient(135deg, ${planColor}08 0%, ${planColor}03 100%)` }}
                >
                    <Box>
                        <Typography className="chit-borrower-name">
                            {lending.borrower}
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center" className="margin-t-15">
                            <Chip
                                label={`${planType} ${planType === '1L' ? 'LITE' : planType === '5L' ? 'STANDARD' : planType === '10L' ? 'PREMIUM' : 'ULTRA'}`}
                                size="small"
                                className="chit-plan-chip"
                                style={{ backgroundColor: planColor, boxShadow: `0 4px 12px ${planColor}33` }}
                            />
                            <Typography className="chit-asset-label">
                                Chit Fund Asset
                            </Typography>
                            <Box className="chit-meta-dot" />
                            <Typography className="chit-term-label">
                                Term: 20 Months
                            </Typography>
                        </Stack>
                    </Box>

                    <Stack spacing={1.5} alignItems="flex-end">
                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={() => onEdit(lending)} className="chit-action-btn btn-edit">
                                <Edit2 size={16} />
                            </IconButton>
                            <IconButton 
                                onClick={() => onDelete(lending)} 
                                disabled={progress >= 100}
                                className="chit-action-btn btn-delete"
                            >
                                <Trash2 size={16} />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Box>

                {/* FULL WIDTH COLLECTION PROGRESS BAR - CINEMATIC BELT */}
                <Box 
                    className="chit-progress-belt"
                    style={{ background: `linear-gradient(135deg, ${planColor}08 0%, ${planColor}03 100%)` }}
                >
                    <Box className="chit-progress-meta">
                        <div className="flex-center-gap-08">
                            <Typography className="chit-progress-label">CAPITAL RECOVERY PROGRESS</Typography>
                            <Chip 
                                label={`${progress.toFixed(1)}% RECLAIMED`}
                                size="small"
                                className="chit-reclaimed-chip"
                            />
                        </div>
                        <Typography className="chit-progress-val">
                            {formatCurrency(totalPaid)} Collected / {formatCurrency(multiplier * 475000)} Expected
                        </Typography>
                    </Box>
                    <div className="chit-progress-track">
                        <div 
                            className="chit-progress-fill"
                            style={{ 
                                width: `${progress}%`, 
                                background: `linear-gradient(90deg, ${planColor} 0%, #10b981 100%)`
                            }} 
                        />
                    </div>
                </Box>

                <div className="responsive-table-container">
                    <Box className="chit-table-header">
                        {['TERM', 'MONTH', 'EXPECTED', 'CUMULATIVE', 'INTEREST', 'MATURITY PROJ', 'STATUS', 'ACTION'].map(h => (
                            <Box key={h} className="chit-th-item">
                                <Typography className="chit-th-text">{h}</Typography>
                                {h === 'ACTION' && <HandCoins size={12} color="rgba(255,255,255,0.4)" />}
                            </Box>
                        ))}
                    </Box>
                </div>

                <div className="responsive-table-container">
                    <Box className="chit-table-body scroll-y-luxury">
                        {scheduleData.map((val, i) => {
                            const termNum = i + 1;
                            const cumul = scheduleData.slice(0, i + 1).reduce((a, b) => a + b, 0);
                            const isLast = i === scheduleData.length - 1;
                            const requiredAmount = val;
                            const rowValue = isLast ? (multiplier * 475000) : (cumul + dividend);

                            const termPayments = (lending.payments || []).filter(p => p.term_number === termNum);
                            const totalTermPaid = termPayments.reduce((acc, p) => acc + p.amount, 0);

                            let status = 'UNPAID';
                            let statusClass = 'status-amber';

                            if (totalTermPaid >= requiredAmount) {
                                status = 'PAID';
                                statusClass = 'status-green';
                            } else if (totalTermPaid > 0) {
                                status = 'PARTIAL';
                                statusClass = 'status-blue';
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
                                <Box key={i} className={`chit-row-layout ${status === 'PAID' ? 'row-paid' : ''}`}>
                                    <Typography className="chit-td-term">{termNum}</Typography>
                                    <Typography className="chit-td-month">{rowMonth}</Typography>
                                    <Typography className="chit-td-expected">₹{val.toLocaleString()}</Typography>
                                    <Typography className="chit-td-cumul">₹{cumul.toLocaleString()}</Typography>
                                    <Typography className="chit-td-dividend">₹{dividend.toLocaleString()}</Typography>
                                    <Box className="flex-center-gap-1">
                                        <Typography className={`chit-td-rowval ${isLast ? 'color-green' : 'color-dark'}`}>
                                            ₹{rowValue.toLocaleString()}
                                        </Typography>
                                        {isLast && <CheckCircle2 size={16} color="#10b981" />}
                                    </Box>
                                    <Box className="flex-col-gap-05">
                                        <Chip
                                            label={status}
                                            size="small"
                                            icon={status === 'PAID' ? <CheckCircle2 size={12} /> : undefined}
                                            className={`chit-status-chip ${statusClass}`}
                                        />
                                        {totalTermPaid > 0 && totalTermPaid < requiredAmount && (
                                            <Typography className="chit-pending-label">
                                                ₹{(requiredAmount - totalTermPaid).toLocaleString()} PENDING
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box>
                                        {status === 'PAID' ? (
                                            <div className="flex-center-gap-05">
                                                <CheckCircle2 size={20} color="#10b981" />
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => onRevert(lending, termNum)}
                                                    className="btn-revert-chit"
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
                                                className="btn-pay-chit"
                                            >
                                                PAY
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </div>

                <Box className="chit-footer-belt">
                    <Typography className="chit-footer-label">TOTALS</Typography>
                    <Box />
                    <Typography className="chit-footer-val">
                        ₹{scheduleData.reduce((a, b) => a + b, 0).toLocaleString()}
                    </Typography>
                    <Typography className="chit-footer-paid">
                        ₹{(lending.payments || []).reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                    </Typography>
                    <Typography className="chit-footer-div">
                        ₹{(dividend * 20).toLocaleString()}
                    </Typography>
                    <Box className="chit-footer-total-col">
                        <Typography className="chit-footer-grand">
                            ₹{(multiplier * 475000).toLocaleString()}
                        </Typography>
                        <CheckCircle2 size={20} color="#10b981" />
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
}
