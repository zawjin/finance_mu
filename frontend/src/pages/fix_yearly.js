const fs = require('fs');
let code = fs.readFileSync('/Users/shajinva/Documents/D2C /Codes/Finance/frontend/src/pages/YearlyExpensePage.jsx', 'utf-8');

code = code.replace(/const \[deleteConfirmItem, setDeleteConfirmItem\] = useState\(null\);/, `const [activeTab, setActiveTab] = useState('YEARLY');
    const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);`);

code = code.replace(/const currentYear = new Date\(\)\.getFullYear\(\);/g, `const currentYear = new Date().getFullYear();\n    const currentMonthPeriod = dayjs().format('YYYY-MM');`);

code = code.replace(/const activeExpenses = useMemo\(\(\) => yearlyExpenses\?\.filter\(e => e\.status === 'ACTIVE'\) \|\| \[\], \[yearlyExpenses\]\);[\s\S]*?const totalRemainingThisYear = totalYearly - totalPaidThisYear;/m, `const activeExpenses = useMemo(() => {
        return yearlyExpenses?.filter(e => e.status === 'ACTIVE' && (activeTab === 'YEARLY' ? e.frequency !== 'MONTHLY' : e.frequency === 'MONTHLY')) || [];
    }, [yearlyExpenses, activeTab]);

    const totalPeriodCost = useMemo(() => activeExpenses.reduce((s, e) => s + (e.amount || 0), 0), [activeExpenses]);

    const monthOrder = { 'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5, 'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11 };

    const unpaidActiveExpenses = useMemo(() => {
        if (activeTab === 'YEARLY') return activeExpenses.filter(e => e.last_paid_year !== currentYear);
        return activeExpenses.filter(e => e.last_paid_period !== currentMonthPeriod);
    }, [activeExpenses, currentYear, currentMonthPeriod, activeTab]);

    const upcomingExpenses = useMemo(() => {
        if (activeTab === 'YEARLY') {
            const currentMonthIndex = new Date().getMonth();
            return unpaidActiveExpenses.slice().sort((a, b) => {
                let aDiff = monthOrder[a.due_month] - currentMonthIndex;
                if (aDiff < 0) aDiff += 12;
                let bDiff = monthOrder[b.due_month] - currentMonthIndex;
                if (bDiff < 0) bDiff += 12;
                if (aDiff === bDiff) return a.amount - b.amount;
                return aDiff - bDiff;
            });
        }
        return unpaidActiveExpenses.slice().sort((a, b) => b.amount - a.amount);
    }, [unpaidActiveExpenses, activeTab]);

    const nextExpense = upcomingExpenses.length > 0 ? upcomingExpenses[0] : null;

    const totalPaidThisPeriod = useMemo(() => {
        if (activeTab === 'YEARLY') return activeExpenses.filter(e => e.last_paid_year === currentYear).reduce((sum, e) => sum + (e.amount || 0), 0);
        return activeExpenses.filter(e => e.last_paid_period === currentMonthPeriod).reduce((sum, e) => sum + (e.amount || 0), 0);
    }, [activeExpenses, currentYear, currentMonthPeriod, activeTab]);

    const totalRemainingThisPeriod = totalPeriodCost - totalPaidThisPeriod;`);

code = code.replace(/const mainFundBalance = mainFund \? \(mainFund\.value \|\| mainFund\.balance \|\| 0\) : 0;\n    const yearlyShortfall = Math\.max\(0, totalRemainingThisYear - mainFundBalance\);[\s\S]*?return Math\.max\(maxSipNeeded, baselineSip\);\n    \}, \[unpaidActiveExpenses, mainFundBalance, totalYearly\]\);/m, `const mainFundBalance = mainFund ? (mainFund.value || mainFund.balance || 0) : 0;
    const periodShortfall = Math.max(0, totalRemainingThisPeriod - mainFundBalance);

    const dynamicSIPTarget = useMemo(() => {
        if (activeTab === 'MONTHLY') return totalPeriodCost;

        const currentMonthIndex = new Date().getMonth();
        let maxSipNeeded = 0;
        let cumulativeExpenses = 0;

        const expensesByMonth = Array(12).fill(0);
        unpaidActiveExpenses.forEach(exp => {
            let m = monthOrder[exp.due_month];
            if (m >= currentMonthIndex && m !== undefined) {
                expensesByMonth[m] += exp.amount;
            }
        });

        for (let m = currentMonthIndex; m <= 11; m++) {
            cumulativeExpenses += expensesByMonth[m];
            let monthsToSave = m - currentMonthIndex + 1;
            let shortfall = cumulativeExpenses - mainFundBalance;
            if (shortfall > 0) {
                let requiredSip = shortfall / monthsToSave;
                if (requiredSip > maxSipNeeded) maxSipNeeded = requiredSip;
            }
        }

        const baselineSip = totalPeriodCost / 12;
        return Math.max(maxSipNeeded, baselineSip);
    }, [unpaidActiveExpenses, mainFundBalance, totalPeriodCost, activeTab]);`);

