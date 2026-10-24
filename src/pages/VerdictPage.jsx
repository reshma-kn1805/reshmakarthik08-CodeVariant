import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Check,
  Info,
  Calendar,
  Layers,
  Wrench,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { COPY } from '../copy/en.js';
import { Stepper } from '../components/assessment/Stepper.jsx';
import { OptionCard } from '../components/verdict/OptionCard.jsx';
import { EstimateBadge } from '../components/common/EstimateBadge.jsx';
import { tippingPoint } from '../engine/index.js';

const CHECKLIST_STORAGE_KEY = 'fix_it_first_checklist_ticks_v2';

export function VerdictPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    assessment,
    updateAssessment,
    decisionResult,
    selectedOption,
    setSelectedOptionId,
    loadExample,
    getHistoryItem,
    rules,
  } = useAssessment();

  // Load history item or example if ID parameter is present
  useEffect(() => {
    if (id) {
      if (id.startsWith('ex_')) {
        loadExample(id.replace('ex_', ''));
      } else if (id.startsWith('demo_')) {
        loadExample(id.replace('demo_', ''));
      } else {
        const hist = getHistoryItem(id);
        if (hist && hist.assessment) {
          updateAssessment(hist.assessment);
        }
      }
    }
  }, [id]);

  const { item, fault, safety, options, winner, analytics, gated, confidence } = decisionResult;

  // Selected option for next-step checklist
  const activeOption = selectedOption || winner;

  // Signature Feature: Tipping Point calculation
  const tipPoint = useMemo(() => {
    try {
      return tippingPoint(assessment, rules);
    } catch (e) {
      return null;
    }
  }, [assessment, rules]);

  // Track previous top winner to flag rank changes when user moves sliders
  const prevWinnerIdRef = useRef(winner?.id);
  const [rankShiftNotice, setRankShiftNotice] = useState('');

  useEffect(() => {
    if (prevWinnerIdRef.current && prevWinnerIdRef.current !== winner?.id) {
      const prev = prevWinnerIdRef.current;
      const curr = winner?.id;
      setRankShiftNotice(`↑ ${winner?.name} has overtaken ${prev} to claim #1 as your priorities shifted.`);
    }
    prevWinnerIdRef.current = winner?.id;
  }, [winner?.id, winner?.name]);

  // Checklist ticks state (persisted in sessionStorage)
  const [checkedSteps, setCheckedSteps] = useState(() => {
    try {
      const saved = sessionStorage.getItem(CHECKLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleChecklistStep = (stepKey) => {
    setCheckedSteps(prev => {
      const next = { ...prev, [stepKey]: !prev[stepKey] };
      try {
        sessionStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  // Resolve checklists from category data in rules.json
  const activeCategoryData = rules.categories.find(c => c.id === assessment.category) || rules.categories[0];
  const optionChecklist = activeCategoryData?.checklists?.[activeOption.id] || [
    'Inspect the device under safe lighting.',
    'Check replacement parts availability and warranty.',
    'Follow official manufacturer documentation for maintenance.',
    'Test performance safely before full re-deployment.',
  ];

  // Break-even Calculations
  const repairCost = Math.round(Number(assessment.repairCost ?? analytics?.bestRepairCost ?? 250));
  const replaceCost = Math.round(Number(assessment.replaceCost ?? analytics?.replacementCost ?? 3500));
  const repairPercent = replaceCost > 0 ? Math.round((repairCost / replaceCost) * 100) : 0;
  const expectedLifespan = activeCategoryData?.expectedLifespanYears || 5;

  const costPerYearOptions = options.map(opt => {
    let cost = opt.costEstimate || 0;
    let years = Math.max(1, opt.lifespanAddedYears || 1);
    let costPerYear = Math.round(cost / years);
    return {
      id: opt.id,
      name: opt.name,
      cost,
      years,
      costPerYear,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  // PHASE 4: GATED SAFETY SCREEN (Replaces verdict if Critical Red Line detected)
  if (gated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
        <Stepper currentStep={4} />

        <div className="p-6 sm:p-10 rounded-brand-lg border-2 border-safety-rust bg-safety-rustLight/80 text-ink shadow-card space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-safety-rust text-white shrink-0 mt-1">
              <ShieldAlert className="w-8 h-8 text-white stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-safety-rust block">
                Critical Safety Gate Triggered
              </span>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink">
                Don't DIY This — Safety Red Line
              </h1>
              <p className="text-sm text-ink-muted">
                Evaluated Item: <strong className="text-ink">{assessment.itemName || activeCategoryData.name}</strong> • Age: {assessment.ageYears} yrs
              </p>
            </div>
          </div>

          {/* Why Section */}
          <div className="p-5 rounded-brand bg-white border border-safety-rust/30 space-y-2">
            <h2 className="font-heading font-bold text-sm uppercase text-safety-rust tracking-wide">
              Why DIY Repair Has Been Locked Out:
            </h2>
            <p className="text-sm text-ink leading-relaxed font-medium">
              A high-risk condition (<strong>{assessment.safetyFlags?.join(', ') || 'Thermal / Chemical Hazard'}</strong>) was detected.
              Items with bulging lithium batteries, smoking coils, or compromised mains wiring present acute fire, explosive gas release, and high-voltage electrocution risks that cannot be safely serviced at home without specialist containment equipment.
            </p>
          </div>

          {/* Safe Route Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-brand bg-white border border-ink-border/80 space-y-2">
              <div className="flex items-center gap-2 text-brand-deep">
                <Wrench className="w-4 h-4 text-brand" />
                <h3 className="font-heading font-bold text-sm text-ink">Route A: Authorized Professional</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                Take the device to a brand-authorized service center equipped with grounded ESD benches, battery fire-safe sand buckets, and original OEM assemblies.
              </p>
            </div>

            <div className="p-4 rounded-brand bg-white border border-ink-border/80 space-y-2">
              <div className="flex items-center gap-2 text-brand-deep">
                <Leaf className="w-4 h-4 text-brand" />
                <h3 className="font-heading font-bold text-sm text-ink">Route B: Safe E-Waste Drop-off</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                If the item is old or unviable to repair, bring it to a certified municipal e-waste recycling collection kiosk. Never discard into regular household waste.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/assess')}
              className="w-full sm:w-auto px-6 py-3 rounded-brand font-bold text-xs bg-brand text-white hover:bg-brand-deep transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Start an Alternate Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/assess"
              className="w-full sm:w-auto px-5 py-3 rounded-brand text-xs font-semibold text-ink-muted hover:text-ink hover:bg-white border border-ink-border/80 transition-colors text-center"
            >
              Edit Assessment Inputs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD VERDICT VIEW
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Stepper */}
      <Stepper currentStep={4} />

      {/* Item Summary Header */}
      <div className="bg-white rounded-brand-lg border border-ink-border/80 shadow-subtle p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-brand-deep tracking-wider">
              Decision Matrix Verdict
            </span>
            <EstimateBadge />
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-ink mt-0.5">
            {assessment.itemName || activeCategoryData.name}
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Category: <strong className="text-ink">{activeCategoryData.name}</strong> • Age: {assessment.ageYears} yrs • Replacement Benchmark: ₹{replaceCost.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-brand bg-brand-surfaceAlt hover:bg-brand-tint text-brand-deep border border-ink-border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <Link
            to="/assess"
            className="px-3 py-2 rounded-brand text-xs font-semibold text-ink-muted hover:text-ink hover:bg-brand-surfaceAlt border border-ink-border transition-colors"
          >
            Edit Inputs
          </Link>
        </div>
      </div>

      {/* HERO VERDICT CARD */}
      <section className="rounded-brand-lg border-2 border-brand bg-gradient-to-br from-brand-tint/90 via-white to-brand-surface p-6 sm:p-8 shadow-card space-y-6">
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

          <div className="text-left sm:text-right space-y-1">
            <div className="flex items-center gap-2 justify-start sm:justify-end">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                confidence === 'high'
                  ? 'bg-brand text-white'
                  : confidence === 'medium'
                  ? 'bg-action-amberLight text-action-amberHover'
                  : 'bg-ink-border text-ink-muted'
              }`}>
                {confidence} Confidence
              </span>
            </div>
            <div className="font-heading font-black text-4xl sm:text-5xl text-brand-deep">
              {winner.score}
              <span className="text-base text-ink-muted font-normal">/100</span>
            </div>
          </div>
        </div>

        {/* One-Sentence Summary */}
        <div className="p-4 rounded-brand bg-white/95 border border-brand/20 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-deep block">
            Core Recommendation Summary
          </span>
          <p className="text-sm sm:text-base text-ink leading-relaxed font-medium">
            {winner.verdictSummary}
          </p>
        </div>

        {/* 4 Highlight Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-brand bg-white border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Estimated Cost</span>
            <span className="font-mono font-bold text-lg text-ink">
              ₹{Number(winner.costEstimate).toLocaleString('en-IN')}
            </span>
            <EstimateBadge className="text-[9px] px-1 py-0 mt-1 block w-fit mx-auto" />
          </div>

          <div className="p-3.5 rounded-brand bg-white border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Net Savings vs New</span>
            <span className="font-mono font-bold text-lg text-brand-deep">
              ₹{Number(analytics.netSavings).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-brand-deep block mt-1 font-medium">
              {repairPercent <= 50 ? 'Strong Economic ROI' : 'Moderate Return'}
            </span>
          </div>

          <div className="p-3.5 rounded-brand bg-white border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Carbon Avoided</span>
            <span className="font-mono font-bold text-lg text-brand">
              {winner.carbonSavedKg > 0 ? `+${winner.carbonSavedKg} kg` : '0 kg'}
            </span>
            <span className="text-[10px] text-ink-faint block mt-1">CO₂e diverted</span>
          </div>

          <div className="p-3.5 rounded-brand bg-white border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Life Extended</span>
            <span className="font-mono font-bold text-lg text-ink">
              +{winner.lifespanAddedYears} yrs
            </span>
            <span className="text-[10px] text-ink-faint block mt-1">Useful life</span>
          </div>
        </div>

        {/* TIPPING POINT CALLOUT (Signature Feature) */}
        {tipPoint && (
          <div className="p-4 rounded-brand bg-white border-2 border-action-amber/70 shadow-xs flex items-start gap-3.5 animate-fadeIn">
            <div className="p-2 rounded-full bg-action-amberLight text-action-amberHover shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-action-amberHover">
                  Signature Feature • Tipping Point Analysis
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink font-semibold leading-relaxed">
                {tipPoint.sentence}
              </p>
              <p className="text-[11px] text-ink-faint">
                Below this repair threshold, fixing remains optimal. Above this number, switching to {tipPoint.newWinner} provides better long-term value.
              </p>
            </div>
          </div>
        )}

        {/* Estimates Note Disclaimer */}
        <div className="flex items-center gap-2 text-[11px] text-ink-faint">
          <Info className="w-3.5 h-3.5 shrink-0 text-brand" />
          <span>Note: Costs, carbon savings, and lifespan extensions are calculated estimates based on market benchmarks, not official shop quotes.</span>
        </div>
      </section>

      {/* PHASE 4: "WHAT MATTERS TO YOU?" LIVE PRIORITIES PANEL */}
      <section className="bg-white rounded-brand-lg border border-ink-border/80 shadow-subtle p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-border/50 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-deep">
              <Sliders className="w-3.5 h-3.5 text-brand" />
              <span>Interactive Decision Tuning</span>
            </div>
            <h2 className="font-heading font-extrabold text-lg text-ink">
              What Matters to You? (Live Priority Shift)
            </h2>
          </div>
          <span className="text-xs text-ink-muted">
            Drag sliders to immediately re-rank all 5 options in real-time
          </span>
        </div>

        {/* Live Rank Shift Notification Badge */}
        {rankShiftNotice && (
          <div className="p-3 rounded-brand bg-brand-tint border border-brand/30 text-brand-deep text-xs font-semibold flex items-center justify-between gap-2 animate-fadeIn">
            <span>{rankShiftNotice}</span>
            <button
              type="button"
              onClick={() => setRankShiftNotice('')}
              className="text-xs text-ink-muted hover:text-ink cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Slider 1: Save Money */}
          <div className="p-3.5 rounded-brand bg-brand-surface border border-ink-border/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink flex items-center gap-1">
                <span className="font-mono font-bold text-brand">₹</span> Save Money
              </span>
              <span className="font-mono font-bold text-brand-deep">
                {assessment.priorities?.money ?? 50}/100
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={assessment.priorities?.money ?? 50}
              onChange={(e) =>
                updateAssessment({
                  priorities: { ...assessment.priorities, money: Number(e.target.value) },
                })
              }
              className="w-full accent-brand h-2 bg-ink-border/30 rounded cursor-pointer"
            />
            <span className="text-[10px] text-ink-faint block">
              Weights financial score vs replacements
            </span>
          </div>

          {/* Slider 2: Reduce Waste */}
          <div className="p-3.5 rounded-brand bg-brand-surface border border-ink-border/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-brand" /> Reduce Waste
              </span>
              <span className="font-mono font-bold text-brand-deep">
                {assessment.priorities?.waste ?? 50}/100
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={assessment.priorities?.waste ?? 50}
              onChange={(e) =>
                updateAssessment({
                  priorities: { ...assessment.priorities, waste: Number(e.target.value) },
                })
              }
              className="w-full accent-brand h-2 bg-ink-border/30 rounded cursor-pointer"
            />
            <span className="text-[10px] text-ink-faint block">
              Weights carbon diversion & longevity
            </span>
          </div>

          {/* Slider 3: Save Effort */}
          <div className="p-3.5 rounded-brand bg-brand-surface border border-ink-border/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-action-amberHover" /> Save Effort
              </span>
              <span className="font-mono font-bold text-brand-deep">
                {assessment.priorities?.effort ?? 50}/100
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={assessment.priorities?.effort ?? 50}
              onChange={(e) =>
                updateAssessment({
                  priorities: { ...assessment.priorities, effort: Number(e.target.value) },
                })
              }
              className="w-full accent-brand h-2 bg-ink-border/30 rounded cursor-pointer"
            />
            <span className="text-[10px] text-ink-faint block">
              Favors convenience over tedious repairs
            </span>
          </div>
        </div>
      </section>

      {/* ALL 5 OPTIONS RANKED MATRIX */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-ink-border/50 pb-2">
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-ink">
            All 5 Options Ranked
          </h2>
          <span className="text-xs font-mono text-ink-muted">
            Safety locked at 10% weight
          </span>
        </div>

        <div className="space-y-3">
          {options.map((opt, idx) => (
            <OptionCard
              key={opt.id}
              option={opt}
              rank={idx + 1}
              isWinner={idx === 0}
              onSelect={(optId) => setSelectedOptionId(optId)}
            />
          ))}
        </div>
      </section>

      {/* BREAK-EVEN & ANNUAL COST VIEW */}
      <section className="bg-white rounded-brand-lg border border-ink-border/80 shadow-subtle p-5 sm:p-6 space-y-5">
        <div className="space-y-1 border-b border-ink-border/50 pb-3">
          <h2 className="font-heading font-extrabold text-xl text-ink">
            Economic Break-Even & Annual Life Cost
          </h2>
          <p className="text-xs text-ink-muted">
            Compare normalized cost per year of useful life gained across all paths:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="p-4 rounded-brand bg-brand-surface border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Repair as % of Replacement</span>
            <span className="font-mono font-black text-2xl text-brand-deep">
              {repairPercent}%
            </span>
            <span className="text-[10px] text-ink-muted block mt-1">
              ₹{repairCost} repair vs ₹{replaceCost} new
            </span>
          </div>

          <div className="p-4 rounded-brand bg-brand-surface border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Net Purchase Savings</span>
            <span className="font-mono font-black text-2xl text-brand">
              ₹{analytics.netSavings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-ink-muted block mt-1">
              Cash kept in your pocket
            </span>
          </div>

          <div className="p-4 rounded-brand bg-brand-surface border border-ink-border/60">
            <span className="text-[11px] text-ink-faint block mb-0.5">Break-Even Threshold</span>
            <span className="font-mono font-black text-2xl text-action-amberHover">
              {tipPoint ? `₹${tipPoint.thresholdRupees.toLocaleString('en-IN')}` : 'N/A'}
            </span>
            <span className="text-[10px] text-ink-muted block mt-1">
              Repair limit before Replace wins
            </span>
          </div>
        </div>

        {/* Cost Per Year Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-ink-border/70 text-ink-faint font-mono uppercase text-[10px]">
                <th className="py-2 pr-3">Option</th>
                <th className="py-2 px-3">Est. Cost</th>
                <th className="py-2 px-3">Years Gained</th>
                <th className="py-2 pl-3 text-right">Cost / Year of Life</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-border/40 font-medium">
              {costPerYearOptions.map((row) => (
                <tr key={row.id} className={row.id === winner.id ? 'bg-brand-tint/40 font-bold' : ''}>
                  <td className="py-2.5 pr-3 text-ink flex items-center gap-1.5">
                    {row.id === winner.id && <Sparkles className="w-3.5 h-3.5 text-action-amber" />}
                    <span>{row.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-ink">₹{row.cost.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 font-mono text-ink">+{row.years} yrs</td>
                  <td className="py-2.5 pl-3 text-right font-mono text-brand-deep font-bold">
                    ₹{row.costPerYear.toLocaleString('en-IN')} / yr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* NEXT-STEP ACTION PLAN FOR CHOSEN OPTION */}
      <section className="bg-white rounded-brand-lg border border-brand/30 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-border/50 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-deep">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
              <span>Step-by-Step Execution Plan</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-ink mt-0.5">
              Next Steps for: {activeOption.name}
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Check off tasks as you complete them. Progress is automatically saved in your browser session.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                className={`px-3 py-1.5 rounded-brand text-xs font-semibold transition-all cursor-pointer ${
                  opt.id === activeOption.id
                    ? 'bg-brand-deep text-white shadow-xs'
                    : 'bg-brand-surfaceAlt text-ink-muted hover:text-ink border border-ink-border/60'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Checklist */}
        <div className="space-y-2.5">
          {optionChecklist.map((step, idx) => {
            const stepKey = `${assessment.id || 'curr'}_${activeOption.id}_${idx}`;
            const isDone = !!checkedSteps[stepKey];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleChecklistStep(stepKey)}
                className={`w-full p-4 rounded-brand border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  isDone
                    ? 'border-brand/40 bg-brand-surfaceAlt/60 text-ink-muted'
                    : 'border-ink-border bg-white hover:border-brand/50 text-ink shadow-xs'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? 'bg-brand border-brand text-white'
                      : 'border-ink-border bg-white group-hover:border-brand'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs sm:text-sm leading-relaxed block ${isDone ? 'line-through text-ink-faint' : 'font-medium text-ink'}`}>
                    {step}
                  </span>
                  <span className="text-[10px] font-mono text-ink-faint uppercase">
                    Task {idx + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Page Deep Dive Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-ink-border/50">
          <span className="text-xs text-ink-muted">
            Need comprehensive tool lists or questions for technicians?
          </span>
          <button
            type="button"
            onClick={() => navigate('/action')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-brand font-bold text-xs bg-action-amber hover:bg-action-amberHover text-ink hover:text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open Detailed Action Playbook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
