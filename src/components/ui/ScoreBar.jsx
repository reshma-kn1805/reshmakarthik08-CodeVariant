import React from 'react';

export function ScoreBar({
  label,
  score = 0,
  description = '',
  className = '',
}) {
  const num = Math.min(100, Math.max(0, Math.round(score)));

  let colorClass = 'bg-green';
  let textClass = 'text-green';

  if (num >= 75) {
    colorClass = 'bg-green';
    textClass = 'text-green';
  } else if (num >= 50) {
    colorClass = 'bg-deepGreen';
    textClass = 'text-deepGreen';
  } else if (num >= 35) {
    colorClass = 'bg-amber';
    textClass = 'text-action-amberHover';
  } else {
    colorClass = 'bg-rust';
    textClass = 'text-rust';
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-ink">{label}</span>
        <span className={`font-mono font-bold ${textClass}`}>
          {num}<span className="text-[10px] text-ink-faint font-normal">/100</span>
        </span>
      </div>

      <div className="h-1.5 w-full bg-ink-border/40 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${num}%` }}
        />
      </div>

      {description && (
        <p className="text-[11px] text-ink-muted leading-tight mt-0.5">{description}</p>
      )}
    </div>
  );
}
