import React from 'react';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';

export default function Loader({ message = "Synchronizing Data..." }) {
    return (
        <Box 
            sx={{ 
                height: '70vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 3
            }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {/* Main Spinner */}
                <CircularProgress 
                    size={80} 
                    thickness={2.5} 
                    sx={{ color: 'primary.main', opacity: 0.8 }} 
                />
                
                {/* Inner Static Ring for high-end look */}
                <CircularProgress 
                    variant="determinate" 
                    value={100} 
                    size={80} 
                    thickness={2.5} 
                    sx={{ color: 'rgba(0,113,227,0.08)', position: 'absolute' }} 
                />
            </motion.div>

            <Stack spacing={0.5} alignItems="center">
                <Typography 
                    variant="h6" 
                    fontWeight="800" 
                    color="text.primary" 
                    sx={{ letterSpacing: '-0.02em' }}
                >
                    {message}
                </Typography>
                <Typography 
                    variant="caption" 
                    fontWeight="700" 
                    color="text.secondary" 
                    sx={{ letterSpacing: '0.1em', opacity: 0.6 }}
                >
                    UPDATING GLOBAL FINANCE LEDGER
                </Typography>
            </Stack>
        </Box>
    );
}
