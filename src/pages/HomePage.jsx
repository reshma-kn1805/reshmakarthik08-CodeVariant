import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Sliders,
  Leaf,
  Wrench,
  Share2,
  Layers,
  ShoppingBag,
  Recycle,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { COPY } from '../copy/en.js';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { JudgeDemosModal } from '../components/modals/JudgeDemosModal.jsx';

export function HomePage() {
  const navigate = useNavigate();
  const { rules, loadDemo } = useAssessment();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleStartFresh = () => {
    navigate('/assess');
  };

  const handleRunDemo = (demoId) => {
    loadDemo(demoId);
    navigate('/verdict');
  };

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-tint border border-brand/20 text-brand-deep text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-action-amber fill-action-amber" />
          <span>{COPY.hero.eyebrow}</span>
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-ink tracking-tight leading-[1.12]">
          {COPY.hero.title}
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          {COPY.hero.subtitle}
        </p>

        {/* Primary and Secondary CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleStartFresh}
            className="w-full sm:w-auto px-6 py-3.5 rounded-brand font-bold text-sm bg-action-amber hover:bg-action-amberHover text-ink hover:text-white shadow-amber-glow transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{COPY.hero.ctaPrimary}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => setShowDemoModal(true)}
            className="w-full sm:w-auto px-5 py-3.5 rounded-brand font-semibold text-sm bg-white hover:bg-brand-surfaceAlt text-brand-deep border border-ink-border transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-subtle"
          >
            <Sparkles className="w-4 h-4 text-action-amber fill-action-amber" />
            <span>{COPY.hero.ctaSecondary}</span>
          </button>
        </div>

        {/* Stats strip */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {COPY.hero.stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-brand bg-white border border-ink-border/70 shadow-xs text-left"
            >
              <div className="font-heading font-extrabold text-2xl text-brand-deep">
                {stat.value}
              </div>
              <div className="text-xs text-ink-muted mt-1 leading-snug">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 30-Second Judge Quick-Test Showcase */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-brand-lg border border-brand/30 bg-gradient-to-b from-brand-tint/60 to-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-brand-deep tracking-wider block mb-1">
                30-Second Judge Evaluation
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-ink">
                Instant Real-World Test Cases
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Click any preloaded scenario to evaluate the mathematical engine, safety flags, and actionable guidance in one click:
              </p>
            </div>

            <button
              onClick={() => setShowDemoModal(true)}
              className="px-3.5 py-1.5 rounded-brand text-xs font-semibold bg-brand-deep text-white hover:bg-brand transition-colors shrink-0"
            >
              View All 4 Scenarios
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {rules.judgeDemos?.map((demo) => {
              const isSafety = demo.id === 'demo_microwave_safety';
              return (
                <div
                  key={demo.id}
                  onClick={() => handleRunDemo(demo.id)}
                  className={`cursor-pointer p-4 rounded-brand border transition-all text-left flex flex-col justify-between group ${
                    isSafety
                      ? 'bg-safety-rustLight/30 border-safety-rustBorder/50 hover:border-safety-rust hover:shadow-subtle'
                      : 'bg-white border-ink-border/80 hover:border-brand hover:shadow-subtle'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-ink-faint">
                        {demo.category.replace('_', ' ')}
                      </span>
                      {isSafety && (
                        <AlertTriangle className="w-3.5 h-3.5 text-safety-rust" />
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-sm text-ink group-hover:text-brand-deep transition-colors">
                      {demo.title}
                    </h3>
                    <p className="text-xs text-ink-muted line-clamp-2">
                      {demo.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-ink-border/40 flex items-center justify-between text-xs font-semibold text-brand-deep">
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      Run Engine →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The 5-R Framework Grid */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-brand uppercase tracking-wider">
            The Product Is The Process
          </span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink">
            5 Paths Evaluated In Parallel
          </h2>
          <p className="text-sm text-ink-muted">
            Most apps nudge you straight to an affiliate link to buy something new. "Fix It First" puts all 5 circular options on an equal, rigorous footing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Repair DIY */}
          <div className="p-5 rounded-brand bg-white border border-ink-border/70 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-brand bg-brand-tint text-brand-deep flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink">1. Repair (DIY)</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Step-by-step disassembly guides, parts lookup, required tools, and estimated workbench minutes. Zero labor markup.
            </p>
          </div>

          {/* 2. Repair Pro */}
          <div className="p-5 rounded-brand bg-white border border-ink-border/70 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-brand bg-brand-tint text-brand-deep flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink">2. Repair (Professional)</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Benchmark labor rates against item replacement value. Includes warranty checklists for local independent repair technicians.
            </p>
          </div>

          {/* 3. Reuse */}
          <div className="p-5 rounded-brand bg-white border border-ink-border/70 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-brand bg-brand-tint text-brand-deep flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink">3. Reuse & Pass Along</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Secondary workarounds, maker space donations, and re-homing items that still have life left in them for zero dollars.
            </p>
          </div>

          {/* 4. Repurpose */}
          <div className="p-5 rounded-brand bg-white border border-ink-border/70 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-brand bg-brand-tint text-brand-deep flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink">4. Repurpose & Upcycle</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Clever upcycling recipes tailored to each category. Turn broken denim into market totes, or tired tablets into wall screens.
            </p>
          </div>

          {/* 5. Replace */}
          <div className="p-5 rounded-brand bg-white border border-ink-border/70 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-brand bg-brand-tint text-brand-deep flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink">5. Replace (Honest Comparison)</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Evaluated fairly: calculates the real total cost of ownership and new embodied carbon penalty before you pull the trigger.
            </p>
          </div>

          {/* 6. Recycle */}
          <div className="p-5 rounded-brand bg-white border border-ink-border/70 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-brand bg-brand-tint text-brand-deep flex items-center justify-center">
              <Recycle className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink">6. Safe Recycle & E-Waste</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Safe decommissioning protocols: lithium battery isolation, data wipe guidance, and precious metal recovery drop-offs.
            </p>
          </div>
        </div>
      </section>

      {/* Demos Modal */}
      {showDemoModal && (
        <JudgeDemosModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
}
