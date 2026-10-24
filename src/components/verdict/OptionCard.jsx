import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Leaf,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Recycle,
  ShoppingBag,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { ScorePill } from '../common/ScorePill.jsx';
import { EstimateBadge } from '../common/EstimateBadge.jsx';
import { useAssessment } from '../../state/AssessmentContext.jsx';
import { COPY } from '../../copy/en.js';

const FACTOR_COLORS = {
  cost: { bg: 'bg-[#3B7A57]', label: 'Cost', text: 'text-[#3B7A57]' },
  practicality: { bg: 'bg-[#2F6B4F]', label: 'Practicality', text: 'text-[#2F6B4F]' },
  remainingLife: { bg: 'bg-[#6B9E78]', label: 'Remaining Life', text: 'text-[#6B9E78]' },
  environment: { bg: 'bg-[#10B981]', label: 'Environment', text: 'text-[#10B981]' },
  safety: { bg: 'bg-[#C8553D]', label: 'Safety', text: 'text-[#C8553D]' },
  effort: { bg: 'bg-[#E09F3E]', label: 'Effort', text: 'text-[#E09F3E]' },
};

export function OptionCard({ option, rank = 1, isWinner = false, onSelect = null }) {
  const navigate = useNavigate();
  const { setSelectedOptionId } = useAssessment();
  const [showWhyThis, setShowWhyThis] = useState(isWinner);

  const getIcon = (id) => {
    switch (id) {
      case 'repair':
      case 'repair_diy':
        return <Wrench className="w-5 h-5" />;
      case 'repair_pro':
        return <Shield className="w-5 h-5" />;
      case 'reuse':
        return <Share2 className="w-5 h-5" />;
      case 'repurpose':
        return <Layers className="w-5 h-5" />;
      case 'replace':
        return <ShoppingBag className="w-5 h-5" />;
      case 'recycle':
        return <Recycle className="w-5 h-5" />;
      default:
        return <Wrench className="w-5 h-5" />;
    }
  };

  const handleChoosePath = () => {
    if (onSelect) {
      onSelect(option.id);
    } else {
      setSelectedOptionId(option.id);
      navigate('/action');
    }
  };

  const factors = option.factors || {};

  return (
    <article
      className={`rounded-brand-lg border transition-all duration-200 overflow-hidden relative ${
        isWinner
          ? 'bg-white border-brand shadow-card ring-2 ring-brand/20'
          : 'bg-white border-ink-border/80 hover:border-brand/40 shadow-subtle'
      }`}
    >
      {/* Winner Header Ribbon */}
      {isWinner && (
        <div className="bg-brand text-white px-4 py-2 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-action-amber fill-action-amber" />
            <span className="uppercase tracking-wider font-heading">{COPY.verdict.winnerBadge}</span>
          </div>
          <span className="text-brand-tint font-mono font-medium">Rank #1 Recommendation</span>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-4">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-brand shrink-0 ${
                isWinner ? 'bg-brand-tint text-brand-deep' : 'bg-brand-surfaceAlt text-ink-muted'
              }`}
            >
              {getIcon(option.id)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-ink-faint">
                  #{rank}
                </span>
                <h3 className="font-heading font-bold text-lg text-ink">
                  {option.name}
                </h3>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                {COPY.verdict.options?.[option.id]?.tagline || option.verdictSummary}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1">
            <ScorePill score={option.score} size={isWinner ? 'lg' : 'md'} isWinner={isWinner} />
            <span className="text-[10px] font-mono text-ink-faint">Score / 100</span>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-ink-border/30 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isWinner ? 'bg-brand' : 'bg-brand-deep/70'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, option.score))}%` }}
            />
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-brand bg-brand-surface border border-ink-border/50 text-xs">
          <div>
            <span className="text-[10px] uppercase font-mono text-ink-faint block">Net Cost</span>
            <span className="font-mono font-bold text-sm text-ink block mt-0.5">
              ₹{Number(option.costEstimate || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-ink-faint block">CO₂e Avoided</span>
            <span className="font-mono font-bold text-sm text-brand-deep block mt-0.5">
              {option.carbonSavedKg > 0 ? `+${option.carbonSavedKg} kg` : '0 kg'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono text-ink-faint block">Lifespan Gain</span>
            <span className="font-mono font-bold text-sm text-ink block mt-0.5">
              {option.lifespanAddedYears > 0 ? `+${option.lifespanAddedYears} yrs` : '0 yrs'}
            </span>
          </div>
        </div>

        {/* Primary Verdict Summary */}
        <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium bg-brand-surfaceAlt/40 p-3 rounded-brand border border-ink-border/40">
          {option.verdictSummary}
        </p>

        {/* Expandable "Why This?" Panel */}
        <div className="pt-2 border-t border-ink-border/60 space-y-3">
          <button
            type="button"
            onClick={() => setShowWhyThis(!showWhyThis)}
            className="flex items-center justify-between w-full text-xs font-bold text-ink-muted hover:text-ink transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>{showWhyThis ? 'Hide "Why this?" Analysis' : 'Show "Why this?" Stacked Factor Analysis'}</span>
            </span>
            {showWhyThis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showWhyThis && (
            <div className="p-4 rounded-brand bg-brand-surfaceAlt/50 border border-ink-border/60 space-y-4 animate-fadeIn text-xs">
              {/* Stacked Factor Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-faint">
                    Stacked Factor Point Breakdown ({option.score}/100)
                  </span>
                </div>

                {/* The Stacked Bar */}
                <div className="h-3 w-full bg-ink-border/40 rounded-full overflow-hidden flex shadow-inner">
                  {Object.entries(factors).map(([factorKey, fData]) => {
                    const points = fData?.points || 0;
                    if (points <= 0) return null;
                    const color = FACTOR_COLORS[factorKey] || { bg: 'bg-brand' };
                    return (
                      <div
                        key={factorKey}
                        className={`h-full ${color.bg} transition-all`}
                        style={{ width: `${points}%` }}
                        title={`${color.label}: ${points} pts (Rating ${fData.rating}/10 × Weight ${fData.weight}%)`}
                      />
                    );
                  })}
                </div>

                {/* Factor Legend Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  {Object.entries(factors).map(([factorKey, fData]) => {
                    const color = FACTOR_COLORS[factorKey] || { bg: 'bg-brand', label: factorKey };
                    return (
                      <div key={factorKey} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${color.bg} shrink-0`} />
                        <span className="text-ink-muted font-medium truncate">
                          {color.label}: <strong className="text-ink">{fData.points} pts</strong> ({fData.rating}/10)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2-3 Plain Language Reasons */}
              <div className="space-y-1.5 pt-2 border-t border-ink-border/40">
                <span className="text-[11px] font-mono font-bold uppercase text-brand-deep block">
                  Plain-Language Rationale:
                </span>
                <ul className="space-y-1">
                  {option.reasons?.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-ink-muted">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action plan button for this option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleChoosePath}
                  className="w-full py-2 px-3 rounded-brand text-xs font-semibold bg-white hover:bg-brand-tint border border-brand/30 text-brand-deep transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Select {option.name} Action Checklist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
