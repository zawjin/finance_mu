import React, { useState, useEffect } from 'react';
import { Dialog, Slide, Box, Typography, IconButton, CircularProgress, Paper, Grid, Stack, LinearProgress, Avatar } from '@mui/material';
import { X, Sparkles, TrendingUp, ShieldCheck, Target, Zap, Cpu, Activity, Rocket, FileSearch, ShieldAlert, Binary, Fingerprint, Shield, ZapOff, Network, Layers, BarChart4, ChevronRight, User, Globe, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const LOADING_STEPS = [
    { text: "INJECTING NEURAL BYTES...", icon: <Cpu />, color: "#06b6d4" },
    { text: "MAPPING CAPITAL NETWORKS...", icon: <Globe />, color: "#8b5cf6" },
    { text: "SCANNED: LEAKAGE DETECTED", icon: <ZapOff />, color: "#ec4899" },
    { text: "OPTIMIZING FUTURE VECTORS...", icon: <TrendingUp />, color: "#10b981" }
];

export default function AiAnalysisModal({ open, onClose }) {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 600);

      api.get('/ai/analyze')
        .then(res => {
          setTimeout(() => {
              setData(res.data);
              setLoading(false);
          }, 2400);
        })
        .catch(() => setLoading(false));
      return () => clearInterval(interval);
    }
  }, [open]);

  const accentColor = data?.score > 80 ? '#10b981' : data?.score > 50 ? '#6366f1' : '#f43f5e';

  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition} 
      PaperProps={{ sx: { background: '#020617', color: '#fff', position: 'relative', overflowX: 'hidden' } }}>
      
      {/* CREATIVE QUANTUM BACKGROUND */}
      <Box sx={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <Box component={motion.div} animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 8 }} sx={{ position: 'absolute', top: '10%', right: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </Box>

      {/* COMMAND HEADER */}
      <Box sx={{ position: 'relative', zIndex: 10, px: 4, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255,255,255,0.1)', background: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(20px)' }}>
        <Box display="flex" alignItems="center" gap={2}>
           <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}>
              <Box sx={{ p: 1.5, borderRadius: '50%', border: '2px solid #6366f1', color: '#6366f1', display: 'flex', boxShadow: '0 0 15px rgba(99,102,241,0.5)' }}>
                <Activity size={24} />
              </Box>
           </motion.div>
           <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FRIDAY NEURAL ENGINE</Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 900, letterSpacing: '0.15em' }}>QUANTUM LINK: <span style={{ color: '#10b981' }}>ACTIVE</span></Typography>
           </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff', border: '1px solid rgba(255,255,255,0.2)', '&:hover': { background: '#f43f5e', borderColor: '#f43f5e' } }}>
          <X size={20}/>
        </IconButton>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 8 } }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <Box key="loader" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="65vh" textAlign="center">
                <Box sx={{ position: 'relative', mb: 4 }}>
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Box sx={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'grid', placeItems: 'center', boxShadow: '0 0 50px rgba(99,102,241,0.4)' }}>
                            <Fingerprint size={60} color="#fff" />
                        </Box>
                    </motion.div>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 900, color: LOADING_STEPS[loadingStep].color }}>{LOADING_STEPS[loadingStep].text}</Typography>
                <Typography variant="h6" sx={{ opacity: 0.6, mt: 1 }}>AUTHENTICATING YOUR DATA STREAM...</Typography>
            </Box>
          ) : data && (
            <Box key="data" component={motion.div} initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                <Grid container spacing={4}>
                    
                    {/* LEFT PANEL: TACTICAL METRICS */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={4}>
                            <Paper sx={{ p: 4, borderRadius: '32px', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 4, color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Target color="#10b981" /> VITALITY VECTORS
                                </Typography>
                                <Stack spacing={4}>
                                    {[
                                        { label: "EFFICIENCY INDEX", value: `${data.metrics?.efficiency_score}/10`, color: "#10b981", percent: data.metrics?.efficiency_score * 10 },
                                        { label: "SAFETY RUNWAY", value: `${data.metrics?.wealth_to_spend} MO`, color: "#6366f1", percent: Math.min(100, data.metrics?.wealth_to_spend * 10) }
                                    ].map((metric, i) => (
                                        <Box key={i}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography variant="button" sx={{ fontWeight: 900, color: '#94a3b8' }}>{metric.label}</Typography>
                                                <Typography sx={{ fontWeight: 900, color: metric.color }}>{metric.value}</Typography>
                                            </Box>
                                            <Box sx={{ height: 10, width: '100%', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${metric.percent}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: metric.color, borderRadius: 10 }} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>

                            <Paper sx={{ p: 4, borderRadius: '32px', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <FileSearch color="#6366f1" /> DEEP DOSSIER
                                </Typography>
                                <Stack spacing={3}>
                                    {data.deep_reports?.map((report, idx) => (
                                        <Box key={idx} sx={{ p: 2, borderRadius: '16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', gap: 2 }}>
                                            <Sparkles size={20} color="#6366f1" />
                                            <Typography sx={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>{report}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* CENTER: THE QUANTUM CORE SCORE */}
                    <Grid item xs={12} lg={4}>
                        <Paper sx={{ p: 6, height: '100%', borderRadius: '40px', background: 'linear-gradient(180deg, rgba(255,255,255,0.05), transparent)', border: '2px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 0 80px rgba(99,102,241,0.2)' }}>
                            <Box sx={{ position: 'absolute', top: 30, textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 900, color: '#6366f1', letterSpacing: '0.2em' }}>STRATEGIC VITALITY</Typography>
                                <Typography variant="caption" sx={{ fontWeight: 900, color: '#94a3b8' }}>NEURAL SCORE COMPOSITE</Typography>
                            </Box>
                            
                            <Box sx={{ position: 'relative', width: 300, height: 300, display: 'grid', placeItems: 'center' }}>
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} style={{ position: 'absolute', inset: 0 }}>
                                    <svg width="300" height="300" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke={accentColor} strokeWidth="3" strokeDasharray={`${data.score * 2.8} 280`} strokeLinecap="round" />
                                    </svg>
                                </motion.div>
                                <Box textAlign="center">
                                    <Typography variant="h1" sx={{ fontWeight: 900, fontSize: '6rem', lineHeight: 1, textShadow: `0 0 30px ${accentColor}` }}>{data.score}</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 900, mt: 1, color: accentColor }}>MODIFIER: {data.status}</Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
                                <Box sx={{ p: 2, borderRadius: '15px', background: accentColor, color: '#fff', fontWeight: 900, cursor: 'pointer', boxShadow: `0 10px 20px ${accentColor}40` }}>DECIPHER FULL LEDGER</Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* RIGHT: INTELLIGENCE MODULES */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={3}>
                            {[
                                { title: "WEALTH PULSE", body: data.current_state, color: "#6366f1", icon: <Activity /> },
                                { title: "LEAKAGE ALERT", body: data.avoid_unwanted, color: "#f43f5e", icon: <ShieldAlert /> },
                                { title: "NEURAL CAP", body: data.control_spending, color: "#fb923c", icon: <Layers /> },
                                { title: "GROWTH VECTOR", body: data.future_savings, color: "#10b981", icon: <Rocket /> }
                            ].map((card, i) => (
                                <Box key={i} sx={{ p: 4, borderRadius: '32px', background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', transition: '0.3s', '&:hover': { transform: 'translateX(10px)', background: 'rgba(255,255,255,0.06)', borderColor: card.color } }}>
                                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                                        <Box sx={{ color: card.color }}>{card.icon}</Box>
                                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff' }}>{card.title}</Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight: 700, color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.4 }}>{card.body}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Grid>

                </Grid>
            </Box>
          )}
        </AnimatePresence>
      </Box>
    </Dialog>
  );
}







