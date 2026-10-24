import React, { useEffect } from 'react';
import { X, Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import { COPY } from '../../copy/en.js';

export function WhatChangedModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { whatChangedTitle, whatChangedLines, chipLabel } = COPY.canvasProtocol;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={whatChangedTitle}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-brand-lg shadow-elevated border border-ink-border overflow-hidden p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ink-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-brand bg-amber/20 text-amber flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-amber text-amber" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber block">
                {chipLabel} Active
              </span>
              <h2 className="font-heading font-extrabold text-xl text-ink leading-snug">
                {whatChangedTitle}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-ink-faint hover:text-ink hover:bg-brand-surfaceAlt transition-colors"
            aria-label="Close dialog (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 lines text only from copy dictionary */}
        <div className="space-y-3 py-1">
          {whatChangedLines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-brand bg-brand-surfaceAlt/40 border border-ink-border/40">
              <span className="w-5 h-5 rounded-full bg-deepGreen text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs text-ink font-medium leading-relaxed">
                {line}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-ink-border/40 text-xs text-ink-muted font-mono">
          <span>Interaction Layer Re-architecture</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-brand bg-brand-deep text-white font-bold text-xs hover:bg-deepGreen transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
