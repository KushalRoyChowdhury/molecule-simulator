import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { usePhysicsEngine } from '../hooks/usePhysicsEngine';
import { Toolbar } from './Toolbar';
import { Inspector } from './Inspector';
import { ATOM_TYPES, COMMON_MOLECULES } from '../constants';

export function Universe() {
    // --- ENGINE ---
    const engine = usePhysicsEngine();

    // --- LOCAL UI STATE ---
    const [selectedTypeIdx, setSelectedTypeIdx] = useState(1); // Default Carbon
    const [physicsParams, setPhysicsParams] = useState(engine.physicsRef.current);

    // --- INTERACTION STATE ---
    const interactionRef = useRef({
        dragAtom: null,
        dragOffset: { x: 0, y: 0 },
        linkingAtomId: null,
        isInteracting: false
    });

    // --- HANDLERS ---

    const handleUpdatePhysics = (key, value) => {
        engine.physicsRef.current[key] = value;
        setPhysicsParams({ ...engine.physicsRef.current }); // Trigger UI update for sliders
    };

    const analyzeMolecule = (startAtomId) => {
        if (!startAtomId) return null;

        // Graph Traversal (BFS)
        const visited = new Set();
        const queue = [startAtomId];
        visited.add(startAtomId);

        // Build Adjacency
        const adj = {};
        engine.bondsRef.current.forEach(b => {
            if (!adj[b.atomA.id]) adj[b.atomA.id] = [];
            if (!adj[b.atomB.id]) adj[b.atomB.id] = [];
            adj[b.atomA.id].push(b.atomB.id);
            adj[b.atomB.id].push(b.atomA.id);
        });

        const atoms = [];
        while (queue.length > 0) {
            const currId = queue.shift();
            const atom = engine.atomsRef.current.find(a => a.id === currId);
            if (atom) atoms.push(atom);

            const neighbors = adj[currId] || [];
            neighbors.forEach(nId => {
                if (!visited.has(nId)) {
                    visited.add(nId);
                    queue.push(nId);
                }
            });
        }

        // Hill System Formula
        const counts = {};
        let mass = 0;
        atoms.forEach(a => {
            counts[a.symbol] = (counts[a.symbol] || 0) + 1;
            mass += a.mass;
        });

        const keys = Object.keys(counts).sort((a, b) => {
            if (a === 'C' && b !== 'C') return -1;
            if (b === 'C' && a !== 'C') return 1;
            if (a === 'H' && b !== 'H') return -1;
            if (b === 'H' && a !== 'H') return 1;
            return a.localeCompare(b);
        });

        let html = '';
        let formula = '';
        keys.forEach(k => {
            html += `${k}${counts[k] > 1 ? `<sub>${counts[k]}</sub>` : ''}`;
            formula += `${k}${counts[k] > 1 ? counts[k] : ''}`;
        });

        const name = COMMON_MOLECULES[formula];
        return { html, mass, name };
    };

    // Interaction Logic
    useEffect(() => {
        const container = engine.containerRef.current;
        if (!container) return;

        const onMouseDown = (e) => {
            // 1. Check if clicking an Atom (via Delegation or coordinate check? Delegate is easier if atoms have pointer-events)
            // But our Atoms are managed manually.
            // Best way: Check event target in the `atomsLayer`.

            const target = e.target;
            const atomEl = target.closest('[data-id]');
            const isAtom = atomEl && engine.atomsLayerRef.current.contains(atomEl);

            if (isAtom) {
                e.stopPropagation();
                interactionRef.current.isInteracting = true;

                const id = atomEl.dataset.id;
                const atom = engine.atomsRef.current.find(a => a.id === id);
                if (!atom) return;

                // Shift Click = Link
                if (e.shiftKey) {
                    if (interactionRef.current.linkingAtomId && interactionRef.current.linkingAtomId !== id) {
                        // Create Bond
                        const a1 = engine.atomsRef.current.find(a => a.id === interactionRef.current.linkingAtomId);
                        const a2 = atom;
                        if (a1 && a2) {
                            // Valency Check
                            const getBondCount = (atomId) => {
                                return engine.bondsRef.current.reduce((sum, b) => {
                                    if (b.atomA.id === atomId || b.atomB.id === atomId) return sum + b.type;
                                    return sum;
                                }, 0);
                            };

                            const v1 = ATOM_TYPES[a1.typeIndex].valency;
                            const v2 = ATOM_TYPES[a2.typeIndex].valency;
                            const c1 = getBondCount(a1.id);
                            const c2 = getBondCount(a2.id);

                            // Check existing
                            const existing = engine.bondsRef.current.find(b =>
                                (b.atomA === a1 && b.atomB === a2) || (b.atomA === a2 && b.atomB === a1)
                            );
                            if (existing) {
                                if (existing.type < 3) {
                                    if (c1 + 1 <= v1 && c2 + 1 <= v2) existing.type++;
                                } else {
                                    engine.bondsRef.current = engine.bondsRef.current.filter(b => b !== existing);
                                }
                            } else {
                                if (c1 + 1 <= v1 && c2 + 1 <= v2) {
                                    engine.bondsRef.current.push({
                                        id: Math.random().toString(),
                                        atomA: a1, atomB: a2, type: 1,
                                        restLength: (a1.radius + a2.radius) * 1.2
                                    });
                                }
                            }
                            engine.saveToSession(); // Save after bonding update
                        }
                        interactionRef.current.linkingAtomId = null;
                    } else {
                        interactionRef.current.linkingAtomId = id;
                    }
                    return;
                }

                // Drag Start
                interactionRef.current.dragAtom = atom;
                atom.isDragging = true;
                const rect = container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;
                interactionRef.current.dragOffset = { x: atom.x - mx, y: atom.y - my };

                // Select & Inspect
                engine.setSelectedAtomId(id);
                engine.setInspectorData(analyzeMolecule(id));

            } else {
                // Background Click -> Spawn
                if (interactionRef.current.isInteracting) return;

                // IGNORE CLICKS ON UI ELEMENTS
                if (e.target.closest('[data-ui-element]') || e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;

                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                engine.addAtom(x, y, selectedTypeIdx);
                engine.setSelectedAtomId(null);
                engine.setInspectorData(null);
                engine.saveToSession(); // Save after spawn
            }
        };

        const onMouseMove = (e) => {
            if (interactionRef.current.dragAtom) {
                const rect = container.getBoundingClientRect();
                const mx = e.clientX - rect.left;
                const my = e.clientY - rect.top;

                interactionRef.current.dragAtom.x = mx + interactionRef.current.dragOffset.x;
                interactionRef.current.dragAtom.y = my + interactionRef.current.dragOffset.y;
                // Zero velocity to prevent fling
                interactionRef.current.dragAtom.oldX = interactionRef.current.dragAtom.x;
                interactionRef.current.dragAtom.oldY = interactionRef.current.dragAtom.y;
            }
        };

        const onMouseUp = () => {
            if (interactionRef.current.dragAtom) {
                interactionRef.current.dragAtom.isDragging = false;
                interactionRef.current.dragAtom = null;
            }
            if (interactionRef.current.isInteracting) {
                engine.saveToSession(); // Save on interaction end
            }
            interactionRef.current.isInteracting = false;
        };

        const onKeyDown = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (engine.selectedAtomId) {
                    const id = engine.selectedAtomId;
                    engine.atomsRef.current = engine.atomsRef.current.filter(a => a.id !== id);
                    engine.bondsRef.current = engine.bondsRef.current.filter(b => b.atomA.id !== id && b.atomB.id !== id);
                    engine.setSelectedAtomId(null);
                    engine.setInspectorData(null);
                    engine.saveToSession(); // Save on delete
                }
            }
        };

        // Attach to Container for Down, Window for Move/Up (to catch dragging outside)
        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            container.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [engine, selectedTypeIdx]); // Re-bind if engine/selection type changes

    const takeSnapshot = async () => {
        if (!engine.containerRef.current) return;

        try {
            const canvas = await html2canvas(engine.containerRef.current, {
                backgroundColor: '#020617', // Match slate-950
                scale: 2, // Retina quality
                logging: false,
                ignoreElements: (element) => {
                    // Ignore UI elements specifically
                    if (element.hasAttribute && element.hasAttribute('data-ui-element')) return true;
                    // Also ignore the FPS counter if possible (it's a div at bottom right)
                    if (element.textContent && element.textContent.includes('FPS')) return true;
                    return false;
                }
            });

            const link = document.createElement('a');
            link.download = `molecule-snapshot-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Snapshot failed:", err);
            alert("Could not take snapshot.");
        }
    };

    return (
        <div className="relative w-full h-full bg-slate-950 overflow-hidden cursor-crosshair select-none" ref={engine.containerRef}>

            {/* SVG Layer (Bonds) */}
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                <g ref={engine.svgLayerRef}></g>
            </svg>

            {/* HTML Layer (Atoms) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" ref={engine.atomsLayerRef}></div>

            {/* UI Overlays */}
            <Toolbar
                selectedAtomType={selectedTypeIdx}
                onSelectAtomType={setSelectedTypeIdx}
                physicsParams={physicsParams}
                onUpdatePhysics={handleUpdatePhysics}
                onClear={engine.clearAll}
                onReset={engine.resetToDemo}
                onSnapshot={takeSnapshot}
                onShare={() => alert("Share feature coming soon!")}
                isPaused={engine.isPaused}
                onTogglePause={engine.togglePause}
            />

            <Inspector data={engine.inspectorData} />

            {/* Info Footer */}
            <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-500 pointer-events-none">
                {engine.stats.fps} FPS | {engine.stats.atomCount} Atoms
            </div>

        </div>
    );
}
