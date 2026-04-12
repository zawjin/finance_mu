import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield } from 'lucide-react';
import './ProfilePage.scss';

export default function ProfilePage() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="profile-page-container"
        >
            <div className="profile-header">
                <div>
                    <h1 className="profile-title">User Profile</h1>
                    <p className="profile-subtitle">Manage your personal details and security</p>
                </div>
            </div>

            <div className="profile-card">
                <div className="profile-info-row">
                    <div className="avatar-box">S</div>
                    <div>
                        <h2 className="user-name">Shajin</h2>
                        <p className="user-email"><Mail size={16} /> shajin@example.com</p>
                    </div>
                </div>

                <div className="profile-grid">
                    <div className="profile-input-group">
                        <span className="profile-label">Full Name</span>
                        <input type="text" defaultValue="Shajin" className="profile-input" />
                    </div>
                    <div className="profile-input-group">
                        <span className="profile-label">Email Address</span>
                        <input type="email" defaultValue="shajin@example.com" className="profile-input" />
                    </div>
                </div>

                <button className="profile-save-btn">
                    <Shield size={18} /> SAVE CHANGES
                </button>
            </div>
        </motion.div>
    );
}
