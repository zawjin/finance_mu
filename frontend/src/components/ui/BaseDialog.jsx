import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Grow, Box } from '@mui/material';
import { X } from 'lucide-react';
import './BaseDialog.scss';

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
            <DialogTitle className="dialog-base-title">
                <Box sx={{ flex: 1 }}>
                    <Typography component="span" className="dialog-title-text">
                        {title}
                    </Typography>
                    {extraHeader}
                </Box>
                <IconButton 
                    onClick={onClose} 
                    className="dialog-close-btn"
                >
                    <X size={20} />
                </IconButton>
            </DialogTitle>
            <DialogContent className="dialog-base-content">
                {children}
            </DialogContent>
        </Dialog>
    );
}
