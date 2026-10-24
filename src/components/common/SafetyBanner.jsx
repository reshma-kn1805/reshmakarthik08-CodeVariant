import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { COPY } from '../../copy/en.js';

export function SafetyBanner({ safety, onAcknowledge = null }) {
  if (!safety || !safety.isHazardous) return null;

  const isCritical = safety.severity === 'critical';

  return (
    <div
      role="alert"
      className="rounded-brand-md border p-4 bg-safety-rustLight border-safety-rustBorder text-safety-rust shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-white/70 text-safety-rust shrink-0 shadow-xs">
          {isCritical ? (
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          ) : (
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-bold text-base text-ink">
              {COPY.safety.alertTitle}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-safety-rust text-white uppercase tracking-wider">
              {isCritical ? 'High Hazard' : 'Precaution Required'}
            </span>
          </div>

          <p className="mt-1 text-sm text-ink leading-relaxed font-medium">
            {safety.warning}
          </p>

          <p className="mt-2 text-xs text-ink-muted">
            {COPY.safety.diyBlockedNotice}
          </p>

          {safety.flags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {safety.flags.map((flag, idx) => (
                <span
                  key={idx}
                  className="inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white/80 text-safety-rust border border-safety-rustBorder/40"
                >
                  {flag.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
