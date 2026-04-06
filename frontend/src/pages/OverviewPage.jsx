import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Users, Box, Target, Calendar, ArrowUp, ArrowDown,
    MoreVertical, Info, RefreshCcw, TrendingUp, Landmark, CreditCard, ChevronDown
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils/formatters';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function OverviewPage() {
    const { summary, loading, spending, reserves } = useSelector(state => state.finance);
    const [aiInsights, setAiInsights] = useState(null);

    useEffect(() => {
        api.get('/ai/analyze')
            .then(res => setAiInsights(res.data))
            .catch(() => setAiInsights({ score: 70, status: "Stable" }));
    }, []);

    // FINANCE LOGIC
    const totalAssets = useMemo(() => (reserves || []).filter(r => r.account_type !== 'CREDIT_CARD').reduce((s, r) => s + r.balance, 0), [reserves]);
    const totalDebts = useMemo(() => (reserves || []).filter(r => r.account_type === 'CREDIT_CARD').reduce((s, r) => s + Math.abs(r.balance), 0), [reserves]);
    const netWorth = totalAssets - totalDebts;

    const barChartData = useMemo(() => {
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const values = [160, 380, 190, 290, 180, 190, 280, 110, 210, 380, 275, 110]; // Sample style data
        return {
            labels,
            datasets: [{
                data: values,
                backgroundColor: '#4f46e5',
                borderRadius: 4,
                barThickness: 12,
            }]
        };
    }, []);

    const momentumData = useMemo(() => {
        const labels = Array.from({ length: 15 }, (_, i) => `Mar ${i + 1}, 2026`);
        const values = [150, 162, 185, 170, 175, 182, 195, 210, 230, 220, 215, 240, 255, 248, 260];
        return {
            labels,
            datasets: [{
                data: values,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.05)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 3
            }]
        };
    }, []);

    if (loading && !summary) return <div className="h-screen w-full flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="min-h-screen bg-[#f8f9fc] p-6 lg:p-10 font-['Outfit',sans-serif]">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* TOP GRID: STATS & TARGET */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT STATS */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* ASSETS CARD */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between h-[220px]">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                    <Landmark size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-lg">
                                    <ArrowUp size={14} /> 11.01%
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-slate-400 font-bold text-sm">Total Assets</p>
                                <h3 className="text-4xl font-black text-slate-900 mt-1 tracking-tight">{formatCurrency(totalAssets).replace('₹', '')}</h3>
                            </div>
                        </div>

                        {/* DEBT CARD */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between h-[220px]">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                    <CreditCard size={24} />
                                </div>
                                <div className="flex items-center gap-1 text-rose-500 font-bold text-sm bg-rose-50 px-2 py-1 rounded-lg">
                                    <ArrowDown size={14} /> 9.05%
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-slate-400 font-bold text-sm">Liabilities</p>
                                <h3 className="text-4xl font-black text-slate-900 mt-1 tracking-tight">{formatCurrency(totalDebts).replace('₹', '')}</h3>
                            </div>
                        </div>

                        {/* MONTHLY ACTIVITY (BAR) */}
                        <div className="sm:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative">
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Monthly Spending</h2>
                                <MoreVertical size={20} className="text-slate-300 pointer-events-none" />
                            </div>
                            <div className="h-[220px]">
                                <Bar
                                    data={barChartData}
                                    options={{
                                        responsive: true, maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 11 }, color: '#94a3b8' } },
                                            y: { grid: { display: true, color: '#f1f5f9' }, border: { display: false }, ticks: { stepSize: 100, font: { weight: 'bold', size: 11 }, color: '#94a3b8' } }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT TARGET CARD */}
                    <div className="lg:col-span-5 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <MoreVertical size={20} className="absolute top-8 right-8 text-slate-200" />
                        <div className="w-full text-left mb-10">
                            <h2 className="text-2xl font-black text-slate-900 leading-none">Security Metric</h2>
                            <p className="text-slate-400 font-medium mt-2">Personal safety runway set for each fiscal</p>
                        </div>

                        {/* PROGRESS RING */}
                        <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                            <svg className="w-full h-full transform -rotate-225">
                                <circle cx="128" cy="128" r="100" fill="transparent" stroke="#f1f5f9" strokeWidth="20" strokeLinecap="round" strokeDasharray="470 628" />
                                <motion.circle
                                    cx="128" cy="128" r="100" fill="transparent" stroke="#4f46e5" strokeWidth="20" strokeLinecap="round"
                                    strokeDasharray="470 628" initial={{ strokeDashoffset: 470 }} animate={{ strokeDashoffset: 470 - (470 * 0.75) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center pt-8">
                                <span className="text-6xl font-black text-slate-900">75.55%</span>
                                <div className="mt-2 bg-emerald-50 text-emerald-500 font-black text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                                    <ArrowUp size={12} /> 10%
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-500 font-medium leading-relaxed max-w-[280px]">
                            You earn ₹3,287 today, it’s higher than last month. Keep up your good work!
                        </p>

                        <div className="grid grid-cols-3 w-full mt-12 pt-12 border-t border-slate-50">
                            <div className="text-center">
                                <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Target</p>
                                <div className="text-slate-900 font-black text-lg">₹20K <ArrowDown size={14} className="inline text-rose-500" /></div>
                            </div>
                            <div className="text-center border-x border-slate-50">
                                <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Revenue</p>
                                <div className="text-slate-900 font-black text-lg">₹20K <ArrowUp size={14} className="inline text-emerald-500" /></div>
                            </div>
                            <div className="text-center">
                                <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Today</p>
                                <div className="text-slate-900 font-black text-lg">₹20K <ArrowUp size={14} className="inline text-emerald-500" /></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM STATISTICS */}
                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portfolio Statistics</h2>
                            <p className="text-slate-400 font-medium mt-1">Growth set for each historical month</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 self-stretch sm:self-auto">
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                {['Overview', 'Sales', 'Revenue'].map((tab, i) => (
                                    <button key={tab} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${i === 0 ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>{tab}</button>
                                ))}
                            </div>
                            <button className="flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
                                <Calendar size={18} className="text-indigo-600" /> Mar 6, 2026 - Mar 12, 2026
                            </button>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <Line
                            data={momentumData}
                            options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 11 }, color: '#94a3b8' } },
                                    y: { grid: { display: true, color: '#f8fbfc' }, border: { display: false }, ticks: { stepSize: 50, font: { weight: 'bold', size: 11 }, color: '#94a3b8' } }
                                }
                            }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
