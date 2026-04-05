import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
    Plus, Edit2, Trash2, Settings, X, PlusCircle, Fingerprint, Layers, Package, Heart, 
    ShoppingCart, Stethoscope, Briefcase, Utensils, ShoppingBag, Car, Zap, Gamepad2, 
    CreditCard, Plane, Home, Music, Tag, Coffee, Smartphone, Laptop, Tv, Film, Camera, 
    Dumbbell, Bike, Scissors, Wrench, Umbrella, Wind, Sun, Moon, Cloud, Star, Shield, 
    Key, Lock, Bell, Mail, Phone, MapPin, Flag, Globe, Cpu, HardDrive, Database, Book, 
    Library, Building, Store, Coins, Euro, PoundSterling, JapaneseYen, Bitcoin, Landmark, 
    TrendingUp, Wallet, Gavel, Terminal, Code, Webhook, Hash, Hexagon, Server, Wifi, 
    Settings2, Bus, TrainFront, Ship, TramFront, Mountain, Tent, Palmtree, ChefHat, 
    Cookie, Croissant, Egg, IceCreamCone, Milk, Pizza, Soup, Wine, Activity, Bone, Brain, 
    HeartPulse, Microscope, Syringe, Thermometer, Bath, Bed, Lamp, Refrigerator, Sofa, 
    WashingMachine, Bird, Bug, Dog, Fish, Flower, Leaf, Rabbit, TreeDeciduous, 
    TreePine, Brush, Music2, Mic2, Palette, PenTool, Piano, Theater, Anchor, Archive, 
    Atom, Battery, Binary, Box as BoxIcon, Calculator, Clock, Compass, Component, Construction, 
    Crown, Diamond, Dice5, Droplets, Eye, Flame, FlaskConical, Gamepad, Gift, Glasses, 
    GraduationCap, Hammer, Infinity, Joystick, Lasso, LifeBuoy, Monitor, Mouse, Network, 
    Newspaper, Nut, Orbit, Paperclip, PawPrint, PersonStanding, Pipette, Plug, Printer, 
    Puzzle, Quote, Radiation, Radio, Rocket, Search, Send, Share2, Shrink, Shuffle, 
    Skull, Smile, Target, Ticket, Timer, Trophy, Truck, User as UserIcon, Users, Video, Volume2, Watch
} from 'lucide-react';
import api from '../utils/api';
import { fetchFinanceData } from '../store/financeSlice';

import {
    Card, Button, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, Chip, Box, Tooltip, Stack, Paper, Divider, Avatar, Skeleton, Grow
} from '@mui/material';

// Expanded high-res icon map - Universal Taxonomy (100+ Icons)
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

const UI_ICONS = Object.keys(IconMap);
const UI_COLORS = [
    // Primary Vibrant
    '#0071e3', '#34c759', '#ff3b30', '#ff9500', '#af52de', '#5856d6', '#ff2d55', 
    '#32ade6', '#00c7be', '#5ac8fa', '#ffcc00', '#8e8e93',
    // High-Fidelity Shades
    '#003366', '#124E27', '#6A0B0B', '#6D4001', '#401A51', '#212053', '#620D20',
    '#1A516C', '#004F4C', '#2C637C', '#6E5800', '#424245',
    // Contemporary Pastels
    '#E3F2FD', '#E8F5E9', '#FFEBEE', '#FFF3E0', '#F3E5F5', '#E8EAF6', '#FCE4EC',
    '#E1F5FE', '#E0F2F1', '#E1F5FE', '#FFFDE7', '#F5F5F7'
];

// Intelligent Branding Engine
const getSuggestedBranding = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('food') || n.includes('eat') || n.includes('rest') || n.includes('dinner')) return { icon: 'Utensils', color: '#ff9500' };
    if (n.includes('shop') || n.includes('cloth') || n.includes('fashion')) return { icon: 'ShoppingBag', color: '#0071e3' };
    if (n.includes('grocer') || n.includes('market')) return { icon: 'ShoppingCart', color: '#34c759' };
    if (n.includes('health') || n.includes('med') || n.includes('dr')) return { icon: 'Stethoscope', color: '#5856d6' };
    if (n.includes('family') || n.includes('baby') || n.includes('love') || n.includes('care')) return { icon: 'Heart', color: '#ff3b30' };
    if (n.includes('off') || n.includes('work') || n.includes('corp')) return { icon: 'Briefcase', color: '#af52de' };
    if (n.includes('leisure') || n.includes('game') || n.includes('fun')) return { icon: 'Gamepad2', color: '#ff2d55' };
    if (n.includes('car') || n.includes('transport') || n.includes('auto') || n.includes('fuel')) return { icon: 'Car', color: '#32ade6' };
    if (n.includes('util') || n.includes('power') || n.includes('elec') || n.includes('zap')) return { icon: 'Zap', color: '#ffcc00' };
    return { icon: 'Package', color: '#0071e3' };
};

