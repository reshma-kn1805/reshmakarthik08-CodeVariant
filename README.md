# Fix It First

> 🌐 **Live Demo:** [https://reshma-kn1805.github.io/reshmakarthik08-CodeVariant/](https://reshma-kn1805.github.io/reshmakarthik08-CodeVariant/)  
> **Code Variant Build 01 — Problem Statement 01**  
> *12-Hour Live Round (24 Oct 2026, 12:00–23:59 IST)*  
> Live Decision Engine: Help users decide what to do with broken or unwanted items without nudging them to buy new.

---

## 30-Second Judge Quick Test

A judge can understand the core product and see it calculate within 30 seconds:

1. Click **"Judge Demos (30s)"** in the top navigation bar (or on the homepage banner).
2. Select any of the 4 real-world test cases:
   - **Pop-up Toaster**: Zero-cost 15-minute crumb cleanup easily beats buying a new $45 toaster (diverts 18 kg $\text{CO}_2\text{e}$).
   - **Smartphone Battery**: $25 DIY battery swap vs $750 replacement (scores 94/100, saves 70 kg $\text{CO}_2\text{e}$).
   - **Solid Wood Dining Chair**: Classic joinery glue & clamp restoration beats cheap flatpack replacement.
   - **Microwave Sparks (Safety Gate)**: Instantly triggers the rust-colored (`#C8553D`) electrical safety alert, warning against lethal internal capacitors while demonstrating a safe $9 mica waveguide fix.
3. On the **Decision Matrix (`/verdict`)**, click **"Tinker with Estimates"** to test different replacement costs, parts prices, or hourly labor rates in real time!

---

## Purpose: The Decision Process Is The Product

Every year, 53 million metric tons of household items and electronics are discarded prematurely. Most existing apps push consumers directly to affiliate links to buy brand-new goods.

**Fix It First** places all 5 circular paths on a transparent, mathematical footing:
1. **Repair (DIY)**: Evaluates tools, parts cost, workbench minutes, and user skill level.
2. **Repair (Professional)**: Benchmarks certified local labor rates against replacement price, with warranty checklists.
3. **Reuse & Pass Along**: Workarounds, secondary household duty, or gifting to community tool libraries.
4. **Repurpose / Upcycle**: Category-specific transformation recipes (e.g. turning denim jeans into tote bags, or broken tablets into wall dashboards).
5. **Replace (Buy New)**: Evaluated honestly with total cost of ownership and the new embodied carbon footprint penalty.
6. **Recycle / E-Waste**: Responsible decommissioning, lithium battery isolation, and data wipe protocols.

---

## Tech Stack & Architecture

- **Core**: React 18 + Vite 6 + Tailwind CSS 3.4 + React Router 6 (Plain JavaScript JSX, no TypeScript blocking deploy).
- **Icons**: `lucide-react`
- **Testing**: `vitest` for pure engine tests
- **Zero Backend**: 100% client-side, zero login, zero external API tracking, survives browser refresh via `sessionStorage`.

### Strict Layered Architecture

```
src/
├── data/rules.json            # Categories, faults, parts costs, typical lifespans, safety red lines, upcycle recipes
├── config/app.config.js       # Tunable scoring weights, labor baselines, and feature flags
├── engine/                    # Pure, deterministic scoring functions (zero React/DOM, 100% unit tested)
│   ├── scoring.js
│   └── __tests__/engine.test.js
├── copy/en.js                 # 100% of user-facing text (headings, microcopy, disclaimers, options)
├── state/AssessmentContext.jsx# React Context + sessionStorage persistence
├── components/
│   ├── ui/                    # Design system: Button, Card, Chip, Badge, ProgressBar, Stepper, ScoreBar, Callout, PageContainer
│   ├── layout/                # Navbar, Footer
│   ├── common/                # EstimateBadge, SafetyBanner, ScorePill
│   ├── verdict/               # OptionCard, Decision Breakdown
│   └── modals/                # JudgeDemosModal, TinkerModal
└── pages/
    ├── HomePage.jsx           # "Don't toss it. Decide it.", 3-step workflow, judge demos
    ├── AssessPage.jsx         # 3-step diagnosis & safety check wizard
    ├── VerdictPage.jsx        # 5-way Decision Matrix & live slider drawer (/verdict and /verdict/:id)
    ├── HistoryPage.jsx        # Session history of past decisions (/history)
    ├── ActionPage.jsx         # Actionable step-by-step playbooks & checklists
    ├── CatalogPage.jsx        # Searchable fault directory
    └── NotFoundPage.jsx       # 404 page
```

---

## Design System & Palette

- **Deep Green** (`#1D4D3F`): Headings, authority, primary brand identity.
- **Green** (`#2E7D5B`): High-scoring paths, environmental indicators, progress bars.
- **Amber** (`#E39A2D`): Reserved strictly for primary call-to-actions and high-contrast buttons.
- **Rust** (`#C8553D`): Reserved strictly for safety red-line hazards (high voltage, swollen lithium batteries).
- **Tint** (`#EEF3EF`): Subtle surface cards, badges, and pill backgrounds.
- **Ink** (`#17211C`): High-contrast typography adhering to WCAG AA accessibility.
- **Typography**: Fraunces (serif for headings) + DM Sans (geometric sans-serif for body).
- **Grid**: 8px grid spacing, consistent radius scale, 150–200ms transitions.

---

## Honesty & Transparency Policy

All costs, lifespans, and carbon metrics are illustrative estimates and are labeled with an `[Estimate]` badge. Users can click **"Tinker with Estimates"** on any verdict to adjust assumptions and watch the mathematical outcome adapt dynamically.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Start local development server
npm run dev

# 4. Create production build
npm run build
```

---

## Deployment

Configured for single-page application routing via `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
