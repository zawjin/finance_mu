import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import dayjs from 'dayjs';

export default function ExpenseForm({ categories, onSubmit }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [sub, setSub] = useState('');
    const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));

    const activeSubs = categories.find(c => c.name === category)?.sub_categories || [];

    return (
        <div className="apple-split-form">
            {/* LEFT: 40% - THE AMOUNT PREVIEW */}
            <div className="apple-form-left-viz">
                <div className="apple-viz-glass">
                    <div className="viz-label">PREVIEW AMOUNT</div>
                    <div className="viz-amount">
                        <span className="viz-currency">₹</span>
                        <input
                            type="text"
                            className="apple-ghost-input"
                            value={amount}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    setAmount(val);
                                }
                            }}
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                    <div className="viz-date-badge">{dayjs(date).format('MMMM DD, YYYY')}</div>
                </div>
            </div>

            {/* RIGHT: 60% - THE FORM DETAILS */}
            <div className="apple-form-right-fields">
                <div className="apple-field-group">
                    <label>DESCRIPTION</label>
                    <input className="apple-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Entry details..." />
                </div>

                <div className="apple-field-grid">
                    <div className="apple-field-group">
                        <label>CATEGORY</label>
                        <select className="apple-select" value={category} onChange={e => { setCategory(e.target.value); setSub(''); }}>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="apple-field-group">
                        <label>SUB-TYPE</label>
                        <select className="apple-select" value={sub} onChange={e => setSub(e.target.value)} disabled={!category}>
                            <option value="">Select Sub-Type</option>
                            {activeSubs.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="apple-field-group">
                    <label>TRANSACTION DATE</label>
                    <input
                        type="date"
                        className="apple-input"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>

                <button
                    className="apple-btn-confirm"
                    onClick={() => onSubmit({ amount: parseFloat(amount), description, category, sub_category: sub, date })}
                    disabled={!amount || !description || !category}
                >
                    <Plus size={18} /> COMPLETE TRANSACTION
                </button>
            </div>
        </div>
    )
}
