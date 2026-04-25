import React, { useState } from 'react';
import { Target, Clock, CalendarDays, Activity } from 'lucide-react';
import { Box, TextField, Select, MenuItem, Button, Typography, InputAdornment, Stack } from '@mui/material';
import './Forms.scss';

export default function HealthHabitForm({ onSubmit, onCancel, initialHabit }) {
    const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const isEdit = !!initialHabit;
    
    const [formData, setFormData] = useState({
        name: initialHabit?.name || '',
        duration: initialHabit?.duration || '',
        type: initialHabit?.type || 'Daily',
        frequency_days: initialHabit?.frequency_days || []
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Please provide a habit name';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = () => {
        if (validate()) {
            onSubmit({
                name: formData.name,
                duration: Number(formData.duration) || 0,
                type: formData.type,
                frequency_days: formData.type === 'Daily' ? formData.frequency_days : []
            });
        }
    };

    return (
        <Box className="form-container-premium">
            <Stack spacing={3}>
                {/* HABIT NAME */}
                <Box>
                    <Typography className="form-label-premium">HABIT DEFINITION</Typography>
                    <TextField
                        fullWidth
                        placeholder="e.g. Read 10 Pages, Morning Run..."
                        variant="outlined"
                        size="small"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Target size={18} style={{ color: '#0ea5e9' }} /></InputAdornment>
                        }}
                        className="form-input-premium"
                    />
                </Box>

                {/* DURATION */}
                <Box>
                    <Typography className="form-label-premium">DURATION (MINUTES)</Typography>
                    <TextField
                        fullWidth
                        placeholder="Optional target duration..."
                        variant="outlined"
                        size="small"
                        type="number"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Clock size={18} style={{ color: '#f59e0b' }} /></InputAdornment>
                        }}
                        className="form-input-premium"
                    />
                </Box>

                {/* SCOPE SELECTION */}
                <Box>
                    <Typography className="form-label-premium">TRACKING SCOPE</Typography>
                    <Select
                        fullWidth
                        size="small"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        startAdornment={<InputAdornment position="start" sx={{ ml: -0.5 }}><CalendarDays size={18} style={{ color: '#6366f1' }} /></InputAdornment>}
                        className="form-input-premium"
                    >
                        <MenuItem value="Daily" sx={{ fontWeight: 800 }}>Daily Interval</MenuItem>
                        <MenuItem value="Weekly" sx={{ fontWeight: 800 }}>Weekly Interval</MenuItem>
                        <MenuItem value="Monthly" sx={{ fontWeight: 800 }}>Monthly Interval</MenuItem>
                        <MenuItem value="Yearly" sx={{ fontWeight: 800 }}>Yearly Interval</MenuItem>
                    </Select>
                </Box>

                {/* SPECIFIC WEEKDAYS */}
                {formData.type === 'Daily' && (
                    <Box sx={{ background: '#f8fafc', padding: 2, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <Typography className="form-label-premium" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <Activity size={16} color="#8b5cf6" /> STRICT WEEKDAY CONDITIONS
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 1.5 }}>
                            Select specific days if this habit does not run every day. Leave unselected to run all 7 days.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {WEEKDAYS.map(day => {
                                const isSelected = formData.frequency_days.includes(day);
                                return (
                                    <Box 
                                        key={day}
                                        onClick={() => {
                                            const newDays = isSelected 
                                                ? formData.frequency_days.filter(d => d !== day)
                                                : [...formData.frequency_days, day];
                                            setFormData({...formData, frequency_days: newDays});
                                        }}
                                        sx={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '10px',
                                            backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                                            color: isSelected ? '#ffffff' : '#64748b',
                                            border: `1px solid ${isSelected ? '#0f172a' : '#cbd5e1'}`,
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.2)' : 'none',
                                            '&:hover': {
                                                backgroundColor: isSelected ? '#1e293b' : '#f1f5f9'
                                            }
                                        }}
                                    >
                                        {day.substring(0, 3).toUpperCase()}
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                )}
            </Stack>

            <Box className="form-actions-row">
                <Button
                    onClick={onCancel}
                    className="btn-dismiss-premium"
                >
                    Dismiss
                </Button>
                <Button
                    variant="contained"
                    onClick={handleFormSubmit}
                    className="btn-submit-premium"
                >
                    {isEdit ? 'Save Changes' : 'Configure Habit'}
                </Button>
            </Box>
        </Box>
    );
}
