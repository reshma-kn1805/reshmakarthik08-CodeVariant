# SURPRISE CHALLENGE — THE CANVAS PROTOCOL

## 1. The Challenge
> **Challenge Statement**:
> - Standard action buttons for primary features (Submit, Book, Save, Delete and similar) are PROHIBITED.
> - Users perform primary actions ONLY by dragging and dropping data cards into designated Action Zones.
> - Adapt the existing app to this model while preserving its core purpose and functionality.
> - The experience must be intuitive, interactive and functional, not just visually impressive.
> - Engine, rules, copy files and tests stay intact. Only the interaction layer changes.

---

## 2. Our Approach & Philosophy
Instead of treating drag-and-drop as a decorative novelty or an MVP gimmick, we built **The Canvas Protocol** as a tactile, physics-inspired workshop surface:
1. **Physical Case Files & Workbenches**:
   - The Home page became **The Workbench**, featuring an 8-category Parts Bin, 3 preloaded real-world scenarios, and an amber-glowing **Start Assessment** zone.
   - The 4-step wizard on `/assess` was replaced by a single, comprehensive **Case File Canvas** where users drop equipment category cards, diagnose faults, attach hazard signs, and order priorities on a live ladder before dropping the Case File into the **Run Assessment** zone.
   - The Verdict page became **The Decision Table**, where the 5 parallel scored options can be physically committed, compared, pinned in history, or discarded into a recovery tray.
   - The History page became **The Archive**, with zones to reopen past cases, inspect them side-by-side, or discard them.
2. **Pure Action Reducer Architecture (`src/canvas/actions.js`)**:
   - All drop events pass through a deterministic, pure reducer function: `applyDrop(state, card, zoneId) -> { success, reason, state, effects }`.
   - Comprehensive unit tests verify every zone and every rejected drop condition.
3. **Safety Red-Line Integrity**:
   - Safety gating is strictly enforced: critical hazards (e.g. swollen lithium battery) apply a rust lock to DIY repair, reuse, and repurpose option cards. Attempting to drop them into the Commit zone triggers an animated bounce with an explicit safety warning. Only professional repair and safe e-waste disposal can be committed.
4. **Zero-Button Primary Action Rule**:
   - Standard action buttons for primary features were systematically eliminated and converted into designated action zones.
   - Prohibited buttons were removed across all pages, verified by an automated AST/regex vitest suite (`src/canvas/__tests__/no-buttons.test.js`).

---

## 3. The Zone Map Architecture

| Page | Action Zone ID | Verb Label | Accepts | Result / Pure Effect |
|---|---|---|---|---|
| **Workbench** (`/`) | `zone-start-assessment` | "Drop to run assessment" | `category`, `example` | Dropping a category card opens `/assess` prefilled; dropping an example card loads the scenario and navigates to its scored verdict. |
| **Case File** (`/assess`) | `zone-category-slot` | "Drop category card here" | `category` | Sets appliance category and loads compatible faults & safety signs. |
| | `zone-faults` | "Drop diagnosed fault cards" | `fault` | Adds to fault list; first card dropped becomes primary diagnosis. |
| | `zone-safety` | "Drop safety warning signs" | `safety` | Toggles safety signs. "None of these" clears flags; critical flags trigger rust hazard state. |
| | `zone-priority-1` | "#1 Priority Slot" | `priority` | Sets top priority with 70% decision weight. |
| | `zone-priority-2` | "#2 Priority Slot" | `priority` | Sets secondary priority with 50% decision weight. |
| | `zone-priority-3` | "#3 Priority Slot" | `priority` | Sets base priority with 30% decision weight. |
| | `zone-run-assessment` | "Drop Case File to run assessment" | `case-file` | Bounces back with pulsing slots if required fields are missing; executes math engine and navigates to `/verdict/:id` on success. |
| **Decision Table** (`/verdict/:id`) | `zone-commit` | "Drop option to commit & view action plan" | `option` | Bounces DIY repair if safety gate is active. Unlocks execution checklist cards when committed. |
| | `zone-plan-done` | "Drop step here to mark Done" | `step` | Toggles step completed; persists progress to `sessionStorage`. |
| | `zone-compare` | "Drop up to 3 options to compare" | `option` | Opens side-by-side trade-off inspection modal. |
| | `zone-keep` | "Drop Case File to pin in history" | `case-file`, `discarded-case` | Pins case file in session history or restores discarded case. |
| | `zone-discard` | "Drop Case File to discard" | `case-file` | Removes case to "Recently Discarded" tray (undo by dragging back to Keep). |
| | `zone-export` | "Drop Case File to export summary" | `case-file` | Copies summary text to clipboard and opens print dialog. |
| | `zone-priority-1..3` | "Priorities Ladder Slots" | `priority` | Live re-ranks options with animated overtake notifications. |
| **Archive** (`/history`) | `zone-history-reopen` | "Drop card to Reopen & Edit" | `history-card` | Loads diagnosis back into `/assess` Case File. |
| | `zone-history-compare` | "Drop 2 cards to Compare" | `history-card` | Opens side-by-side comparison between the two past records. |
| | `zone-history-discard` | "Drop card to Discard" | `history-card` | Permanently deletes item from session history. |

