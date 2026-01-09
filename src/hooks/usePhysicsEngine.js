import { useRef, useEffect, useCallback, useState } from 'react';
import { ATOM_TYPES, INITIAL_PHYSICS, MOLECULE_PRESETS } from '../constants';

// --- UTILS ---
const uid = () => Math.random().toString(36).substr(2, 9);

class Atom {
    constructor(x, y, typeIdx = 1) {
        this.id = uid();
        this.x = x;
        this.y = y;
        this.oldX = x; // Verlet: prev position
        this.oldY = y;
        this.typeIndex = typeIdx;
        this.updateProps();
        this.vx = 0;
        this.vy = 0;
        this.isDragging = false;
    }

    updateProps() {
        const def = ATOM_TYPES[this.typeIndex];
        this.mass = def.mass;
        this.radius = def.radius;
        this.color = def.color;
        this.symbol = def.symbol;
        this.charge = def.charge;
    }
}

class Bond {
    constructor(atomA, atomB, type = 1) {
        this.id = uid();
        this.atomA = atomA; // Reference
        this.atomB = atomB; // Reference
        this.type = type; // 1 = single, 2 = double, 3 = triple
        // Calculate rest length based on radii overlap
        this.restLength = (atomA.radius + atomB.radius) * 1.2;
    }
}

