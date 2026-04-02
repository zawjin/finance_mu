import React from 'react';

export default function StatCard({ title, value, subtitle, trend, icon }) {
    return (
        <div className="stat-card glass-effect">
            <div className="stat-header">
                <div>
                    <h3 className="stat-title">{title}</h3>
                    <div className="stat-value">{value}</div>
                </div>
                {icon && <div className="stat-icon-wrapper">{icon}</div>}
            </div>
            {(trend || subtitle) && (
                <div className="stat-footer mt-4">
                    {trend && <span className="stat-trend badge-luxury-mini">{trend}</span>}
                    {subtitle && <span className="text-dim text-xs font-bold uppercase tracking-wider">{subtitle}</span>}
                </div>
            )}
        </div>
    );
}
