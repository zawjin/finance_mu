import React from 'react';
import {
    Package, Heart, ShoppingCart, Stethoscope, Briefcase, Utensils,
    ShoppingBag, Car, Zap, Gamepad2, CreditCard, Plane,
    Home, Music, Coffee, Smartphone, Laptop, Tv, Film, Camera,
    Dumbbell, Bike, Scissors, Wrench, Umbrella, Wind, Sun, Moon,
    Cloud, Star, Shield, Key, Lock, Bell, Mail, Phone, MapPin,
    Flag, Globe, Cpu, HardDrive, Database, Book, Library, Building,
    Store, Coins, Euro, PoundSterling, JapaneseYen, Bitcoin, Landmark,
    TrendingUp, Wallet, Gavel, Terminal, Code, Webhook, Hash,
    Hexagon, Server, Wifi, Settings2, Bus, TrainFront, Ship, TramFront,
    Mountain, Tent, Palmtree, ChefHat, Cookie, Croissant, Egg,
    IceCreamCone, Milk, Pizza, Soup, Wine, Activity, Bone, Brain,
    HeartPulse, Microscope, Syringe, Thermometer, Bath, Bed, Lamp,
    Refrigerator, Sofa, WashingMachine, Bird, Bug, Dog, Fish, Flower,
    Leaf, Rabbit, TreeDeciduous, TreePine, Brush, Music2, Mic2,
    Palette, PenTool, Piano, Theater, Anchor, Archive, Atom, Battery,
    Binary, Box as BoxIcon, Calculator, Clock, Compass, Component,
    Construction, Crown, Diamond, Dice5, Droplets, Eye, Flame,
    FlaskConical, Gamepad, Gift, Glasses, GraduationCap, Hammer,
    Infinity, Joystick, Lasso, LifeBuoy, Monitor, Mouse, Network,
    Newspaper, Nut, Orbit, Paperclip, PawPrint, PersonStanding,
    Pipette, Plug, Printer, Puzzle, Quote, Radiation, Radio, Rocket,
    Search, Send, Share2, Shrink, Shuffle, Skull, Smile, Target,
    Ticket, Timer, Trophy, Truck, User as UserIcon, Users, Video,
    Volume2, Watch, Gem
} from 'lucide-react';

export const IconMap = {
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
    Video: <Video />, Volume2: <Volume2 />, Watch: <Watch />, Gem: <Gem />
};

export const getIcon = (catName, categories = [], options = {}) => {
    const cat = categories.find(c => c.name === catName);
    const iconName = cat?.icon || 'Package';
    const color = options.color || cat?.color || '#0071e3';

    const props = {
        size: options.size || 16,
        color: color,
        strokeWidth: options.strokeWidth || 2.5,
        ...options.props
    };

    const IconComponent = IconMap[iconName] || <Package />;
    return React.cloneElement(IconComponent, props);
};
