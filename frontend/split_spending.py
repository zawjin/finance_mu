import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Extract SpendingPage
match = re.search(r'function SpendingPage\(\{.*?\}\) \{.*?\n(.*?)\nfunction InvestmentPage', content, re.DOTALL)
if match:
    spending_code = 'function SpendingPage({ onAdd }) {\n' + match.group(1).replace('const {', '// const {')
    
    # We need to add useSelector
    spending_code = spending_code.replace('const [search, setSearch]', 'const { spending, categories, loading } = useSelector(state => state.finance);\n    const [search, setSearch]')
    
    # Prepend imports
    imports = """import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, Tag, Calendar, CalendarDays, Clock, Filter, PieChart, Layers, History, Check } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import PageHeader from '../components/ui/PageHeader';

"""
    with open('src/pages/SpendingPage.jsx', 'w') as out:
        out.write(imports + spending_code + "\n}\n")

