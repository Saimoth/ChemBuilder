# ChemBuilder

ChemBuilder is a touch-friendly molecule construction game for C/H/O chemistry. This repository is the modular version of the original single-file prototype.

## Run

Open `ChemBuilder.html` in a modern browser, or serve the folder with any static web server. No build step or external dependency is required.

## File map

| File | Responsibility |
|---|---|
| `ChemBuilder.html` | Page markup and script loading order |
| `style.css` | All visual styling |
| `js/main.js` | DOM references, shared state, canvas sizing, startup |
| `js/utils.js` | Small shared constructors and formula formatting |
| `js/ui.js` | Toasts, help panel, clear action |
| `js/input.js` | Pointer/touch dragging, atom creation and deletion |
| `js/bonds.js` | Valency checks, bond lookup and bond upgrading |
| `js/chemistry.js` | Components, formulae, graph isomorphism and recognition |
| `js/library.js` | Built-in molecule template library |
| `js/challenge.js` | Challenge selection, display and automatic checking |
| `js/physics.js` | Gentle molecule layout simulation |
| `js/layout.js` | Skeletal graph filtering and 2D layout |
| `js/renderer.js` | Canvas drawing and animation loop |

The scripts use classic browser globals and therefore must remain in the order shown in `ChemBuilder.html`.
