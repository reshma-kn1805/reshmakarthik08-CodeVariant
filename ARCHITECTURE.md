# Fix It First — Architecture & "Where to Change What" Map

This document serves as the developer and maintainer reference for **Fix It First** (`reshmakarthik08-CodeVariant`).

---

## 1. Architectural Layers Overview

Fix It First is structured into clean, decoupled layers to maintain 100% modularity between mathematical calculation, rule data, user-facing text, and UI components:

```
src/
├── canvas/     # The Canvas Protocol interaction layer (DataCard, ActionZone, applyDrop pure reducer)
├── config/     # Zone definitions (zones.js), app-wide constants, currency defaults
├── data/       # Rules, category defaults, fault benchmarks, seed examples (JSON)
├── engine/     # Pure JavaScript calculation & scoring logic (zero UI dependencies)
├── copy/       # User-facing copy, reasons templates, and UI strings (pure JS)
├── state/      # React context and sessionStorage persistence
├── components/ # Workshop navigation (Sidebar, BottomTabBar, Navbar, Breadcrumbs, DonutGauge)
└── pages/      # Route-level canvas surfaces (The Workbench, Case File Canvas, Decision Table, Archive)
```

---

## 2. "Where to Change What" Reference Map

### If you want to change...

| Change Goal | Primary File to Edit | Key Exports / Structures |
| :--- | :--- | :--- |
| **Action Zone declarations & accepted types** | [`src/config/zones.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/config/zones.js) | `ZONES`, `isZoneAccepting()`, verb labels |
| **Drop handling logic & state transitions** | [`src/canvas/actions.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/canvas/actions.js) | `applyDrop(state, card, zoneId)`, `PRIORITY_WEIGHTS` |
| **Draggable card component & lock states** | [`src/canvas/DataCard.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/canvas/DataCard.jsx) | `DataCard`, `DragOverlayCard` |
| **Droppable zone component & glow styling** | [`src/canvas/ActionZone.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/canvas/ActionZone.jsx) | `ActionZone` |
| **DndContext, sensors & keyboard navigation** | [`src/canvas/CanvasProvider.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/canvas/CanvasProvider.jsx) | `CanvasProvider`, keyboard coordinate getter |
| **Scoring factor weights & priority shift** | [`src/engine/scoring.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/engine/scoring.js) | `calculateWeights()`, `DEFAULT_WEIGHTS` (Safety locked at 10%) |
| **5-way decision math & ranking** | [`src/engine/scoring.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/engine/scoring.js) | `calculateDecision()` |
| **Tipping Point break-even threshold** | [`src/engine/scoring.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/engine/scoring.js) | `tippingPoint()` |
| **Category lifespans, faults, or repair costs** | [`src/data/rules.json`](file:///c:/dev/reshmakarthik08-CodeVariant/src/data/rules.json) | `categories` array (8 categories) |
| **Home workbench parts bin & start zone** | [`src/pages/HomePage.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/pages/HomePage.jsx) | `HomePage` component |
| **Unified Case File diagnosis canvas** | [`src/pages/AssessPage.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/pages/AssessPage.jsx) | `AssessPage` component |
| **Decision Table canvas & Commit/Compare zones** | [`src/pages/VerdictPage.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/pages/VerdictPage.jsx) | `VerdictPage` component |
| **Archive canvas & Reopen/Discard zones** | [`src/pages/HistoryPage.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/pages/HistoryPage.jsx) | `HistoryPage` component |
| **Sidebar & BottomTabBar navigation** | [`src/components/layout/`](file:///c:/dev/reshmakarthik08-CodeVariant/src/components/layout/) | `Sidebar.jsx`, `BottomTabBar.jsx` |
| **Design tokens & theme styling** | [`tailwind.config.js`](file:///c:/dev/reshmakarthik08-CodeVariant/tailwind.config.js), [`src/index.css`](file:///c:/dev/reshmakarthik08-CodeVariant/src/index.css) | Color palette, range sliders, focus styles |

---

## 3. Strict Semantics & Rules

1. **Color Semantics**:
   - **Amber (`#E39A2D` / `#E09F3E`)**: Used strictly for **primary interactive action CTAs**, active sliders, and primary buttons.
   - **Rust (`#C8553D`)**: Used strictly for **safety warnings**, hazardous indicators, and the acute safety lockout gate.
   - **Forest Green (`#1D4D3F` / `#2E7D5B`)**: Used for sustainability metrics, carbon avoided, and brand framing.
2. **Safety Weight Lock**:
   - The safety factor weight is permanently locked at `10%`. Even when user sliders vary from 0 to 100, the remaining 90% is dynamically normalized across the other 5 factors so the total always equals exactly `100%`.
3. **Safety Gate Red Line**:
   - Acute hazards (swelling battery, burning smell, exposed mains) trip the safety gate (`isGated === true`). This locks out DIY options (`repair`, `reuse`, `repurpose`) and presents the dedicated "Don't DIY this" screen recommending certified professionals or safe e-waste disposal.
