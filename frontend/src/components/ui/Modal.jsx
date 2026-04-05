import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ children, title, onClose, maxWidth }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; }
    }, []);

    return (
        <div className="modal-overlay-dark" style={{ 
            position: 'fixed', inset: 0, zIndex: 10000, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            display: 'grid', placeItems: 'center'
        }}>
            <div className="modal-box-premium" style={{ 
                maxWidth: maxWidth || '850px', background: 'white', 
                borderRadius: '28px', overflow: 'hidden', 
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div className="modal-header" style={{ padding: '1.5rem 2.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', background: '#fcfcfd' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#1d1d1f' }}>{title}</h2>
                    <button 
                        onClick={onClose} 
                        style={{ border: 'none', background: 'rgba(0,0,0,0.05)', width: '36px', height: '36px', borderRadius: '10px', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: '0.2s' }}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body" style={{ maxHeight: '85vh', overflowY: 'auto', padding: '1rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
