import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  color = 'green',
  label = '',
  showValue = false,
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colors = {
    green: 'bg-green',
    deepGreen: 'bg-deepGreen',
    amber: 'bg-amber',
    rust: 'bg-rust',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs mb-1 text-ink-muted">
          {label && <span className="font-medium text-ink">{label}</span>}
          {showValue && <span className="font-mono font-semibold">{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        className="h-2 w-full bg-ink-border/40 rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors[color] || colors.green}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