export function usePhysicsEngine() {
    const atomsRef = useRef([]); // Mutable array of Atom objects
    const bondsRef = useRef([]); // Mutable array of Bond objects
    const physicsRef = useRef({ ...INITIAL_PHYSICS });

    // UI Sync State (updated less frequently)
    const [stats, setStats] = useState({ fps: 60, atomCount: 0 });
    const [selectedAtomId, _setSelectedAtomId] = useState(null);
    const selectedAtomIdRef = useRef(null); // Ref for loop access

    const setSelectedAtomId = (id) => {
        selectedAtomIdRef.current = id;
        _setSelectedAtomId(id);
    };

    const [inspectorData, setInspectorData] = useState(null);

    // Refs for DOM nodes (we manipulate these directly for speed)
    const atomElementsRef = useRef(new Map());
    const bondElementsRef = useRef(new Map());
    const containerRef = useRef(null);
    const svgLayerRef = useRef(null);
    const atomsLayerRef = useRef(null);

    const animationRef = useRef(null);
    const lastTimeRef = useRef(performance.now());
    const framesRef = useRef(0);
    const hasLoaded = useRef(false);
    const pausedRef = useRef(false); // Pause State
    const [isPaused, setIsPaused] = useState(false); // UI State

    // --- STATE MANAGEMENT ---
    const saveToSession = () => {
        const data = {
            atoms: atomsRef.current.map(a => ({
                id: a.id, x: Math.round(a.x), y: Math.round(a.y), typeIdx: a.typeIndex, vx: a.vx, vy: a.vy
            })),
            bonds: bondsRef.current.map(b => ({
                id: b.id, aid: b.atomA.id, bid: b.atomB.id, t: b.type
            })),
            params: physicsRef.current
        };
        sessionStorage.setItem('molecule_state', JSON.stringify(data));
    };

    const loadFromSession = () => {
        try {
            const raw = sessionStorage.getItem('molecule_state');
            if (!raw) return false;
            const data = JSON.parse(raw);

            // Reconstruct
            atomsRef.current = [];
            bondsRef.current = [];
            atomElementsRef.current.forEach(el => el.remove());
            atomElementsRef.current.clear();
            bondElementsRef.current.forEach(el => el.remove());
            bondElementsRef.current.clear();

            data.atoms.forEach(d => {
                const a = new Atom(d.x, d.y, d.typeIdx);
                a.id = d.id;
                a.vx = d.vx || 0;
                a.vy = d.vy || 0;
                atomsRef.current.push(a);
            });

            data.bonds.forEach(d => {
                const a = atomsRef.current.find(at => at.id === d.aid);
                const b = atomsRef.current.find(at => at.id === d.bid);
                if (a && b) {
                    const bond = new Bond(a, b, d.t);
                    bond.id = d.id;
                    bondsRef.current.push(bond);
                }
            });

            if (data.params) {
                // Merge params safely
                Object.assign(physicsRef.current, data.params);
            }

            return true;
        } catch (e) {
            console.error("Failed to load session:", e);
            return false;
        }
    };

    // --- PHYSICS LOOP ---
    const updatePhysics = () => {
        const width = containerRef.current?.clientWidth || 0;
        const height = containerRef.current?.clientHeight || 0;
        const params = physicsRef.current;
        const atoms = atomsRef.current;
        const bonds = bondsRef.current;

        // 1. Forces
        for (let a of atoms) {
            if (a.isDragging) continue;

            // Gravity
            if (params.gravity > 0) {
                a.y += params.gravity * a.mass * 0.05;
            }

            // Electrostatics
            if (params.useElectro) {
                for (let b of atoms) {
                    if (a === b) continue;
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    let distSq = dx * dx + dy * dy;
                    if (distSq < 100) distSq = 100;

                    const dist = Math.sqrt(distSq);

                    // Collision
                    const minDesc = a.radius + b.radius;
                    if (dist < minDesc) {
                        const overlap = minDesc - dist;
                        const push = overlap * 0.1;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        a.x += nx * push;
                        a.y += ny * push;
                    }

                    // Charge
                    const fMag = (params.repulsion * (a.charge * b.charge + 1)) / distSq;
                    const fx = (dx / dist) * fMag;
                    const fy = (dy / dist) * fMag;
                    a.x += fx / a.mass;
                    a.y += fy / a.mass;
                }
            }

            // Wall Constraints
            const damping = 0.7;
            if (a.x < a.radius) { a.x = a.radius; a.oldX = a.x + (a.x - a.oldX) * damping; }
            if (a.x > width - a.radius) { a.x = width - a.radius; a.oldX = a.x + (a.x - a.oldX) * damping; }
            if (a.y < a.radius) { a.y = a.radius; a.oldY = a.y + (a.y - a.oldY) * damping; }
            if (a.y > height - a.radius) { a.y = height - a.radius; a.oldY = a.y + (a.y - a.oldY) * damping; }

            // Temp
            if (params.temperature > 0) {
                const mag = params.temperature * 0.15;
                a.x += (Math.random() - 0.5) * mag;
                a.y += (Math.random() - 0.5) * mag;
            }
        }

        // 2. Bonds
        for (let b of bonds) {
            const dx = b.atomB.x - b.atomA.x;
            const dy = b.atomB.y - b.atomA.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) continue;

            const difference = dist - b.restLength;
            const percent = (difference / dist) / 2;
            const offset = percent * params.bondStiffness;

            const offsetX = dx * offset;
            const offsetY = dy * offset;

            if (!b.atomA.isDragging) {
                b.atomA.x += offsetX;
                b.atomA.y += offsetY;
            }
            if (!b.atomB.isDragging) {
                b.atomB.x -= offsetX;
                b.atomB.y -= offsetY;
            }
        }

        // 3. Integration
        for (let a of atoms) {
            if (a.isDragging) continue;
            const vx = (a.x - a.oldX) * params.friction;
            const vy = (a.y - a.oldY) * params.friction;
            a.oldX = a.x;
            a.oldY = a.y;
            a.x += vx;
            a.y += vy;
        }
    };

    // --- RENDER DOM SYNC ---
    const syncDOM = () => {
        if (!atomsLayerRef.current || !svgLayerRef.current) return;

        // 1. ATOMS
        // Remove deleted
        const activeIds = new Set(atomsRef.current.map(a => a.id));
        for (const [id, el] of atomElementsRef.current) {
            if (!activeIds.has(id)) {
                el.remove();
                atomElementsRef.current.delete(id);
            }
        }

        // Add/Update
        atomsRef.current.forEach(atom => {
            let el = atomElementsRef.current.get(atom.id);
            if (!el) {
                // Create New DOM Element
                el = document.createElement('div');
                el.className = 'absolute flex justify-center items-center rounded-full font-bold text-white cursor-pointer select-none pointer-events-auto';
                el.style.zIndex = '10';
                el.dataset.id = atom.id;

                // Visuals
                updateAtomDOMVisuals(el, atom);

                // Events
                // We handle events via delegation on container or attaching here?
                // Attaching here allows specific logic but we need to pass handlers.
                // For now, let's set metadata and handle events globally/delegated or passed in to simplify this hook.

                atomsLayerRef.current.appendChild(el);
                atomElementsRef.current.set(atom.id, el);
            }

            // High-performance Transform
            el.style.transform = `translate(${atom.x - atom.radius}px, ${atom.y - atom.radius}px)`;

            // Selection Class
            if (selectedAtomIdRef.current === atom.id) {
                el.style.filter = 'brightness(1.5)';
                el.style.boxShadow = `0 0 0 3px #facc15, 0 0 25px #facc15`;
            } else {
                el.style.filter = 'brightness(1)';
                el.style.boxShadow = `0 4px 10px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.5)`;
            }

            // Periodic Safety Check for Style (if type changed)
            // Ideally we only update this on change, not every frame. 
        });

        // 2. BONDS (SVG)
        const bondIds = new Set(bondsRef.current.map(b => b.id));
        for (const [id, el] of bondElementsRef.current) {
            if (!bondIds.has(id)) {
                el.remove();
                bondElementsRef.current.delete(id);
            }
        }

        bondsRef.current.forEach(bond => {
            let g = bondElementsRef.current.get(bond.id);
            if (!g) {
                g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.classList.add('cursor-pointer');
                g.style.pointerEvents = 'all'; // Ensure bonds are clickable
                g.dataset.id = bond.id;

                // Lines
                updateBondDOMVisuals(g, bond);

                svgLayerRef.current.appendChild(g);
                bondElementsRef.current.set(bond.id, g);
            }

            // Update Line Coords
            const ax = bond.atomA.x, ay = bond.atomA.y;
            const bx = bond.atomB.x, by = bond.atomB.y;
            const dx = bx - ax, dy = by - ay;
            const mag = Math.sqrt(dx * dx + dy * dy);

            // Normal
            let nx = -dy / mag;
            let ny = dx / mag;
            const spacing = 4;
            const lines = g.children;
            const type = bond.type;

            // Rebuild if needed (could be optimized)
            if (lines.length !== type) {
                updateBondDOMVisuals(g, bond);
            }

            for (let i = 0; i < type; i++) {
                let offset = (i - (type - 1) / 2) * spacing;
                if (lines[i]) {
                    lines[i].setAttribute('x1', ax + nx * offset);
                    lines[i].setAttribute('y1', ay + ny * offset);
                    lines[i].setAttribute('x2', bx + nx * offset);
                    lines[i].setAttribute('y2', by + ny * offset);
                }
            }
        });

        // 3. Chemistry Check Logic (Valency)
        checkChemistry();
    };

    const updateAtomDOMVisuals = (el, atom) => {
        el.style.width = (atom.radius * 2) + 'px';
        el.style.height = (atom.radius * 2) + 'px';

        // Tailwind-like gradient using inline style for dyn colors
        el.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, ${atom.color} 50%, rgba(0,0,0,0.7) 100%)`;

        // Inner Content
        const chargeHTML = atom.charge !== 0 ? `<sup class="absolute top-0 right-1 text-xs">${atom.charge > 0 ? '+' : ''}${atom.charge}</sup>` : '';
        el.innerHTML = `<span class="pointer-events-none drop-shadow-md text-lg">${atom.symbol}</span>${chargeHTML}`;
    };

    const updateBondDOMVisuals = (g, bond) => {
        g.innerHTML = '';
        for (let i = 0; i < bond.type; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute('stroke', '#94a3b8');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('stroke-linecap', 'round');
            line.style.transition = 'stroke 0.2s';
            // Hover effect handled via CSS or JS? Let's use CSS in global or class
            g.appendChild(line);
        }
    };

    const checkChemistry = () => {
        const bondCounts = new Map();
        atomsRef.current.forEach(a => bondCounts.set(a.id, 0));
        bondsRef.current.forEach(b => {
            bondCounts.set(b.atomA.id, bondCounts.get(b.atomA.id) + b.type);
            bondCounts.set(b.atomB.id, bondCounts.get(b.atomB.id) + b.type);
        });

        atomsRef.current.forEach(atom => {
            const el = atomElementsRef.current.get(atom.id);
            if (!el) return;

            const count = bondCounts.get(atom.id);
            const max = ATOM_TYPES[atom.typeIndex].valency;

            // Directly manipulate style borders for valency
            if (count > max) {
                el.style.border = '2px solid #ef4444'; // Red danger
                // el.style.animation = 'pulse-error ...' (would need keyframes in global css)
            } else {
                el.style.border = 'none';
            }
        });
    };

    // --- MAIN LOOP ---
    const tick = (time) => {
        const dt = time - lastTimeRef.current;
        if (dt >= 1000) {
            setStats({ fps: Math.round((framesRef.current * 1000) / dt), atomCount: atomsRef.current.length });
            framesRef.current = 0;
            lastTimeRef.current = time;
        }
        framesRef.current++;

        // Physics Sub-steps
        if (!pausedRef.current) {
            for (let i = 0; i < 3; i++) updatePhysics();
        }
        syncDOM();

        animationRef.current = requestAnimationFrame(tick);
    };

    useEffect(() => {
        animationRef.current = requestAnimationFrame(tick);

        if (!hasLoaded.current) {
            hasLoaded.current = true;
            // Try loading from session first
            if (!loadFromSession()) {
                setTimeout(() => loadDemo(), 100);
            }
        }

        return () => cancelAnimationFrame(animationRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // --- ACTIONS ---
    const addAtom = (x, y, typeIdx) => {
        const atom = new Atom(x, y, typeIdx);
        atomsRef.current.push(atom);
    };

    const clearAll = () => {
        atomsRef.current = [];
        bondsRef.current = [];
        setInspectorData(null);
        setSelectedAtomId(null);
        saveToSession(); // Clear session too
    };

    const togglePause = () => {
        pausedRef.current = !pausedRef.current;
        setIsPaused(pausedRef.current);
    };



    // ... Implement logic for bonding, dragging, etc. here or expose Refs

    const loadRandomMolecule = () => {
        const width = containerRef.current?.clientWidth || window.innerWidth;
        const height = containerRef.current?.clientHeight || window.innerHeight;
        const cx = width / 2;
        const cy = height / 2;

        const preset = MOLECULE_PRESETS[Math.floor(Math.random() * MOLECULE_PRESETS.length)];

        // Helper wrappers
        const _addAtom = (x, y, type) => {
            const a = new Atom(x, y, type);
            atomsRef.current.push(a);
            return a;
        };
        const _addBond = (a, b, type) => {
            bondsRef.current.push(new Bond(a, b, type));
        };

        preset.setup(cx, cy, _addAtom, _addBond);

        // Spin it roughly
        atomsRef.current.forEach(a => {
            a.oldX -= (a.y - cy) * 0.02;
            a.oldY += (a.x - cx) * 0.02;
        });
    };

    const resetToRandom = () => {
        clearAll();
        loadRandomMolecule();
        saveToSession();
    };

    return {
        containerRef,
        atomsLayerRef,
        svgLayerRef,
        physicsRef,
        stats,
        addAtom,
        clearAll,
        loadDemo: loadRandomMolecule, // Alias for init
        resetToDemo: resetToRandom, // Keep name for UI compat
        resetToRandom,
        saveToSession,
        togglePause,
        isPaused,
        atomsRef,
        bondsRef,
        selectedAtomId,
        setSelectedAtomId,
        inspectorData,
        setInspectorData,
        pausedRef
    };
}