---

## 4. Conversion List: Every Standard Action Button Replaced

| Original Component / Button | Location | Action | Replaced With (Canvas Protocol) |
|---|---|---|---|
| `<Button>Assess an item</Button>` | `HomePage.jsx` (Hero) | Open diagnosis | Dragging any of the 8 Category cards into `zone-start-assessment` |
| `<Button>Try a 30-Second Judge Demo</Button>` | `HomePage.jsx` (Hero) | Run instant demo | Dragging any of the 3 preloaded Example cards into `zone-start-assessment` |
| `<button>Example Card</button>` | `HomePage.jsx` (Examples) | Jump to verdict | Draggable `DataCard type="example"` dropped onto `zone-start-assessment` |
| Search `<button>Assess</button>` | `HomePage.jsx` (Search) | Submit search | Live text input highlighting matching cards in parts bin without submit button |
| `<button>Next Step</button>` | `AssessPage.jsx` (Wizard) | Advance step | Eliminated wizard: unified single-screen Case File canvas |
| `<button>Back</button>` | `AssessPage.jsx` (Wizard) | Previous step | Eliminated wizard: all slots visible and editable simultaneously |
| `<button>Finish & Calculate Verdict</button>` | `AssessPage.jsx` (Wizard) | Run engine | Dragging `active-case-file` card into `zone-run-assessment` |
| `<button>Commit Option</button>` | `VerdictPage.jsx` (Cards) | Choose winner | Dragging Option card into `zone-commit` |
| Checklist Checkboxes / Buttons | `VerdictPage.jsx` (Playbook) | Mark task done | Dragging step cards into `zone-plan-done` (untick by dragging back) |
| `<Button>View Side-by-Side</Button>` | `VerdictPage.jsx` / `HistoryPage.jsx` | Compare items | Dragging Option or History cards into `zone-compare` / `zone-history-compare` |
| `<button>Save to History</button>` | `VerdictPage.jsx` | Pin evaluation | Dragging Case card into `zone-keep` |
| `<button>Delete</button>` | `VerdictPage.jsx` | Discard record | Dragging Case card into `zone-discard` (undo by dragging back to Keep) |
| `<button>Print / Copy</button>` | `VerdictPage.jsx` / `ActionPage.jsx` | Export report | Dragging Case card into `zone-export` |
| `<button>Reopen & Edit</button>` | `HistoryPage.jsx` (Cards) | Reload case | Dragging History card into `zone-history-reopen` |
| `<button>Delete History</button>` | `HistoryPage.jsx` (Cards) | Remove case | Dragging History card into `zone-history-discard` |
| `<button>Assess another item</button>` | `Breadcrumbs.jsx` | Navigation | Navigation `<Link to="/assess">` |
| `<Button>Return Home</Button>` | `NotFoundPage.jsx` | Navigation | Navigation `<Link to="/">` |

---

## 5. Files Changed & Created

- **Configuration & Foundation**:
  - `src/config/zones.js` *(Created)*: Registry of all Action Zones, verb labels, accepted card types, and hints.
  - `src/canvas/actions.js` *(Created)*: Pure `applyDrop(state, card, zoneId)` reducer handling all state transitions and drop effects.
  - `src/canvas/DataCard.jsx` *(Created)*: Draggable card with grip handle (`touch-none`), lift tilt, drop animation, and rust lock state.
  - `src/canvas/ActionZone.jsx` *(Created)*: Droppable container with dashed outline, verb label, amber valid hover glow, and rust invalid warning.
  - `src/canvas/CanvasProvider.jsx` *(Created)*: DndContext wrapper with Pointer, Touch (150ms delay), and Keyboard sensors, custom coordinate navigation, and DragOverlay.
  - `src/canvas/index.js` *(Created)*: Central export for canvas primitives.
- **Pages**:
  - `src/pages/HomePage.jsx` *(Updated)*: Workbench with 8-category parts bin, 3 draggable example cards, live search highlight, and animated ghost card.
  - `src/pages/AssessPage.jsx` *(Updated)*: Single-screen Case File canvas with Category slot, What's wrong zone, Safety signs zone, Priorities ladder, and live draggable Case File card.
  - `src/pages/VerdictPage.jsx` *(Updated)*: Decision Table with Commit, Compare, Keep, Discard, Export zones, and live priority ladder re-ranking.
  - `src/pages/HistoryPage.jsx` *(Updated)*: Archive canvas with Reopen, Compare, and Discard zones, plus empty-state demo card.
  - `src/pages/NotFoundPage.jsx` *(Updated)*: Converted action buttons to semantic navigation Links.
  - `src/pages/CatalogPage.jsx` *(Updated)*: Converted evaluate buttons to navigation Links.
  - `src/pages/ActionPage.jsx` *(Updated)*: Converted print button to Decision Table export link.
