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
  Compass,
} from 'lucide-react';
import { COPY } from '../copy/en.js';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { JudgeDemosModal } from '../components/modals/JudgeDemosModal.jsx';
import { Button, Card, Badge, PageContainer } from '../components/ui/index.js';
import examplesData from '../data/examples.json';

export function HomePage() {
  const navigate = useNavigate();
  const { rules, loadDemo, loadExample } = useAssessment();
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleStartFresh = () => {
    navigate('/assess');
  };

  const handleRunDemo = (demoId) => {
    loadDemo(demoId);
    navigate(`/verdict/${demoId}`);
  };

  const handleRunExample = (exampleId) => {
    const id = loadExample(exampleId);
    navigate(`/verdict/${id}`);
  };

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tint border border-green/20 text-deepGreen text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber fill-amber" />
          <span>Code Variant Build 01 • 12-Hour Live Round</span>
        </div>

        {/* Mandatory Heading: "Don't toss it. Decide it." */}
        <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-ink tracking-tight leading-[1.08]">
          Don't toss it.<br />
          <span className="text-deepGreen italic font-serif">Decide it.</span>
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
          Before you discard or replace a damaged item, see if it is truly worth fixing.
          Get a transparent, unbiased comparison across <strong>Repair, Reuse, Repurpose, Replace, and Recycle</strong> with net costs, carbon impact, and zero sponsored nudges to buy new.
        </p>

        {/* Primary CTA: "Assess an item" */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartFresh}
            className="w-full sm:w-auto"
          >
            <span>Assess an item</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowDemoModal(true)}
            className="w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 text-amber fill-amber" />
            <span>Try a 30-Second Judge Demo</span>
          </Button>
        </div>

        {/* Restrained Hand-Designed Stats Row */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-brand bg-white border border-ink-border/80 shadow-xs text-left">
            <span className="font-heading font-extrabold text-2xl text-deepGreen block">5-Way</span>
            <span className="text-xs text-ink-muted mt-0.5 block leading-snug">Parallel circular evaluation (Repair, Reuse, Repurpose, Replace, Recycle)</span>
          </div>
          <div className="p-4 rounded-brand bg-white border border-ink-border/80 shadow-xs text-left">
            <span className="font-heading font-extrabold text-2xl text-deepGreen block">100%</span>
            <span className="text-xs text-ink-muted mt-0.5 block leading-snug">Transparent and user-tunable cost & lifespan estimates</span>
          </div>
          <div className="p-4 rounded-brand bg-white border border-ink-border/80 shadow-xs text-left">
            <span className="font-heading font-extrabold text-2xl text-deepGreen block">0 sec</span>
            <span className="text-xs text-ink-muted mt-0.5 block leading-snug">No login, zero telemetry, runs pure math in your browser</span>
          </div>
        </div>
      </section>

      {/* Try an Example Row (Phase 2 Requirement) */}
      <section className="max-w-5xl mx-auto px-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-ink-border/50 pb-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-deep">
              <Sparkles className="w-3.5 h-3.5 text-action-amber fill-action-amber" />
              <span>Instant Test Scenarios</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-ink mt-0.5">
              Try an Example (1-Click Verdicts)
            </h2>
          </div>
          <span className="text-xs text-ink-muted">
            Jump straight into real-world scored decision matrices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examplesData.map((ex) => {
            const isSafety = ex.expectedWinner === 'recycle';
            const isRepair = ex.expectedWinner === 'repair';

            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleRunExample(ex.id)}
                className="p-5 rounded-brand-lg bg-white border border-ink-border/80 hover:border-brand/50 shadow-subtle hover:shadow-card transition-all text-left group cursor-pointer flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isSafety
                          ? 'bg-safety-rustLight text-safety-rust'
                          : isRepair
                          ? 'bg-brand-tint text-brand-deep'
                          : 'bg-action-amberLight text-action-amberHover'
                      }`}
                    >
                      {ex.badge}
                    </span>
                    <span className="text-xs font-mono text-ink-faint">1-click</span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-ink group-hover:text-brand-deep transition-colors">
                    {ex.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {ex.subtitle}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink-border/40 flex items-center justify-between text-xs font-semibold text-brand-deep group-hover:text-brand">
                  <span>{ex.highlight}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3-Step "How It Works" Row */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-green">
            The Decision Workflow
          </span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            Three simple steps to arrive at the most economical and sustainable choice:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="relative p-6 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-tint text-deepGreen font-heading font-extrabold text-sm flex items-center justify-center">
                  1
                </span>
                <span className="text-[11px] font-mono text-ink-faint uppercase font-semibold">Diagnosis</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-ink">
                Identify & Diagnose
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Enter your item and observe the primary fault. The engine checks parts cost, repair difficulty, and runs a strict safety red-line test for electrical or battery hazards.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-tint text-deepGreen font-heading font-extrabold text-sm flex items-center justify-center">
                  2
                </span>
                <span className="text-[11px] font-mono text-ink-faint uppercase font-semibold">Scoring</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-ink">
                Compare All 5 Paths
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                The pure decision engine scores Repair (DIY vs Pro), Reuse, Repurpose, Replace, and Recycle against economic return, personal effort, and embodied CO₂e diverted.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-tint text-deepGreen font-heading font-extrabold text-sm flex items-center justify-center">
                  3
                </span>
                <span className="text-[11px] font-mono text-ink-faint uppercase font-semibold">Execution</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-ink">
                Action Playbook
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Follow actionable instructions tailored to your winner: DIY tool checklists, questions for local repair technicians, creative upcycling recipes, or safe recycling depot rules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 30-Second Judge Quick-Test Showcase */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-brand-lg border border-green/30 bg-gradient-to-b from-tint/60 to-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-deepGreen tracking-wider block mb-1">
                30-Second Judge Evaluation
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-ink">
                Preloaded Real-World Scenarios
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Click any scenario to see the complete mathematical engine, safety flags, and cost calculations instantly:
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDemoModal(true)}
              className="shrink-0"
            >
              View All 4 Scenarios
            </Button>
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
                      ? 'bg-safety-rustLight/30 border-safety-rustBorder/50 hover:border-rust hover:shadow-subtle'
                      : 'bg-white border-ink-border/80 hover:border-green hover:shadow-subtle'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-ink-faint">
                        {demo.category.replace('_', ' ')}
                      </span>
                      {isSafety && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rust" />
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-sm text-ink group-hover:text-deepGreen transition-colors">
                      {demo.title}
                    </h3>
                    <p className="text-xs text-ink-muted line-clamp-2">
                      {demo.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-ink-border/40 flex items-center justify-between text-xs font-semibold text-deepGreen">
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

      {/* Demos Modal */}
      {showDemoModal && (
        <JudgeDemosModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
}
