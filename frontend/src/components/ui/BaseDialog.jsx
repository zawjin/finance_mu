import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Grow, Box } from '@mui/material';
import { X } from 'lucide-react';

export default function BaseDialog({ open, onClose, title, children, maxWidth = "sm", borderRadius = "28px", extraHeader }) {
    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            TransitionComponent={Grow} 
            fullWidth 
            maxWidth={maxWidth} 
            PaperProps={{ sx: { borderRadius, overflow: 'hidden' } }}
        >
            <DialogTitle sx={{ 
                p: 4, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                background: '#fff'
            }}>
                <Box sx={{ flex: 1 }}>
                    <Typography component="span" sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-0.04em' }}>
                        {title}
                    </Typography>
                    {extraHeader}
                </Box>
                <IconButton 
                    onClick={onClose} 
                    sx={{ bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                >
                    <X size={20} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
                {children}
            </DialogContent>
        </Dialog>
    );
}
