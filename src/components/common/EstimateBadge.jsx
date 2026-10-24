import React from 'react';
import { COPY } from '../../copy/en.js';

export function EstimateBadge({ className = '' }) {
  return (
    <span
      title={COPY.common.estimateDisclaimer}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-surfaceAlt text-ink-muted border border-ink-border/50 uppercase tracking-wider select-none ${className}`}
    >
      {COPY.common.estimateBadge}
    </span>
  );
}
