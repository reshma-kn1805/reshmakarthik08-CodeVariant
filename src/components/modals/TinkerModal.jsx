import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Check, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { useAssessment } from '../../state/AssessmentContext.jsx';
import { COPY } from '../../copy/en.js';
import { EstimateBadge } from '../common/EstimateBadge.jsx';

export function TinkerModal({ onClose }) {
  const { assessment, applyOverrides, resetOverrides, decisionResult } = useAssessment();

  const currentOverrides = assessment.overrides || {};
  const defaultReplacement = decisionResult.analytics.replacementCost;
  const defaultParts = assessment.overrides?.partsCostEstimate ?? decisionResult.fault?.partsCostEstimate ?? 15;
  const defaultProRate = assessment.overrides?.proLaborHourly ?? 50;
  const defaultSkill = assessment.overrides?.userSkillLevel ?? assessment.userSkill ?? 2;
  const defaultYears = assessment.overrides?.expectedAddedYears ?? Math.round((decisionResult.item?.typicalLifespanYears || 5) * 0.6);
  const defaultHasTools = assessment.overrides?.hasTools ?? assessment.hasBasicTools ?? true;

  const [replacementCost, setReplacementCost] = useState(currentOverrides.replacementCost ?? defaultReplacement);
  const [partsCostEstimate, setPartsCostEstimate] = useState(currentOverrides.partsCostEstimate ?? defaultParts);
  const [proLaborHourly, setProLaborHourly] = useState(currentOverrides.proLaborHourly ?? defaultProRate);
  const [userSkillLevel, setUserSkillLevel] = useState(currentOverrides.userSkillLevel ?? defaultSkill);
  const [expectedAddedYears, setExpectedAddedYears] = useState(currentOverrides.expectedAddedYears ?? defaultYears);
  const [hasTools, setHasTools] = useState(currentOverrides.hasTools ?? defaultHasTools);

  const handleApply = (e) => {
    e.preventDefault();
    applyOverrides({
      replacementCost: Number(replacementCost),
      partsCostEstimate: Number(partsCostEstimate),
      proLaborHourly: Number(proLaborHourly),
      userSkillLevel: Number(userSkillLevel),
      expectedAddedYears: Number(expectedAddedYears),
      hasTools: Boolean(hasTools),
    });
    onClose();
  };

  const handleReset = () => {
    resetOverrides();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-brand-lg shadow-elevated border border-ink-border overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-brand-surface border-b border-ink-border/60 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-brand bg-brand-tint text-brand-deep flex items-center justify-center">
              <Sliders className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-lg text-ink">
                  {COPY.tinkerModal.title}
                </h2>
                <EstimateBadge />
              </div>
              <p className="text-xs text-ink-muted">
                {COPY.tinkerModal.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-brand text-ink-faint hover:text-ink hover:bg-brand-surfaceAlt transition-colors"
            aria-label={COPY.common.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Form */}
        <form onSubmit={handleApply} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-sm">
          {/* Replacement Cost Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="replace-cost-slider" className="font-medium text-ink">
                {COPY.tinkerModal.replacementCost}
              </label>
              <span className="font-mono font-bold text-brand-deep bg-brand-surfaceAlt px-2 py-0.5 rounded text-xs">
                ${replacementCost}
              </span>
            </div>
            <input
              id="replace-cost-slider"
              type="range"
              min="20"
              max="1500"
              step="10"
              value={replacementCost}
              onChange={(e) => setReplacementCost(Number(e.target.value))}
              className="w-full accent-action-amber cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-ink-faint mt-0.5">
              <span>$20</span>
              <span>$750</span>
              <span>$1,500+</span>
            </div>
          </div>

          {/* Parts Cost Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="parts-cost-slider" className="font-medium text-ink">
                {COPY.tinkerModal.repairPartsCost}
              </label>
              <span className="font-mono font-bold text-brand-deep bg-brand-surfaceAlt px-2 py-0.5 rounded text-xs">
                ${partsCostEstimate}
              </span>
            </div>
            <input
              id="parts-cost-slider"
              type="range"
              min="0"
              max="300"
              step="5"
              value={partsCostEstimate}
              onChange={(e) => setPartsCostEstimate(Number(e.target.value))}
              className="w-full accent-action-amber cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-ink-faint mt-0.5">
              <span>$0 (clean only)</span>
              <span>$150</span>
              <span>$300</span>
            </div>
          </div>

          {/* Pro Shop Labor Rate */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="pro-rate-slider" className="font-medium text-ink">
                {COPY.tinkerModal.proLaborHourly}
              </label>
              <span className="font-mono font-bold text-brand-deep bg-brand-surfaceAlt px-2 py-0.5 rounded text-xs">
                ${proLaborHourly}/hr
              </span>
            </div>
            <input
              id="pro-rate-slider"
              type="range"
              min="25"
              max="120"
              step="5"
              value={proLaborHourly}
              onChange={(e) => setProLaborHourly(Number(e.target.value))}
              className="w-full accent-action-amber cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-ink-faint mt-0.5">
              <span>$25/hr (local tinkerer)</span>
              <span>$50/hr (standard)</span>
              <span>$120/hr (certified)</span>
            </div>
          </div>

          {/* User Skill Level */}
          <div>
            <label className="font-medium text-ink block mb-1.5">
              {COPY.tinkerModal.userSkillLevel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { lvl: 1, label: '1 - Novice' },
                { lvl: 2, label: '2 - Handy' },
                { lvl: 3, label: '3 - Maker' },
              ].map(({ lvl, label }) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setUserSkillLevel(lvl)}
                  className={`py-1.5 px-2 rounded-brand border text-xs font-semibold text-center transition-colors ${
                    userSkillLevel === lvl
                      ? 'bg-brand-deep text-white border-brand-deep'
                      : 'bg-brand-surface hover:bg-brand-surfaceAlt text-ink-muted border-ink-border'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Lifespan Added */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="years-slider" className="font-medium text-ink">
                {COPY.tinkerModal.expectedAddedYears}
              </label>
              <span className="font-mono font-bold text-brand-deep bg-brand-surfaceAlt px-2 py-0.5 rounded text-xs">
                +{expectedAddedYears} yrs
              </span>
            </div>
            <input
              id="years-slider"
              type="range"
              min="1"
              max="10"
              step="1"
              value={expectedAddedYears}
              onChange={(e) => setExpectedAddedYears(Number(e.target.value))}
              className="w-full accent-action-amber cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-ink-border/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{COPY.tinkerModal.resetDefaults}</span>
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-brand bg-action-amber hover:bg-action-amberHover text-ink hover:text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Done</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
