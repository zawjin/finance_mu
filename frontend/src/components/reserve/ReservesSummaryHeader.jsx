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
        <div className="reserves-summary-grid">
            <div className="reserves-summary-glass">
                <div className="reserves-summary-info">
                    <div className="reserves-summary-icon-box">
                        <Banknote size={24} />
                    </div>
                    <div>
                        <Typography variant="caption" className="reserves-summary-label">TOTAL RESERVE LIQUIDITY</Typography>
                        <Typography variant="h4" className="reserves-summary-value">{formatCurrency(totalLiquidity)}</Typography>
                    </div>
                </div>

                <div className="reserves-summary-actions">
                    {activeTab === 'accounts' && (
                        <>
                            <Button
                                onClick={onTransfer}
                                startIcon={<ArrowRightLeft size={18} />}
                                className="btn-move-money"
                            >
                                MOVE MONEY
                            </Button>
                            <Button
                                onClick={() => onEdit({})}
                                startIcon={<Plus size={18} />}
                                className="btn-sync-account"
                            >
                                SYNC ACCOUNT
                            </Button>
                        </>
                    )}
                    {activeTab === 'debt-ledger' && (
                        <Button
                            onClick={() => onEditDebt({})}
                            startIcon={<Plus size={18} />}
                            className="btn-move-money"
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
                                className="btn-new-instrument"
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
