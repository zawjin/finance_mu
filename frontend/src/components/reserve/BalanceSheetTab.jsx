import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart3, TrendingUp, TrendingDown, Landmark, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import './BalanceSheetTab.scss';

export default function BalanceSheetTab({ filteredRows, bsTotals }) {
    return (
        <div className="spending-main-content balance-sheet-layout">
            <div className="data-table-premium scroll-y-luxury">
                <div className="date-group">
                    <div className="date-header-luxury">
                        <div className="table-header-flex">
                            <BarChart3 size={14} color="#1d1d1f" />
                            <span className="table-header-title">MONTHLY BALANCE SHEET</span>
                        </div>
                    </div>
                    <div className="responsive-table-container table-container-padded">
                        <table className="premium-data-table">
                            <thead>
                                <tr>
                                    <th className="th-month">MONTH</th>
                                    <th className="th-debits">TOTAL DEBITS</th>
                                    <th className="th-credits">TOTAL CREDITS</th>
                                    <th className="th-net">NET POSITION</th>
                                    <th className="th-cumulative">CUMULATIVE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map(row => (
                                    <tr key={row.month}>
                                        <td>{row.month}</td>
                                        <td className="th-debits">{formatCurrency(row.debits)}</td>
                                        <td className="th-credits">{formatCurrency(row.credits)}</td>
                                        <td className={row.net > 0 ? "td-value-pos" : "td-value-neg"}>
                                            {formatCurrency(row.net)}
                                        </td>
                                        <td className="th-net">{formatCurrency(row.closing)}</td>
                                    </tr>
                                ))}
                                <tr className="table-footer">
                                    <td>TOTALS</td>
                                    <td className="total-debits">{formatCurrency(bsTotals.debits)}</td>
                                    <td className="total-credits">{formatCurrency(bsTotals.credits)}</td>
                                    <td>{formatCurrency(bsTotals.net)}</td>
                                    <td>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