code = code.replace(/await api.put\(\`\/yearly-expenses\/\$\{item\._id\}\`, \{ \.\.\.item, last_paid_year: currentYear \}\);/g, `if(activeTab === 'YEARLY') { await api.put(\`/yearly-expenses/\${item._id}\`, { ...item, last_paid_year: currentYear }); } else { await api.put(\`/yearly-expenses/\${item._id}\`, { ...item, last_paid_period: currentMonthPeriod }); }`);

code = code.replace(/await api.put\(\`\/yearly-expenses\/\$\{item\._id\}\`, \{ \.\.\.item, last_paid_year: null \}\);/g, `if(activeTab === 'YEARLY') { await api.put(\`/yearly-expenses/\${item._id}\`, { ...item, last_paid_year: null }); } else { await api.put(\`/yearly-expenses/\${item._id}\`, { ...item, last_paid_period: null }); }`);

code = code.replace(/<Typography variant="caption".*?><Replace size={14} \/> FIXED EXPENSES \(\{currentYear\}\)<\/Typography>/g, `<Typography variant="caption" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: '#c4b5fd', letterSpacing: '0.1em' }}><Replace size={14} /> FIXED EXPENSES ({activeTab})</Typography>`);

code = code.replace(/\{formatCurrency\(totalYearly\)\} <span style={{ fontSize: '0\.8rem', fontWeight: 700, opacity: 0\.7 }}>\/ yr<\/span><\/Typography>/g, `{formatCurrency(totalPeriodCost)} <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7 }}>/ {activeTab === 'YEARLY' ? 'yr' : 'mo'}</span></Typography>`);

code = code.replace(/\{formatCurrency\(totalPaidThisYear\)\}/g, `{formatCurrency(totalPaidThisPeriod)}`);
code = code.replace(/\{formatCurrency\(totalRemainingThisYear\)\}/g, `{formatCurrency(totalRemainingThisPeriod)}`);
code = code.replace(/yearlyShortfall/g, `periodShortfall`);
code = code.replace(/totalYearly \/ 12/g, `totalPeriodCost / 12`);

code = code.replace(/<div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>\n                <Button variant={activeTab === 'YEARLY' \? "contained" : "outlined"}.*?MONTHLY BILLS<\/Button>\n            <\/div>/s, ''); 

code = code.replace(/<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2\.5rem' }}>\n                <Box>\n                    <Typography variant="h3".*?Routines<\/Typography>/, `<div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <Button variant={activeTab === 'YEARLY' ? "contained" : "outlined"} onClick={() => setActiveTab('YEARLY')} sx={{ borderRadius: '50px', px: 3, fontWeight: 900 }}>YEARLY RESERVES</Button>
                <Button variant={activeTab === 'MONTHLY' ? "contained" : "outlined"} onClick={() => setActiveTab('MONTHLY')} sx={{ borderRadius: '50px', px: 3, fontWeight: 900 }}>MONTHLY BILLS</Button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: '#1d1d1f' }}>{activeTab === 'YEARLY' ? "Yearly Routines" : "Monthly Bills"}</Typography>`);

code = code.replace(/<Typography sx={{ fontSize: '0\.7rem', fontWeight: 900, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0\.05em', mb: 0\.2 }}>Next Pay \(\{nextExpense\.due_month\}\)<\/Typography>/g, `<Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.2 }}>Next Pay {activeTab === 'YEARLY' ? \`(\${nextExpense.due_month})\` : ""}</Typography>`);

code = code.replace(/<div style={{ flex: 1, paddingRight: '2rem' }}>\n                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0\.75rem', marginBottom: '0\.4rem' }}>\n                                                    <Typography sx={{ fontSize: '1\.15rem', fontWeight: 900, color: '#1d1d1f' }}>\{item\.name\}<\/Typography>/, `<div style={{ flex: 1, paddingRight: '2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                                    {activeTab === 'YEARLY' && <Chip label={item.due_month} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: '20px', bgcolor: 'rgba(0,0,0,0.06)' }} />}
                                                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#1d1d1f' }}>{item.name}</Typography>`);

// Also change the old due_month chip slightly below
code = code.replace(/<Chip label=\{item\.due_month\}.*?\/>/g, `{activeTab === 'YEARLY' && <Chip label={item.due_month} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', height: '22px', bgcolor: 'rgba(0,0,0,0.06)' }} />}`);

fs.writeFileSync('/Users/shajinva/Documents/D2C /Codes/Finance/frontend/src/pages/YearlyExpensePage.jsx', code);
