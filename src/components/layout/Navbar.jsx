import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wrench, Sparkles, RotateCcw, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { COPY } from '../../copy/en.js';
import { useAssessment } from '../../state/AssessmentContext.jsx';
import { JudgeDemosModal } from '../modals/JudgeDemosModal.jsx';
import { WhatChangedModal } from '../modals/WhatChangedModal.jsx';

export function Navbar() {
  const location = useLocation();
  const { assessment, resetAssessment } = useAssessment();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showWhatChanged, setShowWhatChanged] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-ink-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-brand-deep hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-brand"
          >
            <div className="w-9 h-9 rounded-brand bg-brand flex items-center justify-center text-white shadow-sm">
              <Wrench className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl text-brand-deep tracking-tight block leading-none">
                {COPY.common.appName}
              </span>
              <span className="text-[10px] text-ink-muted uppercase font-semibold tracking-wider block mt-0.5">
                Decision Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation: Assess, History, The Matrix */}
          <nav className="flex items-center gap-1 text-sm font-medium text-ink">
            <Link
              to="/assess"
              className={`px-3 py-1.5 rounded-brand transition-colors ${
                isActive('/assess')
                  ? 'bg-tint text-deepGreen font-bold'
                  : 'hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink'
              }`}
            >
              Assess
            </Link>

            <Link
              to="/history"
              className={`px-3 py-1.5 rounded-brand transition-colors flex items-center gap-1.5 ${
                isActive('/history')
                  ? 'bg-tint text-deepGreen font-bold'
                  : 'hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-green" />
              <span>History</span>
            </Link>

            <Link
              to="/verdict"
              className={`hidden sm:flex px-3 py-1.5 rounded-brand transition-colors items-center gap-1.5 ${
                isActive('/verdict')
                  ? 'bg-tint text-deepGreen font-bold'
                  : 'hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink'
              }`}
            >
              <span>Verdict</span>
            </Link>

            <Link
              to="/explore"
              className={`hidden sm:flex px-3 py-1.5 rounded-brand transition-colors items-center gap-1.5 ${
                isActive('/explore')
                  ? 'bg-tint text-deepGreen font-bold'
                  : 'hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink'
              }`}
            >
              <Layers className="w-4 h-4 text-green" />
              <span>The Matrix</span>
            </Link>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2">
            {/* Canvas Mode Chip (Phase 7 requirement) */}
            <button
              type="button"
              onClick={() => setShowWhatChanged(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber/20 hover:bg-amber/30 text-ink border border-amber/50 font-mono text-[11px] font-bold shadow-xs transition-all cursor-pointer"
              title="Learn about The Canvas Protocol"
            >
              <Sparkles className="w-3 h-3 text-amber fill-amber" />
              <span>Canvas Mode</span>
            </button>

            {/* Judge Demo Quick Launcher: Essential for 30s judging */}
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-brand bg-brand-surfaceAlt hover:bg-brand-tint text-brand-deep border border-brand/20 text-xs font-semibold shadow-xs transition-colors"
              title="Preload real-world test scenarios in 1 click"
            >
              <Sparkles className="w-3.5 h-3.5 text-action-amber fill-action-amber" />
              <span className="hidden sm:inline">Judge Demos</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-deep text-white">30s</span>
            </button>

            {/* Reset button */}
            <button
              onClick={resetAssessment}
              title={COPY.common.reset}
              className="p-1.5 text-ink-faint hover:text-ink-muted hover:bg-brand-surfaceAlt rounded-brand transition-colors"
              aria-label={COPY.common.reset}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Judge Demos Modal */}
      {showDemoModal && (
        <JudgeDemosModal onClose={() => setShowDemoModal(false)} />
      )}

      {/* What Changed Modal (Phase 7 requirement) */}
      {showWhatChanged && (
        <WhatChangedModal onClose={() => setShowWhatChanged(false)} />
      )}
    </>
  );
}
