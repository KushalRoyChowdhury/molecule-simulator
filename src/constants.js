export const ATOM_TYPES = [
    // Lifecycle 1
    { symbol: 'H', name: 'Hydrogen', mass: 1, radius: 20, color: '#e2e8f0', charge: 1, valency: 1 },

    // Lifecycle 2 (Main Organics)
    { symbol: 'C', name: 'Carbon', mass: 12, radius: 30, color: '#64748b', charge: 0, valency: 4 },
    { symbol: 'N', name: 'Nitrogen', mass: 14, radius: 28, color: '#3b82f6', charge: -1, valency: 3 },
    { symbol: 'O', name: 'Oxygen', mass: 16, radius: 28, color: '#ef4444', charge: -2, valency: 2 },
    { symbol: 'F', name: 'Fluorine', mass: 19, radius: 25, color: '#84cc16', charge: -1, valency: 1 },

    // Period 3
    { symbol: 'Na', name: 'Sodium', mass: 23, radius: 34, color: '#a855f7', charge: 1, valency: 1 },
    { symbol: 'Mg', name: 'Magnesium', mass: 24, radius: 34, color: '#22c55e', charge: 2, valency: 2 },
    { symbol: 'Al', name: 'Aluminium', mass: 27, radius: 32, color: '#94a3b8', charge: 3, valency: 3 },
    { symbol: 'Si', name: 'Silicon', mass: 28, radius: 32, color: '#d6d3d1', charge: 0, valency: 4 },
    { symbol: 'P', name: 'Phosphorus', mass: 31, radius: 31, color: '#f97316', charge: -3, valency: 5 },
    { symbol: 'S', name: 'Sulfur', mass: 32, radius: 31, color: '#facc15', charge: -2, valency: 2 },
    { symbol: 'Cl', name: 'Chlorine', mass: 35, radius: 30, color: '#10b981', charge: -1, valency: 1 },

    // Metals & Others
    { symbol: 'K', name: 'Potassium', mass: 39, radius: 36, color: '#8b5cf6', charge: 1, valency: 1 },
    { symbol: 'Ca', name: 'Calcium', mass: 40, radius: 36, color: '#84cc16', charge: 2, valency: 2 },
    { symbol: 'Fe', name: 'Iron', mass: 56, radius: 33, color: '#ea580c', charge: 2, valency: 4 },
    { symbol: 'Cu', name: 'Copper', mass: 64, radius: 32, color: '#c2410c', charge: 2, valency: 2 },
    { symbol: 'Zn', name: 'Zinc', mass: 65, radius: 32, color: '#7e7e91', charge: 2, valency: 2 },
    { symbol: 'Br', name: 'Bromine', mass: 80, radius: 31, color: '#991b1b', charge: -1, valency: 1 },
    { symbol: 'Ag', name: 'Silver', mass: 108, radius: 34, color: '#e2e8f0', charge: 1, valency: 1 },
    { symbol: 'I', name: 'Iodine', mass: 127, radius: 33, color: '#6b21a8', charge: -1, valency: 1 },
    { symbol: 'Au', name: 'Gold', mass: 197, radius: 34, color: '#fbbf24', charge: 1, valency: 1 },
];

export const INITIAL_PHYSICS = {
    gravity: 0,
    friction: 0.96,
    repulsion: 1500, // Coulomb constant proxy
    bondStiffness: 0.1,
    temperature: 0,
    timeStep: 1, // Delta time multiplier
    useElectro: true
};

