import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  CheckCircle,
  HelpCircle,
  Clock,
  DollarSign,
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
} from 'lucide-react';
import { ScorePill } from '../common/ScorePill.jsx';
import { EstimateBadge } from '../common/EstimateBadge.jsx';
import { useAssessment } from '../../state/AssessmentContext.jsx';
import { COPY } from '../../copy/en.js';

export function OptionCard({ option, rank = 1, isWinner = false }) {
  const navigate = useNavigate();
  const { setSelectedOptionId } = useAssessment();
  const [showBreakdown, setShowBreakdown] = useState(isWinner);

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
    setSelectedOptionId(option.id);
    navigate('/action');
  };

  return (
    <article
      className={`rounded-brand-lg border transition-all duration-200 overflow-hidden relative ${
        isWinner
          ? 'bg-white border-brand shadow-card ring-2 ring-brand/20'
          : 'bg-white border-ink-border/80 hover:border-brand/50 shadow-subtle'
      }`}
    >
      {/* Winner Header Ribbon */}
      {isWinner && (
        <div className="bg-brand text-white px-4 py-2 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-action-amber fill-action-amber" />
            <span className="uppercase tracking-wider font-heading">{COPY.verdict.winnerBadge}</span>
          </div>
          <span className="text-brand-tint font-mono font-medium">Rank #1 Choice</span>
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
                {COPY.verdict.options[option.id]?.tagline || option.name}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1">
            <ScorePill score={option.score} size={isWinner ? 'lg' : 'md'} isWinner={isWinner} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-brand bg-brand-surface border border-ink-border/50 text-xs">
          <div>
            <div className="flex items-center gap-1 text-ink-faint mb-0.5">
              <DollarSign className="w-3.5 h-3.5 text-brand" />
              <span>Net Cost</span>
              <EstimateBadge className="text-[9px] px-1 py-0" />
            </div>
            <span className="font-mono font-bold text-sm text-ink block">
              ${option.costEstimate}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1 text-ink-faint mb-0.5">
              <Leaf className="w-3.5 h-3.5 text-brand" />
              <span>CO₂e Saved</span>
            </div>
            <span className="font-mono font-bold text-sm text-brand-deep block">
              {option.carbonSavedKg > 0 ? `+${option.carbonSavedKg} kg` : '0 kg'}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1 text-ink-faint mb-0.5">
              <Clock className="w-3.5 h-3.5 text-brand" />
              <span>Time Needed</span>
            </div>
            <span className="font-mono font-bold text-sm text-ink block">
              {option.timeEstimateMinutes < 60
                ? `${option.timeEstimateMinutes} min`
                : `${(option.timeEstimateMinutes / 60).toFixed(1)} hrs`}
            </span>
          </div>
        </div>

        {/* Plain-language explanation */}
        <p className="text-sm text-ink leading-relaxed font-medium bg-brand-surfaceAlt/30 p-3 rounded-brand border border-ink-border/40">
          {option.verdictSummary}
        </p>

        {/* Pros & Cons */}
        <div className="space-y-1.5 text-xs">
          {option.pros?.map((pro, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-ink-muted">
              <CheckCircle className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
              <span>{pro}</span>
            </div>
          ))}
        </div>

        {/* Expandable Breakdown Drawer */}
        <div className="pt-2 border-t border-ink-border/60">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-xs font-semibold text-ink-muted hover:text-ink transition-colors py-1"
          >
            <span>{COPY.verdict.tabs.breakdown}</span>
            {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showBreakdown && (
            <div className="mt-3 space-y-2.5 p-3 rounded-brand bg-brand-surfaceAlt/40 text-xs">
              <div>
                <div className="flex justify-between text-ink-muted mb-1">
                  <span>{COPY.verdict.scores.financial}</span>
                  <span className="font-mono font-semibold">{option.scoreBreakdown.financial}%</span>
                </div>
                <div className="h-1.5 w-full bg-ink-border/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${option.scoreBreakdown.financial}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-ink-muted mb-1">
                  <span>{COPY.verdict.scores.feasibility}</span>
                  <span className="font-mono font-semibold">{option.scoreBreakdown.feasibility}%</span>
                </div>
                <div className="h-1.5 w-full bg-ink-border/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${option.scoreBreakdown.feasibility}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-ink-muted mb-1">
                  <span>{COPY.verdict.scores.environmental}</span>
                  <span className="font-mono font-semibold">{option.scoreBreakdown.environmental}%</span>
                </div>
                <div className="h-1.5 w-full bg-ink-border/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${option.scoreBreakdown.environmental}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-ink-muted mb-1">
                  <span>{COPY.verdict.scores.longevity}</span>
                  <span className="font-mono font-semibold">{option.scoreBreakdown.longevity}%</span>
                </div>
                <div className="h-1.5 w-full bg-ink-border/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all"
                    style={{ width: `${option.scoreBreakdown.longevity}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button: One primary action rule respected */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleChoosePath}
            className={`w-full py-2.5 px-4 rounded-brand font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isWinner
                ? 'bg-action-amber hover:bg-action-amberHover text-ink hover:text-white shadow-xs'
                : 'bg-brand-surfaceAlt hover:bg-brand-tint text-brand-deep hover:text-brand-deep border border-brand/20'
            }`}
          >
            <span>Explore Action Plan for {option.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
