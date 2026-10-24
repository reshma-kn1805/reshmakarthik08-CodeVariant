# Fix It First — Architecture & "Where to Change What" Map

This document serves as the developer and maintainer reference for **Fix It First** (`reshmakarthik08-CodeVariant`).

---

## 1. Architectural Layers Overview

Fix It First is structured into clean, decoupled layers to maintain 100% modularity between mathematical calculation, rule data, user-facing text, and UI components:

```
src/
├── data/       # Rules, category defaults, fault benchmarks, seed examples (JSON)
├── engine/     # Pure JavaScript calculation & scoring logic (zero UI dependencies)
├── copy/       # User-facing copy, reasons templates, and UI strings (pure JS)
├── config/     # App-wide constants, currency defaults, and heuristics
├── state/      # React context and sessionStorage persistence
├── components/ # Reusable design system primitives and domain components
└── pages/      # Route-level screens (Home, Assess, Verdict, History, etc.)
```

---

## 2. "Where to Change What" Reference Map

### If you want to change...

| Change Goal | Primary File to Edit | Key Exports / Structures |
| :--- | :--- | :--- |
| **Scoring factor weights & priority shift** | [`src/engine/scoring.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/engine/scoring.js) | `calculateWeights()`, `DEFAULT_WEIGHTS` (Safety locked at 10%) |
| **5-way decision math & ranking** | [`src/engine/scoring.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/engine/scoring.js) | `calculateDecision()` |
| **Tipping Point break-even threshold** | [`src/engine/scoring.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/engine/scoring.js) | `tippingPoint()` |
| **Public engine entrypoint** | [`src/engine/index.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/engine/index.js) | `export * from './scoring.js'` |
| **Category lifespans, faults, or repair costs** | [`src/data/rules.json`](file:///c:/dev/reshmakarthik08-CodeVariant/src/data/rules.json) | `categories` array (8 categories) |
| **Safety hazard flags (critical triggers)** | [`src/data/rules.json`](file:///c:/dev/reshmakarthik08-CodeVariant/src/data/rules.json) | `categories[].safetyFlags`, `safetyRules.criticalFlags` |
| **Checklist tasks per option** | [`src/data/rules.json`](file:///c:/dev/reshmakarthik08-CodeVariant/src/data/rules.json) | `categories[].checklists` |
| **1-Click test example scenarios** | [`src/data/examples.json`](file:///c:/dev/reshmakarthik08-CodeVariant/src/data/examples.json) | Array of 3 default seed scenarios |
| **User copy, explanations, reasons templates** | [`src/copy/en.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/copy/en.js) | `COPY.reasons`, `COPY.steps`, `COPY.verdict` |
| **Currency formatting or default constants** | [`src/config/app.config.js`](file:///c:/dev/reshmakarthik08-CodeVariant/src/config/app.config.js) | `APP_CONFIG` |
| **Assessment state & history storage** | [`src/state/AssessmentContext.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/state/AssessmentContext.jsx) | `AssessmentProvider`, `useAssessment()` |
| **Home landing page & example scenario row** | [`src/pages/HomePage.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/pages/HomePage.jsx) | `HomePage` component |
| **4-step guided wizard (/assess)** | [`src/pages/AssessPage.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/pages/AssessPage.jsx) | `AssessPage` component (Steps 1–4) |
| **Verdict screen & safety gate (/verdict/:id)** | [`src/pages/VerdictPage.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/pages/VerdictPage.jsx) | `VerdictPage` component |
| **Session history & side-by-side compare (/history)** | [`src/pages/HistoryPage.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/pages/HistoryPage.jsx) | `HistoryPage` component |
| **Option card stacked factor bar & reasons** | [`src/components/verdict/OptionCard.jsx`](file:///c:/dev/reshmakarthik08-CodeVariant/src/components/verdict/OptionCard.jsx) | `OptionCard` component |
| **Design tokens (Amber, Rust, Green, Typography)** | [`tailwind.config.js`](file:///c:/dev/reshmakarthik08-CodeVariant/tailwind.config.js), [`src/index.css`](file:///c:/dev/reshmakarthik08-CodeVariant/src/index.css) | Color palette, range sliders, focus styles |

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
