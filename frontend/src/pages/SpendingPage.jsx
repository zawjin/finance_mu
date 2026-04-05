import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Tag, Calendar, CalendarDays, Clock, Filter,
    PieChart, Layers, History, X, Download, Activity,
    Utensils, ShoppingBag, Heart, Zap, Briefcase, Lightbulb,
    Truck, Globe, Package, ShoppingCart, Stethoscope, BarChart2,
    TrendingUp, ArrowUpRight, Plus, Edit2, Trash2, Settings, PlusCircle, Fingerprint,
    ShoppingBag as ShoppingBagIcon, Car, Zap as ZapIcon, Gamepad2, CreditCard, Plane, Home,
    Music, Coffee, Smartphone, Laptop, Tv, Film, Camera, Dumbbell, Bike, Scissors, Wrench,
    Umbrella, Wind, Sun, Moon, Cloud, Star, Shield, Key, Lock, Bell, Mail, Phone, MapPin,
    Flag, Globe as GlobeIcon, Cpu, HardDrive, Database, Book, Library, Building, Store,
    Coins, Euro, PoundSterling, JapaneseYen, Bitcoin, Landmark, Wallet, Terminal, Gavel, Code, Webhook, Hash, Hexagon,
    Server, Wifi, Settings2, Bus, TrainFront, Ship, TramFront, Mountain, Tent, Palmtree,
    ChefHat, Cookie, Croissant, Egg, IceCreamCone, Milk, Pizza, Soup, Wine, Activity as ActivityIcon,
    Bone, Brain, HeartPulse, Microscope, Syringe, Thermometer, Bath, Bed, Lamp, Refrigerator,
    Sofa, WashingMachine, Bird, Bug, Dog, Fish, Flower, Leaf, Rabbit, TreeDeciduous,
    TreePine, Brush, Music2, Mic2, Palette, PenTool, Piano, Theater, Anchor, Archive,
    Atom, Battery, Binary, Box as BoxIcon, Calculator, Clock as ClockIcon, Compass,
    Component, Construction, Crown, Diamond, Dice5, Droplets, Eye, Flame, FlaskConical,
    Gamepad, Gift, Glasses, GraduationCap, Hammer, Infinity, Joystick, Lasso, LifeBuoy,
    Monitor, Mouse, Network, Newspaper, Nut, Orbit, Paperclip, PawPrint, PersonStanding,
    Pipette, Plug, Printer, Puzzle, Quote, Radiation, Radio, Rocket, Send, Share2,
    Shrink, Shuffle, Skull, Smile, Target, Ticket, Timer, Trophy, User as UserIcon, Users,
    Video, Volume2, Watch
} from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import { Skeleton, Box, Button, Typography, Grid, IconButton, Divider, Dialog, DialogTitle, DialogContent, Grow } from '@mui/material';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';

// Charting
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, BarElement, LineElement, PointElement,
    CategoryScale, LinearScale, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

