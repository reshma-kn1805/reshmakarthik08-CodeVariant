# THE CANVAS PROTOCOL — EXECUTION PLAN

## Overview
Adapt **Fix It First** from standard action buttons to the **Canvas Protocol**: primary actions are performed **strictly by dragging and dropping data cards into designated Action Zones**. Standard action buttons (Submit, Assess, Save, Delete, Book, Next, Back, Compare, etc.) are prohibited.

---

## 1. Zone Map Architecture

| Page | Action Zone ID | Label / Verb | Accepted Card Types | Result / Effect |
|---|---|---|---|---|
| **Workbench** (`/`) | `zone-start-assessment` | "Drop card to start assessment" | `category`, `example` | If `category`: opens `/assess` prefilled. If `example`: loads scenario and opens `/verdict/:id`. |
| **Case File** (`/assess`) | `zone-category-slot` | "Drop category to set appliance type" | `category` | Sets category and resets compatible faults & safety signs. |
| | `zone-faults` | "Drop fault cards (1st is primary)" | `fault` | Adds to diagnosis fault list; computes repair estimate. |
| | `zone-safety` | "Drop safety warning signs" | `safety` | Toggles safety flags. Critical flag turns board to rust hazard. |
| | `zone-priority-1` | "#1 Priority Slot" | `priority` | Sets highest-weighted priority (Money, Waste, Effort). |
| | `zone-priority-2` | "#2 Priority Slot" | `priority` | Sets secondary priority weight. |
| | `zone-priority-3` | "#3 Priority Slot" | `priority` | Sets tertiary priority weight. |
| | `zone-run-assessment` | "Drop Case File to Run Assessment" | `case-file` | Validates completeness. If missing, bounces & pulses missing slots. On success: calculates decision, adds to history, navigates to `/verdict/:id`. |
| **Decision Table** (`/verdict/:id`) | `zone-commit` | "Drop option to commit & view action steps" | `option` | Gated options (DIY repair/reuse/repurpose during critical hazards) bounce back with safety warning. Allowed options reveal step cards. |
| | `zone-plan-done` | "Drop step here to mark Done" | `step` | Toggles step completed; persists progress to `sessionStorage`. Dragging out/back unticks. |
| | `zone-compare` | "Drop up to 3 options to compare" | `option` | Opens side-by-side comparison modal/drawer. |
| | `zone-keep` | "Drop Case File to Pin in History" | `case-file`, `discarded-case` | Pins case file in history / restores from discarded tray. |
| | `zone-discard` | "Drop Case File to Discard" | `case-file` | Moves case to "Recently Discarded" tray (undo by dragging back to Keep). |
| | `zone-export` | "Drop Case File to Export Summary" | `case-file` | Copies summary to clipboard and opens print dialog. |
| | `zone-verdict-priority-1..3` | "Re-rank Priority" | `priority` | Live re-ranks options with real-time recalculation. |
| **Archive** (`/history`) | `zone-history-reopen` | "Drop here to reopen & edit" | `history-card` | Loads assessment into `/assess` case file. |
| | `zone-history-compare` | "Drop 2 cards here to compare" | `history-card` | Opens side-by-side comparison between the two records. |
| | `zone-history-discard` | "Drop here to remove from history" | `history-card` | Removes record from history state. |

---

## 2. Files to Change & Create

- **Foundation (`src/canvas/`, `src/config/`)**:
  - `src/config/zones.js` (zone definitions, accept rules, hints, verb labels)
  - `src/canvas/actions.js` (pure `applyDrop(state, card, zoneId)` reducer function)
  - `src/canvas/DataCard.jsx` (draggable card with grip handle, tilt on lift, drop animation, touch-action)
  - `src/canvas/ActionZone.jsx` (droppable zone with dashed border, amber valid glow, rust invalid glow)
  - `src/canvas/CanvasProvider.jsx` (DndContext, pointer + 150ms touch + keyboard sensors, aria announcements)
  - `src/canvas/__tests__/actions.test.js` (unit tests for every zone and rejected drop)
  - `src/canvas/__tests__/no-buttons.test.js` (strict lint test banning forbidden `<button>` elements)
- **Pages**:
  - `src/pages/HomePage.jsx` (workbench parts bin, ghost hint card, no search button or hero CTAs)
  - `src/pages/AssessPage.jsx` (single-screen Case File canvas, no wizard/Next/Back buttons)
  - `src/pages/VerdictPage.jsx` (decision table with Commit, Compare, Keep, Discard, Export, Step-Done zones)
  - `src/pages/HistoryPage.jsx` (archive canvas with Reopen, Compare, Discard zones; no action buttons)
- **Layout & Navigation**:
  - `src/components/layout/Navbar.jsx` (Canvas Mode badge, What Changed modal trigger)
  - `src/App.jsx` (wire Sidebar, BottomTabBar, CanvasProvider)
  - `src/copy/en.js` (add Canvas Protocol text, 3-line What Changed summary)

---

## 3. Risks & Mitigations

1. **Touch Scrolling Interference on Mobile**:
   - *Mitigation*: Configure `@dnd-kit` touch sensor with 150ms activation delay and apply `touch-action: none` strictly on grip handles. Ensure sticky bottom action tray on small viewports.
2. **Keyboard Accessibility**:
   - *Mitigation*: Support Space/Enter to lift, Arrow keys to jump strictly between *valid* Action Zones, Space/Enter to drop, and Esc to cancel. Screen reader announcements via `@dnd-kit/core` live regions.
3. **Safety Gating Integrity**:
   - *Mitigation*: When safety flags (e.g. swollen battery) trigger gating, DIY repair/reuse/repurpose options are visually locked with rust badges and `applyDrop` explicitly rejects drops into `zone-commit` with an alert message.
4. **Button Ban Compliance**:
   - *Mitigation*: Implement automated AST/regex test `no-buttons.test.js` checking that all primary actions operate via drag-and-drop.

---

## 4. What to Cut If Short

- Non-essential micro-animations (e.g. multi-layer particle confetti).
- Extended catalog search filters (keep simple drag-filtering).
- *Strictly retained*: All zones, keyboard accessibility, mobile touch drag, safety gating, test suite, and 100% button-free primary interactions.
