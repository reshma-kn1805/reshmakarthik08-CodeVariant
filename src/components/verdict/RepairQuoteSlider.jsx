import React from 'react';
import { Sliders, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

/**
 * RepairQuoteSlider: Interactive "What if the repair quote changes?" slider
 * that re-ranks live and shows the exact flip point / tipping point.
 * Zero buttons — 100% slider & live numerical feedback.
 */
export function RepairQuoteSlider({
  currentRepairCost = 250,
  replaceCost = 3500,
  tipPoint = null,
  onCostChange,
  className = '',
}) {
  const maxQuote = Math.max(Math.ceil(replaceCost * 1.3), 5000);
  const threshold = tipPoint?.thresholdRupees || null;
  const isAboveThreshold = threshold !== null && currentRepairCost >= threshold;
  const buffer = threshold !== null ? threshold - currentRepairCost : null;

  return (
    <div className={`p-4 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle space-y-3 select-none ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber/20 text-amber flex items-center justify-center shrink-0">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber block">
              Interactive Sensitivity Analysis
            </span>
            <h4 className="font-heading font-bold text-sm text-ink leading-tight">
              What if the repair quote changes?
            </h4>
          </div>
        </div>

        {/* Live quote readout */}
        <div className="text-right">
          <span className="text-[10px] font-mono text-ink-muted block uppercase">Current Quote</span>
          <span className="font-mono font-black text-base text-ink tabular-nums">
            ₹{Number(currentRepairCost).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-1 pt-1">
        <input
          id="repair-quote-sensitivity-slider"
          type="range"
          min="0"
          max={maxQuote}
          step="50"
          value={currentRepairCost}
          onChange={(e) => onCostChange && onCostChange(Number(e.target.value))}
          className="w-full accent-action-amber cursor-pointer"
          aria-label="What if the repair quote changes slider"
        />

        <div className="flex justify-between text-[10px] font-mono text-ink-faint">
          <span>₹0 (DIY parts only)</span>
          {threshold && (
            <span className="text-amber font-bold">
              Flip Point: ₹{threshold.toLocaleString('en-IN')}
            </span>
          )}
          <span>₹{maxQuote.toLocaleString('en-IN')} (Max)</span>
        </div>
      </div>

      {/* Live Flip Point Callout */}
      {threshold && (
        <div
          className={`p-2.5 rounded-brand border text-xs flex items-center justify-between gap-2 transition-colors ${
            isAboveThreshold
              ? 'bg-amber/15 border-amber text-ink font-medium'
              : 'bg-tint border-green/20 text-deepGreen'
          }`}
        >
          <div className="flex items-center gap-2">
            {isAboveThreshold ? (
              <AlertTriangle className="w-4 h-4 text-amber shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
            )}
            <span className="leading-snug">
              {isAboveThreshold ? (
                <>
                  <strong>Flip threshold crossed:</strong> At ₹{currentRepairCost.toLocaleString('en-IN')}, switching to{' '}
                  <strong className="underline capitalize">{tipPoint.newWinner}</strong> becomes higher-ranked!
                </>
              ) : (
                <>
                  <strong>Economical fix:</strong> You have a{' '}
                  <strong>₹{buffer?.toLocaleString('en-IN')} buffer</strong> before{' '}
                  <span className="capitalize">{tipPoint.newWinner}</span> overtakes as #1.
                </>
              )}
            </span>
          </div>

          <span className="font-mono font-bold text-[11px] shrink-0 hidden sm:inline">
            Tipping: ₹{threshold.toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </div>
  );
}
