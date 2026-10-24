import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ArrowRight, ShieldAlert, DollarSign, Wrench } from 'lucide-react';
import { useAssessment } from '../../state/AssessmentContext.jsx';
import { COPY } from '../../copy/en.js';

export function JudgeDemosModal({ onClose }) {
  const { rules, loadDemo } = useAssessment();
  const navigate = useNavigate();

  const handleSelectDemo = (demoId) => {
    loadDemo(demoId);
    onClose();
    navigate('/verdict');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-brand-lg shadow-elevated border border-ink-border overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-brand-surface border-b border-ink-border/60 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-brand bg-action-amberLight text-action-amberHover flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-action-amber" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-ink">
                {COPY.judgeDemosModal.title}
              </h2>
              <p className="text-xs text-ink-muted">
                {COPY.judgeDemosModal.subtitle}
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

        {/* Demos List */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {rules.judgeDemos?.map((demo) => {
            const isSafetyDemo = demo.id === 'demo_microwave_safety';

            return (
              <div
                key={demo.id}
                onClick={() => handleSelectDemo(demo.id)}
                className={`group cursor-pointer p-4 rounded-brand border transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSafetyDemo
                    ? 'border-safety-rustBorder/60 hover:border-safety-rust bg-safety-rustLight/20 hover:bg-safety-rustLight/50'
                    : 'border-ink-border/80 hover:border-brand bg-white hover:bg-brand-surface'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isSafetyDemo ? (
                      <ShieldAlert className="w-4 h-4 text-safety-rust shrink-0" />
                    ) : (
                      <Wrench className="w-4 h-4 text-brand shrink-0" />
                    )}
                    <h3 className="font-heading font-bold text-sm text-ink group-hover:text-brand-deep transition-colors">
                      {demo.title}
                    </h3>
                  </div>

                  <p className="text-xs text-ink-muted mt-1">
                    {demo.subtitle}
                  </p>

                  <div className="mt-2 text-[11px] text-ink-faint font-medium flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand"></span>
                    <span>{demo.highlightNote}</span>
                  </div>
                </div>

                <span
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-brand text-xs font-semibold bg-action-amber text-ink group-hover:bg-action-amberHover hover:text-white transition-colors shrink-0 shadow-xs"
                >
                  <span>{COPY.judgeDemosModal.buttonLoad}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-brand-surface border-t border-ink-border/60 flex items-center justify-between text-xs text-ink-muted">
          <span>Zero login required • Computes in &lt;10ms</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium text-ink-muted hover:text-ink"
          >
            {COPY.common.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
