import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield } from 'lucide-react';

export default function ProfilePage() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>User Profile</h1>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '1.1rem' }}>Manage your personal details and security</p>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', padding: '3rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '2rem', marginBottom: '2rem' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '2.5rem', fontWeight: 900 }}>S</div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Shajin</h2>
                        <p style={{ margin: '0.2rem 0', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> shajin@example.com</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</span>
                        <input type="text" defaultValue="Shajin" style={{ padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</span>
                        <input type="email" defaultValue="shajin@example.com" style={{ padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }} />
                    </div>
                </div>

                <button style={{ marginTop: '2.5rem', background: '#0f172a', color: '#fff', padding: '1rem 2rem', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Shield size={18} /> SAVE CHANGES
                </button>
            </div>
        </motion.div>
    );
}
