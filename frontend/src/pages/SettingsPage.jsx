import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Lock, Globe, Users, Activity } from 'lucide-react';

export default function SettingsPage() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em' }}>App Settings</h1>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '1.1rem' }}>Customize your dashboard experience</p>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <SettingCard icon={<Bell size={24} color="#6366f1" />} title="Notifications" description="Manage email alerts and push notifications" />
                <SettingCard icon={<Moon size={24} color="#fb923c" />} title="Appearance" description="Toggle dark mode and theme preferences" />
                <SettingCard icon={<Lock size={24} color="#10b981" />} title="Privacy" description="Control data sharing and security settings" />
                <SettingCard icon={<Globe size={24} color="#8b5cf6" />} title="Regional" description="Set your timezone and preferred currency" />
                <SettingCard icon={<Users size={24} color="#ec4899" />} title="Family Members" description="Invite and manage family access to dashboards" />
                <SettingCard icon={<Activity size={24} color="#ef4444" />} title="Health Integrations" description="Manage external health and fitness trackers" />
            </div>
        </motion.div>
    );
}

const SettingCard = ({ icon, title, description }) => (
    <div 
        style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#fff', padding: '2rem', borderRadius: '24px', border: '1px solid #f1f5f9', cursor: 'pointer', transition: '0.2s transform', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }} 
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} 
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#f8fafc', display: 'grid', placeItems: 'center' }}>
            {icon}
        </div>
        <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>{description}</p>
        </div>
    </div>
);