export default function CategoryPage() {
    const { categories, assetClasses, loading } = useSelector(state => state.finance);
    const dispatch = useDispatch();
    
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'asset_classes'
    
    // Form Dialog State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newName, setNewName] = useState('');
    const [newSubs, setNewSubs] = useState([]);
    const [newIcon, setNewIcon] = useState('Package');
    const [newColor, setNewColor] = useState('#0071e3');
    const [autoSuggestEnabled, setAutoSuggestEnabled] = useState(true);

    // Save State
    const [isSaving, setIsSaving] = useState(false);

    // Sorted Categories A-Z
    const activeDataList = activeTab === 'categories' ? categories : (assetClasses || []);
    const sortedCategories = useMemo(() => {
        return [...activeDataList].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [activeDataList]);

    useEffect(() => {
        if (!editingId && autoSuggestEnabled && newName.length > 2) {
            const branding = getSuggestedBranding(newName);
            setNewIcon(branding.icon);
            setNewColor(branding.color);
        }
    }, [newName, editingId, autoSuggestEnabled]);

    const openAddForm = () => {
        setEditingId(null);
        setNewName('');
        setNewSubs(['']);
        setNewIcon('Package');
        setNewColor('#0071e3');
        setAutoSuggestEnabled(true);
        setIsFormOpen(true);
    };

    const openEditForm = (cat) => {
        setEditingId(cat._id);
        setNewName(cat.name);
        setNewSubs(cat.sub_categories || []);
        setNewIcon(cat.icon || 'Package');
        setNewColor(cat.color || '#0071e3');
        setAutoSuggestEnabled(false);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setNewName('');
    };

    const handleSave = async () => {
        if (!newName) return;
        const subList = newSubs.map(s => s.trim()).filter(s => s);
        const payload = { 
            name: newName, 
            sub_categories: subList.length > 0 ? subList : ['General'],
            icon: newIcon,
            color: newColor
        };
        
        // Immediate UI Close for perceived speed
        setIsFormOpen(false);
        setIsSaving(true);
        
        
        const apiPath = activeTab === 'categories' ? '/categories' : '/asset_classes';
        try {
            if (editingId) {
                await api.put(`${apiPath}/${editingId}`, payload);
            } else {
                await api.post(apiPath, payload);
            }
            // Once data is returned, Redux will update and clear loading
            await dispatch(fetchFinanceData());
        } catch (err) {
            console.error("Failed to save category", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setIsSaving(true);
        const apiPath = activeTab === 'categories' ? '/categories' : '/asset_classes';
        try {
            await api.delete(`${apiPath}/${id}`);
            await dispatch(fetchFinanceData());
        } catch (err) {
            console.error("Failed to delete", err);
        } finally {
            setIsSaving(false);
        }
    };

    const showLoading = loading || isSaving;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1.5rem' }}>
            
            {/* Header Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.2, bgcolor: 'primary.main', borderRadius: '12px', color: 'white', display: 'flex' }}><Settings size={22}/></Box>
                    <Box>
                        <Typography variant="h5" fontWeight="900" letterSpacing="-0.02em">Architecture Central</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="700">MASTER TAXONOMY ENGINE</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '12px', p: 0.5 }}>
                        <Button 
                            onClick={() => setActiveTab('categories')}
                            sx={{ 
                                borderRadius: '10px', 
                                px: 3, 
                                py: 0.5, 
                                fontWeight: 800, 
                                color: activeTab === 'categories' ? '#1d1d1f' : 'text.secondary',
                                bgcolor: activeTab === 'categories' ? 'white' : 'transparent',
                                boxShadow: activeTab === 'categories' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                textTransform: 'none'
                            }}
                        >
                            Spending Categories
                        </Button>
                        <Button 
                            onClick={() => setActiveTab('asset_classes')}
                            sx={{ 
                                borderRadius: '10px', 
                                px: 3, 
                                py: 0.5, 
                                fontWeight: 800, 
                                color: activeTab === 'asset_classes' ? '#1d1d1f' : 'text.secondary',
                                bgcolor: activeTab === 'asset_classes' ? 'white' : 'transparent',
                                boxShadow: activeTab === 'asset_classes' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                textTransform: 'none'
                            }}
                        >
                            Asset Classes
                        </Button>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<Plus size={18} />} 
                        onClick={openAddForm}
                        sx={{ borderRadius: '12px', px: 3, fontWeight: '800', textTransform: 'none', boxShadow: 'none' }}
                    >
                        New Entry
                    </Button>
                </Box>
            </Box>

            {/* List Table View */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#fbfcfd' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2.5, pl: 4, letterSpacing: '0.05rem', fontSize: '0.7rem' }}>ENTITY CONTEXT</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2.5, letterSpacing: '0.05rem', fontSize: '0.7rem' }}>GRANULAR NODES</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 2.5, pr: 4, letterSpacing: '0.05rem', fontSize: '0.7rem' }}>OPERATIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {showLoading ? (
                            // Inline Skeleton Rows
                            [...Array(6)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell sx={{ pl: 4, py: 2.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                            <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: '12px' }} />
                                            <Box sx={{ width: '100px' }}>
                                                <Skeleton variant="text" width="100%" height={24} />
                                                <Skeleton variant="text" width="60%" height={16} />
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '8px' }} />
                                            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '8px' }} />
                                            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '8px' }} />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            <Skeleton variant="circular" width={32} height={32} />
                                            <Skeleton variant="circular" width={32} height={32} />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            sortedCategories.map((cat) => {
                                const branding = cat.icon ? { icon: cat.icon, color: cat.color } : getSuggestedBranding(cat.name);
                                return (
                                    <TableRow key={cat._id || cat.name} hover>
                                        <TableCell sx={{ py: 2.5, pl: 4 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                                <Avatar sx={{ 
                                                    width: 48, height: 48, 
                                                    bgcolor: `${branding.color}12`, 
                                                    color: branding.color, 
                                                    border: `1.5px solid ${branding.color}20`,
                                                    borderRadius: '16px'
                                                }}>
                                                    {React.cloneElement(IconMap[branding.icon] || <Package />, { size: 24, strokeWidth: 2.5 })}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1rem' }}>
                                                        {cat.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', opacity: 0.7 }}>
                                                        {cat.sub_categories?.length || 0} active mappings
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                                                {[...(cat.sub_categories || [])].slice().sort((a, b) => a.localeCompare(b)).map(s => (
                                                    <Chip key={s} label={s} variant="outlined" size="small" sx={{ borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem', bgcolor: 'white', color: 'text.secondary', borderColor: 'rgba(0,0,0,0.06)', px: 0.5 }} />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={{ pr: 4 }}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <IconButton onClick={() => openEditForm(cat)} sx={{ color: branding.color, bgcolor: `${branding.color}08`, borderRadius: '10px' }} size="small"><Edit2 size={16} /></IconButton>
                                                <IconButton onClick={() => handleDelete(cat._id)} sx={{ color: 'error.main', bgcolor: 'rgba(255, 59, 48, 0.06)', borderRadius: '10px' }} size="small"><Trash2 size={16} /></IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Redesigned Slimmer Dialog */}
            <Dialog 
                open={isFormOpen} 
                onClose={closeForm} 
                TransitionComponent={Grow}
                transitionDuration={450}
                maxWidth="sm" 
                fullWidth 
                PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
                BackdropProps={{
                    sx: {
                        backdropFilter: 'blur(4px)',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        transition: '0.4s all ease-in-out'
                    }
                }}
            >
                <DialogTitle sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: `${newColor}15`, color: newColor, border: `1.5px solid ${newColor}25`, borderRadius: '14px', width: 48, height: 48 }}>
                            {React.cloneElement(IconMap[newIcon] || <Fingerprint />, { size: 24, strokeWidth: 2.5 })}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                                {newName || 'New Entity'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="700">ENTITY BRANDING</Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={closeForm} sx={{ bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '10px' }} size="small"><X size={20}/></IconButton>
                </DialogTitle>
                
                <DialogContent sx={{ p: 3, pt: 2 }}>
                    <Stack spacing={3} sx={{ mb: 4 }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 900, mb: 1.5, color: 'text.secondary', letterSpacing: '0.12em', display: 'block' }}>ENTITY NAME</Typography>
                            <TextField
                                autoFocus
                                placeholder="e.g. Healthcare..."
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                InputProps={{ sx: { borderRadius: '12px', fontWeight: 800, fontSize: '1rem', bgcolor: 'rgba(0,0,0,0.01)' } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                                        '&.Mui-focused fieldset': { borderColor: newColor, borderWidth: '2px' }
                                    }
                                }}
                            />
                        </Box>
                        
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 900, mb: 1.5, color: 'text.secondary', letterSpacing: '0.12em', display: 'block' }}>COLOUR PALETTE</Typography>
                            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', maxHeight: '120px', overflowY: 'auto', p: 2, border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.01)' }}>
                                {UI_COLORS.map(c => (
                                    <Box 
                                        key={c} 
                                        onClick={() => { setNewColor(c); setAutoSuggestEnabled(false); }}
                                        sx={{ 
                                            width: 26, height: 26, borderRadius: '8px', cursor: 'pointer', bgcolor: c, 
                                            border: newColor === c ? '2.5px solid white' : 'none',
                                            boxShadow: newColor === c ? `0 0 0 2.5px ${c}` : 'none',
                                            transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                                            '&:hover': { transform: 'scale(1.2)' }
                                        }} 
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Stack>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, mb: 1.5, color: 'text.secondary', letterSpacing: '0.12em', display: 'block' }}>ICON ARCHETYPE SELECTION</Typography>
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', 
                            gap: 1.5, 
                            maxHeight: '180px', 
                            overflowY: 'auto', 
                            p: 2, 
                            border: '1px solid rgba(0,0,0,0.06)', 
                            borderRadius: '16px',
                            bgcolor: 'rgba(0,0,0,0.02)'
                        }}>
                            {UI_ICONS.map(icon => (
                                <IconButton 
                                    key={icon} 
                                    onClick={() => { setNewIcon(icon); setAutoSuggestEnabled(false); }}
                                    sx={{ 
                                        p: 1.2, borderRadius: '12px',
                                        bgcolor: newIcon === icon ? `${newColor}20` : 'rgba(255,255,255,0.8)',
                                        color: newIcon === icon ? newColor : 'text.secondary',
                                        boxShadow: newIcon === icon ? `0 4px 12px ${newColor}30` : 'none',
                                        transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': { bgcolor: `${newColor}12`, transform: 'translateY(-2px)' }
                                    }}
                                >
                                    {React.cloneElement(IconMap[icon], { size: 20, strokeWidth: 2.5 })}
                                </IconButton>
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: '0.1em' }}>SUB-NODES ({newSubs.length})</Typography>
                        <Button variant="text" size="small" startIcon={<PlusCircle size={16}/>} onClick={() => setNewSubs(['', ...newSubs])} sx={{ fontWeight: 800, textTransform: 'none', color: newColor }}>Add Node</Button>
                    </Box>
                    
                    <Box sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'rgba(0,0,0,0.01)' }}>
                        <Stack divider={<Divider sx={{ opacity: 0.4 }} />}>
                            {newSubs.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center', opacity: 0.4 }}><Typography variant="caption" fontWeight="800">NO NODES DEFINED</Typography></Box>
                            ) : (
                                newSubs.map((sub, idx) => (
                                    <Box key={idx} sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: 'white' } }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant="standard"
                                            placeholder="Label..."
                                            value={sub}
                                            onChange={(e) => {
                                                const updated = [...newSubs];
                                                updated[idx] = e.target.value;
                                                setNewSubs(updated);
                                            }}
                                            InputProps={{ disableUnderline: true, sx: { fontWeight: 800, fontSize: '0.9rem', color: 'text.primary' } }}
                                        />
                                        <IconButton size="small" onClick={() => {
                                            const updated = [...newSubs];
                                            updated.splice(idx, 1);
                                            setNewSubs(updated);
                                        }} sx={{ color: 'text.secondary' }}><Trash2 size={16} /></IconButton>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'space-between' }}>
                    <Button onClick={closeForm} color="inherit" sx={{ fontWeight: 800, textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
                    <Button 
                        onClick={handleSave} 
                        variant="contained" 
                        disabled={!newName} 
                        sx={{ px: 4, py: 1, borderRadius: '12px', textTransform: 'none', fontWeight: 900, bgcolor: newColor, boxShadow: `0 8px 24px ${newColor}25` }}
                    >
                        {editingId ? "Update Identity" : "Finalize Infrastructure"}
                    </Button>
                </DialogActions>
            </Dialog>

        </motion.div>
    );
}
