import { 
    Dialog, DialogTitle, DialogContent, Typography, IconButton, 
    Grow, Box, useMediaQuery, useTheme 
} from '@mui/material';
import { X } from 'lucide-react';
import './BaseDialog.scss';

export default function BaseDialog({ open, onClose, title, children, maxWidth = "sm", borderRadius = "28px", extraHeader }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            TransitionComponent={Grow} 
            fullWidth 
            maxWidth={maxWidth}
            PaperProps={{ 
                sx: { 
                    borderRadius: borderRadius, 
                    overflow: 'hidden',
                    width: fullScreen ? '99%' : 'auto',
                    margin: fullScreen ? '80px auto 0.5rem auto' : 'auto', // Added 80px top margin
                    maxHeight: fullScreen ? 'calc(100% - 100px)' : 'calc(100% - 64px)'
                } 
            }}
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