- **Components & Layout**:
  - `src/App.jsx` *(Updated)*: Integrated Workshop Sidebar, BottomTabBar, and layout offsets.
  - `src/components/layout/Navbar.jsx` *(Updated)*: Added "Canvas Mode" chip and What Changed panel.
  - `src/components/common/Breadcrumbs.jsx` *(Updated)*: Converted action button to navigation Link.
  - `src/components/modals/WhatChangedModal.jsx` *(Created)*: Clean modal displaying the 3-line Canvas Protocol summary.
  - `src/copy/en.js` *(Updated)*: Added 3-line Canvas Protocol text.
- **Automated Tests**:
  - `src/canvas/__tests__/actions.test.js` *(Created)*: Unit tests for every action zone and rejected drop.
  - `src/canvas/__tests__/no-buttons.test.js` *(Created)*: Strict test asserting zero prohibited action buttons in UI.
  - `src/canvas/__tests__/journey.test.js` *(Created)*: End-to-end user journey tests for all 3 examples, safety gating, compare, and discard/restore.

## 6. How to See It in the Live App

Live URL: **[https://reshma-kn1805.github.io/reshmakarthik08-CodeVariant/](https://reshma-kn1805.github.io/reshmakarthik08-CodeVariant/)**

1. **Workbench (`#/`)**: Notice the amber **Canvas Mode** chip in the header. Drag any of the 8 Category cards (e.g. *Kitchen Appliances*) or 3 Example cards (e.g. *Mixer Grinder*) into the prominent glowing dashed **"Drop card to start assessment"** zone.
2. **Case File (`#/assess`)**: Drag equipment cards into the Category slot, diagnose fault cards into the What's Wrong zone, drop hazard flags into Safety Signs, and re-arrange the Priorities Ladder. Finally, grab the live **Case File** card and drop it into **"Drop Case File to run assessment"**.
3. **Decision Table (`#/verdict/:id`)**: View the 6-factor SVG Radar Chart, Break-even Line Chart, and Repair Quote Sensitivity Slider. Drag any option into **Commit**, **Compare** (side-by-side modal), **Keep**, **Discard**, or **Export** (copies summary and opens print dialog).
4. **History Archive (`#/history`)**: Drag past evaluation cards into **Reopen & Edit**, **Compare 2 Cases**, or **Discard**.

---

## 7. 60-Second Demo Script for Judges

1. **Workbench (00:00 - 00:15)**:
   - Notice the header chip **"Canvas Mode"** — click it to see the 3-line protocol summary.
   - On the homepage, notice zero action buttons. Drag the **"5-year-old Mixer Grinder"** example card into the glowing amber **"Start assessment"** zone.
   - Dropping the card instantly calculates the matrix and jumps to the scored verdict.
2. **Safety Gate & Decision Table (00:15 - 00:35)**:
   - On `/verdict`, notice the 5 ranked options. If evaluating the **"Phone with Swollen Battery"**, observe that DIY Repair, Reuse, and Repurpose cards are locked with **Rust Locks**.
   - Try dragging "Repair It Yourself" into the **"Commit to this option"** zone: the card bounces back and explains the safety red-line.
   - Now drag **"E-Waste Safe Recycling"** or **"Professional Repair"** into Commit: the action plan unlocks into draggable Step cards!
   - Drag Step 1 into the **"Done"** zone: notice the step ticks off and saves to session storage.
3. **Compare & Undo with Zero Buttons (00:35 - 00:50)**:
   - Drag any two option cards into the **"Compare"** zone: the side-by-side trade-off modal opens automatically. Press **Esc** to close.
   - Drag the live Case File card into **"Discard"**: the card vanishes into the **Recently Discarded tray**.
   - Notice there is no undo button! Grab the card from the Discarded tray and drag it back onto **"Keep"**: the case is immediately restored!
4. **Case File & History Archive (00:50 - 01:00)**:
   - Go to **History** in the sidebar or bottom bar: notice zero delete or verdict buttons. Drag any history card into **"Reopen & Edit"** to reload it into `/assess`.
   - On `/assess`, re-order the **Priorities Ladder** by dragging "Reduce Waste" into Slot #1 (70% weight) and drag the live Case File into **"Run Assessment"** to re-score.

---

## 7. Accessibility Notes

- **Keyboard Support**:
  - Press `Space` or `Enter` on any card's drag grip to lift it.
  - Press `ArrowDown`, `ArrowUp`, `ArrowRight`, or `ArrowLeft` to automatically cycle between **strictly valid target zones** for that card.
  - Press `Space` or `Enter` over the target zone to complete the drop.
  - Press `Escape` at any time to cancel dragging.
- **Screen Reader Announcements**:
  - Live ARIA announcements declare when a card is lifted, whether a hovered zone is a valid or invalid drop target, and the result of the drop.
- **Mobile Touch**:
  - Touch sensors configured with a `150ms` delay and `5px` tolerance to prevent accidental drags during normal scrolling.
  - Dedicated grip handles feature `touch-action: none` (`touch-none`) to ensure reliable vertical and horizontal dragging without triggering page scrolling.
  - Sticky bottom action zones ensure targets are always within comfortable reach on small viewports.
- **Prefers-Reduced-Motion**:
  - Respects user operating system preferences: tilt angles and transition durations are disabled when `prefers-reduced-motion` is active.
