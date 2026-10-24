import React from 'react';
import { Check } from 'lucide-react';
import { COPY } from '../../copy/en.js';

export function Stepper({ currentStep = 1, onStepClick = null }) {
  const steps = [
    COPY.steps.step1,
    COPY.steps.step2,
    COPY.steps.step3,
    COPY.steps.step4,
  ];

  return (
    <nav aria-label="Progress" className="w-full py-4">
      <ol className="grid grid-cols-4 gap-2 sm:gap-4">
        {steps.map((s, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <li key={s.number} className="relative">
              <button
                type="button"
                disabled={!onStepClick || (!isCompleted && !isCurrent)}
                onClick={() => onStepClick && onStepClick(stepNum)}
                className={`w-full text-left transition-all group ${
                  onStepClick && (isCompleted || isCurrent) ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Step Bar indicator */}
                <div
                  className={`h-1.5 w-full rounded-full transition-colors mb-2 ${
                    isCompleted
                      ? 'bg-brand'
                      : isCurrent
                      ? 'bg-action-amber'
                      : 'bg-ink-border/50'
                  }`}
                />

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-brand text-white'
                        : isCurrent
                        ? 'bg-brand-deep text-white ring-2 ring-brand-deep/20'
                        : 'bg-brand-surfaceAlt text-ink-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : s.number}
                  </span>

                  <span
                    className={`text-xs font-medium truncate ${
                      isCurrent
                        ? 'text-brand-deep font-bold'
                        : isCompleted
                        ? 'text-ink font-semibold'
                        : 'text-ink-muted'
                    }`}
                  >
                    {s.shortTitle}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
