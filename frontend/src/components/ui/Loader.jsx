import React from 'react';
import { motion } from 'framer-motion';
import './Loader.scss';

const letters = [
    { char: 'S', color: '#00AEEF' },
    { char: 'A', color: '#A855F7' },
    { char: 'L', color: '#FFFFFF', textColor: '#A855F7' },
    { char: 'F', color: '#10B981' }
];

export default function Loader({ message = "Loading..." }) {
    return (
        <div className="salf-loader-root">
            {/* Background orbs */}
            <motion.div className="sl-orb sl-orb-blue"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div className="sl-orb sl-orb-purple"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.div className="sl-orb sl-orb-green"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            <div className="sl-mesh" />

            {/* Logo */}
            <div className="sl-content">
                <div className="sl-logo">
                    {letters.map((l, i) => (
                        <motion.div
                            key={l.char}
                            className="sl-letter-box"
                            style={{ background: l.color, color: l.textColor || '#fff' }}
                            initial={{ opacity: 0, y: 40, scale: 0.6 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                delay: i * 0.12,
                                type: 'spring',
                                stiffness: 260,
                                damping: 20
                            }}
                        >
                            <span>{l.char}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Tagline */}
                <motion.p
                    className="sl-tagline"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    {message}
                </motion.p>

                {/* Animated dots */}
                <motion.div
                    className="sl-dots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    {[0, 1, 2].map(i => (
                        <motion.span
                            key={i}
                            className="sl-dot"
                            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                            style={{
                                background: i === 0 ? '#00AEEF' : i === 1 ? '#A855F7' : '#10B981'
                            }}
                        />
                    ))}
                </motion.div>

                {/* Progress rail */}
                <motion.div
                    className="sl-rail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <motion.div
                        className="sl-rail-fill"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