export const COMMON_MOLECULES = {
    // --- Simple Gases ---
    "H2": "Hydrogen Gas",
    "O2": "Oxygen Gas",
    "N2": "Nitrogen Gas",
    "F2": "Fluorine Gas",
    "Cl2": "Chlorine Gas",
    "Br2": "Bromine",
    "I2": "Iodine",
    "O3": "Ozone",

    // --- Common Inorganics ---
    "H2O": "Water",
    "H2O2": "Hydrogen Peroxide",
    "CO": "Carbon Monoxide",
    "CO2": "Carbon Dioxide",
    "NH3": "Ammonia",
    "NO": "Nitric Oxide",
    "NO2": "Nitrogen Dioxide",
    "N2O": "Nitrous Oxide (Laughing Gas)",
    "SO2": "Sulfur Dioxide",
    "SO3": "Sulfur Trioxide",
    "H2S": "Hydrogen Sulfide",

    // --- Acids ---
    "HCl": "Hydrochloric Acid",
    "HF": "Hydrofluoric Acid",
    "HBr": "Hydrobromic Acid",
    "HI": "Hydroiodic Acid",
    "H2SO4": "Sulfuric Acid",
    "HNO3": "Nitric Acid",
    "H3PO4": "Phosphoric Acid",
    "H2CO3": "Carbonic Acid",
    "CH3COOH": "Acetic Acid (Vinegar)",
    "HCOOH": "Formic Acid",

    // --- Salts ---
    "NaCl": "Sodium Chloride (Table Salt)",
    "NaOH": "Sodium Hydroxide (Lye)",
    "Na2CO3": "Sodium Carbonate (Soda Ash)",
    "NaHCO3": "Baking Soda",
    "KCl": "Potassium Chloride",
    "KOH": "Potassium Hydroxide",
    "CaCl2": "Calcium Chloride",
    "CaCO3": "Calcium Carbonate (Chalk)",
    "CaO": "Quicklime",
    "MgO": "Magnesium Oxide",
    "MgCl2": "Magnesium Chloride",
    "Fe2O3": "Iron(III) Oxide (Rust)",
    "CuSO4": "Copper Sulfate",

    // --- Hydrocarbons (Alkanes) ---
    "CH4": "Methane",
    "C2H6": "Ethane",
    "C3H8": "Propane",
    "C4H10": "Butane",
    "C5H12": "Pentane",
    "C6H14": "Hexane",
    "C8H18": "Octane",

    // --- Hydrocarbons (Alkenes/Alkynes/Aromatics) ---
    "C2H4": "Ethylene",
    "C3H6": "Propylene",
    "C2H2": "Acetylene",
    "C6H6": "Benzene",
    "C7H8": "Toluene",
    "C10H8": "Naphthalene (Mothballs)",

    // --- Alcohols & Ethers ---
    "CH3OH": "Methanol",
    "C2H5OH": "Ethanol",
    "C3H7OH": "Propanol",
    "C3H8O": "Isopropanol", // Note: Isomer issue (same formula), simple lookup might be ambiguous
    "CH3OCH3": "Dimethyl Ether",

    // --- Halides ---
    "CH3Cl": "Methyl Chloride",
    "CH2Cl2": "Dichloromethane",
    "CHCl3": "Chloroform",
    "CCl4": "Carbon Tetrachloride",

    // --- Others ---
    "HCN": "Hydrogen Cyanide",
    "CH2O": "Formaldehyde",
    "C3H6O": "Acetone",
    "C6H12O6": "Glucose/Fructose",
    "C12H22O11": "Sucrose (Sugar)",
    "CO(NH2)2": "Urea", // Complex formula handling needed? Assuming standard Hill system: CH4N2O
    "CH4N2O": "Urea",
    "NaN3": "Sodium Azide"
};

