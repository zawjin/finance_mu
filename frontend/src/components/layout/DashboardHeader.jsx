import React from 'react';
import { Search, Bell, User, Plus, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const DashboardHeader = ({ onAdd, onOpenAiModal }) => {
    const location = useLocation();

    return (
        <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1.5rem 2.5rem', 
            background: '#fff', 
            borderBottom: '1px solid #f1f5f9',
            marginTop: '0.5rem',
            marginLeft: '5.5rem',
            width: 'calc(100% - 5.5rem)',
            position: 'sticky',
            top: 0,
            zIndex: 900
        }}>
            <div style={{ position: 'relative', width: '350px' }}>
                <input 
                    type="text" 
                    placeholder="Enter your search request" 
                    style={{ 
                        width: '100%', 
                        padding: '0.75rem 1rem 0.75rem 3rem', 
                        borderRadius: '12px', 
                        border: 'none', 
                        background: '#f8fafc',
                        color: '#64748b',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: '0.3s'
                    }}
                />
                <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button 
                    onClick={onOpenAiModal}
                    style={{ 
                        background: '#1e293b', 
                        color: '#fff', 
                        border: 'none', 
                        padding: '0.7rem 1.2rem', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontWeight: 800, 
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                    }}
                >
                    <Sparkles size={16} color="#fb923c" /> AI Strategist
                </button>

                {(location.pathname === '/spending' || location.pathname === '/investments') && (
                    <button 
                        onClick={onAdd}
                        style={{ 
                            background: '#fb923c', 
                            color: '#1c1917', 
                            border: 'none', 
                            padding: '0.7rem 1.2rem', 
                            borderRadius: '10px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            fontWeight: 800, 
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        <Plus size={16} /> Sync {location.pathname === '/investments' ? 'Asset' : 'Record'}
                    </button>
                )}

                <Box sx={{ p: 1, borderRadius: '10px', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}><Bell size={20} /></Box>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem', cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a' }}>Vignesh S</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>Elite Tier</div>
                    </div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #fb923c, #78350f)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>VS</div>
                </div>
            </div>
        </header>
    );
};

const Box = ({ children, sx }) => <div style={{ ...sx }}>{children}</div>;

export default DashboardHeader;
