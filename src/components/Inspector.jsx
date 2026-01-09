import React from 'react';
import { motion } from 'framer-motion';

export function Inspector({ data }) {
    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            data-ui-element
            className="absolute top-6 left-1/2 -translate-x-1/2 min-w-50 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-xl text-center pointer-events-none select-none z-40"
        >
            <div className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-1">Molecule Inspector</div>

            {data.name && (
                <div className="text-sm font-bold text-sky-400 mb-1 tracking-wide">{data.name}</div>
            )}

            <div className="text-3xl font-black text-white tracking-wider" dangerouslySetInnerHTML={{ __html: data.html }}></div>

            <div className="text-xs font-mono text-slate-400 mt-2">
                Mass: <span className="text-emerald-400">{data.mass.toFixed(1)}u</span>
            </div>

            {/* Optional: Add common names detection here later */}
        </motion.div>
    );
}
