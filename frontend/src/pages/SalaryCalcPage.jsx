import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Banknote, Shield, Briefcase, FileText, TrendingDown, Home } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const SLAB_COLORS = ['#94a3b8', '#60a5fa', '#34d399', '#facc15', '#fb923c', '#f87171', '#be123c'];

// Derive all salary components from Total CTC
// CTC = 12*monthlyGross + 0.6048*monthlyGross + 0.15*CTC
// ⇒ monthlyGross = (0.85 * CTC) / 12.6048
function deriveFromTotalCTC(totalCTC) {
    const monthlyGross = (0.85 * totalCTC) / 12.6048;
    const basicM = Math.round(monthlyGross * 0.42);
    const hraM = Math.round(basicM * 0.50);
    const ltaM = Math.round(basicM * 0.13);
    const saM = Math.round(monthlyGross - basicM - hraM - ltaM);
    const pfY = Math.round(basicM * 12 * 0.12);
    const bonus = Math.round((0.15 * totalCTC) / 100) * 100; // round to nearest ₹100
    return { basic: basicM, hra: hraM, lta: ltaM, specialAllowance: saM, pfYearly: pfY, bonus };
}

export default function SalaryCalcPage() {
    const [basic, setBasic] = useState(59620);
    const [hra, setHra] = useState(29810);
    const [specialAllowance, setSpecialAllowance] = useState(44710);
    const [lta, setLta] = useState(7760);
    const [pfYearly, setPfYearly] = useState(85853);
    const [grossInput, setGrossInput] = useState('');

    const handleGrossChange = (val) => {
        setGrossInput(val);
        const num = Number(val);
        if (num > 0) {
            const d = deriveFromTotalCTC(num);
            setBasic(d.basic);
            setHra(d.hra);
            setLta(d.lta);
            setSpecialAllowance(d.specialAllowance);
            setPfYearly(d.pfYearly);
            setBonusYearly(d.bonus);
        }
    };

    const [bonusYearly, setBonusYearly] = useState(315700);

    const monthlyGross = basic + hra + specialAllowance + lta;
    const annualGross = monthlyGross * 12;
    const fixedCtc = annualGross + pfYearly;          // Total Fixed CTC (without incentive)
    const ctc = fixedCtc + bonusYearly;           // Total CTC (with Performance Incentive)

    const standardDeduction = 75000; // Updated FY 2025-26

    const computeTax = (income) => {
        const taxable = Math.max(0, income - standardDeduction);
        if (taxable <= 1200000) return { totalTax: 0, cess: 0, finalTax: 0, slabs: [], taxable };

        const SLABS = [
            { from: 0, to: 400000, rate: 0 },
            { from: 400000, to: 800000, rate: 5 },
            { from: 800000, to: 1200000, rate: 10 },
            { from: 1200000, to: 1600000, rate: 15 },
            { from: 1600000, to: 2000000, rate: 20 },
            { from: 2000000, to: 2400000, rate: 25 },
            { from: 2400000, to: Infinity, rate: 30 },
        ];

        let remaining = taxable, tax = 0;
        const slabs = [];
        SLABS.forEach(slab => {
            if (remaining <= 0) return;
            const slabSize = slab.to === Infinity ? remaining : (slab.to - slab.from);
            const taxableHere = Math.min(remaining, slabSize);
            if (taxableHere <= 0) return;
            const t = taxableHere * slab.rate / 100;
            tax += t;
            slabs.push({ rate: slab.rate, from: slab.from, to: slab.to, taxable: taxableHere, tax: t }); // include 0% slab
            remaining -= taxableHere;
        });
        const cess = tax * 0.04;
        return { totalTax: tax, cess, finalTax: Math.round(tax + cess), slabs, taxable };
    };

    const taxDetails = useMemo(() => computeTax(annualGross), [annualGross]);
    const taxWithBonus = useMemo(() => computeTax(annualGross + bonusYearly), [annualGross, bonusYearly]);

    const monthlyPf = pfYearly / 12;
    const monthlyTax = taxDetails.finalTax / 12;
    const monthlyFood = 500;
    const monthlyFrs = 5;
    const monthlyTakeHome = monthlyGross - monthlyPf - monthlyTax - monthlyFood - monthlyFrs;
    const annualTakeHome = monthlyTakeHome * 12;
    const effectiveTaxRate = annualGross > 0 ? (taxDetails.finalTax / annualGross) * 100 : 0;

    // Bonus month (July) — extra tax on the bonus amount only
    const bonusTax = taxWithBonus.finalTax - taxDetails.finalTax; // incremental tax
    const julyTakeHome = monthlyGross + bonusYearly - monthlyPf - monthlyTax - monthlyFood - monthlyFrs - bonusTax;

    const components = [
        { label: 'Basic', value: basic, onChange: setBasic, color: '#6366f1' },
        { label: 'HRA', value: hra, onChange: setHra, color: '#8b5cf6' },
        { label: 'Special Allowance', value: specialAllowance, onChange: setSpecialAllowance, color: '#0ea5e9' },
        { label: 'Leave Travel Allowance', value: lta, onChange: setLta, color: '#10b981' },
    ];

    const bonusPctOfCtc = ctc > 0 ? (bonusYearly / ctc) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.35)'
                }}>
                    <Calculator color="#fff" size={22} />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e1b4b', margin: 0 }}>Salary Profiler</h1>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600, margin: 0 }}>
                        New Tax Regime — FY 2024–25 Take-Home Simulator
                    </p>
                </div>
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                {/* Left: Inputs */}
                <div style={{ flex: '0 0 340px', minWidth: '280px' }}>
                    {/* CTC Quick-fill */}
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: 20, padding: '1.5rem',
                        marginBottom: '1rem',
                        boxShadow: '0 4px 20px rgba(99,102,241,0.25)'
                    }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                            ⚡ Enter Total CTC — Auto-fill all components
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            background: 'rgba(255,255,255,0.15)', borderRadius: 12,
                            padding: '0.65rem 1rem', border: '1.5px solid rgba(255,255,255,0.25)'
                        }}>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 800, marginRight: '0.5rem', fontSize: '1.1rem' }}>₹</span>
                            <input
                                type="number"
                                placeholder="e.g. 21,04,360"
                                value={grossInput}
                                onChange={e => handleGrossChange(e.target.value)}
                                style={{
                                    border: 'none', background: 'transparent', outline: 'none',
                                    width: '100%', fontSize: '1.1rem', fontWeight: 700, color: '#fff',
                                    fontFamily: 'Outfit, sans-serif'
                                }}
                            />
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem', fontWeight: 600 }}>
                            Auto-calculates Basic, HRA, LTA, SA, PF & Performance Incentive
                        </div>
                    </div>

                    {/* Salary Components */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: '1.75rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                            <Briefcase size={16} color="#6366f1" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Components</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {components.map(c => (
                                <InputField key={c.label} label={c.label} value={c.value} onChange={c.onChange} accent={c.color} />
                            ))}
                        </div>

                        {/* Monthly Gross Total */}
                        <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f5f3ff', borderRadius: 12, border: '1px solid #ddd6fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6d28d9' }}>Monthly Gross</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#4c1d95' }}>{formatCurrency(monthlyGross)}</span>
                        </div>
                    </div>

                    {/* PF / Retirals */}
                    <div style={{ background: '#fff', borderRadius: 20, padding: '1.75rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                            <Shield size={16} color="#0ea5e9" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Retirals & Deductions</span>
                        </div>
                        <InputField label="Provident Fund (Yearly)" value={pfYearly} onChange={setPfYearly} accent="#0ea5e9" />
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
                            <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600 }}>Monthly EPF deducted</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0c4a6e' }}>{formatCurrency(monthlyPf)}</div>
                        </div>
                    </div>

                    {/* Bonus */}
                    <div style={{ background: 'linear-gradient(135deg, #451a03, #78350f)', borderRadius: 20, padding: '1.5rem', boxShadow: '0 4px 16px rgba(120,53,15,0.25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <Banknote size={16} color="#fbbf24" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Performance Incentive</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', borderRadius: 20, padding: '0.15rem 0.6rem', fontWeight: 700 }}>July Only</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.65rem 1rem', border: '1px solid rgba(251,191,36,0.3)' }}>
                            <span style={{ color: '#fbbf24', fontWeight: 800, marginRight: '0.5rem' }}>₹</span>
                            <input
                                type="number"
                                value={bonusYearly}
                                onChange={e => setBonusYearly(Number(e.target.value))}
                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1.05rem', fontWeight: 700, color: '#fff', fontFamily: 'Outfit, sans-serif' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Bulk tax deducted in July when bonus credited</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fbbf24' }}>Bonus = ~{bonusPctOfCtc.toFixed(1)}% of your CTC</span>
                        </div>
                    </div>
                </div>

                {/* Right: Results */}
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Take-home hero */}
                    <div style={{
                        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
                        borderRadius: 20, padding: '1.75rem',
                        boxShadow: '0 8px 32px rgba(6,78,59,0.25)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                                    Est. Take Home / Month
                                </div>
                                <div style={{ fontSize: '2.75rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
                                    {formatCurrency(monthlyTakeHome)}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 600, marginTop: '0.4rem' }}>
                                    {formatCurrency(annualTakeHome)} annually
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Effective Tax Rate</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>{effectiveTaxRate.toFixed(2)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* CTC / Gross row */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <StatCard label="Annual Gross" value={formatCurrency(annualGross)} sub="Pre-tax income" color="#6366f1" bg="#eef2ff" />
                        <StatCard label="Total Fixed CTC" value={formatCurrency(fixedCtc)} sub="Gross + Employer PF" color="#7c3aed" bg="#f5f3ff" />
                        <StatCard label="Total CTC" value={formatCurrency(ctc)} sub={`Incl. ${bonusPctOfCtc.toFixed(1)}% Perf. Incentive`} color="#0369a1" bg="#f0f9ff" />
                    </div>

                    {/* July Bonus Month Card */}
                    <div style={{ background: 'linear-gradient(135deg, #1c1402 0%, #2d1f04 50%, #451a03 100%)', borderRadius: 20, padding: '1.75rem', boxShadow: '0 8px 32px rgba(120,53,15,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                    <Banknote size={14} color="#fbbf24" />
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em' }}>July — Performance Incentive Month</span>
                                </div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>{formatCurrency(julyTakeHome)}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem' }}>vs normal {formatCurrency(monthlyTakeHome)} / month</div>
                            </div>
                            <div style={{ background: 'rgba(251,191,36,0.1)', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid rgba(251,191,36,0.2)', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Bonus</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fcd34d' }}>+{formatCurrency(bonusYearly)}</div>
                            </div>
                        </div>
                        {/* Bonus breakdown */}
                        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                                { label: 'Monthly Gross', amt: monthlyGross, color: '#a7f3d0' },
                                { label: `Performance Incentive (${bonusPctOfCtc.toFixed(1)}% of CTC)`, amt: bonusYearly, color: '#fcd34d', prefix: '+' },
                                { label: 'Regular TDS (Monthly)', amt: -monthlyTax, color: '#fca5a5' },
                                { label: 'Incentive Tax (Bulk Deduction)', amt: -bonusTax, color: '#f87171' },
                                { label: 'EPF Deduction', amt: -monthlyPf, color: '#fca5a5' },
                                { label: 'Food', amt: -monthlyFood, color: '#fca5a5' },
                                { label: 'FRS Fund', amt: -monthlyFrs, color: '#93c5fd' },
                            ].map((r, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{r.label}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: r.color }}>{r.prefix || ''}{formatCurrency(Math.abs(r.amt))}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(251,191,36,0.3)' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fef3c7' }}>Net July Take Home</span>
                                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fbbf24' }}>{formatCurrency(julyTakeHome)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Deduction & Tax card */}
                    <div style={{ background: '#1e1b4b', borderRadius: 20, padding: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                            <TrendingDown size={16} color="#a5b4fc" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Deductions</span>
                        </div>

                        <DeductRow label="Income Tax (TDS)" amount={monthlyTax} color="#f87171" />
                        <DeductRow label="EPF / Provident Fund" amount={monthlyPf} color="#fcd34d" />
                        <DeductRow label="Food / Canteen" amount={monthlyFood} color="#fca5a5" />
                        <DeductRow label="FRS Fund" amount={monthlyFrs} color="#93c5fd" />

                        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>Total Monthly Deductions</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fca5a5' }}>{formatCurrency(monthlyTax + monthlyPf + monthlyFood + monthlyFrs)}</span>
                        </div>
                    </div>

                    {/* Tax Walkthrough — Premium */}
                    <div style={{ background: '#0f172a', borderRadius: 20, padding: '1.75rem', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <FileText size={15} color="#818cf8" />
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>New Regime Tax Walkthrough</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', background: 'rgba(129,140,248,0.1)', color: '#a5b4fc', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 20, padding: '0.2rem 0.65rem', fontWeight: 700 }}>FY 2025–26</span>
                        </div>

                        {/* Income Trail */}
                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Annual Gross Income</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>{formatCurrency(annualGross)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Less: Standard Deduction</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>– {formatCurrency(standardDeduction)}</span>
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Net Taxable Income</span>
                                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#a5b4fc' }}>{formatCurrency(taxDetails.taxable)}</span>
                            </div>
                        </div>

                        {/* Slabs or Zero-Tax */}
                        {taxDetails.slabs.length === 0 ? (
                            <div style={{ padding: '1.25rem', background: 'rgba(16,185,129,0.08)', borderRadius: 14, border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🎉</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>Zero Tax — 87A Rebate Applied</div>
                                <div style={{ fontSize: '0.72rem', color: '#6ee7b7', marginTop: '0.2rem' }}>Taxable income ≤ ₹12,00,000</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                                    {taxDetails.slabs.map((slab, i) => {
                                        const maxSlab = Math.max(...taxDetails.slabs.map(s => s.taxable));
                                        const barPct = maxSlab > 0 && maxSlab !== Infinity ? (slab.taxable / maxSlab) * 100 : 0;
                                        const color = SLAB_COLORS[i] || '#94a3b8';
                                        return (
                                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.72rem', fontWeight: 900, color, background: `${color}18`, borderRadius: 8, padding: '0.15rem 0.6rem', letterSpacing: 0.3 }}>{slab.rate}%</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                                            {formatCurrency(slab.from + 1)} – {slab.to === Infinity ? '∞' : formatCurrency(slab.to)}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f1f5f9' }}>{formatCurrency(slab.tax)}</span>
                                                </div>
                                                {/* Progress bar */}
                                                <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${barPct}%` }}
                                                        transition={{ duration: 0.7, delay: i * 0.08 }}
                                                        style={{ height: '100%', background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 10 }}
                                                    />
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.3rem', fontWeight: 600 }}>
                                                    Taxable: {formatCurrency(slab.taxable)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Cess + Total */}
                                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.85rem 1rem', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Base Tax on Slabs</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>{formatCurrency(taxDetails.totalTax)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Health & Edu. Cess (4%)</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>{formatCurrency(taxDetails.cess)}</span>
                                    </div>
                                </div>

                                <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Annual Tax Liability</div>
                                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>~{formatCurrency(taxDetails.finalTax / 12)} / month (TDS)</div>
                                    </div>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f87171', letterSpacing: '-0.02em' }}>{formatCurrency(taxDetails.finalTax)}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Payslip Section ──────────────────────────────── */}
            <div style={{ marginTop: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 4, height: 24, borderRadius: 4, background: 'linear-gradient(#6366f1, #8b5cf6)' }} />
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e1b4b' }}>Sample Pay Slip</h2>
                    <span style={{ fontSize: '0.7rem', background: '#eef2ff', color: '#6366f1', borderRadius: 20, padding: '0.2rem 0.7rem', fontWeight: 700 }}>Auto-generated</span>
                </div>
                <Payslip
                    basic={basic} hra={hra} sa={specialAllowance} lta={lta}
                    monthlyGross={monthlyGross} monthlyPf={monthlyPf}
                    monthlyTax={monthlyTax} monthlyFood={monthlyFood} monthlyFrs={monthlyFrs}
                    monthlyTakeHome={monthlyTakeHome}
                />
            </div>
        </motion.div>
    );
}

function StatCard({ label, value, sub, color, bg }) {
    return (
        <div style={{ flex: '1 1 140px', background: bg, borderRadius: 16, padding: '1.25rem', border: `1px solid ${color}20` }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e1b4b' }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, marginTop: '0.2rem' }}>{sub}</div>
        </div>
    );
}

function DeductRow({ label, amount, color }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{label}</span>
            </div>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>{formatCurrency(amount)}</span>
        </div>
    );
}

function TrailRow({ label, value, dim, bold }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: bold ? 800 : 600, color: dim ? '#9ca3af' : '#374151' }}>{label}</span>
            <span style={{ fontSize: '0.85rem', fontWeight: bold ? 900 : 700, color: bold ? '#1e1b4b' : (dim ? '#9ca3af' : '#374151') }}>{value}</span>
        </div>
    );
}

function InputField({ label, value, onChange, accent }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
            </label>
            <div style={{
                display: 'flex', alignItems: 'center',
                background: '#f9fafb', border: `1.5px solid #e5e7eb`,
                borderRadius: 10, padding: '0.55rem 0.85rem',
                transition: 'border-color 0.15s',
            }}>
                <span style={{ color: '#9ca3af', fontWeight: 800, marginRight: '0.4rem', fontSize: '0.95rem' }}>₹</span>
                <input
                    type="number"
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    style={{
                        border: 'none', background: 'transparent', outline: 'none',
                        width: '100%', fontSize: '1rem', fontWeight: 700, color: '#111827',
                        fontFamily: 'Outfit, sans-serif'
                    }}
                    onFocus={e => e.target.parentNode.style.borderColor = accent}
                    onBlur={e => e.target.parentNode.style.borderColor = '#e5e7eb'}
                />
            </div>
        </div>
    );
}

function Payslip({ basic, hra, sa, lta, monthlyGross, monthlyPf, monthlyTax, monthlyFood, monthlyFrs, monthlyTakeHome }) {
    const now = new Date();
    const monthYear = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

    const earnings = [
        { label: 'Basic Pay', amount: basic },
        { label: 'House Rent Allowance (HRA)', amount: hra },
        { label: 'Special Allowance', amount: sa },
        { label: 'Leave Travel Allowance (LTA)', amount: lta },
    ];
    const deductions = [
        { label: 'Provident Fund (Employee)', amount: monthlyPf },
        { label: 'Income Tax (TDS)', amount: monthlyTax },
        { label: 'Food / Canteen', amount: monthlyFood || 500 },
        { label: 'FRS Fund', amount: monthlyFrs || 5 },
    ];
    const grossDeductions = deductions.reduce((s, d) => s + d.amount, 0);

    return (
        <div style={{
            background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden',
            fontFamily: 'Outfit, sans-serif'
        }}>
            {/* Payslip Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>PAYSLIP</div>
                    <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600, marginTop: '0.15rem' }}>{monthYear}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 600 }}>NET PAY</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#6ee7b7', letterSpacing: '-0.02em' }}>
                        {formatCurrency(monthlyTakeHome)}
                    </div>
                </div>
            </div>

            {/* Employee row */}
            <div style={{ padding: '1rem 2rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                {[
                    { label: 'Employee Name', value: '— ' },
                    { label: 'Designation', value: '— ' },
                    { label: 'Department', value: '— ' },
                    { label: 'Pay Period', value: monthYear },
                    { label: 'Working Days', value: '30' },
                ].map(f => (
                    <div key={f.label}>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.label}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginTop: '0.15rem' }}>{f.value}</div>
                    </div>
                ))}
            </div>

            {/* Earnings + Deductions table */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb' }}>
                {/* Earnings */}
                <div style={{ flex: 1, borderRight: '1px solid #e5e7eb' }}>
                    <div style={{ padding: '0.65rem 1.5rem', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: 0.5 }}>Earnings</span>
                    </div>
                    {earnings.map(e => (
                        <div key={e.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                            <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 600 }}>{e.label}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{formatCurrency(e.amount)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1.5rem', background: '#f9fafb' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>Gross Earnings</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#15803d' }}>{formatCurrency(monthlyGross)}</span>
                    </div>
                </div>

                {/* Deductions */}
                <div style={{ flex: 1 }}>
                    <div style={{ padding: '0.65rem 1.5rem', background: '#fff7f7', borderBottom: '1px solid #fecaca' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5 }}>Deductions</span>
                    </div>
                    {deductions.map(d => (
                        <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                            <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 600 }}>{d.label}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{formatCurrency(d.amount)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1.5rem', background: '#f9fafb' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#dc2626' }}>Total Deductions</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#dc2626' }}>{formatCurrency(grossDeductions)}</span>
                    </div>
                </div>
            </div>

            {/* Net Pay footer */}
            <div style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f3ff' }}>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Net Pay (Take Home)</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginTop: '0.1rem' }}>Gross Earnings – Total Deductions</div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4c1d95' }}>{formatCurrency(monthlyTakeHome)}</div>
            </div>

            <div style={{ padding: '0.75rem 2rem', background: '#fafafa', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>
                    This is a system-generated salary simulation. Values are indicative based on standard FY 2025-26 New Tax Regime.
                </span>
            </div>
        </div>
    );
}
