import {
    Dialog, DialogTitle, DialogContent, Typography, IconButton,
    Slide, Grow, Box, useMediaQuery, useTheme
} from '@mui/material';
import { forwardRef, useEffect } from 'react';
import { X } from 'lucide-react';
import './BaseDialog.scss';

// Bottom sheet slide-up transition for mobile
const SlideUp = forwardRef(function SlideUp(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function BaseDialog({ open, onClose, title, children, maxWidth = "sm", borderRadius = "28px", extraHeader }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const checkMobile = () => window.innerWidth <= 768;
        if (checkMobile() && open) {
            document.body.classList.add('dialog-open-mobile');
        } else {
            document.body.classList.remove('dialog-open-mobile');
        }
        return () => {
            document.body.classList.remove('dialog-open-mobile');
        };
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={isMobile ? SlideUp : Grow}
            fullWidth
            maxWidth={maxWidth}
            PaperProps={{
                className: `base-dialog-paper${isMobile ? ' mobile-sheet' : ''}`,
                sx: {
                    borderRadius: isMobile ? '28px 28px 0 0' : borderRadius,
                    overflow: 'hidden',
                    margin: isMobile ? '0' : 'auto',
                    width: isMobile ? '100%' : undefined,
                    maxWidth: isMobile ? '100% !important' : undefined,
                    maxHeight: isMobile ? '92dvh' : 'calc(100% - 64px)',
                    position: isMobile ? 'fixed' : 'relative',
                    bottom: isMobile ? 0 : undefined,
                    left: isMobile ? 0 : undefined,
                    right: isMobile ? 0 : undefined,
                }
            }}
            sx={{
                '& .MuiDialog-container': {
                    alignItems: isMobile ? 'flex-end' : 'center',
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
                    <X size={isMobile ? 18 : 20} />
                </IconButton>
            </DialogTitle>
            <DialogContent className="dialog-base-content">
                {children}
            </DialogContent>
        </Dialog>
    );
}
