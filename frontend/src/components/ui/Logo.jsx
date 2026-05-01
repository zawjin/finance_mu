import React from 'react';
import { Box, Typography } from '@mui/material';
import './Logo.scss';

export default function Logo({ size = 'medium', className = '' }) {
    const letters = [
        { char: 'S', color: '#00AEEF' },
        { char: 'A', color: '#A855F7' },
        { char: 'L', color: '#FFFFFF', textColor: '#A855F7' },
        { char: 'F', color: '#10B981' }
    ];

    return (
        <Box className={`sale-logo-container ${size} ${className}`}>
            {letters.map((item, index) => (
                <Box 
                    key={index} 
                    className="logo-box" 
                    sx={{ 
                        bgcolor: item.color,
                        color: item.textColor || 'white',
                        border: item.char === 'L' ? '1px solid rgba(168, 85, 247, 0.1)' : 'none'
                    }}
                >
                    <Typography className="logo-letter">{item.char}</Typography>
                </Box>
            ))}
        </Box>
    );
}
