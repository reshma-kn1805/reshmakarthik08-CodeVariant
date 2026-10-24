import React, { useState } from 'react';
import { Info, Lock } from 'lucide-react';

/**
 * MatrixHeatmap: Interactive heatmap of options × factors
 * with dynamic factor weights in column headers and hover reasons on every cell.
 * Zero buttons — 100% hover & focus accessible data grid.
 */
export function MatrixHeatmap({
  options = [],
  weights = {},
  gated = false,
  className = '',
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const factorDefs = [
    { key: 'cost', label: 'Cost', defaultWeight: '30%' },
    { key: 'practicality', label: 'Practicality', defaultWeight: '20%' },
    { key: 'remainingLife', label: 'Life Added', defaultWeight: '15%' },
    { key: 'environment', label: 'Environment', defaultWeight: '15%' },
    { key: 'safety', label: 'Safety', defaultWeight: '10%' },
    { key: 'effort', label: 'Effort', defaultWeight: '10%' },
  ];

  const getHeatmapColor = (rating, isOptionGated) => {
    if (isOptionGated && rating === 0) {
      return 'bg-safety-rustLight text-safety-rust font-bold border-safety-rust/40';
    }
    if (rating >= 8) {
      return 'bg-emerald-100/90 text-emerald-900 font-bold border-emerald-200/80';
    }
    if (rating >= 5) {
      return 'bg-amber-100/80 text-amber-900 font-bold border-amber-200/80';
    }
    return 'bg-stone-100 text-stone-700 font-medium border-stone-200/80';
  };

  return (
    <div className={`p-5 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle space-y-4 select-none overflow-x-auto ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-ink-border/40 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen block">
            The Decision Matrix • Heatmap View
          </span>
          <h3 className="font-heading font-extrabold text-xl text-ink">
            Options × Factors Multi-Dimensional Matrix
          </h3>
        </div>
        <span className="text-xs text-ink-muted">
          Hover any cell to inspect scoring reasoning
        </span>
      </div>

      {/* Heatmap Table */}
      <table className="w-full text-left border-collapse min-w-[620px]">
        <thead>
          <tr className="border-b border-ink-border/60">
            <th className="py-2.5 px-3 text-xs font-mono font-bold uppercase text-ink-muted">
              Option
            </th>
            {factorDefs.map((f) => {
              const weightVal = weights[f.key] ? `${Math.round(weights[f.key])}%` : f.defaultWeight;
              return (
                <th key={f.key} className="py-2.5 px-3 text-center text-xs font-mono">
                  <span className="font-bold text-ink block">{f.label}</span>
                  <span className="text-[10px] text-amber font-bold block">
                    {f.key === 'safety' ? '10% Lock' : weightVal}
                  </span>
                </th>
              );
            })}
            <th className="py-2.5 px-3 text-right text-xs font-mono font-bold uppercase text-ink">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-border/30 text-xs">
          {options.map((opt, optIdx) => {
            const isDiy = ['repair', 'diy_repair', 'reuse', 'repurpose'].includes(opt.id);
            const isOptionGated = gated && isDiy;

            return (
              <tr key={opt.id} className="hover:bg-brand-surfaceAlt/25 transition-colors">
                {/* Option Name & Lock Tag */}
                <td className="py-3 px-3 font-semibold text-ink flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-surfaceAlt text-ink-faint font-mono text-[10px] flex items-center justify-center shrink-0">
                    {optIdx + 1}
                  </span>
                  <div>
                    <span className="font-bold block leading-tight">{opt.name}</span>
                    {isOptionGated && (
                      <span className="text-[9px] font-mono text-safety-rust font-bold flex items-center gap-0.5 mt-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        Gated
                      </span>
                    )}
                  </div>
                </td>

                {/* Factor Cells with Heatmap styling & Hover reason */}
                {factorDefs.map((f) => {
                  const factorData = opt.factors?.[f.key] || {};
                  const rating = typeof factorData.rating === 'number' ? factorData.rating : 5;
                  const reason = factorData.reason || opt.verdictSummary || 'Standard calculation';
                  const cellId = `${opt.id}-${f.key}`;
                  const isHovered = activeTooltip?.id === cellId;

                  return (
                    <td
                      key={f.key}
                      className="py-2 px-2 text-center relative"
                      onMouseEnter={() =>
                        setActiveTooltip({
                          id: cellId,
                          option: opt.name,
                          factor: f.label,
                          rating,
                          reason,
                        })
                      }
                      onMouseLeave={() => setActiveTooltip(null)}
                    >
                      <div
                        className={`mx-auto w-10 h-7 rounded border flex items-center justify-center cursor-help transition-transform hover:scale-110 font-mono text-xs tabular-nums ${getHeatmapColor(
                          rating,
                          isOptionGated
                        )}`}
                      >
                        {isOptionGated && rating === 0 ? '0' : rating}
                      </div>

                      {/* Tooltip on cell hover */}
                      {isHovered && (
                        <div className="absolute z-40 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-brand bg-ink text-white shadow-elevated text-left pointer-events-none">
                          <div className="flex items-center justify-between text-[10px] font-mono text-amber border-b border-white/20 pb-1 mb-1">
                            <span>{opt.name}</span>
                            <span>{f.label}: {rating}/10</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-white/90">
                            {reason}
                          </p>
                        </div>
                      )}
                    </td>
                  );
                })}

                {/* Total Score */}
                <td className="py-3 px-3 text-right font-mono font-black text-sm text-deepGreen tabular-nums">
                  {opt.score}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Heatmap Color Scale Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-ink-border/30 text-[11px] font-mono text-ink-muted">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase font-bold text-ink-faint">Rating Scale:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 inline-block" />
            <span>8–10 High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 inline-block" />
            <span>5–7 Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-stone-100 border border-stone-300 inline-block" />
            <span>1–4 Low</span>
          </div>
        </div>
        <span>Weights normalized to 100% (Safety locked at 10%)</span>
      </div>
    </div>
  );
}
