import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Banknote, Shield, Briefcase, FileText, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import './SalaryCalcPage.scss';

const SLAB_COLORS = ['#94a3b8', '#60a5fa', '#34d399', '#facc15', '#fb923c', '#f87171', '#be123c'];

// Derive all salary components from Total CTC
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
    const [basic, setBasic] = useState(0);
    const [hra, setHra] = useState(0);
    const [specialAllowance, setSpecialAllowance] = useState(0);
    const [lta, setLta] = useState(0);
    const [pfYearly, setPfYearly] = useState(0);
    const [grossInput, setGrossInput] = useState('');
    const [bonusYearly, setBonusYearly] = useState(0);
    const [juneBonus, setJuneBonus] = useState(400000); // MG4 -> 4L
    const [grade, setGrade] = useState('MG4');

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

    const monthlyGross = basic + hra + specialAllowance + lta;
    const annualGross = monthlyGross * 12;
    const fixedCtc = annualGross + pfYearly;
    const ctc = fixedCtc + bonusYearly + juneBonus;

    const standardDeduction = 75000;

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
            slabs.push({ rate: slab.rate, from: slab.from, to: slab.to, taxable: taxableHere, tax: t });
            remaining -= taxableHere;
        });
        const cess = tax * 0.04;
        return { totalTax: tax, cess, finalTax: Math.round(tax + cess), slabs, taxable };
    };

    const taxDetails = useMemo(() => computeTax(annualGross), [annualGross]);
    const taxWithJulyBonus = useMemo(() => computeTax(annualGross + bonusYearly), [annualGross, bonusYearly]);
    const taxWithJuneBonus = useMemo(() => computeTax(annualGross + juneBonus), [annualGross, juneBonus]);
    const totalTaxWithBonuses = useMemo(() => computeTax(annualGross + bonusYearly + juneBonus), [annualGross, bonusYearly, juneBonus]);

    const isMg4Above = useMemo(() => {
        const level = parseInt(grade.replace(/\D/g, '')) || 0;
        return level >= 4;
    }, [grade]);

    const monthlyPf = pfYearly / 12;
    const monthlyTax = taxDetails.finalTax / 12;
    const monthlyFood = isMg4Above ? 500 : 0;
    const monthlyFrs = 5;
    const monthlyTakeHome = monthlyGross - monthlyPf - monthlyTax - monthlyFood - monthlyFrs;
    
    // Tax impact of bonuses (simplified as marginal tax)
    const julyBonusTax = taxWithJulyBonus.finalTax - taxDetails.finalTax;
    const juneBonusTax = taxWithJuneBonus.finalTax - taxDetails.finalTax;

    const annualTakeHome = (monthlyTakeHome * 12) + bonusYearly + juneBonus - (totalTaxWithBonuses.finalTax - taxDetails.finalTax);
    const effectiveTaxRate = annualGross > 0 ? (totalTaxWithBonuses.finalTax / (annualGross + bonusYearly + juneBonus)) * 100 : 0;

    const julyTakeHome = monthlyGross + bonusYearly - monthlyPf - monthlyTax - monthlyFood - monthlyFrs - julyBonusTax;
    const juneTakeHome = monthlyGross + juneBonus - monthlyPf - monthlyTax - monthlyFood - monthlyFrs - juneBonusTax;

    const components = [
        { label: 'Basic', value: basic, onChange: setBasic, color: '#6366f1' },
        { label: 'HRA', value: hra, onChange: setHra, color: '#8b5cf6' },
        { label: 'Special Allowance', value: specialAllowance, onChange: setSpecialAllowance, color: '#0ea5e9' },
        { label: 'Leave Travel Allowance', value: lta, onChange: setLta, color: '#10b981' },
    ];

    const bonusPctOfCtc = ctc > 0 ? ((bonusYearly + juneBonus) / ctc) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="salary-calc-viewport"
        >
            <div className="salary-calc-header">
                <div className="header-icon-box">
                    <Calculator color="#fff" size={22} />
                </div>
                <div className="header-text">
                    <h1>Salary Profiler</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <p>New Tax Regime — FY 2024–25 Simulator</p>
                        <span className="grade-badge">Grade: {grade}</span>
                    </div>
                </div>
            </div>

            <div className="salary-calc-layout">
                <div className="salary-calc-inputs">
                    <div className="quick-ctc-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div className="label">⚡ Enter Total CTC</div>
                            <select 
                                value={grade} 
                                onChange={e => setGrade(e.target.value)}
                                className="grade-select"
                            >
                                {['MG1','MG2','MG3','MG4','MG5','MG6'].map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-wrap">
                            <span>₹</span>
                            <input
                                type="number"
                                placeholder="Enter your annual CTC"
                                value={grossInput}
                                onChange={e => handleGrossChange(e.target.value)}
                            />
                        </div>
                        <div className="footer">
                            {isMg4Above ? 'Canteen: ₹500 (Deducted)' : 'Canteen: ₹0 (No deduction for below MG4)'}
                        </div>
                    </div>

                    <div className="salary-white-card">
                        <div className="card-title-row">
                            <Briefcase size={16} color="#6366f1" />
                            <span style={{ color: '#6366f1' }}>Monthly Components</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {components.map(c => (
                                <InputField key={c.label} label={c.label} value={c.value} onChange={c.onChange} accent={c.color} />
                            ))}
                        </div>
                        <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f5f3ff', borderRadius: 12, border: '1px solid #ddd6fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6d28d9' }}>Monthly Gross</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#4c1d95' }}>{formatCurrency(monthlyGross)}</span>
                        </div>
                    </div>

                    <div className="salary-white-card">
                        <div className="card-title-row">
                            <Shield size={16} color="#0ea5e9" />
                            <span style={{ color: '#0ea5e9' }}>Retirals & Deductions</span>
                        </div>
                        <InputField label="Provident Fund (Yearly)" value={pfYearly} onChange={setPfYearly} accent="#0ea5e9" />
                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd' }}>
                            <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600 }}>Monthly EPF deducted</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0c4a6e' }}>{formatCurrency(monthlyPf)}</div>
                        </div>
                    </div>

                    <div className="salary-white-card" style={{ background: 'linear-gradient(135deg, #1e3a8a, #1e40af)', border: 'none' }}>
                        <div className="card-title-row" style={{ marginBottom: '1rem' }}>
                            <Banknote size={16} color="#93c5fd" />
                            <span style={{ color: '#dbeafe' }}>Annual Bonus (June)</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'rgba(147,197,253,0.15)', color: '#93c5fd', borderRadius: 20, padding: '0.15rem 0.6rem', fontWeight: 700 }}>June Only</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.65rem 1rem', border: '1px solid rgba(147,197,253,0.3)' }}>
                            <span style={{ color: '#93c5fd', fontWeight: 800, marginRight: '0.5rem' }}>₹</span>
                            <input
                                type="number"
                                value={juneBonus}
                                onChange={e => setJuneBonus(Number(e.target.value))}
                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1.05rem', fontWeight: 700, color: '#fff', fontFamily: 'Outfit, sans-serif' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Grade {grade} Specific</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#93c5fd' }}>June Payout</span>
                        </div>
                    </div>

                    <div className="salary-white-card" style={{ background: 'linear-gradient(135deg, #451a03, #78350f)', border: 'none' }}>
                        <div className="card-title-row" style={{ marginBottom: '1rem' }}>
                            <Banknote size={16} color="#fbbf24" />
                            <span style={{ color: '#fcd34d' }}>Performance Incentive</span>
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
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Bulk TDS in July</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fbbf24' }}>Variable Pay</span>
                        </div>
                    </div>
                </div>

                <div className="salary-calc-results">
                    <div className="take-home-hero">
                        <div className="hero-flex">
                            <div className="main-val-box">
                                <div className="label">Est. Take Home / Month</div>
                                <div className="value">{formatCurrency(monthlyTakeHome)}</div>
                                <div className="annual">{formatCurrency(annualTakeHome)} annually</div>
                            </div>
                            <div className="tax-rate-box">
                                <div className="label">Effective Tax Rate</div>
                                <div className="rate">{effectiveTaxRate.toFixed(2)}%</div>
                            </div>
                        </div>
                    </div>

                    <div className="stat-grid-row">
                        <StatCard label="Annual Gross" value={formatCurrency(annualGross)} sub="Pre-tax" color="#6366f1" bg="#eef2ff" />
                        <StatCard label="Fixed CTC" value={formatCurrency(fixedCtc)} sub="Gross + PF" color="#7c3aed" bg="#f5f3ff" />
                        <StatCard label="Total CTC" value={formatCurrency(ctc)} sub={`Incl. Incentive`} color="#0369a1" bg="#f0f9ff" />
                    </div>

                    <div className="bonus-month-card" style={{ background: 'linear-gradient(135deg, #1e3a8a, #1e40af)' }}>
                        <div className="bonus-header">
                            <div className="bonus-main">
                                <div className="title-row">
                                    <Banknote size={14} color="#93c5fd" />
                                    <span>June — Annual Bonus Month</span>
                                </div>
                                <div className="value" style={{ color: '#fff' }}>{formatCurrency(juneTakeHome)}</div>
                                <div className="compare" style={{ color: 'rgba(255,255,255,0.6)' }}>vs normal {formatCurrency(monthlyTakeHome)}</div>
                            </div>
                            <div style={{ background: 'rgba(147,197,253,0.1)', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid rgba(147,197,253,0.2)', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Grade {grade} Bonus</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#dbeafe' }}>+{formatCurrency(juneBonus)}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                                { label: 'Monthly Gross', amt: monthlyGross, color: '#a7f3d0' },
                                { label: `Annual Bonus (June)`, amt: juneBonus, color: '#93c5fd', prefix: '+' },
                                { label: 'Regular TDS (Monthly)', amt: -monthlyTax, color: '#fca5a5' },
                                { label: 'Bonus Tax (Deduction)', amt: -juneBonusTax, color: '#f87171' },
                                { label: 'EPF Deduction', amt: -monthlyPf, color: '#fca5a5' },
                                { label: 'Food / Canteen', amt: -monthlyFood, color: '#fca5a5' },
                                { label: 'FRS Fund', amt: -monthlyFrs, color: '#93c5fd' },
                            ].map((r, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{r.label}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: r.color }}>{r.prefix || ''}{formatCurrency(Math.abs(r.amt))}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(147,197,253,0.3)' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#dbeafe' }}>Net June Take Home</span>
                                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#93c5fd' }}>{formatCurrency(juneTakeHome)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bonus-month-card">
                        <div className="bonus-header">
                            <div className="bonus-main">
                                <div className="title-row">
                                    <Banknote size={14} color="#fbbf24" />
                                    <span>July — Performance Incentive Month</span>
                                </div>
                                <div className="value">{formatCurrency(julyTakeHome)}</div>
                                <div className="compare">vs normal {formatCurrency(monthlyTakeHome)}</div>
                            </div>
                            <div style={{ background: 'rgba(251,191,36,0.1)', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid rgba(251,191,36,0.2)', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>Bonus</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fcd34d' }}>+{formatCurrency(bonusYearly)}</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                                { label: 'Monthly Gross', amt: monthlyGross, color: '#a7f3d0' },
                                { label: `Performance Incentive`, amt: bonusYearly, color: '#fcd34d', prefix: '+' },
                                { label: 'Regular TDS (Monthly)', amt: -monthlyTax, color: '#fca5a5' },
                                { label: 'Incentive Tax (Bulk Deduction)', amt: -julyBonusTax, color: '#f87171' },
                                { label: 'EPF Deduction', amt: -monthlyPf, color: '#fca5a5' },
                                { label: 'Food / Canteen', amt: -monthlyFood, color: '#fca5a5' },
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

                    <div className="dark-deduction-card">
                        <div className="header">
                            <TrendingDown size={16} color="#a5b4fc" />
                            <span>Monthly Deductions</span>
                        </div>
                        <DeductRow label="Income Tax (TDS)" amount={monthlyTax} color="#f87171" />
                        <DeductRow label="EPF / Provident Fund" amount={monthlyPf} color="#fcd34d" />
                        <DeductRow label="Food / Canteen" amount={monthlyFood} color="#fca5a5" />
                        <DeductRow label="FRS Fund" amount={monthlyFrs} color="#93c5fd" />
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>Total Monthly</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fca5a5' }}>{formatCurrency(monthlyTax + monthlyPf + monthlyFood + monthlyFrs)}</span>
                        </div>
                    </div>

                    <div className="dark-deduction-card" style={{ background: '#0f172a' }}>
                        <div className="header" style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <FileText size={15} color="#818cf8" />
                                <span style={{ color: '#818cf8' }}>Tax Walkthrough</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', background: 'rgba(129,140,248,0.1)', color: '#a5b4fc', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 20, padding: '0.2rem 0.65rem', fontWeight: 700 }}>FY 2025–26</span>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Annual Gross</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>{formatCurrency(annualGross)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Standard Deduction</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>– {formatCurrency(standardDeduction)}</span>
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Net Taxable</span>
                                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#a5b4fc' }}>{formatCurrency(taxDetails.taxable)}</span>
                            </div>
                        </div>

                        {taxDetails.slabs.length === 0 ? (
                            <div style={{ padding: '1.25rem', background: 'rgba(16,185,129,0.08)', borderRadius: 14, border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem' }}>🎉</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>Zero Tax — 87A Applied</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {taxDetails.slabs.map((slab, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: SLAB_COLORS[i], background: `${SLAB_COLORS[i]}18`, borderRadius: 8, padding: '0.15rem 0.6rem' }}>{slab.rate}%</span>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f1f5f9' }}>{formatCurrency(slab.tax)}</span>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 700 }}>Annual Tax</span>
                                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f87171' }}>{formatCurrency(taxDetails.finalTax)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="payslip-container">
                <div className="payslip-header-row">
                    <div className="bar" />
                    <h2>Sample Pay Slip</h2>
                    <span className="badge">Auto-generated</span>
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
        { label: 'HRA', amount: hra },
        { label: 'Special Allowance', amount: sa },
        { label: 'LTA', amount: lta },
    ];
    const deductions = [
        { label: 'PF (Employee)', amount: monthlyPf },
        { label: 'Income Tax (TDS)', amount: monthlyTax },
        { label: 'Food / Canteen', amount: monthlyFood || 500 },
        { label: 'FRS Fund', amount: monthlyFrs || 5 },
    ];
    const grossDeductions = deductions.reduce((s, d) => s + d.amount, 0);

    return (
        <div className="payslip-box">
            <div className="payslip-top-banner">
                <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>PAYSLIP</div>
                    <div style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600, marginTop: '0.15rem' }}>{monthYear}</div>
                </div>
                <div className="net-pay-val">
                    <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 600 }}>NET PAY</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#6ee7b7' }}>
                        {formatCurrency(monthlyTakeHome)}
                    </div>
                </div>
            </div>

            <div className="payslip-meta-bar">
                {[
                    { label: 'Employee', value: '— ' },
                    { label: 'Designation', value: '— ' },
                    { label: 'Pay Period', value: monthYear },
                    { label: 'Days', value: '30' },
                ].map(f => (
                    <div key={f.label}>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{f.label}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginTop: '0.15rem' }}>{f.value}</div>
                    </div>
                ))}
            </div>

            <div className="payslip-table-grid">
                <div style={{ flex: 1, borderRight: '1px solid #e5e7eb' }}>
                    <div style={{ padding: '0.65rem 1.5rem', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Earnings</span>
                    </div>
                    {earnings.map(e => (
                        <div key={e.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                            <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 600 }}>{e.label}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{formatCurrency(e.amount)}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1.5rem', background: '#f9fafb' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>Gross Total</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#15803d' }}>{formatCurrency(monthlyGross)}</span>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ padding: '0.65rem 1.5rem', background: '#fff7f7', borderBottom: '1px solid #fecaca' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase' }}>Deductions</span>
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

            <div style={{ padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f3ff' }}>
                <div style={{ fontSize: '0.7rem', color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase' }}>Net Pay</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4c1d95' }}>{formatCurrency(monthlyTakeHome)}</div>
            </div>
        </div>
    );
}
