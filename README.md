# ⚛️ Molecular Designer

A high-performance, interactive molecular dynamics simulation built with **React**, **Vite**, and **Tailwind CSS**. 

This project demonstrates a custom physics engine running a Verlet integration loop at native refresh rate (syncing with your display's Hz), detached from the React render cycle for maximum performance, while still providing a reactive and beautiful UI.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

### 🔬 Core Simulation
*   **Custom Physics Engine**: Implements Verlet integration for stable molecular dynamics, handling gravity, friction, electrostatic repulsion, and bond constraints.
*   **Chemical Intelligence**: Strict valency checks prevent invalid chemical bonds (e.g., stopping you from bonding 5 Hydrogens to Carbon).
*   **Interactive Playground**:
    *   **Spawn Atoms**: Click anywhere to add atoms (Carbon, Hydrogen, Oxygen, Nitrogen, etc.).
    *   **Create Bonds**: Shift+Click between atoms to form Single, Double, or Triple bonds.
    *   **Manipulate**: Drag atoms to feel the physics forces in real-time.
    *   **Delete**: Select and press `Delete`/`Backspace` to remove atoms.

### 🎨 UI & Experience
*   **Real-time Inspector**: Select any molecule to instantly see its chemical formula (Hill System), mass (u), and full element name (e.g., "Carbon (4)").
*   **Snapshot Mode**: Built-in camera tool to capture high-quality PNGs of your molecular creations, automatically hiding UI overlays.
*   **Persistence**: Auto-saves your workspace to Session Storage - never lose your molecule on refresh.
*   **Premium Aesthetics**: Glassmorphism UI using Tailwind CSS and smooth animations with Framer Motion.
*   **Simulation Controls**: Pause/Resume, Reset to Demo (Benzene), and adjustable physics parameters (Temperature, Bond Stiffness, Gravity).

## 🛠️ Tech Stack

*   **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **State/Physics**: Custom `usePhysicsEngine` hook using `requestAnimationFrame` and `useRef` for high-frequency updates without React re-renders.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16+)
*   pnpm (recommended) or npm/yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/KushalRoyChowdhury/molecule-simulator
    cd molecular-designer
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  Run the development server:
    ```bash
    pnpm dev
    # or
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173`.

## 🎮 Controls

| Action | Control |
| :--- | :--- |
| **Spawn Atom** | Click on empty background |
| **Select Atom** | Click on an atom |
| **Move Atom** | Drag with mouse |
| **Create Bond** | **Shift + Click** first atom, then **Shift + Click** second atom |
| **Upgrade Bond** | **Shift + Click** two already bonded atoms (Single -> Double -> Triple) |
| **Delete** | `Delete` or `Backspace` key on selected atom |
| **Panels** | Use the floating Toolbar to change elements or physics settings |

## 📂 Project Structure

```
src/
├── components/
│   ├── Inspector.jsx   # HUD showing formula and mass
│   ├── Toolbar.jsx     # Main control panel (Collapsible)
│   └── Universe.jsx    # Main simulation container & event handler
├── hooks/
│   └── usePhysicsEngine.js  # The core physics loop & logic
├── constants.js        # Atom definitions (Mass, Radius, Color, Valency)
├── index.css          # Tailwind imports & global styles
└── App.jsx            # Root layout
```

## 🧠 Technical Highlights

*   **Hybrid Rendering**: Uses standard DOM nodes for atoms and SVG for bonds, updated directly via the physics loop refs to bypass React's virtual DOM overhead for the simulation layer.
*   **Graph Traversal**: Implements BFS (Breadth-First Search) to dynamically calculate molecular formulas based on connected components.
*   **Smart Persistence**: Automatically serializes the complex graph of atoms and bonds to JSON for session restoration.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✍️ Authors & Acknowledgements

*   **Kushal Roy Chowdhury** - *Creative Direction, UX Design, & Concept*
*   **Antigravity** - *Core Physics Engine, Logic & Implementation*

Built with ❤️ and ⚛️.
