import React from 'react';
import { Info, Leaf, Heart } from 'lucide-react';
import { COPY } from '../../copy/en.js';
import { APP_CONFIG } from '../../config/app.config.js';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-border/60 bg-brand-surface py-10 px-4 sm:px-6 text-sm text-ink-muted">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Honest Estimate Callout */}
        <div className="rounded-brand bg-white p-4 border border-ink-border/70 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink uppercase tracking-wider block mb-0.5">
              Honest Data Transparency
            </span>
            {COPY.common.estimateDisclaimer} Every item is different, and local labor rates or parts availability may vary. Use our interactive slider tool to adapt the math to your exact location.
          </div>
        </div>

        {/* Footer Meta & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-ink-border/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-ink">
              {APP_CONFIG.appName}
            </span>
            <span>•</span>
            <span>{APP_CONFIG.round}</span>
            <span>•</span>
            <span>24 Oct 2026</span>
          </div>

          <div className="flex items-center gap-1 text-ink-faint">
            <span>Built for sustainable consumption with</span>
            <Leaf className="w-3.5 h-3.5 text-brand inline" />
            <span>and zero commercial nudges.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
