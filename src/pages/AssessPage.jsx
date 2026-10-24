import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sliders,
  DollarSign,
  Leaf,
  Clock,
  Layers,
  ChevronDown,
  Info,
  Check,
  Flame,
  Zap,
} from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { CanvasProvider, DataCard, ActionZone, applyDrop, PRIORITY_WEIGHTS } from '../canvas/index.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { ZONES } from '../config/zones.js';

export function AssessPage() {
  const navigate = useNavigate();
  const {
    assessment,
    updateAssessment,
    rules,
    saveCurrentToHistory,
    history,
  } = useAssessment();

  const [validationPulse, setValidationPulse] = useState(null); // string or null
  const [missingSlots, setMissingSlots] = useState([]);

  const activeCategory =
    rules.categories.find((c) => c.id === assessment.category) || rules.categories[0];
  const categoryFaults = activeCategory?.commonFaults || [];
  const categorySafetyFlags = activeCategory?.safetyFlags || [];

  // Check if critical flag is present
  const hasCriticalFlag = (assessment.safetyFlags || []).some((f) => {
    const s = String(f).toLowerCase();
    return (
      s.includes('swollen') ||
      s.includes('battery') ||
      s.includes('burning') ||
      s.includes('sparks') ||
      s.includes('exposed_mains') ||
      s.includes('structural')
    );
  });

  const priorityRanks = assessment.priorityRanks || ['money', 'waste', 'effort'];

  const PRIORITY_LABELS = {
    money: { title: 'Save Money', desc: 'Focus on direct pocket savings', icon: DollarSign },
    waste: { title: 'Reduce Waste', desc: 'Prioritize landfill diversion & circularity', icon: Leaf },
    effort: { title: 'Save Effort', desc: 'Minimize troubleshooting & physical labor', icon: Clock },
  };

  const handleDropSuccess = (result) => {
    setValidationPulse(null);
    setMissingSlots([]);

    if (result.effects?.isCritical !== undefined) {
      // Safety drop
    }

    if (result.state?.assessment) {
      updateAssessment(result.state.assessment);
    }

    // Dropped into run-assessment
    if (result.effects?.caseId) {
      const id = saveCurrentToHistory();
      navigate(`/verdict/${id || result.effects.caseId}`);
    }
  };

  const handleCustomDrop = (result) => {
    if (!result.success) {
      setValidationPulse(result.effects?.message || 'Incomplete case file');
      if (result.effects?.missingSlots) {
        setMissingSlots(result.effects.missingSlots);
      }
      setTimeout(() => {
        setValidationPulse(null);
        setMissingSlots([]);
      }, 3000);
      return;
    }
    handleDropSuccess(result);
  };

  // Build live summary data for Case File Card
  const primaryFaultLabel =
    categoryFaults.find((f) => f.id === assessment.faultId)?.label ||
    assessment.problemText?.slice(0, 45) ||
    'Not yet diagnosed';

  return (
    <CanvasProvider
      stateContext={{ assessment, history, gated: hasCriticalFlag }}
      onDropSuccess={handleCustomDrop}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: 'Workbench', path: '/' }, { label: 'Case File Canvas' }]} showActions={false} />

        {/* Case File Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ink-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen bg-tint px-2 py-0.5 rounded-full border border-green/20">
                The Canvas Protocol • Case File
              </span>
              {hasCriticalFlag && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-safety-rust px-2 py-0.5 rounded-full animate-pulse">
                  Critical Hazard Active
                </span>
              )}
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink mt-1">
              {activeCategory.name} Case File
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Drag cards to diagnose equipment, tune weights on the priorities ladder, and drag the Case File to Run Assessment.
            </p>
          </div>

          {/* Validation Notice Banner if bounced */}
          {validationPulse && (
            <div className="p-3 rounded-brand bg-safety-rustLight border border-safety-rust/40 text-safety-rust text-xs font-semibold flex items-center gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationPulse}</span>
            </div>
          )}
        </div>

        {/* Canvas Layout: Left Workspace + Right Live Case File Card & Run Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Canvas Work Area (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Slot 1: Category Slot */}
            <section
              className={`p-5 rounded-brand-lg bg-white border transition-all ${
                missingSlots.includes('Category')
                  ? 'border-safety-rust ring-2 ring-safety-rust/40'
                  : 'border-ink-border/80 shadow-subtle'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-tint text-deepGreen font-mono font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-heading font-bold text-base text-ink">
                    Category Slot
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-deepGreen">
                  Active: {activeCategory.name}
                </span>
              </div>

              <ActionZone
                id="zone-category-slot"
                label={`Drop category card here to switch equipment`}
                hint={`Currently loaded: ${activeCategory.name}. Drag another category card into this slot to replace.`}
                emptyState={`Active: ${activeCategory.name} • Drop card to switch`}
                className="bg-brand-surfaceAlt/20 min-h-[80px]"
              />

              {/* Category selector bin */}
              <div className="mt-4 pt-3 border-t border-ink-border/30">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block mb-2">
                  Available Equipment Types (Drag to switch):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {rules.categories.map((cat) => (
                    <DataCard
                      key={cat.id}
                      id={cat.id}
                      type="category"
                      title={cat.name}
                      data={cat}
                      className={cat.id === activeCategory.id ? 'border-amber ring-1 ring-amber/50' : ''}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Slot 2: What's Wrong Zone */}
            <section
              className={`p-5 rounded-brand-lg bg-white border transition-all ${
                missingSlots.includes("What's wrong")
                  ? 'border-safety-rust ring-2 ring-safety-rust/40'
                  : 'border-ink-border/80 shadow-subtle'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-tint text-deepGreen font-mono font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="font-heading font-bold text-base text-ink">
                    What's Wrong Zone
                  </h3>
                </div>
                <span className="text-[11px] text-ink-muted">
                  First card dropped is primary fault
                </span>
              </div>

              <ActionZone
                id="zone-faults"
                label="Drop diagnosed fault cards here"
                hint="Multi-drop accepted. The first card becomes the primary diagnosis for repair calculations."
                emptyState={
                  assessment.faultId
                    ? `Diagnosed: ${primaryFaultLabel}`
                    : 'No fault card dropped yet • Drop a card from below'
                }
                className="bg-brand-surfaceAlt/20 min-h-[80px]"
              />

              {/* Category Fault Bin */}
              <div className="mt-4 pt-3 border-t border-ink-border/30 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                  Common Faults for {activeCategory.name} (Drag to add):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categoryFaults.map((f) => (
                    <DataCard
                      key={f.id}
                      id={f.id}
                      type="fault"
                      title={f.label}
                      subtitle={`Est. part: ₹${f.repairCost?.default || 250}`}
                      badge={f.id === assessment.faultId ? 'Primary' : undefined}
                      data={f}
                      className={f.id === assessment.faultId ? 'border-amber ring-2 ring-amber/40' : ''}
                    />
                  ))}
                </div>
              </div>

              {/* Free-text description (required) */}
              <div className="mt-4 pt-3 border-t border-ink-border/30 space-y-1.5">
                <label
                  htmlFor="problem-text-input"
                  className="block text-xs font-semibold text-ink"
                >
                  Specific Symptom or Problem Description <span className="text-safety-rust">*</span>
                </label>
                <textarea
                  id="problem-text-input"
                  rows={2}
                  value={assessment.problemText}
                  onChange={(e) => updateAssessment({ problemText: e.target.value })}
                  placeholder="e.g. Coupler teeth stripped; motor hums but blades don't turn under load..."
                  className="w-full p-2.5 rounded-brand bg-white border border-ink-border text-xs text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-amber shadow-xs"
                />
              </div>

              {/* Severity Segmented Selector */}
              <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-ink-border/30">
                <span className="text-xs font-semibold text-ink">Failure Severity:</span>
                <div className="flex rounded-brand bg-brand-surfaceAlt p-0.5 border border-ink-border/60">
                  {[
                    { val: 1, label: 'Mild (Functional)' },
                    { val: 2, label: 'Moderate (Failing)' },
                    { val: 3, label: 'Severe (Dead)' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => updateAssessment({ severity: s.val })}
                      className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                        assessment.severity === s.val
                          ? 'bg-white text-ink shadow-xs'
                          : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Slot 3: Safety Signs Zone */}
            <section
              className={`p-5 rounded-brand-lg border transition-all ${
                hasCriticalFlag
                  ? 'bg-safety-rustLight/20 border-safety-rust/50 shadow-card'
                  : 'bg-white border-ink-border/80 shadow-subtle'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full font-mono font-bold text-xs flex items-center justify-center ${
                      hasCriticalFlag ? 'bg-safety-rust text-white' : 'bg-tint text-deepGreen'
                    }`}
                  >
                    3
                  </span>
                  <h3 className="font-heading font-bold text-base text-ink">
                    Safety Signs Zone
                  </h3>
                </div>
                {hasCriticalFlag ? (
                  <span className="text-xs font-mono font-bold text-safety-rust flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Rust Hazard Triggered
                  </span>
                ) : (
                  <span className="text-xs font-mono text-ink-muted">Safe condition affirmed</span>
                )}
              </div>

              <ActionZone
                id="zone-safety"
                label="Drop safety warning sign cards here"
                hint="Critical signs lock DIY repair and redirect to professional technicians or recycling."
                emptyState={
                  hasCriticalFlag
                    ? 'Hazard active • Locks DIY repair'
                    : 'Safe condition affirmed • Drop flags if hazard observed'
                }
                className="bg-brand-surfaceAlt/20 min-h-[80px]"
              />

              {/* Safety Sign Bin */}
              <div className="mt-4 pt-3 border-t border-ink-border/30 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block">
                  Available Warning Signs (Drag to toggle):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* None of these card */}
                  <DataCard
                    id="none"
                    type="safety"
                    title="None of these"
                    subtitle="Item operates without sparks, swelling, or odor"
                    badge="Safe"
                    data={{ id: 'none', label: 'None of these' }}
                    className={
                      (assessment.safetyFlags || []).length === 0
                        ? 'border-deepGreen ring-2 ring-deepGreen/30'
                        : ''
                    }
                  />

                  {categorySafetyFlags.map((flag) => {
                    const isActive = (assessment.safetyFlags || []).includes(flag.id);
                    return (
                      <DataCard
                        key={flag.id}
                        id={flag.id}
                        type="safety"
                        title={flag.label}
                        subtitle={flag.isCritical ? 'Critical Safety Gate' : 'Precautionary warning'}
                        badge={flag.isCritical ? 'Hazard' : 'Warning'}
                        isLocked={false}
                        data={flag}
                        className={isActive ? 'border-safety-rust ring-2 ring-safety-rust/50' : ''}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Slot 4: Priorities Ladder */}
            <section className="p-5 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-tint text-deepGreen font-mono font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                  <h3 className="font-heading font-bold text-base text-ink">
                    Priorities Ladder (Ranked 1–3)
                  </h3>
                </div>
                <span className="text-xs font-mono text-ink-muted">
                  Drag priority cards into Slots 1, 2, or 3
                </span>
              </div>

              {/* 3 Ranked Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[1, 2, 3].map((rank) => {
                  const key = priorityRanks[rank - 1] || 'money';
                  const weight = PRIORITY_WEIGHTS[rank];
                  const info = PRIORITY_LABELS[key] || PRIORITY_LABELS.money;

                  return (
                    <div key={rank} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-ink">Slot #{rank}</span>
                        <span className="font-bold text-amber px-1.5 py-0.2 rounded bg-amberLight">
                          {weight}% Weight
                        </span>
                      </div>

                      <ActionZone
                        id={`zone-priority-${rank}`}
                        label={`#${rank} Priority Slot`}
                        hint={`Drop priority card here to assign ${weight}% weight`}
                        className="min-h-[100px] bg-brand-surfaceAlt/25 p-2"
                      >
                        <div className="p-2 rounded bg-white border border-ink-border text-left">
                          <span className="font-bold text-xs text-ink block">{info.title}</span>
                          <span className="text-[10px] text-ink-muted block">{info.desc}</span>
                        </div>
                      </ActionZone>
                    </div>
                  );
                })}
              </div>

              {/* Draggable Priority Cards */}
              <div className="pt-2 border-t border-ink-border/30">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block mb-2">
                  Priority Cards (Drag to swap ladder):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['money', 'waste', 'effort'].map((k) => {
                    const info = PRIORITY_LABELS[k];
                    return (
                      <DataCard
                        key={k}
                        id={k}
                        type="priority"
                        title={info.title}
                        subtitle={info.desc}
                        icon={info.icon}
                        data={{ key: k, label: info.title }}
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Slot 5: Age, Cost Estimates & Condition (Sliders & Inputs) */}
            <section
              className={`p-5 rounded-brand-lg bg-white border transition-all ${
                missingSlots.includes('Cost estimates')
                  ? 'border-safety-rust ring-2 ring-safety-rust/40'
                  : 'border-ink-border/80 shadow-subtle'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-tint text-deepGreen font-mono font-bold text-xs flex items-center justify-center">
                    5
                  </span>
                  <h3 className="font-heading font-bold text-base text-ink">
                    Age & Economic Estimates
                  </h3>
                </div>
                <span className="text-xs font-mono text-ink-muted">Inputs & Sliders</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="age-years-slider" className="font-semibold text-ink">Item Age:</label>
                    <span className="font-mono font-bold text-ink">
                      {assessment.itemAgeYears || assessment.ageYears || 3} years
                    </span>
                  </div>
                  <input
                    id="age-years-slider"
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={assessment.itemAgeYears || assessment.ageYears || 3}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateAssessment({ ageYears: val, itemAgeYears: val });
                    }}
                    className="w-full accent-deepGreen cursor-pointer"
                    aria-label="Item Age in years"
                  />
                  <div className="flex justify-between text-[10px] text-ink-faint font-mono">
                    <span>New (0y)</span>
                    <span>Average ({activeCategory.expectedLifespanYears}y)</span>
                    <span>Old (15y)</span>
                  </div>
                </div>

                {/* Rest of Condition Selector */}
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-ink">Rest-of-Item Condition:</span>
                  <div className="flex rounded-brand bg-brand-surfaceAlt p-0.5 border border-ink-border/60">
                    {['good', 'fair', 'poor'].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => updateAssessment({ restCondition: cond })}
                        className={`flex-1 py-1.5 rounded text-[11px] font-bold capitalize transition-all ${
                          assessment.restCondition === cond
                            ? 'bg-white text-ink shadow-xs'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Repair Cost Estimate */}
                <div className="space-y-1">
                  <label htmlFor="repair-cost-input" className="block text-xs font-semibold text-ink">
                    Estimated Part / Repair Cost (₹):
                  </label>
                  <input
                    id="repair-cost-input"
                    type="number"
                    min="0"
                    step="50"
                    value={assessment.repairCost}
                    onChange={(e) => updateAssessment({ repairCost: Number(e.target.value) })}
                    className="w-full p-2 rounded-brand bg-white border border-ink-border text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>

                {/* Replacement Cost Estimate */}
                <div className="space-y-1">
                  <label htmlFor="replace-cost-input" className="block text-xs font-semibold text-ink">
                    Cost of Brand-New Replacement (₹):
                  </label>
                  <input
                    id="replace-cost-input"
                    type="number"
                    min="100"
                    step="100"
                    value={assessment.replaceCost}
                    onChange={(e) => updateAssessment({ replaceCost: Number(e.target.value) })}
                    className="w-full p-2 rounded-brand bg-white border border-ink-border text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-amber"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Sticky Area: The Draggable Case File Card & Run Assessment Zone (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Live Case File Card (Draggable) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber">
                  Live Case File • Grab Handle to Run
                </span>
                <span className="text-[10px] font-mono text-ink-muted">
                  Drag ↓ into Run Zone
                </span>
              </div>

              <DataCard
                id="active-case-file"
                type="case-file"
                title={`${activeCategory.name} Case File`}
                subtitle={primaryFaultLabel}
                badge={hasCriticalFlag ? 'Hazard Alert' : 'Diagnosed'}
                icon={hasCriticalFlag ? ShieldAlert : ShieldCheck}
                className={`border-2 ${
                  hasCriticalFlag
                    ? 'border-safety-rust bg-safety-rustLight/20 shadow-card'
                    : 'border-brand-deep/50 shadow-card'
                }`}
                data={assessment}
              >
                <div className="space-y-2 text-[11px] pt-1">
                  <div className="flex justify-between border-b border-ink-border/30 pb-1">
                    <span className="text-ink-muted">Equipment:</span>
                    <span className="font-bold text-ink">{activeCategory.name}</span>
                  </div>

                  <div className="flex justify-between border-b border-ink-border/30 pb-1">
                    <span className="text-ink-muted">Primary Fault:</span>
                    <span className="font-bold text-ink truncate max-w-[170px]">{primaryFaultLabel}</span>
                  </div>

                  <div className="flex justify-between border-b border-ink-border/30 pb-1">
                    <span className="text-ink-muted">Safety Status:</span>
                    <span
                      className={`font-bold ${
                        hasCriticalFlag ? 'text-safety-rust' : 'text-deepGreen'
                      }`}
                    >
                      {hasCriticalFlag ? 'Critical Gate Triggered' : 'Operating Safely'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-ink-border/30 pb-1">
                    <span className="text-ink-muted">Priority Ladder:</span>
                    <span className="font-mono font-bold text-amber">
                      #{priorityRanks[0]} &gt; #{priorityRanks[1]} &gt; #{priorityRanks[2]}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-ink-border/30 pb-1">
                    <span className="text-ink-muted">Est. Economics:</span>
                    <span className="font-mono font-bold text-ink">
                      Fix ₹{assessment.repairCost} vs New ₹{assessment.replaceCost}
                    </span>
                  </div>

                  <p className="text-[10px] text-ink-faint italic pt-1 text-center">
                    Grip the handle top-right and drop into the zone below to run the decision engine.
                  </p>
                </div>
              </DataCard>
            </div>

            {/* Action Zone: Large "Run Assessment" Target */}
            <div className="space-y-2">
              <ActionZone
                id="zone-run-assessment"
                label="Drop Case File to run assessment"
                hint="Drop the Case File above to calculate the 5-way decision matrix, log to history, and view the verdict."
                emptyState="Ready for Case File • Drag the card above to run engine"
                mobileSticky={true}
                className="min-h-[140px] bg-white border-brand shadow-card"
              />
            </div>
          </div>
        </div>
      </div>
    </CanvasProvider>
  );
}