// Universal Icon Map Projection
const IconMap = {
    Package: <Package />, Heart: <Heart />, ShoppingCart: <ShoppingCart />,
    Stethoscope: <Stethoscope />, Briefcase: <Briefcase />, Utensils: <Utensils />,
    ShoppingBag: <ShoppingBag />, Car: <Car />, Zap: <Zap />,
    Gamepad2: <Gamepad2 />, CreditCard: <CreditCard />, Plane: <Plane />,
    Home: <Home />, Music: <Music />, Coffee: <Coffee />, Smartphone: <Smartphone />,
    Laptop: <Laptop />, Tv: <Tv />, Film: <Film />, Camera: <Camera />,
    Dumbbell: <Dumbbell />, Bike: <Bike />, Scissors: <Scissors />, Wrench: <Wrench />,
    Umbrella: <Umbrella />, Wind: <Wind />, Sun: <Sun />, Moon: <Moon />,
    Cloud: <Cloud />, Star: <Star />, Shield: <Shield />, Key: <Key />,
    Lock: <Lock />, Bell: <Bell />, Mail: <Mail />, Phone: <Phone />,
    MapPin: <MapPin />, Flag: <Flag />, Globe: <Globe />, Cpu: <Cpu />,
    HardDrive: <HardDrive />, Database: <Database />, Book: <Book />,
    Library: <Library />, Building: <Building />, Store: <Store />,
    Coins: <Coins />, Euro: <Euro />, PoundSterling: <PoundSterling />,
    JapaneseYen: <JapaneseYen />, Bitcoin: <Bitcoin />, Landmark: <Landmark />,
    TrendingUp: <TrendingUp />, Wallet: <Wallet />, Gavel: <Gavel />,
    Terminal: <Terminal />, Code: <Code />, Webhook: <Webhook />, Hash: <Hash />,
    Hexagon: <Hexagon />, Server: <Server />, Wifi: <Wifi />, Settings2: <Settings2 />,
    Bus: <Bus />, TrainFront: <TrainFront />, Ship: <Ship />, TramFront: <TramFront />,
    Mountain: <Mountain />, Tents: <Tent />, Palmtree: <Palmtree />,
    ChefHat: <ChefHat />, Cookie: <Cookie />, Croissant: <Croissant />, Egg: <Egg />,
    IceCream: <IceCreamCone />, Milk: <Milk />, Pizza: <Pizza />, Soup: <Soup />, Wine: <Wine />,
    Activity: <Activity />, Bones: <Bone />, Brain: <Brain />, HeartPulse: <HeartPulse />,
    Microscope: <Microscope />, Syringe: <Syringe />, Thermometer: <Thermometer />,
    Bath: <Bath />, Bed: <Bed />, Lamp: <Lamp />, Refrigerator: <Refrigerator />,
    Sofa: <Sofa />, WashingMachine: <WashingMachine />,
    Bird: <Bird />, Bug: <Bug />, Dog: <Dog />, Fish: <Fish />, Flower: <Flower />,
    Leaf: <Leaf />, Rabbit: <Rabbit />, TreeDeciduous: <TreeDeciduous />, TreePine: <TreePine />,
    Brush: <Brush />, Music2: <Music2 />, Mic2: <Mic2 />, Palette: <Palette />,
    PenTool: <PenTool />, Piano: <Piano />, Theater: <Theater />,
    Anchor: <Anchor />, Archive: <Archive />, Atom: <Atom />, Battery: <Battery />,
    Binary: <Binary />, Box: <BoxIcon />, Calculator: <Calculator />, Clock: <Clock />,
    Compass: <Compass />, Component: <Component />, Construction: <Construction />,
    Crown: <Crown />, Diamond: <Diamond />, Dice5: <Dice5 />, Droplets: <Droplets />,
    Eye: <Eye />, Flame: <Flame />, FlaskConical: <FlaskConical />, Gamepad: <Gamepad />,
    Gift: <Gift />, Glasses: <Glasses />, GraduationCap: <GraduationCap />, Hammer: <Hammer />,
    Infinity: <Infinity />, Joystick: <Joystick />, Lasso: <Lasso />, LifeBuoy: <LifeBuoy />,
    Monitor: <Monitor />, Mouse: <Mouse />, Network: <Network />, Newspaper: <Newspaper />,
    Nut: <Nut />, Orbit: <Orbit />, Paperclip: <Paperclip />, PawPrint: <PawPrint />,
    PersonStanding: <PersonStanding />, Pipette: <Pipette />, Plug: <Plug />,
    Printer: <Printer />, Puzzle: <Puzzle />, Quote: <Quote />, Radiation: <Radiation />,
    Radio: <Radio />, Rocket: <Rocket />, Search: <Search />, Send: <Send />,
    Share2: <Share2 />, Shrink: <Shrink />, Shuffle: <Shuffle />, Skull: <Skull />,
    Smile: <Smile />, Target: <Target />, Ticket: <Ticket />, Timer: <Timer />,
    Trophy: <Trophy />, Truck: <Truck />, User: <UserIcon />, Users: <Users />,
    Video: <Video />, Volume2: <Volume2 />, Watch: <Watch />
};

