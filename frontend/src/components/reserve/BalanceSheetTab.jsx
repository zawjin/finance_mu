import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart3, TrendingUp, TrendingDown, Landmark, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function BalanceSheetTab({ filteredRows, bsTotals }) {
    return (
        <div className="spending-main-content" style={{ gridColumn: '1 / -1' }}>
            <div className="data-table-premium scroll-y-luxury">
                <div className="date-group">
                    <div className="date-header-luxury">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <BarChart3 size={14} color="#1d1d1f" />
                            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>MONTHLY BALANCE SHEET</span>
                        </div>
                    </div>
                    <div className="responsive-table-container" style={{ padding: '0 1.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                    <th style={{ textAlign: 'left', padding: '1.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 900, color: '#86868b' }}>MONTH</th>
                                    <th style={{ textAlign: 'right', padding: '1.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 900, color: '#ff3b30' }}>TOTAL DEBITS</th>
                                    <th style={{ textAlign: 'right', padding: '1.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 900, color: '#34c759' }}>TOTAL CREDITS</th>
                                    <th style={{ textAlign: 'right', padding: '1.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 900, color: '#1d1d1f' }}>NET POSITION</th>
                                    <th style={{ textAlign: 'right', padding: '1.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 900, color: '#6366f1' }}>CUMULATIVE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map(row => (
                                    <tr key={row.month} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                        <td style={{ padding: '1.25rem 0.5rem', fontWeight: 800, fontSize: '0.85rem' }}>{row.month}</td>
                                        <td style={{ textAlign: 'right', padding: '1.25rem 0.5rem', fontWeight: 800, color: '#ff3b30' }}>{formatCurrency(row.debits)}</td>
                                        <td style={{ textAlign: 'right', padding: '1.25rem 0.5rem', fontWeight: 800, color: '#34c759' }}>{formatCurrency(row.credits)}</td>
                                        <td style={{ textAlign: 'right', padding: '1.25rem 0.5rem', fontWeight: 900, color: row.net > 0 ? '#34c759' : '#ff3b30' }}>{formatCurrency(row.net)}</td>
                                        <td style={{ textAlign: 'right', padding: '1.25rem 0.5rem', fontWeight: 900, color: '#1d1d1f' }}>{formatCurrency(row.closing)}</td>
                                    </tr>
                                ))}
                                <tr style={{ background: 'rgba(0,0,0,0.02)', fontWeight: 900 }}>
                                    <td style={{ padding: '1.5rem 0.5rem' }}>TOTALS</td>
                                    <td style={{ textAlign: 'right', padding: '1.5rem 0.5rem', color: '#ff3b30' }}>{formatCurrency(bsTotals.debits)}</td>
                                    <td style={{ textAlign: 'right', padding: '1.5rem 0.5rem', color: '#34c759' }}>{formatCurrency(bsTotals.credits)}</td>
                                    <td style={{ textAlign: 'right', padding: '1.5rem 0.5rem' }}>{formatCurrency(bsTotals.net)}</td>
                                    <td style={{ textAlign: 'right', padding: '1.5rem 0.5rem' }}>-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
