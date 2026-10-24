import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ChevronDown,
  ChevronUp,
  Lock,
  Archive,
  Trash2,
  Share2,
  HelpCircle,
  X,
  Copy,
} from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { COPY } from '../copy/en.js';
import { CanvasProvider, DataCard, ActionZone, PRIORITY_WEIGHTS } from '../canvas/index.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { DonutGauge } from '../components/common/DonutGauge.jsx';
import { RadarChart } from '../components/verdict/RadarChart.jsx';
import { BreakEvenChart } from '../components/verdict/BreakEvenChart.jsx';
import { RepairQuoteSlider } from '../components/verdict/RepairQuoteSlider.jsx';
import { MatrixHeatmap } from '../components/verdict/MatrixHeatmap.jsx';
import { tippingPoint } from '../engine/index.js';

const CHECKLIST_STORAGE_KEY = 'fix_it_first_checklist_ticks_v2';
const DISCARDED_STORAGE_KEY = 'fix_it_first_recently_discarded_v2';

export function VerdictPage() {
  const { id } = useParams();
  const {
    assessment,
    updateAssessment,
    decisionResult,
    selectedOption,
    setSelectedOptionId,
    loadExample,
    getHistoryItem,
    saveCurrentToHistory,
    history,
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

  const { options, winner, analytics, gated } = decisionResult;

  // Signature Tipping Point
  const tipPoint = useMemo(() => {
    try {
      return tippingPoint(assessment, rules);
    } catch (e) {
      return null;
    }
  }, [assessment, rules]);

  // Track rank shifts
  const prevWinnerIdRef = useRef(winner?.id);
  const [rankShiftNotice, setRankShiftNotice] = useState('');

  useEffect(() => {
    if (prevWinnerIdRef.current && prevWinnerIdRef.current !== winner?.id) {
      const prev = prevWinnerIdRef.current;
      setRankShiftNotice(`↑ ${winner?.name} has overtaken ${prev} to claim #1 as priorities shifted.`);
      setTimeout(() => setRankShiftNotice(''), 5000);
    }
    prevWinnerIdRef.current = winner?.id;
  }, [winner?.id, winner?.name]);

  // Checklist ticks persisted in sessionStorage
  const [checkedSteps, setCheckedSteps] = useState(() => {
    try {
      const saved = sessionStorage.getItem(CHECKLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Recently discarded case files
  const [recentlyDiscarded, setRecentlyDiscarded] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DISCARDED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Committed option ID
  const [committedOptionId, setCommittedOptionId] = useState(null);

  // Compared option IDs (up to 3)
  const [comparedOptionIds, setComparedOptionIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Expanded option ID for "Why this?"
  const [expandedOptionId, setExpandedOptionId] = useState(null);

  // Feedback banner from canvas drops
  const [bannerFeedback, setBannerFeedback] = useState(null);

  // Close modals on Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowCompareModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync discarded to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(DISCARDED_STORAGE_KEY, JSON.stringify(recentlyDiscarded));
    } catch (e) {
      // ignore
    }
  }, [recentlyDiscarded]);

  // Sync checklist ticks to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedSteps));
    } catch (e) {
      // ignore
    }
  }, [checkedSteps]);

  // Resolve active category and checklist
  const activeCategoryData =
    rules.categories.find((c) => c.id === assessment.category) || rules.categories[0];
  const activeCommittedOption =
    options.find((o) => o.id === committedOptionId) || winner;

  const rawChecklist =
    activeCategoryData?.checklists?.[activeCommittedOption.id] || [
      'Inspect equipment under direct task lighting.',
      'Check replacement parts availability & warranty.',
      'Follow certified workshop manual guidelines.',
      'Verify complete electrical insulation before energizing.',
    ];

  // Priority labels & ranks
  const priorityRanks = assessment.priorityRanks || ['money', 'waste', 'effort'];
  const PRIORITY_LABELS = {
    money: { title: 'Save Money', desc: 'Direct cost minimization', icon: DollarSign },
    waste: { title: 'Reduce Waste', desc: 'Circularity & landfill diversion', icon: Leaf },
    effort: { title: 'Save Effort', desc: 'Ease & labor minimization', icon: Sliders },
  };

  const handleDropSuccess = (result) => {
    if (result.effects?.message) {
      setBannerFeedback(result.effects.message);
      setTimeout(() => setBannerFeedback(null), 4000);
    }

    if (result.state?.assessment) {
      updateAssessment(result.state.assessment);
    }

    // Zone Commit
    if (result.effects?.committedOptionId) {
      setCommittedOptionId(result.effects.committedOptionId);
    }

    // Zone Plan Done
    if (result.effects?.stepId) {
      setCheckedSteps((prev) => ({
        ...prev,
        [result.effects.stepId]: true,
      }));
    }

    // Zone Compare
    if (result.effects?.openCompareModal) {
      setComparedOptionIds(result.state.comparedOptionIds);
      setShowCompareModal(true);
    }

    // Zone Keep / Pin
    if (result.effects?.caseId && result.state?.history) {
      saveCurrentToHistory();
      setRecentlyDiscarded(result.state.recentlyDiscarded);
    }

    // Zone Discard
    if (result.effects?.caseId && result.state?.recentlyDiscarded) {
      setRecentlyDiscarded(result.state.recentlyDiscarded);
    }

    // Zone Export
    if (result.effects?.action === 'EXPORT') {
      const summaryText = `FIX IT FIRST — DECISION REPORT\nItem: ${activeCategoryData.name}\nWinner: ${winner?.name} (Score: ${winner?.score}/100)\nEconomics: Repair ₹${assessment.repairCost} vs Replacement ₹${assessment.replaceCost}\nCO₂ Saved: ${winner?.carbonSavedKg || 0} kg\nTipping Point: ${tipPoint?.sentence || 'N/A'}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(summaryText).catch(() => {});
      }
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  const handleCustomDrop = (result) => {
    if (!result.success) {
      setBannerFeedback(result.effects?.message || 'Drop rejected by zone');
      setTimeout(() => setBannerFeedback(null), 4500);
      return;
    }
    handleDropSuccess(result);
  };

  const currentCaseData = {
    id: assessment.id || id || `eval_${Date.now()}`,
    title: `${activeCategoryData.name} Case`,
    subtitle: `${winner?.name} • Score ${winner?.score}`,
    assessment,
    decisionResult,
  };

  return (
    <CanvasProvider
      stateContext={{
        assessment,
        history,
        recentlyDiscarded,
        gated,
        committedOptionId,
        comparedOptionIds,
        checklistTicks: checkedSteps,
      }}
      onDropSuccess={handleCustomDrop}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: 'Workbench', path: '/' },
            { label: 'Assess', path: '/assess' },
            { label: 'Decision Table' },
          ]}
          showActions={false}
        />

        {/* Verdict Header & Banner */}
        <div className="space-y-3 pb-4 border-b border-ink-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen bg-tint px-2 py-0.5 rounded-full border border-green/20">
                  Decision Matrix • 5-Way Evaluation
                </span>
                {gated && (
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-safety-rust px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Lock className="w-3 h-3" />
                    Safety Gated
                  </span>
                )}
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink mt-1">
                The Decision Table
              </h1>
              <p className="text-xs text-ink-muted">
                Drag option cards into Action Zones to commit, compare, or manage case records.
              </p>
            </div>

            {/* Top Winner Score Gauge */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-brand-lg border border-ink-border/80 shadow-xs">
              <DonutGauge
                score={winner?.score || 0}
                size={68}
                strokeWidth={7}
                color={gated ? '#C0392B' : '#2E7D5B'}
                sublabel="/ 100"
              />
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block font-semibold">
                  #1 Recommendation
                </span>
                <span className="font-heading font-extrabold text-base text-ink block leading-tight">
                  {winner?.name}
                </span>
                <span className="text-[11px] text-deepGreen font-semibold font-mono block mt-0.5">
                  Est. Net Savings: ₹{analytics?.netSavings?.toLocaleString('en-IN') || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Rank shift notice */}
          {rankShiftNotice && (
            <div className="p-3 rounded-brand bg-amber/15 border border-amber/40 text-ink text-xs font-semibold flex items-center gap-2 animate-pulse">
              <TrendingUp className="w-4 h-4 text-amber shrink-0" />
              <span>{rankShiftNotice}</span>
            </div>
          )}

          {/* Feedback banner */}
          {bannerFeedback && (
            <div className="p-3 rounded-brand bg-brand-surfaceAlt border border-brand/30 text-brand-deep text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber shrink-0" />
              <span>{bannerFeedback}</span>
            </div>
          )}

          {/* Tipping Point Signature Card */}
          {tipPoint && (
            <div className="p-3.5 rounded-brand-lg bg-white border border-amber/40 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-brand bg-amberLight text-amber shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber block">
                    Signature Analysis • The Tipping Point
                  </span>
                  <p className="text-xs text-ink font-medium mt-0.5 leading-snug">
                    {tipPoint.sentence}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-ink-muted shrink-0 hidden md:inline">
                Threshold: ₹{tipPoint.thresholdRupees?.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Priority Ladder repeated on Verdict Page (with live sliders and drag ladder) */}
        <section className="p-4 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-border/30 pb-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen block">
                Tune Decision Weights
              </span>
              <h3 className="font-heading font-bold text-sm text-ink">
                Priorities Ladder & Sliders (Live Re-ranking)
              </h3>
            </div>
            <span className="text-[11px] text-ink-muted">
              Move sliders or re-drop cards to live re-score all 5 options
            </span>
          </div>

          {/* 3 Ranked Drop Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((rank) => {
              const key = priorityRanks[rank - 1] || 'money';
              const weight = PRIORITY_WEIGHTS[rank];
              const info = PRIORITY_LABELS[key] || PRIORITY_LABELS.money;

              return (
                <div key={rank} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-ink">Slot #{rank}</span>
                    <span className="text-amber font-bold text-[11px] px-1.5 py-0.2 rounded bg-amberLight">
                      {weight}%
                    </span>
                  </div>
                  <ActionZone
                    id={`zone-priority-${rank}`}
                    label={`#${rank} Slot`}
                    className="min-h-[64px] bg-brand-surfaceAlt/20 p-2"
                  >
                    <span className="text-xs font-bold text-ink">{info.title}</span>
                  </ActionZone>
                </div>
              );
            })}
          </div>

          {/* Draggable priority cards */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto">
            {['money', 'waste', 'effort'].map((k) => (
              <DataCard
                key={k}
                id={`verdict-prio-${k}`}
                type="priority"
                title={PRIORITY_LABELS[k].title}
                data={{ key: k, label: PRIORITY_LABELS[k].title }}
                className="min-w-[140px]"
              />
            ))}
          </div>

          {/* Sliders (permitted per rules) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-ink-border/30">
            {['money', 'waste', 'effort'].map((key) => {
              const label = key === 'money' ? 'Cost' : key === 'waste' ? 'Circularity' : 'Convenience';
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <label htmlFor={`slider-prio-${key}`} className="text-ink">{label}:</label>
                    <span className="font-mono font-bold text-deepGreen">
                      {assessment.priorities?.[key] || 50}%
                    </span>
                  </div>
                  <input
                    id={`slider-prio-${key}`}
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={assessment.priorities?.[key] || 50}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateAssessment({
                        priorities: {
                          ...assessment.priorities,
                          [key]: val,
                        },
                      });
                    }}
                    className="w-full accent-deepGreen cursor-pointer"
                    aria-label={`Priority weight for ${label}`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Phase B: Decision Visuals Bento Grid (Radar Chart, Break-even Line Chart, Sensitivity Slider) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-bento-2">
          {/* Radar Chart: 6 Factors comparing Winner vs Runner-up */}
          <div className="lg:col-span-5 p-5 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen block">
                Factor Trade-off Radar
              </span>
              <h3 className="font-heading font-extrabold text-base text-ink">
                #1 {winner?.name} vs #2 {options[1]?.name || 'Runner-up'}
              </h3>
              <p className="text-[11px] text-ink-muted leading-relaxed">
                6-dimensional polygon overlay comparing multi-factor balance across cost, feasibility, and carbon.
              </p>
            </div>
            <RadarChart winner={winner} runnerUp={options[1]} />
          </div>

          {/* Right Column: Break-Even Projections & Live Repair Quote Sensitivity Slider */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle">
              <BreakEvenChart
                repairCost={Number(assessment.repairCost) || 250}
                replaceCost={Number(assessment.replaceCost) || 3500}
                years={5}
              />
            </div>

            <RepairQuoteSlider
              currentRepairCost={Number(assessment.repairCost) || 250}
              replaceCost={Number(assessment.replaceCost) || 3500}
              tipPoint={tipPoint}
              onCostChange={(newCost) => updateAssessment({ repairCost: newCost })}
            />
          </div>
        </section>

        {/* Phase B: The Matrix Heatmap (Options × Factors with Weights & Hover Reasons) */}
        <section className="animate-bento-3">
          <MatrixHeatmap
            options={options}
            weights={decisionResult.weights || {}}
            gated={gated}
          />
        </section>

        {/* Action Zones Grid: Commit, Compare, Keep, Discard, Export */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Zone 1: Commit */}
          <ActionZone
            id="zone-commit"
            label="Drop option to Commit"
            hint="Locks option & reveals step checklist below."
            className="bg-white border-brand shadow-xs"
          />

          {/* Zone 2: Compare */}
          <ActionZone
            id="zone-compare"
            label="Drop option to Compare"
            hint="Side-by-side comparison for up to 3 options."
            className="bg-white border-amber shadow-xs"
          />

          {/* Zone 3: Keep */}
          <ActionZone
            id="zone-keep"
            label="Drop Case to Keep"
            hint="Pins in history or restores discarded case."
            className="bg-white border-deepGreen shadow-xs"
          />

          {/* Zone 4: Discard & Export */}
          <div className="grid grid-cols-2 gap-2">
            <ActionZone
              id="zone-discard"
              label="Drop to Discard"
              hint="Moves to Discard tray."
              className="bg-white border-safety-rust shadow-xs"
            />
            <ActionZone
              id="zone-export"
              label="Drop to Export"
              hint="Copies report & prints."
              className="bg-white border-ink-border shadow-xs"
            />
          </div>
        </section>

        {/* Case File Card & Recently Discarded Tray */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
              Current Evaluation Case Card (Drag into Keep, Discard, or Export)
            </span>
            <DataCard
              id="verdict-case-file"
              type="case-file"
              title={`${activeCategoryData.name} Case File`}
              subtitle={`${winner?.name} • Score ${winner?.score}/100`}
              badge="Active Case"
              icon={Archive}
              data={currentCaseData}
            >
              <div className="flex justify-between text-[11px] pt-1">
                <span>Equipment: {activeCategoryData.name}</span>
                <span className="font-bold text-deepGreen">Winner: {winner?.name}</span>
              </div>
            </DataCard>
          </div>

          {/* Recently Discarded Tray (Drag back to Keep to restore — No button undo) */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-safety-rust">
              Recently Discarded Tray (Drag onto Keep zone to restore)
            </span>
            {recentlyDiscarded.length > 0 ? (
              <div className="space-y-2">
                {recentlyDiscarded.map((disc) => (
                  <DataCard
                    key={disc.id}
                    id={disc.id}
                    type="discarded-case"
                    title={disc.title || `${disc.itemName || 'Discarded Case'}`}
                    subtitle="Drag onto 'Drop Case to Keep' zone to restore"
                    badge="Discarded"
                    icon={Trash2}
                    data={disc}
                    className="border-safety-rust/60 bg-safety-rustLight/20"
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-brand border border-dashed border-ink-border/50 bg-brand-surfaceAlt/20 text-center text-xs text-ink-muted">
                Discarded tray is currently empty.
              </div>
            )}
          </div>
        </div>

        {/* Five Ranked Option Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink-border/50 pb-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber block">
                Ranked Verdicts
              </span>
              <h2 className="font-heading font-extrabold text-xl text-ink">
                Five Parallel Scored Options
              </h2>
            </div>
            <span className="text-xs text-ink-muted hidden sm:inline">
              Grab handle & drop into Commit or Compare zones above
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {options.map((opt, idx) => {
              const isOptionWinner = opt.id === winner?.id;
              const isCommitted = opt.id === committedOptionId;
              const isOptionGated =
                gated && ['repair', 'diy_repair', 'reuse', 'repurpose'].includes(opt.id);
              const isExpanded = expandedOptionId === opt.id;

              return (
                <div key={opt.id} className="flex flex-col">
                  <DataCard
                    id={opt.id}
                    type="option"
                    title={`#${idx + 1} ${opt.name}`}
                    subtitle={`Score: ${opt.score}/100`}
                    badge={isCommitted ? 'Committed' : isOptionWinner ? 'Winner' : undefined}
                    isLocked={isOptionGated}
                    lockReason="Critical safety hazard: DIY options locked."
                    data={opt}
                    className={
                      isCommitted
                        ? 'border-deepGreen ring-2 ring-deepGreen/40 shadow-card'
                        : isOptionWinner
                        ? 'border-amber ring-2 ring-amber/30'
                        : ''
                    }
                  >
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between border-b border-ink-border/30 pb-1">
                        <span className="text-ink-muted">Cost:</span>
                        <span className="font-mono font-bold text-ink">
                          {opt.costEstimate > 0 ? `₹${opt.costEstimate.toLocaleString('en-IN')}` : '₹0'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-ink-border/30 pb-1">
                        <span className="text-ink-muted">CO₂ Avoided:</span>
                        <span className="font-mono font-bold text-deepGreen">
                          +{opt.carbonSavedKg || 0} kg
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-ink-border/30 pb-1">
                        <span className="text-ink-muted">Added Life:</span>
                        <span className="font-mono font-bold text-ink">
                          +{opt.lifespanAddedYears || 0}y
                        </span>
                      </div>

                      {/* "Why this?" Expandable on Click (permitted details toggle) */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedOptionId(isExpanded ? null : opt.id)}
                          className="w-full flex items-center justify-between text-[10px] font-bold text-brand-deep hover:text-brand transition-colors p-1 rounded hover:bg-brand-surfaceAlt"
                          aria-expanded={isExpanded}
                        >
                          <span>Why this?</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-1.5 p-2 rounded bg-brand-surfaceAlt/60 text-[10px] text-ink space-y-1">
                            <p className="font-medium leading-relaxed">{opt.verdictSummary}</p>
                            {opt.factors && (
                              <div className="pt-1 border-t border-ink-border/30 text-[9px] font-mono text-ink-muted">
                                <div>Financial: {opt.factors.cost?.rating}/10</div>
                                <div>Feasibility: {opt.factors.practicality?.rating}/10</div>
                                <div>Ecology: {opt.factors.environment?.rating}/10</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </DataCard>
                </div>
              );
            })}
          </div>
        </section>

        {/* Committed Action Plan & Step Cards Section */}
        {committedOptionId && (
          <section className="p-6 rounded-brand-lg bg-white border-2 border-deepGreen/40 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-border/40 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen">
                  Action Plan Unlocked • {activeCommittedOption.name}
                </span>
                <h3 className="font-heading font-extrabold text-xl text-ink">
                  Execution Checklist Cards
                </h3>
              </div>
              <span className="text-xs text-ink-muted">
                Drag each step card into the "Done" zone below to mark complete
              </span>
            </div>

            {/* Action Zone: Drop step here to mark Done */}
            <ActionZone
              id="zone-plan-done"
              label="Drop step card here to mark Done"
              hint="Persists step completion in session storage."
              className="bg-brand-surfaceAlt/30 min-h-[90px]"
            />

            {/* Draggable Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {rawChecklist.map((stepText, idx) => {
                const stepId = `step_${idx + 1}_${activeCommittedOption.id}`;
                const isTicked = Boolean(checkedSteps[stepId]);

                return (
                  <DataCard
                    key={stepId}
                    id={stepId}
                    type="step"
                    title={`Step ${idx + 1}`}
                    subtitle={isTicked ? 'Completed' : 'Pending Action'}
                    badge={isTicked ? 'Done' : `Step ${idx + 1}`}
                    icon={isTicked ? CheckCircle2 : Wrench}
                    data={{ id: stepId, text: stepText, optionId: activeCommittedOption.id }}
                    className={isTicked ? 'border-deepGreen bg-tint/30' : ''}
                  >
                    <p className={`text-[11px] leading-relaxed ${isTicked ? 'line-through text-ink-muted' : 'text-ink font-medium'}`}>
                      {stepText}
                    </p>
                  </DataCard>
                );
              })}
            </div>
          </section>
        )}

        {/* Side-by-Side Comparison Panel (closeable with Esc or click-outside) */}
        {showCompareModal && comparedOptionIds.length > 0 && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Side-by-side comparison"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowCompareModal(false)}
          >
            <div
              className="bg-white rounded-brand-lg max-w-4xl w-full p-6 space-y-6 shadow-elevated border border-ink-border max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-ink-border/50 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber block">
                    Comparative Inspection
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-ink">
                    Side-by-Side Trade-off Analysis
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompareModal(false)}
                  className="p-1.5 rounded hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink font-mono text-xs font-bold"
                  aria-label="Close modal (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {comparedOptionIds.map((optId) => {
                  const match = options.find((o) => o.id === optId);
                  if (!match) return null;

                  return (
                    <div
                      key={match.id}
                      className="p-4 rounded-brand border border-ink-border/80 bg-brand-surfaceAlt/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-bold text-base text-ink">{match.name}</h4>
                        <span className="font-heading font-black text-lg text-deepGreen">
                          {match.score}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between border-b border-ink-border/30 pb-1">
                          <span className="text-ink-muted">Cost:</span>
                          <span className="font-mono font-bold text-ink">
                            ₹{match.costEstimate.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-ink-border/30 pb-1">
                          <span className="text-ink-muted">CO₂ Avoided:</span>
                          <span className="font-mono font-bold text-deepGreen">
                            +{match.carbonSavedKg || 0} kg
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-ink-border/30 pb-1">
                          <span className="text-ink-muted">Lifespan:</span>
                          <span className="font-mono font-bold text-ink">
                            +{match.lifespanAddedYears || 0}y
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-ink-muted leading-relaxed">
                        {match.verdictSummary}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2 border-t border-ink-border/40 text-xs text-ink-muted font-mono">
                Press Esc or click outside to close comparison.
              </div>
            </div>
          </div>
        )}
      </div>
    </CanvasProvider>
  );
}
