import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  Printer,
  RotateCcw,
  Leaf,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Layers,
  Share2,
} from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { COPY } from '../copy/en.js';
import { Stepper } from '../components/assessment/Stepper.jsx';
import { OptionCard } from '../components/verdict/OptionCard.jsx';
import { SafetyBanner } from '../components/common/SafetyBanner.jsx';
import { EstimateBadge } from '../components/common/EstimateBadge.jsx';
import { TinkerModal } from '../components/modals/TinkerModal.jsx';
import { tippingPoint } from '../engine/index.js';

export function VerdictPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { assessment, decisionResult, setSelectedOptionId, loadDemo, rules } = useAssessment();
  const [showTinkerModal, setShowTinkerModal] = useState(false);

  // If URL has :id parameter and it's a known demo, load it
  useEffect(() => {
    if (id && rules.judgeDemos?.some(d => d.id === id)) {
      loadDemo(id);
    }
  }, [id]);

  const { item, fault, safety, options, winner, analytics } = decisionResult;

  // Signature Feature: Tipping Point calculation
  const tipPoint = useMemo(() => {
    try {
      return tippingPoint(assessment, rules);
    } catch (e) {
      return null;
    }
  }, [assessment, rules]);

  // Sync to history log
  useEffect(() => {
    if (item && winner) {
      try {
        const key = 'fix_it_first_history_v1';
        const existing = JSON.parse(sessionStorage.getItem(key) || '[]');
        const entry = {
          id: id || item.id || 'assessment',
          itemName: item.name,
          category: assessment.category?.replace('_', ' ') || 'General',
          faultName: fault?.name || 'Diagnosed fault',
          winner: winner.name,
          score: winner.score,
          savings: analytics.netSavings,
          carbon: winner.carbonSavedKg || 0,
          date: 'Just now',
        };
        // Avoid duplicate top entry
        if (!existing.length || existing[0].itemName !== entry.itemName || existing[0].faultName !== entry.faultName) {
          sessionStorage.setItem(key, JSON.stringify([entry, ...existing.slice(0, 9)]));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [item?.name, fault?.name, winner?.score]);

  const handlePrint = () => {
    window.print();
  };

  const handleGoToAction = () => {
    setSelectedOptionId(winner.id);
    navigate('/action');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Stepper */}
      <Stepper currentStep={4} />

      {/* Item Summary Bar */}
      <div className="bg-white rounded-brand-lg border border-ink-border/80 shadow-subtle p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-brand-deep tracking-wider">
              Evaluated Item
            </span>
            <EstimateBadge />
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-ink mt-0.5">
            {item?.name || 'Custom Item'}
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Fault: <span className="font-medium text-ink">{fault?.name || 'Unspecified fault'}</span> • Age: {assessment.itemAgeYears} yrs • Replacement Benchmark: ${analytics.replacementCost}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowTinkerModal(true)}
            className="px-3 py-2 rounded-brand bg-action-amberLight hover:bg-action-amber text-action-amberHover hover:text-white border border-action-amber/40 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>{COPY.verdict.tinkerButton}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-brand bg-brand-surfaceAlt hover:bg-brand-tint text-brand-deep border border-ink-border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-4 h-4" />
            <span>{COPY.verdict.printReport}</span>
          </button>

          <Link
            to="/assess"
            className="px-3 py-2 rounded-brand text-xs font-medium text-ink-muted hover:text-ink hover:bg-brand-surfaceAlt transition-colors"
          >
            Edit Inputs
          </Link>
        </div>
      </div>

      {/* Safety Banner if Hazard Detected */}
      {safety.isHazardous && (
        <SafetyBanner safety={safety} />
      )}

      {/* Recommendation Banner Hero */}
      <div className="rounded-brand-lg border-2 border-brand bg-gradient-to-br from-brand-tint/90 via-white to-brand-surface p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand text-white text-xs font-heading font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-action-amber fill-action-amber" />
              <span>{COPY.verdict.winnerBadge}</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-brand-deep tracking-tight">
              {winner.name}
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-mono uppercase text-ink-faint block">
              Confidence Score
            </span>
            <div className="font-heading font-black text-4xl sm:text-5xl text-brand-deep">
              {winner.score}
              <span className="text-base text-ink-muted font-normal">/100</span>
            </div>
          </div>
        </div>

        {/* Core Rationale */}
        <div className="p-4 rounded-brand bg-white/90 border border-brand/20 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-deep block">
            {COPY.verdict.whyWinner}
          </span>
          <p className="text-sm sm:text-base text-ink leading-relaxed font-medium">
            {winner.verdictSummary}
          </p>
        </div>

        {/* 4 Key Highlight Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-brand bg-white border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Estimated Cost</span>
            <span className="font-mono font-bold text-lg text-ink">
              ${winner.costEstimate}
            </span>
            <EstimateBadge className="text-[9px] px-1 py-0 mt-1 block w-fit mx-auto" />
          </div>

          <div className="p-3 rounded-brand bg-white border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Net Savings vs New</span>
            <span className="font-mono font-bold text-lg text-brand-deep">
              ${analytics.netSavings}
            </span>
            <span className="text-[10px] text-brand-deep block mt-1 font-medium">
              {analytics.repairToReplaceRatio <= 0.5 ? 'Excellent ROI' : 'Moderate ROI'}
            </span>
          </div>

          <div className="p-3 rounded-brand bg-white border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Carbon Avoided</span>
            <span className="font-mono font-bold text-lg text-brand">
              {winner.carbonSavedKg > 0 ? `+${winner.carbonSavedKg} kg` : '0 kg'}
            </span>
            <span className="text-[10px] text-ink-faint block mt-1">CO₂e diverted</span>
          </div>

          <div className="p-3 rounded-brand bg-white border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Life Extended</span>
            <span className="font-mono font-bold text-lg text-ink">
              +{winner.lifespanAddedYears} yrs
            </span>
            <span className="text-[10px] text-ink-faint block mt-1">Useful life</span>
          </div>
        </div>

        {/* Signature Feature: Tipping Point Banner */}
        {tipPoint && (
          <div className="p-4 rounded-brand bg-white/95 border border-brand/30 shadow-xs flex items-start gap-3">
            <div className="p-2 rounded-full bg-brand-tint text-brand-deep shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4 text-brand-deep" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-deep block">
                What Would Change This Verdict (Tipping Point)
              </span>
              <p className="text-xs sm:text-sm text-ink font-medium leading-relaxed">
                {tipPoint.sentence}
              </p>
            </div>
          </div>
        )}

        {/* Primary CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGoToAction}
            className="w-full sm:w-auto px-6 py-3 rounded-brand font-bold text-sm bg-action-amber hover:bg-action-amberHover text-ink hover:text-white shadow-amber-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed with Step-by-Step {winner.name} Playbook</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* All 5 Options Ranked Matrix */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading font-extrabold text-2xl text-ink">
              {COPY.verdict.tabs.all}
            </h2>
            <p className="text-xs text-ink-muted">
              Ranked from highest net social/economic score to lowest. Click any option to examine detailed trade-offs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTinkerModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-deep hover:text-brand transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{COPY.verdict.editBanner}</span>
          </button>
        </div>

        <div className="space-y-4">
          {options.map((opt, idx) => (
            <OptionCard
              key={opt.id}
              option={opt}
              rank={idx + 1}
              isWinner={opt.id === winner.id}
            />
          ))}
        </div>
      </section>

      {/* Environmental & Circular Impact Card */}
      <section className="rounded-brand-lg border border-brand/20 bg-brand-surface p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-brand" />
          <h2 className="font-heading font-extrabold text-xl text-ink">
            Embodied Carbon & Circular Footprint
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-ink-muted">
          <div className="p-4 rounded-brand bg-white border border-ink-border/60">
            <span className="font-semibold text-ink block mb-1">Total Embodied Impact</span>
            <p className="leading-relaxed">
              Manufacturing a replacement for this {item?.name} accounts for approximately <strong className="text-ink">{analytics.embodiedCo2Kg} kg CO₂e</strong> in raw material extraction and factory logistics.
            </p>
          </div>

          <div className="p-4 rounded-brand bg-white border border-ink-border/60">
            <span className="font-semibold text-ink block mb-1">Emissions Prevented</span>
            <p className="leading-relaxed">
              Carrying out your top choice avoids <strong className="text-brand-deep">{analytics.carbonSavedBestKg} kg CO₂e</strong> from being released into the atmosphere, equivalent to charging <strong className="text-ink">~4,500 smartphones</strong>.
            </p>
          </div>

          <div className="p-4 rounded-brand bg-white border border-ink-border/60">
            <span className="font-semibold text-ink block mb-1">Landfill Diversion</span>
            <p className="leading-relaxed">
              Diverting this item keeps toxic heavy metals, flame retardants, and persistent microplastics out of municipal landfill systems.
            </p>
          </div>
        </div>
      </section>

      {/* Tinker Modal */}
      {showTinkerModal && (
        <TinkerModal onClose={() => setShowTinkerModal(false)} />
      )}
    </div>
  );
}
