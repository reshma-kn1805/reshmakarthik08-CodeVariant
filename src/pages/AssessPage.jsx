import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Wrench,
  Check,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  DollarSign,
  Leaf,
  Zap,
} from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { COPY } from '../copy/en.js';
import { Stepper } from '../components/assessment/Stepper.jsx';
import { EstimateBadge } from '../components/common/EstimateBadge.jsx';

export function AssessPage() {
  const navigate = useNavigate();
  const {
    assessment,
    updateAssessment,
    currentStep,
    setCurrentStep,
    rules,
    saveCurrentToHistory,
  } = useAssessment();

  const [validationError, setValidationError] = useState('');

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setValidationError('');
  }, [currentStep]);

  const activeCategory =
    rules.categories.find(c => c.id === assessment.category) || rules.categories[0];
  const categoryFaults = activeCategory?.commonFaults || [];
  const categorySafetyFlags = activeCategory?.safetyFlags || [];

  // Handle category change
  const handleCategoryChange = (catId) => {
    const newCat = rules.categories.find(c => c.id === catId);
    const firstFault = newCat?.commonFaults?.[0];
    const defaultItem = newCat?.items?.[0];

    updateAssessment({
      category: catId,
      itemName: defaultItem?.name || newCat?.name || '',
      itemId: defaultItem?.id || '',
      replaceCost: newCat?.replaceCost?.default || 3500,
      faultId: firstFault?.id || '',
      repairCost: firstFault?.repairCost?.default || 250,
      safetyFlags: [],
    });
  };

  // Handle fault chip selection
  const handleFaultSelect = (fault) => {
    updateAssessment({
      faultId: fault.id,
      repairCost: fault.repairCost?.default || assessment.repairCost,
      severity: typeof fault.severity === 'number' ? Math.min(Math.max(fault.severity, 1), 3) : 2,
      problemText: assessment.problemText || fault.description || fault.label,
    });
    setValidationError('');
  };

  // Step 3 Safety flag toggle
  const handleSafetyToggle = (flagId) => {
    const currentFlags = assessment.safetyFlags || [];
    let updated;
    if (flagId === 'none') {
      updated = [];
    } else {
      if (currentFlags.includes(flagId)) {
        updated = currentFlags.filter(f => f !== flagId);
      } else {
        updated = [...currentFlags.filter(f => f !== 'none'), flagId];
      }
    }
    updateAssessment({ safetyFlags: updated });
  };

  // Check if critical flag is active in step 3
  const hasCriticalFlag = (assessment.safetyFlags || []).some(f => {
    const s = String(f).toLowerCase();
    return (
      s.includes('swollen') ||
      s.includes('battery') ||
      s.includes('burning') ||
      s.includes('sparks') ||
      s.includes('exposed_mains') ||
      s.includes('exposed mains')
    );
  });

  // Navigation handlers with validation
  const handleNext = () => {
    if (currentStep === 1) {
      if (!assessment.category) {
        setValidationError('Please select an item category to continue.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!assessment.problemText || !assessment.problemText.trim()) {
        setValidationError('Please describe what is wrong in your own words before proceeding.');
        return;
      }
      setValidationError('');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Complete flow
      const id = saveCurrentToHistory();
      navigate(`/verdict/${id}`);
    }
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* 4-Step Progress Bar */}
      <Stepper currentStep={currentStep} onStepClick={(step) => step < currentStep && setCurrentStep(step)} />

      {/* Main Assessment Container */}
      <div className="bg-white rounded-brand-lg border border-ink-border/80 shadow-subtle p-6 sm:p-8 space-y-6">
        {/* Step Header */}
        <div className="border-b border-ink-border/50 pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-tint text-brand-deep font-mono font-bold text-xs uppercase tracking-wider">
              Step {currentStep} of 4
            </span>
            <span className="text-xs font-semibold text-ink-faint">
              {COPY.steps[`step${currentStep}`]?.shortTitle}
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-ink">
            {COPY.steps[`step${currentStep}`]?.title}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            {COPY.steps[`step${currentStep}`]?.description}
          </p>
        </div>

        {/* Inline Validation Error Banner */}
        {validationError && (
          <div
            role="alert"
            className="p-3.5 rounded-brand bg-safety-rustLight border border-safety-rust text-safety-rust text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-safety-rust" />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: ITEM DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Category Cards */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink block">
                Select Item Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {rules.categories.map((cat) => {
                  const isSelected = assessment.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-3.5 rounded-brand border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 min-h-[92px] ${
                        isSelected
                          ? 'border-brand bg-brand-tint text-brand-deep ring-2 ring-brand/30 shadow-xs'
                          : 'border-ink-border/80 bg-white hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink hover:border-brand/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-heading font-bold text-xs block truncate">
                          {cat.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                      </div>
                      <span className="text-[11px] text-ink-faint leading-tight">
                        Typical life: ~{cat.expectedLifespanYears} yrs
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Item Name */}
            <div className="space-y-2">
              <label htmlFor="item-name-input" className="text-xs font-bold uppercase tracking-wider text-ink block">
                Item Name or Model
              </label>
              <input
                id="item-name-input"
                type="text"
                placeholder="e.g. Mixer Grinder, ThinkPad Laptop, Office Swivel Chair"
                value={assessment.itemName || ''}
                onChange={(e) => updateAssessment({ itemName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-brand border border-ink-border bg-white text-ink text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              />
              {activeCategory?.items?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-ink-faint">Presets:</span>
                  {activeCategory.items.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        updateAssessment({
                          itemName: preset.name,
                          itemId: preset.id,
                          replaceCost: preset.defaultNewPrice || assessment.replaceCost,
                        })
                      }
                      className="px-2 py-0.5 rounded-full bg-brand-surfaceAlt hover:bg-brand-tint text-[11px] font-medium text-ink-muted hover:text-brand-deep border border-ink-border/60 transition-colors cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Age in Years */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="item-age-input" className="text-xs font-bold uppercase tracking-wider text-ink block">
                  How Old Is This Item? (Years)
                </label>
                <span className="font-mono font-bold text-sm text-brand-deep">
                  {assessment.ageYears} {assessment.ageYears === 1 ? 'year' : 'years'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="item-age-slider"
                  type="range"
                  min="0"
                  max={Math.max(15, activeCategory.expectedLifespanYears * 2)}
                  value={assessment.ageYears}
                  onChange={(e) =>
                    updateAssessment({
                      ageYears: Number(e.target.value),
                      itemAgeYears: Number(e.target.value),
                    })
                  }
                  className="w-full accent-brand h-2 bg-ink-border/40 rounded-lg cursor-pointer"
                />
                <input
                  id="item-age-input"
                  type="number"
                  min="0"
                  max="50"
                  value={assessment.ageYears}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value) || 0);
                    updateAssessment({ ageYears: val, itemAgeYears: val });
                  }}
                  className="w-20 px-2.5 py-1.5 rounded-brand border border-ink-border text-center text-sm font-mono font-bold text-ink"
                />
              </div>
              <p className="text-[11px] text-ink-faint">
                Category baseline lifespan: ~{activeCategory.expectedLifespanYears} years. Remaining life will be calculated automatically.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: WHAT'S WRONG */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Fault Chips adapting to Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink block">
                Common Symptoms for {activeCategory.name}
              </label>
              <div className="flex flex-wrap gap-2">
                {categoryFaults.map((fault) => {
                  const isSelected = assessment.faultId === fault.id;
                  return (
                    <button
                      key={fault.id}
                      type="button"
                      onClick={() => handleFaultSelect(fault)}
                      className={`px-3 py-2 rounded-brand text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-brand bg-brand-tint text-brand-deep font-bold ring-1 ring-brand'
                          : 'border-ink-border/80 bg-white hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink'
                      }`}
                    >
                      <span>{fault.label || fault.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* REQUIRED Free-Text Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="problem-text-input" className="text-xs font-bold uppercase tracking-wider text-ink block">
                  Describe What's Wrong in Your Own Words <span className="text-safety-rust">*</span>
                </label>
                <span className="text-[10px] font-mono text-ink-faint">
                  {assessment.problemText?.trim().length || 0} chars • Required
                </span>
              </div>
              <textarea
                id="problem-text-input"
                rows={3}
                required
                placeholder="e.g. Motor hums loudly but blades won't turn; or handle snapped when closing."
                value={assessment.problemText || ''}
                onChange={(e) => {
                  updateAssessment({ problemText: e.target.value });
                  if (e.target.value.trim()) setValidationError('');
                }}
                className={`w-full p-3 rounded-brand border text-sm text-ink outline-none transition-all focus-visible:ring-2 focus-visible:ring-amber ${
                  validationError
                    ? 'border-safety-rust focus:ring-1 focus:ring-safety-rust bg-safety-rustLight/20'
                    : 'border-ink-border bg-white focus:border-brand'
                }`}
              />
              <p className="text-[11px] text-ink-faint">
                Be as specific as possible about sounds, physical cracks, or how the failure occurred.
              </p>
            </div>

            {/* 3-Level Severity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink block">
                How Severe Is the Issue?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    level: 1,
                    title: 'Mild',
                    desc: 'Still partially works or cosmetic flaw only',
                  },
                  {
                    level: 2,
                    title: 'Moderate',
                    desc: 'Core function impaired; incomplete or annoying',
                  },
                  {
                    level: 3,
                    title: 'High',
                    desc: 'Completely non-functional or stopped working',
                  },
                ].map((s) => {
                  const isSelected = assessment.severity === s.level;
                  return (
                    <button
                      key={s.level}
                      type="button"
                      onClick={() => updateAssessment({ severity: s.level })}
                      className={`p-3.5 rounded-brand border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand bg-brand-tint text-brand-deep ring-2 ring-brand/30 shadow-xs'
                          : 'border-ink-border/80 bg-white hover:bg-brand-surfaceAlt text-ink-muted'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-heading font-bold text-xs uppercase">
                          {s.level}. {s.title}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand" />}
                      </div>
                      <span className="text-[11px] text-ink-muted block leading-tight">
                        {s.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SAFETY CHECK */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Category-Specific Warning Signs */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink block">
                Safety Checklist for {activeCategory.name}
              </label>
              <p className="text-xs text-ink-muted">
                Items with severe electrical, chemical, or battery damage require caution. Check any that apply:
              </p>

              <div className="space-y-2 pt-1">
                {categorySafetyFlags.map((flag) => {
                  const isChecked = (assessment.safetyFlags || []).includes(flag.id);
                  return (
                    <button
                      key={flag.id}
                      type="button"
                      onClick={() => handleSafetyToggle(flag.id)}
                      className={`w-full p-3.5 rounded-brand border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? flag.isCritical
                            ? 'border-safety-rust bg-safety-rustLight/60 text-ink ring-1 ring-safety-rust'
                            : 'border-brand bg-brand-tint text-brand-deep ring-1 ring-brand'
                          : 'border-ink-border/80 bg-white hover:bg-brand-surfaceAlt text-ink-muted'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? flag.isCritical
                              ? 'bg-safety-rust border-safety-rust text-white'
                              : 'bg-brand border-brand text-white'
                            : 'border-ink-border bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-ink block">
                            {flag.label}
                          </span>
                          {flag.isCritical && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-safety-rust text-white">
                              Critical Risk
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* "None of these" option */}
                <button
                  type="button"
                  onClick={() => handleSafetyToggle('none')}
                  className={`w-full p-3.5 rounded-brand border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    (assessment.safetyFlags || []).length === 0
                      ? 'border-brand bg-brand-surface text-brand-deep font-semibold'
                      : 'border-ink-border/80 bg-white text-ink-muted hover:bg-brand-surfaceAlt'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      (assessment.safetyFlags || []).length === 0
                        ? 'bg-brand border-brand text-white'
                        : 'border-ink-border bg-white'
                    }`}
                  >
                    {(assessment.safetyFlags || []).length === 0 && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </div>
                  <span className="text-xs">
                    None of these — No smoke, burning odor, battery swelling, or exposed wiring detected.
                  </span>
                </button>
              </div>
            </div>

            {/* Instant Rust Warning if Critical Flag is checked */}
            {hasCriticalFlag && (
              <div
                role="alert"
                className="p-5 rounded-brand bg-safety-rustLight border-2 border-safety-rust text-ink space-y-2 animate-fadeIn"
              >
                <div className="flex items-center gap-2 text-safety-rust">
                  <ShieldAlert className="w-5 h-5 text-safety-rust shrink-0" />
                  <h3 className="font-heading font-extrabold text-sm uppercase tracking-wide">
                    Critical Safety Red Line Detected
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-ink font-medium">
                  One or more acute hazards (such as battery bulge, burning odor, or exposed mains voltage) have been flagged.
                  For your safety, our decision engine will <strong>gate the verdict against DIY repair</strong> and recommend certified authorized servicing or safe e-waste disposal.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: COSTS AND PRIORITIES */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Cost Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Repair Cost */}
              <div className="p-4 rounded-brand border border-ink-border bg-brand-surface space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="repair-cost-input" className="text-xs font-bold uppercase tracking-wider text-ink block">
                    Estimated Repair Cost (₹)
                  </label>
                  <EstimateBadge />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-ink-muted font-mono">₹</span>
                  <input
                    id="repair-cost-input"
                    type="number"
                    min="0"
                    step="50"
                    value={assessment.repairCost}
                    onChange={(e) => updateAssessment({ repairCost: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full pl-8 pr-3 py-2 rounded-brand border border-ink-border bg-white font-mono font-bold text-ink text-base focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  />
                </div>
                <span className="text-[11px] text-ink-faint block">
                  Prefilled from rule database; edit if you have a local quote.
                </span>
              </div>

              {/* Replacement Cost */}
              <div className="p-4 rounded-brand border border-ink-border bg-brand-surface space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="replace-cost-input" className="text-xs font-bold uppercase tracking-wider text-ink block">
                    New Replacement Cost (₹)
                  </label>
                  <EstimateBadge />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-ink-muted font-mono">₹</span>
                  <input
                    id="replace-cost-input"
                    type="number"
                    min="100"
                    step="100"
                    value={assessment.replaceCost}
                    onChange={(e) => updateAssessment({ replaceCost: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-full pl-8 pr-3 py-2 rounded-brand border border-ink-border bg-white font-mono font-bold text-ink text-base focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                  />
                </div>
                <span className="text-[11px] text-ink-faint block">
                  Price to buy a comparable brand-new replacement today.
                </span>
              </div>
            </div>

            {/* Rest-of-Item Condition */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink block">
                Rest of Item Physical Condition (Excluding the Fault)
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'good', label: 'Good', desc: 'Clean, well-cared for' },
                  { id: 'fair', label: 'Fair', desc: 'Visible scuffs & scratches' },
                  { id: 'poor', label: 'Poor', desc: 'Heavily worn or damaged' },
                ].map((c) => {
                  const isSelected = assessment.restCondition === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateAssessment({ restCondition: c.id, itemCondition: c.id })}
                      className={`p-3 rounded-brand border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand bg-brand-tint text-brand-deep font-bold ring-1 ring-brand'
                          : 'border-ink-border bg-white text-ink-muted hover:bg-brand-surfaceAlt'
                      }`}
                    >
                      <span className="font-heading font-bold text-xs block mb-0.5">{c.label}</span>
                      <span className="text-[10px] text-ink-faint leading-tight block">{c.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Three Priority Sliders */}
            <div className="space-y-4 pt-2 border-t border-ink-border/50">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink">
                  <Sliders className="w-3.5 h-3.5 text-brand" />
                  <span>Your Priorities (0–100)</span>
                </div>
                <p className="text-[11px] text-ink-muted">
                  The decision engine automatically shifts factor weights to reflect your personal balance:
                </p>
              </div>

              {/* Slider 1: Save Money */}
              <div className="p-3.5 rounded-brand bg-white border border-ink-border/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <span className="font-mono text-brand font-bold">₹</span> Save Money
                  </span>
                  <span className="font-mono font-bold text-brand-deep">
                    {assessment.priorities?.money ?? 50}/100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessment.priorities?.money ?? 50}
                  onChange={(e) =>
                    updateAssessment({
                      priorities: { ...assessment.priorities, money: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-brand h-2 bg-ink-border/30 rounded cursor-pointer"
                />
                <span className="text-[10px] text-ink-faint block">
                  Higher priority puts heavier weight on lowest out-of-pocket spend.
                </span>
              </div>

              {/* Slider 2: Reduce Waste */}
              <div className="p-3.5 rounded-brand bg-white border border-ink-border/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-brand" /> Reduce Waste
                  </span>
                  <span className="font-mono font-bold text-brand-deep">
                    {assessment.priorities?.waste ?? 50}/100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessment.priorities?.waste ?? 50}
                  onChange={(e) =>
                    updateAssessment({
                      priorities: { ...assessment.priorities, waste: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-brand h-2 bg-ink-border/30 rounded cursor-pointer"
                />
                <span className="text-[10px] text-ink-faint block">
                  Higher priority emphasizes embodied carbon avoidance and extending remaining life.
                </span>
              </div>

              {/* Slider 3: Save Effort */}
              <div className="p-3.5 rounded-brand bg-white border border-ink-border/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-action-amberHover" /> Save Effort
                  </span>
                  <span className="font-mono font-bold text-brand-deep">
                    {assessment.priorities?.effort ?? 50}/100
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={assessment.priorities?.effort ?? 50}
                  onChange={(e) =>
                    updateAssessment({
                      priorities: { ...assessment.priorities, effort: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-brand h-2 bg-ink-border/30 rounded cursor-pointer"
                />
                <span className="text-[10px] text-ink-faint block">
                  Higher priority favors convenient paths (buy new or simple discard) over complex repairs.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-ink-border/60">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2.5 rounded-brand text-xs font-semibold text-ink-muted hover:text-ink hover:bg-brand-surfaceAlt border border-ink-border/80 transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentStep === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-brand font-bold text-xs bg-amber hover:bg-action-amberHover text-ink hover:text-white shadow-amber-glow transition-all flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber"
          >
            <span>{currentStep === 4 ? 'Calculate Decision Matrix' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
