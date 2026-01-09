import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ATOM_TYPES } from '../constants';
import { Settings, Zap, Trash2, Share2, Minimize2, Maximize2, Play, Pause, RotateCcw, Camera } from 'lucide-react';

export function Toolbar({
    selectedAtomType,
    onSelectAtomType,
    physicsParams,
    onUpdatePhysics,
    onClear,
    onShare,
    onReset,
    onSnapshot,
    isPaused,
    onTogglePause
}) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.div
            layout
            initial={{ width: 280, height: 'auto', borderRadius: 16 }}
            animate={{
                width: collapsed ? 48 : 280,
                height: collapsed ? 48 : 475,
                borderRadius: collapsed ? 24 : 16
            }}
            transition={{ type: "spring", stiffness: 5000, damping: 300 }}
            onPointerDown={(e) => e.stopPropagation()}
            data-ui-element
            className={`absolute top-6 left-6 cursor-default bg-slate-900/80 backdrop-blur-md border border-slate-700/50 shadow-2xl overflow-hidden z-50`}
        >
            <div className="relative p-4">
                {/* Header / Toggle */}
                <div className="flex items-center justify-between mb-4">
                    {!collapsed && <h1 className="text-lg font-bold bg-linear-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent whitespace-nowrap">Molecule Designer</h1>}
                    <button
                        onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
                        className={`p-3 rounded-full cursor-pointer hover:bg-slate-700 transition-colors z-20 ${collapsed ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
                    >
                        {collapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                </div>

                {/* Content */}
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4 min-w-62"
                        >
                            {/* Atom Selector */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Element</label>
                                <select
                                    value={selectedAtomType}
                                    onChange={(e) => onSelectAtomType(parseInt(e.target.value))}
                                    className="w-full cursor-pointer bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                                >
                                    {ATOM_TYPES.map((type, idx) => (
                                        <option key={type.symbol} value={idx}>
                                            {type.symbol} - {type.name} (ch: {type.charge}, val: {type.valency})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Physics Controls */}
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    <Settings size={12} /> Physics
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => onUpdatePhysics('gravity', physicsParams.gravity === 0 ? 0.5 : 0)}
                                        className={`px-3 py-2 cursor-pointer rounded-md text-xs font-bold transition-all ${physicsParams.gravity > 0 ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        Gravity
                                    </button>
                                    <button
                                        onClick={() => onUpdatePhysics('useElectro', !physicsParams.useElectro)}
                                        className={`px-3 py-2 cursor-pointer rounded-md text-xs font-bold transition-all ${physicsParams.useElectro ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-1 justify-center">
                                            <Zap size={12} fill="currentColor" /> Electro
                                        </div>
                                    </button>
                                </div>

                                <button
                                    onClick={onTogglePause}
                                    className={`w-full cursor-pointer mt-2 px-3 py-2 rounded-md text-xs font-bold transition-all ${isPaused ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
                                        {isPaused ? "Resume Simulation" : "Pause Simulation"}
                                    </div>
                                </button>
                            </div>

                            {/* Sliders */}
                            <div className="space-y-3 pt-2">
                                <div>
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>Bond Stiffness</span>
                                        <span>{(physicsParams.bondStiffness * 10).toFixed(1)}</span>
                                    </div>
                                    <input
                                        type="range" min="0.01" max="1" step="0.01"
                                        value={physicsParams.bondStiffness}
                                        onChange={(e) => onUpdatePhysics('bondStiffness', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>Temperature</span>
                                        <span>{physicsParams.temperature.toFixed(1)}</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="5" step="0.1"
                                        value={physicsParams.temperature}
                                        onChange={(e) => onUpdatePhysics('temperature', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                                <button onClick={onReset} className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-slate-800 hover:bg-sky-500/20 hover:text-sky-400 text-slate-300 py-2 rounded-md text-xs font-medium transition-colors duration-200" title="Reset to Benzene">
                                    <RotateCcw size={14} />
                                </button>
                                <button onClick={onClear} className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 py-2 rounded-md text-xs font-medium transition-colors duration-200" title="Clear">
                                    <Trash2 size={14} />
                                </button>
                                <button onClick={onShare} className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 py-2 rounded-md text-xs font-medium transition-colors duration-200" title="Share">
                                    <Share2 size={14} />
                                </button>
                                <button onClick={onSnapshot} className="flex-1 cursor-pointer flex items-center justify-center gap-2 bg-slate-800 hover:bg-violet-500/20 hover:text-violet-400 text-slate-300 py-2 rounded-md text-xs font-medium transition-colors duration-200" title="Save Snapshot">
                                    <Camera size={14} />
                                </button>
                            </div>

                            <div className="text-[10px] text-slate-500 text-center pt-1">
                                Shift+Click to Bond • [/] to Cycle
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
