import React from 'react';
import { Check } from 'lucide-react';

export function Stepper({
  steps = [],
  currentStep = 1,
  onStepClick = null,
  className = '',
}) {
  return (
    <nav aria-label="Progress" className={`w-full py-4 ${className}`}>
      <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <li key={step.number || stepNum} className="relative">
              <button
                type="button"
                disabled={!onStepClick || (!isCompleted && !isCurrent)}
                onClick={() => onStepClick && onStepClick(stepNum)}
                className={`w-full text-left transition-all ${
                  onStepClick && (isCompleted || isCurrent) ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Step indicator bar */}
                <div
                  className={`h-1.5 w-full rounded-full transition-colors mb-2 ${
                    isCompleted
                      ? 'bg-green'
                      : isCurrent
                      ? 'bg-amber'
                      : 'bg-ink-border/50'
                  }`}
                />

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-green text-white'
                        : isCurrent
                        ? 'bg-deepGreen text-white ring-2 ring-deepGreen/20'
                        : 'bg-brand-surfaceAlt text-ink-muted'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : stepNum}
                  </span>

                  <span
                    className={`text-xs font-medium truncate ${
                      isCurrent
                        ? 'text-deepGreen font-bold'
                        : isCompleted
                        ? 'text-ink font-semibold'
                        : 'text-ink-muted'
                    }`}
                  >
                    {step.shortTitle || step.title || `Step ${stepNum}`}
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
