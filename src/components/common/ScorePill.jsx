import React from 'react';

export function ScorePill({ score, size = 'md', isWinner = false }) {
  const num = Math.round(score);

  let bgClass = 'bg-brand-surfaceAlt text-ink';
  let ringClass = 'border-ink-border';

  if (num >= 80) {
    bgClass = isWinner ? 'bg-brand text-white' : 'bg-brand/10 text-brand-deep';
    ringClass = 'border-brand/30';
  } else if (num >= 60) {
    bgClass = 'bg-brand-deep/10 text-brand-deep';
    ringClass = 'border-brand-deep/20';
  } else if (num >= 40) {
    bgClass = 'bg-action-amberLight text-action-amberHover';
    ringClass = 'border-action-amber/30';
  } else {
    bgClass = 'bg-ink-border/40 text-ink-muted';
    ringClass = 'border-ink-border';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-sm px-2.5 py-1 font-bold',
    lg: 'text-lg px-3.5 py-1.5 font-extrabold',
    xl: 'text-2xl px-4 py-2 font-black',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-brand-pill border font-heading ${sizeClasses[size] || sizeClasses.md} ${bgClass} ${ringClass} transition-colors`}
      aria-label={`Score: ${num} out of 100`}
    >
      <span>{num}</span>
      <span className="text-[10px] font-body font-normal opacity-70">/100</span>
    </div>
  );
}
