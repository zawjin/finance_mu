import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Gem, Home, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';
import Loader from '../components/ui/Loader';

export default function InvestmentPage() {
    const { investments, loading } = useSelector(state => state.finance);

    if (loading) return <Loader message="Revaluing Assets..." />;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container">
            <PageHeader title="Asset Portfolio" subtitle="Managing your wealth classes." />
            <div className="investments-grid">
                {investments.map((inv, idx) => (
                    <div key={idx} className="asset-card-fancy glass-effect">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div className="asset-icon-box">
                                {inv.type === 'Gold' ? <Gem color="#f59e0b" /> : (inv.type === 'Property' ? <Home color="#6366f1" /> : <DollarSign color="#10b981" />)}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="text-dim" style={{ fontSize: '0.7rem', fontWeight: 800 }}>{inv.type.toUpperCase()}</div>
                                <div style={{ fontSize: '0.8rem' }}>{inv.date}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{inv.name}</div>
                        <div className="text-dim" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>{inv.details}</div>
                        <div className="asset-value-label">{formatCurrency(inv.value)}</div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
