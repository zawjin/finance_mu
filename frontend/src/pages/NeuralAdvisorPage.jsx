import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import NeuralPulse from '../components/ui/NeuralPulse';
import { Brain, Sparkles, ShieldCheck } from 'lucide-react';

const NeuralAdvisorPage = () => {
    const { spending, categories } = useSelector(state => state.finance);

    return (
        <div className="neural-advisor-page" style={{ 
            padding: '20px', 
            maxWidth: '100%', 
            margin: '0', 
            background: '#000', 
            minHeight: '100vh',
            color: '#fff'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neural-page-header"
                style={{ textAlign: 'center', marginBottom: '30px' }}
            >
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    background: 'rgba(0, 209, 255, 0.1)', 
                    padding: '8px 16px', 
                    borderRadius: '50px',
                    marginBottom: '15px'
                }}>
                    <Brain size={16} color="#00d1ff" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#00d1ff', letterSpacing: '0.1em' }}>NEURAL COMMAND CENTER</span>
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 950, color: '#fff', marginBottom: '10px' }}>Your AI Financial Advisor</h1>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto' }}>
                    Deep-dive behavioral auditing and predictive wealth forecasting powered by the Neural Matrix engine.
                </p>
            </motion.div>

            <NeuralPulse spending={spending} categories={categories} />

            <div className="neural-additional-info" style={{ marginTop: '40px', display: 'grid', gap: '20px' }}>
                <div style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    padding: '20px', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Sparkles size={16} color="#fb923c" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff' }}>HOW IT WORKS</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        The Neural Advisor analyzes your last 90 days of transactions to understand your lifestyle. 
                        It looks for patterns in your spending velocity, investment health, and habit completion 
                        to give you real-time advice updated every 24 hours.
                    </p>
                </div>

                <div style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    padding: '20px', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <ShieldCheck size={16} color="#34c759" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff' }}>DATA PRIVACY</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        All analysis is performed locally on your server. No financial data ever leaves your 
                        private infrastructure.
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
};

export default NeuralAdvisorPage;