const getIcon = (catName, categories = [], options = {}) => {
    const cat = categories.find(c => c.name === catName);
    const iconName = cat?.icon || 'Package';
    const color = options.color || cat?.color || '#0071e3';

    const fillValue = options.fill === 'none' ? 'none' : (options.fill || `${color}30`);
    const props = {
        size: options.size || 16,
        color: color,
        fill: fillValue,
        strokeWidth: options.strokeWidth || 2.5,
        style: options.style || { filter: `drop-shadow(0 2px 4px ${color}15)` }
    };

    const IconComponent = IconMap[iconName] || <Package />;
    return React.cloneElement(IconComponent, props);
};

const getCatStyle = (catName, categories = []) => {
    const cat = categories.find(c => c.name === catName);
    const color = cat?.color || '#8e8e93';
    return { bg: `${color}12`, color: color };
};

export default function SpendingPage({ onEdit, showAnalytics, onToggleAnalytics }) {
    const dispatch = useDispatch();
    const { spending, categories, loading } = useSelector(state => state.finance);

    // Filters State
    const [search, setSearch] = useState('');
    const [selectedCat, setSelectedCat] = useState('ALL');
    const [selectedSub, setSelectedSub] = useState('ALL');
    const [period, setPeriod] = useState('ALL');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

    const handleRemove = async () => {
        if (!deleteConfirmItem) return;
        try {
            await api.delete(`/spending/${deleteConfirmItem._id}`);
            dispatch(fetchFinanceData());
            setDeleteConfirmItem(null);
        } catch (err) {
            console.error(err);
            alert("Purge failed. Cloud link unstable.");
        }
    };

    const filteredSpending = useMemo(() => {
        return spending.filter(item => {
            const matchesSearch = item.description.toLowerCase().includes(search.toLowerCase()) ||
                item.category.toLowerCase().includes(search.toLowerCase());
            const matchesCat = selectedCat === 'ALL' || item.category === selectedCat;
            const matchesSub = selectedSub === 'ALL' || item.sub_category === selectedSub;

            let matchesPeriod = true;
            const itemDate = dayjs(item.date);
            const now = dayjs();

            if (period === 'TODAY') matchesPeriod = itemDate.isSame(now, 'day');
            else if (period === 'YESTERDAY') matchesPeriod = itemDate.isSame(now.subtract(1, 'day'), 'day');
            else if (period === 'THIS WEEK') matchesPeriod = itemDate.isAfter(now.startOf('week').subtract(1, 'ms'));
            else if (period === 'THIS MONTH') matchesPeriod = itemDate.isAfter(now.startOf('month').subtract(1, 'ms'));
            else if (period === 'PREVIOUS MONTH') {
                const prev = now.subtract(1, 'month');
                matchesPeriod = itemDate.isAfter(prev.startOf('month').subtract(1, 'ms')) && itemDate.isBefore(prev.endOf('month').add(1, 'ms'));
            }
            else if (period === 'CUSTOM') {
                if (dateRange.start) matchesPeriod = matchesPeriod && itemDate.isAfter(dayjs(dateRange.start).subtract(1, 'day'));
                if (dateRange.end) matchesPeriod = matchesPeriod && itemDate.isBefore(dayjs(dateRange.end).add(1, 'day'));
            }

            return matchesSearch && matchesCat && matchesSub && matchesPeriod;
        });
    }, [spending, search, selectedCat, selectedSub, period, dateRange]);
    
    // Global Position (Unfiltered Persistent State)
    const globalSummary = useMemo(() => {
        let gross = 0;
        let recovered = 0;
        spending.forEach(item => {
            gross += item.amount || 0;
            recovered += item.recovered || 0;
        });
        return { gross, recovered, net: gross - recovered };
    }, [spending]);

    // Analytics Extraction (Accounting Standard)
    const totals = useMemo(() => {
        let grossSpend = 0;
        let grossRecovered = 0;
        const catStats = {}; // { category: { spend: 0, recovered: 0, net: 0 } }

        filteredSpending.forEach(item => {
            const amt = item.amount || 0;
            const rec = item.recovered || 0;
            const cat = item.category;
            
            if (!catStats[cat]) catStats[cat] = { spend: 0, recovered: 0, net: 0 };

            grossSpend += amt;
            grossRecovered += rec;
            catStats[cat].spend += amt;
            catStats[cat].recovered += rec;
            catStats[cat].net += (amt - rec);
        });

        return { grossSpend, grossRecovered, net: grossSpend - grossRecovered, catStats };
    }, [filteredSpending]);

    const trendAnalysis = useMemo(() => {
        const dailyNet = {};
        filteredSpending.forEach(s => { 
            const amt = (s.amount || 0) - (s.recovered || 0);
            dailyNet[s.date] = (dailyNet[s.date] || 0) + amt; 
        });
        const dates = Object.keys(dailyNet).sort();
        let cumulative = 0;
        const cumulativeData = dates.map(d => { cumulative += dailyNet[d]; return cumulative; });

        return {
            labels: dates.map(d => dayjs(d).format('MMM DD')),
            daily: dates.map(d => dailyNet[d]),
            cumulative: cumulativeData
        };
    }, [filteredSpending]);

    const chartConfig = useMemo(() => {
        const catLabels = Object.keys(totals.catStats).filter(l => totals.catStats[l].spend > 0);
        const catColors = catLabels.map(l => getCatStyle(l, categories).color);

        return {
            doughnut: {
                labels: catLabels,
                datasets: [{
                    data: catLabels.map(l => totals.catStats[l].spend),
                    backgroundColor: catColors.map(c => `${c}40`),
                    borderColor: catColors,
                    borderWidth: 2,
                    cutout: '72%'
                }]
            },
            trajectory: {
                labels: trendAnalysis.labels,
                datasets: [{
                    label: 'Cumulative Burn',
                    data: trendAnalysis.cumulative,
                    borderColor: '#34c759',
                    backgroundColor: 'rgba(52, 199, 89, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 2
                }]
            },
            bar: {
                labels: trendAnalysis.labels,
                datasets: [{
                    label: 'Daily Burn',
                    data: trendAnalysis.daily,
                    backgroundColor: 'rgba(0, 113, 227, 0.4)',
                    borderColor: '#0071e3',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            }
        };
    }, [totals, trendAnalysis]);

    const handleExportCSV = () => {
        const headers = ["Date", "Description", "Category", "Sub Category", "Amount"];
        const rows = filteredSpending.map(s => [s.date, s.description, s.category, s.sub_category, s.amount]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_${dayjs().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-container-super">

            {/* ANALYTICS HUB - TRIPLE BOX CONVERGENCE */}
            {showAnalytics && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    style={{ marginBottom: '2.5rem', overflow: 'hidden' }}
                >
                    <Box sx={{ p: 4, borderRadius: '32px', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch', width: '100%' }}>
                            {/* BOX 1: ARCHITECTURE - 20% */}
                            <div style={{ flex: '0 0 calc(20% - 1rem)', maxWidth: 'calc(20% - 1rem)' }}>
                                <Box sx={{ p: 3, borderRadius: '24px', bgcolor: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PieChart size={14} color="var(--primary)" /> ARCHITECTURE
                                    </Typography>
                                    <Box sx={{ height: 180, position: 'relative', display: 'grid', placeItems: 'center', mb: 3 }}>
                                        <Doughnut data={chartConfig.doughnut} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
                                        <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block' }}>BURN</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 900, fontSize: '0.85rem' }}>{formatCurrency(totals.grossSpend)}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {Object.entries(totals.catStats).sort((a, b) => b[1].spend - a[1].spend).slice(0, 3).map(([cat, stats]) => (
                                            <Box key={cat} sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'white', p: 1.25, borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getCatStyle(cat, categories).color }}></div>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.65rem' }}>{cat}</Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ fontWeight: 900, color: getCatStyle(cat, categories).color, fontSize: '0.65rem' }}>{formatCurrency(stats.net)}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </div>

                            {/* BOX 2: TRAJECTORY - 40% */}
                            <div style={{ flex: '0 0 calc(40% - 0.75rem)', maxWidth: 'calc(40% - 0.75rem)' }}>
                                <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TrendingUp size={14} color="#34c759" /> TRAJECTORY
                                        </Typography>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#34c759', lineHeight: 1 }}>{formatCurrency(trendAnalysis.cumulative.slice(-1)[0] || 0)}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>CUMULATIVE</Typography>
                                        </Box>
                                    </div>
                                    <Box sx={{ flex: 1, minHeight: 320 }}>
                                        <Line
                                            data={chartConfig.trajectory}
                                            options={{
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 9, weight: 800 }, color: '#86868b' } },
                                                    y: { grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false }, ticks: { font: { family: 'Outfit', size: 10, weight: 800 }, color: '#86868b' } }
                                                },
                                                maintainAspectRatio: false
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </div>

                            {/* BOX 3: VELOCITY - 40% */}
                            <div style={{ flex: '0 0 calc(40% - 0.75rem)', maxWidth: 'calc(40% - 0.75rem)' }}>
                                <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Activity size={14} color="#0071e3" /> VELOCITY
                                    </Typography>
                                    <Box sx={{ flex: 1, minHeight: 320 }}>
                                        <Bar
                                            data={chartConfig.bar}
                                            options={{
                                                plugins: { legend: { display: false } },
                                                scales: {
                                                    x: { grid: { display: false }, ticks: { font: { family: 'Outfit', size: 9, weight: 800 }, color: '#86868b' } },
                                                    y: { grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false }, ticks: { font: { family: 'Outfit', size: 10, weight: 800 }, color: '#86868b' } }
                                                },
                                                maintainAspectRatio: false
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </div>
                        </div>
                    </Box>
                </motion.div>
            )}
            
            {/* PERMANENT PURGE CONFIRMATION DIALOG - POP UP MODAL */}
            <Dialog 
                open={!!deleteConfirmItem} 
                onClose={() => setDeleteConfirmItem(null)}
                TransitionComponent={Grow}
                transitionDuration={400}
                PaperProps={{ 
                    sx: { 
                        borderRadius: '28px', 
                        overflow: 'hidden', 
                        width: '100%', 
                        maxWidth: '440px', 
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' 
                    } 
                }}
            >
                {deleteConfirmItem && (
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'white' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', display: 'grid', placeItems: 'center', margin: '0 auto 1.5rem' }}>
                            <Trash2 size={32} />
                        </div>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: '#1d1d1f' }}>CRITICAL PURGE</Typography>
                        <Typography variant="body1" sx={{ color: '#86868b', mb: 3, lineHeight: 1.6, fontSize: '0.95rem' }}>
                            Permanently purge <strong style={{color: '#1d1d1f'}}>{deleteConfirmItem.description}</strong> from the primary ledger? This action is irreversible.
                        </Typography>
                        
                        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.25rem', borderRadius: '18px', marginBottom: '2rem', textAlign: 'left', border: '1px solid rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                                <span style={{ opacity: 0.6, fontSize: '0.7rem', fontWeight: 800 }}>CATEGORY</span>
                                <span style={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: '0.02em' }}>{deleteConfirmItem.category}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ opacity: 0.6, fontSize: '0.7rem', fontWeight: 800 }}>AUDIT AMOUNT</span>
                                <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#ff3b30' }}>{formatCurrency(deleteConfirmItem.amount)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button fullWidth onClick={() => setDeleteConfirmItem(null)} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, color: '#1d1d1f', bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }, textTransform: 'none' }}>ABORT</Button>
                            <Button fullWidth variant="contained" onClick={handleRemove} sx={{ borderRadius: '50px', p: '0.9rem', fontWeight: 800, bgcolor: '#ff3b30', boxShadow: '0 10px 20px -5px rgba(255,59,48,0.3)', '&:hover': { bgcolor: '#e03228', transform: 'translateY(-2px)' }, textTransform: 'none', transition: '0.2s' }}>PROCEED PURGE</Button>
                        </div>
                    </Box>
                )}
            </Dialog>

            {/* FINANCIAL SUMMARY CORE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="glass-effect" style={{ padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', display: 'grid', placeItems: 'center' }}><Download size={20} style={{ transform: 'rotate(180deg)' }} /></div>
                    <div>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', mb: -0.5 }}>GROSS DEBIT</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{formatCurrency(totals.grossSpend)}</Typography>
                    </div>
                </div>
                <div className="glass-effect" style={{ padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(52,199,89,0.1)', color: '#34c759', display: 'grid', placeItems: 'center' }}><Download size={20} /></div>
                    <div>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', mb: -0.5 }}>TOTAL RECOVERY</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#34c759' }}>{formatCurrency(totals.grossRecovered)}</Typography>
                    </div>
                </div>
                <div className="glass-effect" style={{ padding: '1.25rem', borderRadius: '1.5rem', border: '1.5px solid rgba(0,113,227,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,113,227,0.03)' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center' }}><Activity size={20} /></div>
                    <div>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'var(--primary)', display: 'block', mb: -0.4, opacity: 0.8 }}>OUTSTANDING</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>{formatCurrency(totals.net)}</Typography>
                    </div>
                </div>
            </div>

            {/* CATEGORY SUMMARY PILLS */}
            <div style={{ width: '100%', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', padding: '0.5rem 0', scrollbarWidth: 'none' }}>
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <Skeleton key={i} variant="rectangular" width={140} height={60} sx={{ borderRadius: '1.1rem', flexShrink: 0 }} />
                        ))
                    ) : (
                        [...categories]
                            .sort((a, b) => {
                                const statsA = totals.catStats[a.name] || { net: 0 };
                                const statsB = totals.catStats[b.name] || { net: 0 };
                                return Math.abs(statsB.net) - Math.abs(statsA.net);
                            })
                            .map((catObj) => {
                                const cat = catObj.name;
                                const stats = totals.catStats[cat] || { spend: 0, recovered: 0, net: 0 };
                                const style = getCatStyle(cat, categories);
                                const hasActivity = stats.spend > 0;
                                
                                return (
                                    <motion.div key={cat} className="apple-category-pill glass-effect" style={{ minWidth: '160px' }}>
                                    <div className="pill-icon-box" style={{ background: hasActivity ? style.bg : 'rgba(0,0,0,0.04)', color: hasActivity ? style.color : '#8e8e93' }}>
                                        {getIcon(cat, categories, { color: hasActivity ? style.color : '#8e8e93', fill: hasActivity ? 'auto' : 'none' })}
                                    </div>
                                    <div className="pill-info-box">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <span className="pill-cat-label" style={{ opacity: hasActivity ? 1 : 0.6 }}>{cat}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className="pill-amt-val" style={{ color: hasActivity ? style.color : '#8e8e93', fontWeight: 900, fontSize: '0.85rem' }}>
                                                {formatCurrency(stats.net)}
                                            </span>
                                            {(stats.recovered > 0) && (
                                                <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.55rem', fontWeight: 800, opacity: 0.5, marginTop: '-2px' }}>
                                                    <span style={{ color: '#ff3b30' }}>↑{formatCurrency(stats.spend)}</span>
                                                    <span style={{ color: '#34c759' }}>↓{formatCurrency(stats.recovered)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="spending-split-layout">
                <div className="filters-sidebar-card glass-effect" style={{ padding: '1.75rem' }}>
                    <div style={{ position: 'sticky', top: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center' }}>
                                <Filter size={15} fill="white" style={{ opacity: 0.8 }} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>Audit Filters</span>
                        </div>

                        <div className="filter-section-block">
                            <div className="filter-section-label"><span>SEARCH LEDGER</span></div>
                            <div style={{ position: 'relative' }}>
                                <Search size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none', zIndex: 1 }} />
                                <input className="filter-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Description, category..." style={{ paddingLeft: '2.75rem' }} />
                            </div>
                        </div>

                        <div className="filter-section-block" style={{ marginTop: '1.75rem' }}>
                            <div className="filter-section-label"><span>CATEGORY ENTITY</span></div>
                            <div className="category-filter-grid">
                                {loading ? (
                                    [...Array(6)].map((_, i) => <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: '10px' }} />)
                                ) : (
                                    <>
                                        <div className={`cat-filter-chip ${selectedCat === 'ALL' ? 'active' : ''}`} onClick={() => { setSelectedCat('ALL'); setSelectedSub('ALL'); }}>All</div>
                                        {categories.slice().sort((a, b) => a.name.localeCompare(b.name)).map(c => {
                                            const style = getCatStyle(c.name, categories);
                                            return (
                                                <div key={c.name} className={`cat-filter-chip ${selectedCat === c.name ? 'active' : ''}`} onClick={() => { setSelectedCat(c.name); setSelectedSub('ALL'); }}>
                                                    {getIcon(c.name, categories, { 
                                                        color: selectedCat === c.name ? 'white' : style.color, 
                                                        fill: selectedCat === c.name ? 'white' : 'auto',
                                                        size: 14 
                                                    })}
                                                    <span>{c.name.split(' ')[0]}</span>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                                {selectedCat !== 'ALL' && (
                                    <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        <span className={`sub-cat-pill ${selectedSub === 'ALL' ? 'active' : ''}`} onClick={() => setSelectedSub('ALL')}>All Nodes</span>
                                        {(categories.find(c => c.name === selectedCat)?.sub_categories || []).slice().sort().map(sub => (
                                            <span key={sub} className={`sub-cat-pill ${selectedSub === sub ? 'active' : ''}`} onClick={() => setSelectedSub(sub)}>{sub}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="filter-section-block" style={{ marginTop: '1.75rem' }}>
                            <div className="filter-section-label"><span>TIME HORIZON</span></div>
                            <div className="time-horizon-grid">
                                {[
                                    { id: 'TODAY', label: 'Today', icon: <Zap size={13} fill="currentColor" /> },
                                    { id: 'THIS WEEK', label: 'This Week', icon: <Calendar size={13} fill="currentColor" /> },
                                    { id: 'THIS MONTH', label: 'This Month', icon: <PieChart size={13} fill="currentColor" /> },
                                    { id: 'PREVIOUS MONTH', label: 'Last Month', icon: <CalendarDays size={13} fill="currentColor" /> },
                                    { id: 'ALL', label: 'All Time', icon: <Globe size={13} fill="currentColor" /> },
                                    { id: 'CUSTOM', label: 'Custom Range', icon: <Filter size={13} fill="currentColor" /> },
                                ].map(p => (
                                    <div key={p.id} className={`time-horizon-btn ${period === p.id ? 'active' : ''}`} onClick={() => setPeriod(p.id)}>
                                        <span className="th-icon">{p.icon}</span>
                                        <span className="th-label">{p.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {period === 'CUSTOM' && (
                            <div className="filter-section-block" style={{ marginTop: '1.5rem' }}>
                                <div className="filter-section-label"><CalendarDays size={13} /><span>DATE RANGE</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <DatePicker label="FROM" value={dateRange.start ? dayjs(dateRange.start) : null} maxDate={dayjs()} onChange={(val) => setDateRange({ ...dateRange, start: val ? val.format('YYYY-MM-DD') : '' })} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '10px' }, '& .MuiOutlinedInput-input': { fontWeight: 800, fontSize: '0.75rem' } } } }} />
                                    <div style={{ width: '8px', height: '2px', background: 'rgba(0,0,0,0.1)', flexShrink: 0 }}></div>
                                    <DatePicker label="TO" value={dateRange.end ? dayjs(dateRange.end) : null} minDate={dateRange.start ? dayjs(dateRange.start) : undefined} maxDate={dayjs()} onChange={(val) => setDateRange({ ...dateRange, end: val ? val.format('YYYY-MM-DD') : '' })} slotProps={{ textField: { size: 'small', fullWidth: true, sx: { '& .MuiOutlinedInput-root': { borderRadius: '10px' }, '& .MuiOutlinedInput-input': { fontWeight: 800, fontSize: '0.75rem' } } } }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="spending-main-content">
                    <div className="content-meta-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'white', padding: '0.85rem 1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <div className="badge-status">
                            {loading ? <Skeleton variant="text" width={120} height={20} /> : (
                                <>
                                    <div className="dot-pulse"></div>
                                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{filteredSpending.length}</span> LOGS FOUND
                                </>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button size="small" variant="outlined" onClick={() => { setSearch(''); setSelectedCat('ALL'); setSelectedSub('ALL'); setPeriod('ALL'); }} sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 800, fontSize: '0.7rem' }}>CLEAR ALL</Button>
                            <Button size="small" variant="contained" onClick={handleExportCSV} startIcon={<Download size={14} />} sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 800, fontSize: '0.7rem', px: 2 }}>EXPORT CSV</Button>
                        </div>
                    </div>

                    <div className="data-table-premium scroll-y-luxury">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <Box key={i} sx={{ mb: 4 }}>
                                    <Skeleton variant="text" width="20%" height={30} sx={{ mb: 2, ml: 2 }} />
                                    {[...Array(3)].map((_, j) => (
                                        <Box key={j} sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2, borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                            <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: '8px' }} />
                                            <Box sx={{ flex: 1 }}><Skeleton variant="text" width="40%" height={24} /><Skeleton variant="text" width="20%" height={16} /></Box>
                                            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '50px' }} /><Skeleton variant="text" width={60} height={24} />
                                        </Box>
                                    ))}
                                </Box>
                            ))
                        ) : (() => {
                            const grouped = filteredSpending.reduce((acc, curr) => {
                                if (!acc[curr.date]) acc[curr.date] = [];
                                acc[curr.date].push(curr);
                                return acc;
                            }, {});
                            const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
                            if (dates.length === 0) return <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)', fontWeight: 800 }}>No entries matching criteria.</div>;

                             return dates.map(date => {
                                const daySpend = grouped[date].reduce((sum, s) => sum + (s.amount || 0), 0);
                                const dayRecovery = grouped[date].reduce((sum, s) => sum + (s.recovered || 0), 0);
                                const dayNet = daySpend - dayRecovery;

                                return (
                                    <div key={date} className="date-group">
                                        <div className="date-header-luxury">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Calendar size={14} color="var(--primary)" fill="rgba(0,113,227,0.2)" />
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{date}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                                {(dayRecovery > 0) && (
                                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', fontWeight: 800, opacity: 0.6 }}>
                                                        <span style={{ color: '#ff3b30' }}>S: {formatCurrency(daySpend)}</span>
                                                        <span style={{ color: '#34c759' }}>R: {formatCurrency(dayRecovery)}</span>
                                                    </div>
                                                )}
                                                <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>
                                                    OUTSTANDING: <span style={{ color: dayNet > 0 ? '#ff3b30' : (dayNet < 0 ? '#34c759' : 'var(--text-dim)') }}>{formatCurrency(dayNet)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="date-transactions">
                                            {grouped[date].map((s, idx) => {
                                                const catStyle = getCatStyle(s.category, categories);
                                                const outstanding = (s.amount || 0) - (s.recovered || 0);
                                                return (
                                                    <div key={idx} className="transaction-row-fancy">
                                                        <div style={{ marginRight: '1rem', width: '32px', height: '32px', borderRadius: '8px', background: catStyle.bg, display: 'grid', placeItems: 'center' }}>
                                                            {getIcon(s.category, categories)}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.description}</div>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>{s.sub_category}</div>
                                                        </div>
                                                        <div style={{ width: '130px', textAlign: 'center' }}>
                                                            <span style={{ padding: '0.35rem 0.75rem', background: catStyle.bg, color: catStyle.color, borderRadius: '50px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.category}</span>
                                                        </div>
                                                        <div style={{ width: '140px', textAlign: 'right' }}>
                                                            <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-main)' }}>{formatCurrency(outstanding)}</div>
                                                            {s.recovered > 0 && (
                                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.5, color: '#34c759' }}>Rec: {formatCurrency(s.recovered)}</div>
                                                            )}
                                                        </div>

                                                        {/* High-Fidelity Action Cluster */}
                                                        <div className="row-action-cluster" style={{ display: 'flex', gap: '0.35rem', marginLeft: '1.5rem', opacity: 0.8, transition: '0.2s all' }}>
                                                            <IconButton size="small" onClick={() => onEdit(s)} sx={{ color: 'var(--primary)', '&:hover': { bgcolor: 'rgba(0,113,227,0.08)', transform: 'scale(1.1)' } }}>
                                                                <Edit2 size={13} />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => setDeleteConfirmItem(s)} sx={{ color: '#ff3b30', '&:hover': { bgcolor: 'rgba(255,59,48,0.08)', transform: 'scale(1.1)' } }}>
                                                                <Trash2 size={13} />
                                                            </IconButton>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