export const MOLECULE_PRESETS = [
    {
        name: "Benzene",
        setup: (cx, cy, addAtom, addBond) => {
            const r = 80;
            const hR = 140;
            const carbons = [];

            // 6 Carbons
            for (let i = 0; i < 6; i++) {
                const ang = (i * 60) * (Math.PI / 180);
                const c = addAtom(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, 1); // C
                carbons.push(c);
            }
            // 6 Hydrogens
            for (let i = 0; i < 6; i++) {
                const ang = (i * 60) * (Math.PI / 180);
                const h = addAtom(cx + Math.cos(ang) * hR, cy + Math.sin(ang) * hR, 0); // H
                addBond(carbons[i], h, 1);
            }
            // Benzene Bonds
            for (let i = 0; i < 6; i++) {
                const next = (i + 1) % 6;
                const type = (i % 2 === 0) ? 2 : 1;
                addBond(carbons[i], carbons[next], type);
            }
        }
    },
    {
        name: "Water",
        setup: (cx, cy, addAtom, addBond) => {
            const o = addAtom(cx, cy - 10, 3); // O (Type 3 in array: H, C, N, O... wait, let's check index)
            // Indices: H=0, C=1, N=2, O=3
            const h1 = addAtom(cx - 30, cy + 20, 0); // H
            const h2 = addAtom(cx + 30, cy + 20, 0); // H
            addBond(o, h1, 1);
            addBond(o, h2, 1);
        }
    },
    {
        name: "Carbon Dioxide",
        setup: (cx, cy, addAtom, addBond) => {
            const c = addAtom(cx, cy, 1); // C
            const o1 = addAtom(cx - 50, cy, 3); // O
            const o2 = addAtom(cx + 50, cy, 3); // O
            addBond(c, o1, 2);
            addBond(c, o2, 2);
        }
    },
    {
        name: "Methane",
        setup: (cx, cy, addAtom, addBond) => {
            const c = addAtom(cx, cy, 1); // C
            addBond(c, addAtom(cx, cy - 40, 0), 1); // H
            addBond(c, addAtom(cx, cy + 40, 0), 1); // H
            addBond(c, addAtom(cx - 40, cy, 0), 1); // H
            addBond(c, addAtom(cx + 40, cy, 0), 1); // H
        }
    },
    {
        name: "Ammonia",
        setup: (cx, cy, addAtom, addBond) => {
            const n = addAtom(cx, cy - 10, 2); // N (Type 2)
            addBond(n, addAtom(cx - 30, cy + 30, 0), 1);
            addBond(n, addAtom(cx + 30, cy + 30, 0), 1);
            addBond(n, addAtom(cx, cy + 40, 0), 1);
        }
    },
    {
        name: "Ethanol",
        setup: (cx, cy, addAtom, addBond) => {
            const c1 = addAtom(cx - 30, cy, 1);
            const c2 = addAtom(cx + 10, cy, 1);
            const o = addAtom(cx + 50, cy - 10, 3);
            const h_o = addAtom(cx + 70, cy + 10, 0);

            addBond(c1, c2, 1);
            addBond(c2, o, 1);
            addBond(o, h_o, 1);

            // C1 Hydrogens
            addBond(c1, addAtom(cx - 30, cy - 40, 0), 1);
            addBond(c1, addAtom(cx - 30, cy + 40, 0), 1);
            addBond(c1, addAtom(cx - 70, cy, 0), 1);

            // C2 Hydrogens
            addBond(c2, addAtom(cx + 10, cy - 40, 0), 1);
            addBond(c2, addAtom(cx + 10, cy + 40, 0), 1);
        }
    },
    {
        name: "Acetic Acid",
        setup: (cx, cy, addAtom, addBond) => {
            const c1 = addAtom(cx - 20, cy, 1); // Methyl C
            const c2 = addAtom(cx + 20, cy, 1); // Carboxyl C
            const o1 = addAtom(cx + 20, cy - 40, 3); // Double bonded O
            const o2 = addAtom(cx + 50, cy + 20, 3); // OH O
            const h_o = addAtom(cx + 70, cy, 0);

            addBond(c1, c2, 1);
            addBond(c2, o1, 2);
            addBond(c2, o2, 1);
            addBond(o2, h_o, 1);

            addBond(c1, addAtom(cx - 20, cy - 40, 0), 1);
            addBond(c1, addAtom(cx - 20, cy + 40, 0), 1);
            addBond(c1, addAtom(cx - 60, cy, 0), 1);
        }
    }
];
