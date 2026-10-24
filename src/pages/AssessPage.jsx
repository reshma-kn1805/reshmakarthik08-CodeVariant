import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Wrench,
  Check,
  AlertTriangle,
  Info,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { COPY } from '../copy/en.js';
import { Stepper } from '../components/assessment/Stepper.jsx';
import { EstimateBadge } from '../components/common/EstimateBadge.jsx';
import { SafetyBanner } from '../components/common/SafetyBanner.jsx';

export function AssessPage() {
  const navigate = useNavigate();
  const {
    assessment,
    updateAssessment,
    currentStep,
    setCurrentStep,
    rules,
    decisionResult,
  } = useAssessment();

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const activeCategory = rules.categories.find(c => c.id === assessment.category) || rules.categories[0];
  const categoryItems = activeCategory?.items || [];
  const activeItem = categoryItems.find(i => i.id === assessment.itemId) || categoryItems[0];

  // Handle category change
  const handleCategoryChange = (catId) => {
    const newCat = rules.categories.find(c => c.id === catId);
    const firstItem = newCat?.items?.[0];
    const defaultFault = firstItem?.commonFaults?.[0] || 'general_fault';

    updateAssessment({
      category: catId,
      itemId: firstItem?.id || '',
      originalPrice: firstItem?.defaultNewPrice || 50,
      faultId: defaultFault,
      customItemName: '',
      customFault: '',
    });
  };

  // Handle item change
  const handleItemChange = (itemId) => {
    const item = categoryItems.find(i => i.id === itemId);
    if (item) {
      updateAssessment({
        itemId: item.id,
        originalPrice: item.defaultNewPrice,
        faultId: item.commonFaults?.[0] || assessment.faultId,
      });
    }
  };

  // Step 1: Item form
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-heading font-extrabold text-2xl text-ink">
          {COPY.steps.step1.title}
        </h2>
        <p className="text-sm text-ink-muted">
          {COPY.steps.step1.description}
        </p>
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-ink block">
          {COPY.step1Form.categoryLabel}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {rules.categories.map((cat) => {
            const isSelected = assessment.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-3 rounded-brand border text-left transition-all ${
                  isSelected
                    ? 'border-brand bg-brand-tint text-brand-deep ring-2 ring-brand/20 shadow-xs'
                    : 'border-ink-border bg-white hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink'
                }`}
              >
                <span className="font-heading font-bold text-xs block truncate">
                  {cat.name}
                </span>
                <span className="text-[10px] text-ink-faint block mt-0.5 line-clamp-1">
                  {cat.items?.length || 0} presets
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Specific Item Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="item-select" className="text-sm font-semibold text-ink block">
            {COPY.step1Form.itemSelectLabel}
          </label>
          <select
            id="item-select"
            value={assessment.itemId}
            onChange={(e) => handleItemChange(e.target.value)}
            className="w-full px-3 py-2 rounded-brand border border-ink-border bg-white text-ink text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          >
            {categoryItems.map((itm) => (
              <option key={itm.id} value={itm.id}>
                {itm.name} (est. ${itm.defaultNewPrice})
              </option>
            ))}
          </select>
        </div>

        {/* Custom Item Fallback */}
        <div className="space-y-1.5">
          <label htmlFor="custom-item-input" className="text-sm font-semibold text-ink block">
            Custom Item Name (Optional)
          </label>
          <input
            id="custom-item-input"
            type="text"
            placeholder={COPY.step1Form.customItemPlaceholder}
            value={assessment.customItemName || ''}
            onChange={(e) => updateAssessment({ customItemName: e.target.value })}
            className="w-full px-3 py-2 rounded-brand border border-ink-border bg-white text-ink text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
        </div>
      </div>

      {/* Price & Age */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Original Price */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="original-price-input" className="text-sm font-semibold text-ink">
              {COPY.step1Form.originalPriceLabel}
            </label>
            <EstimateBadge />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm font-bold text-ink-faint">$</span>
            <input
              id="original-price-input"
              type="number"
              min="1"
              max="10000"
              value={assessment.originalPrice}
              onChange={(e) => updateAssessment({ originalPrice: Math.max(1, Number(e.target.value)) })}
              className="w-full pl-7 pr-3 py-2 rounded-brand border border-ink-border bg-white text-ink text-sm font-mono focus:border-brand focus:ring-1 focus:ring-brand outline-none"
            />
          </div>
          <p className="text-[11px] text-ink-muted">{COPY.step1Form.originalPriceHint}</p>
        </div>

        {/* Age in Years */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="item-age-input" className="text-sm font-semibold text-ink">
              {COPY.step1Form.ageLabel}
            </label>
            <span className="text-xs font-mono text-ink-muted">
              {assessment.itemAgeYears} {assessment.itemAgeYears === 1 ? 'yr' : 'yrs'} old
            </span>
          </div>
          <input
            id="item-age-input"
            type="range"
            min="0"
            max="15"
            step="1"
            value={assessment.itemAgeYears}
            onChange={(e) => updateAssessment({ itemAgeYears: Number(e.target.value) })}
            className="w-full accent-brand cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-ink-faint">
            <span>&lt; 1 yr</span>
            <span>5 yrs</span>
            <span>15+ yrs</span>
          </div>
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-ink block">
          {COPY.step1Form.conditionLabel}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(COPY.step1Form.conditionOptions).map(([key, label]) => {
            const isSelected = assessment.itemCondition === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateAssessment({ itemCondition: key })}
                className={`p-2.5 rounded-brand border text-left text-xs transition-all ${
                  isSelected
                    ? 'border-brand bg-brand-tint text-brand-deep font-semibold'
                    : 'border-ink-border bg-white text-ink-muted hover:bg-brand-surfaceAlt'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Step CTA */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2.5 rounded-brand font-bold text-xs bg-action-amber hover:bg-action-amberHover text-ink hover:text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span>{COPY.step1Form.nextButton}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Step 2: Diagnosis form
  const renderStep2 = () => {
    const itemCommonFaults = activeItem?.commonFaults || [];

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-2xl text-ink">
            {COPY.step2Form.title}
          </h2>
          <p className="text-sm text-ink-muted">
            {COPY.step2Form.subtitle}
          </p>
        </div>

        {/* Safety Banner (Live rust alert if hazardous) */}
        {decisionResult.safety.isHazardous && (
          <SafetyBanner safety={decisionResult.safety} />
        )}

        {/* Observed Fault Picker */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink block">
            {COPY.step2Form.symptomLabel}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {itemCommonFaults.map((faultId) => {
              const faultData = rules.faults[faultId];
              if (!faultData) return null;
              const isSelected = assessment.faultId === faultId;

              return (
                <button
                  key={faultId}
                  type="button"
                  onClick={() => updateAssessment({
                    faultId,
                    severity: faultData.severity || 'moderate',
                  })}
                  className={`p-3.5 rounded-brand border text-left transition-all ${
                    isSelected
                      ? 'border-brand bg-brand-tint text-brand-deep ring-2 ring-brand/20 shadow-xs'
                      : 'border-ink-border bg-white hover:bg-brand-surfaceAlt text-ink'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-heading font-bold text-xs text-ink block">
                      {faultData.name}
                    </span>
                    {faultData.safetyRisk === 'high' || faultData.safetyRisk === 'critical' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-safety-rustLight text-safety-rust shrink-0">
                        Safety Check
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-ink-muted mt-1 leading-snug line-clamp-2">
                    {faultData.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Fault input */}
        <div className="space-y-1.5">
          <label htmlFor="custom-fault-input" className="text-sm font-semibold text-ink block">
            {COPY.step2Form.customFaultLabel}
          </label>
          <input
            id="custom-fault-input"
            type="text"
            placeholder={COPY.step2Form.customFaultPlaceholder}
            value={assessment.customFault || ''}
            onChange={(e) => updateAssessment({ customFault: e.target.value })}
            className="w-full px-3 py-2 rounded-brand border border-ink-border bg-white text-ink text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink block">
            {COPY.step2Form.severityLabel}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(COPY.step2Form.severities).map(([key, desc]) => {
              const isSelected = assessment.severity === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateAssessment({ severity: key })}
                  className={`p-2.5 rounded-brand border text-left text-xs transition-all ${
                    isSelected
                      ? 'border-brand bg-brand-tint text-brand-deep font-semibold'
                      : 'border-ink-border bg-white text-ink-muted hover:bg-brand-surfaceAlt'
                  }`}
                >
                  {desc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Safety Questions Checklist */}
        <div className="p-4 rounded-brand border border-ink-border/80 bg-brand-surface space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-safety-rust" />
            <h3 className="font-heading font-bold text-sm text-ink">
              {COPY.step2Form.safetyQuestionsTitle}
            </h3>
          </div>
          <p className="text-xs text-ink-muted">
            {COPY.step2Form.safetyQuestionsSubtitle}
          </p>

          <div className="space-y-2">
            {COPY.step2Form.safetyChecklist.map((item) => {
              const isChecked = Boolean(assessment.safetyChecks?.[item.id]);

              return (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 text-xs text-ink cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => updateAssessment({
                      safetyChecks: {
                        [item.id]: e.target.checked,
                      },
                    })}
                    className="rounded border-ink-border text-safety-rust focus:ring-safety-rust w-4 h-4"
                  />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-4 py-2 rounded-brand font-medium text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{COPY.common.back}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="px-6 py-2.5 rounded-brand font-bold text-xs bg-action-amber hover:bg-action-amberHover text-ink hover:text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>{COPY.step2Form.nextButton}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Step 3: Capability & Tools
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-heading font-extrabold text-2xl text-ink">
          {COPY.step3Form.title}
        </h2>
        <p className="text-sm text-ink-muted">
          {COPY.step3Form.subtitle}
        </p>
      </div>

      {/* User Skill Level */}
      <div className="space-y-2.5">
        <label className="text-sm font-semibold text-ink block">
          {COPY.step3Form.skillLabel}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COPY.step3Form.skillLevels.map((lvl) => {
            const isSelected = Number(assessment.userSkill) === lvl.level;

            return (
              <button
                key={lvl.level}
                type="button"
                onClick={() => updateAssessment({ userSkill: lvl.level })}
                className={`p-4 rounded-brand border text-left transition-all ${
                  isSelected
                    ? 'border-brand bg-brand-tint text-brand-deep ring-2 ring-brand/20 shadow-xs'
                    : 'border-ink-border bg-white hover:bg-brand-surfaceAlt text-ink'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading font-bold text-sm text-ink">
                    {lvl.title}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-brand" />}
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {lvl.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Tools Check */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-ink block">
          {COPY.step3Form.toolsLabel}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateAssessment({ hasBasicTools: true })}
            className={`p-3.5 rounded-brand border text-left text-xs transition-all ${
              assessment.hasBasicTools
                ? 'border-brand bg-brand-tint text-brand-deep font-semibold'
                : 'border-ink-border bg-white text-ink-muted hover:bg-brand-surfaceAlt'
            }`}
          >
            <span className="font-bold text-sm block mb-0.5">{COPY.step3Form.toolsYes}</span>
            <span className="text-ink-muted text-[11px]">{COPY.step3Form.toolsHint}</span>
          </button>

          <button
            type="button"
            onClick={() => updateAssessment({ hasBasicTools: false })}
            className={`p-3.5 rounded-brand border text-left text-xs transition-all ${
              !assessment.hasBasicTools
                ? 'border-brand bg-brand-tint text-brand-deep font-semibold'
                : 'border-ink-border bg-white text-ink-muted hover:bg-brand-surfaceAlt'
            }`}
          >
            <span className="font-bold text-sm block mb-0.5">{COPY.step3Form.toolsNo}</span>
            <span className="text-ink-muted text-[11px]">Engine accounts for ~$15 tool acquisition cost</span>
          </button>
        </div>
      </div>

      {/* Available Time */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-ink block">
          {COPY.step3Form.timeAvailableLabel}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {Object.entries(COPY.step3Form.timeOptions).map(([key, label]) => {
            const isSelected = assessment.timeAvailable === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateAssessment({ timeAvailable: key })}
                className={`p-3 rounded-brand border text-left text-xs transition-all ${
                  isSelected
                    ? 'border-brand bg-brand-tint text-brand-deep font-semibold'
                    : 'border-ink-border bg-white text-ink-muted hover:bg-brand-surfaceAlt'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation CTAs: Generate Decision Matrix */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="px-4 py-2 rounded-brand font-medium text-xs text-ink-muted hover:text-ink flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{COPY.common.back}</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/verdict')}
          className="px-6 py-3 rounded-brand font-bold text-sm bg-action-amber hover:bg-action-amberHover text-ink hover:text-white shadow-amber-glow transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-ink group-hover:fill-white" />
          <span>{COPY.step3Form.calculateButton}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Stepper Bar */}
      <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />

      {/* Step Container Card */}
      <div className="bg-white rounded-brand-lg border border-ink-border/80 shadow-subtle p-6 sm:p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
}
