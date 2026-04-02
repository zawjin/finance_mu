import React from 'react';

export default function PageHeader({ title, subtitle }) {
    return (
        <header className="page-header-box">
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{subtitle}</p>
        </header>
    );
}
