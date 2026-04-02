import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ children, title, onClose }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; }
    }, []);

    return (
        <div className="modal-backdrop">
            <div className="modal-surface">
                <div className="modal-header">
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</h2>
                    <button className="icon-btn" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
                </div>
                <div className="modal-body p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
