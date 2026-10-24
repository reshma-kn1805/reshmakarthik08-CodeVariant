import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  RotateCcw,
  Scale,
  Trash2,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2,
  DollarSign,
  Leaf,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { CanvasProvider, DataCard, ActionZone } from '../canvas/index.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { DonutGauge } from '../components/common/DonutGauge.jsx';
import examplesData from '../data/examples.json';

export function HistoryPage() {
  const navigate = useNavigate();
  const {
    history,
    deleteHistoryItem,
    updateAssessment,
    assessment,
  } = useAssessment();

  // Compared history IDs (up to 2)
  const [comparedHistoryIds, setComparedHistoryIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [bannerNotice, setBannerNotice] = useState(null);

  // Esc key closes comparison modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowCompareModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDropSuccess = (result) => {
    if (result.effects?.message) {
      setBannerNotice(result.effects.message);
      setTimeout(() => setBannerNotice(null), 4000);
    }

    // Reopen & edit
    if (result.effects?.navigate) {
      if (result.state?.assessment) {
        updateAssessment(result.state.assessment);
      }
      navigate(result.effects.navigate);
      return;
    }

    // Discard from history
    if (result.effects?.removedId) {
      deleteHistoryItem(result.effects.removedId);
      setComparedHistoryIds((prev) => prev.filter((id) => id !== result.effects.removedId));
    }

    // Compare
    if (result.effects?.comparedHistoryIds) {
      setComparedHistoryIds(result.effects.comparedHistoryIds);
      if (result.effects.openCompareModal) {
        setShowCompareModal(true);
      }
    }
  };

  const handleCustomDrop = (result) => {
    if (!result.success) {
      setBannerNotice(result.effects?.message || 'Drop rejected');
      setTimeout(() => setBannerNotice(null), 4000);
      return;
    }
    handleDropSuccess(result);
  };

  // Compare pair items
  const itemA = history.find((h) => h.id === comparedHistoryIds[0]);
  const itemB = history.find((h) => h.id === comparedHistoryIds[1]);

  const totalSavings = history.reduce((acc, h) => acc + (h.savings || 0), 0);
  const totalCarbon = history.reduce((acc, h) => acc + (h.carbon || 0), 0);

  // Fallback example card for empty state
  const fallbackExample = examplesData[0] || {};
  const fallbackHistoryCard = {
    id: `ex_${fallbackExample.id}`,
    itemName: fallbackExample.title,
    category: fallbackExample.assessment?.category?.replace(/_/g, ' ') || 'Kitchen Appliance',
    faultName: fallbackExample.subtitle,
    winner: 'Repair It Yourself',
    score: 84,
    savings: 3320,
    carbon: 35,
    assessment: fallbackExample.assessment,
  };

  return (
    <CanvasProvider
      stateContext={{
        assessment,
        history,
        comparedHistoryIds,
      }}
      onDropSuccess={handleCustomDrop}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[{ label: 'Workbench', path: '/' }, { label: 'Archive (Canvas Mode)' }]}
          showActions={false}
        />

        {/* Archive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen bg-tint px-2 py-0.5 rounded-full border border-green/20">
                Session Archive • Canvas Mode
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                {history.length} {history.length === 1 ? 'record' : 'records'}
              </span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink mt-1">
              Decision Archive
            </h1>
            <p className="text-xs text-ink-muted">
              All evaluations performed in this session. Drag cards to Reopen, Compare side-by-side, or Discard.
            </p>
          </div>

          {/* Session Impact Stats */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-brand-lg border border-ink-border/80 shadow-xs">
            <DonutGauge
              score={Math.min(history.length * 20, 100)}
              size={56}
              strokeWidth={6}
              color="#2E7D5B"
              label=""
              sublabel="cases"
            />
            <div className="text-left text-xs">
              <span className="text-[10px] font-mono text-ink-muted uppercase block">Cumulative Savings</span>
              <span className="font-mono font-bold text-sm text-deepGreen block">
                ₹{totalSavings.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-ink-muted font-mono block">
                +{totalCarbon} kg CO₂ avoided
              </span>
            </div>
          </div>
        </div>

        {/* Notice feedback banner */}
        {bannerNotice && (
          <div className="p-3 rounded-brand bg-brand-surfaceAlt border border-brand/30 text-brand-deep text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber shrink-0" />
            <span>{bannerNotice}</span>
          </div>
        )}

        {/* Three Action Zones: Reopen & Edit, Compare, Discard */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Zone 1: Reopen & Edit */}
          <ActionZone
            id="zone-history-reopen"
            label="Drop card to Reopen & Edit"
            hint="Loads diagnosis back into the assessment workbench."
            className="bg-white border-brand min-h-[110px] shadow-xs"
          />

          {/* Zone 2: Compare 2 Items */}
          <ActionZone
            id="zone-history-compare"
            label="Drop 2 cards to Compare"
            hint={`Side-by-side comparison. (${comparedHistoryIds.length}/2 cards queued).`}
            className="bg-white border-amber min-h-[110px] shadow-xs"
          />

          {/* Zone 3: Discard */}
          <ActionZone
            id="zone-history-discard"
            label="Drop card to Discard"
            hint="Permanently removes evaluation from session archive."
            className="bg-white border-safety-rust min-h-[110px] shadow-xs"
          />
        </section>

        {/* History Cards Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-ink-border/40 pb-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen block">
                Saved Case Records
              </span>
              <h2 className="font-heading font-extrabold text-xl text-ink">
                Archive Cards
              </h2>
            </div>
            <span className="text-xs text-ink-muted hidden sm:inline">
              Grab handle & drop into an action zone above
            </span>
          </div>

          {history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <DataCard
                  key={item.id}
                  id={item.id}
                  type="history-card"
                  title={item.itemName || 'Assessed Item'}
                  subtitle={`${item.category || 'Appliance'} • ${item.dateStr || 'Recent'}`}
                  badge={item.winner || 'Evaluated'}
                  icon={HistoryIcon}
                  data={item}
                  className={comparedHistoryIds.includes(item.id) ? 'border-amber ring-2 ring-amber/40' : ''}
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between border-b border-ink-border/30 pb-1">
                      <span className="text-ink-muted">Verdict:</span>
                      <span className="font-bold text-deepGreen">{item.winner}</span>
                    </div>
                    <div className="flex justify-between border-b border-ink-border/30 pb-1">
                      <span className="text-ink-muted">Score:</span>
                      <span className="font-mono font-bold text-ink">{item.score}/100</span>
                    </div>
                    <div className="flex justify-between border-b border-ink-border/30 pb-1">
                      <span className="text-ink-muted">Savings:</span>
                      <span className="font-mono font-bold text-deepGreen">
                        ₹{(item.savings || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {item.faultName && (
                      <p className="text-[11px] text-ink-muted truncate pt-0.5">
                        {item.faultName}
                      </p>
                    )}
                  </div>
                </DataCard>
              ))}
            </div>
          ) : (
            /* Empty State with Example Card to drag per prompt requirement */
            <div className="p-8 rounded-brand-lg border-2 border-dashed border-ink-border bg-white text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand-surfaceAlt mx-auto flex items-center justify-center text-ink-muted">
                <HistoryIcon className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-heading font-bold text-lg text-ink">
                  Archive is Empty
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  You haven't saved any evaluations yet. Pick up the demo card below and drag it into <strong>Reopen & Edit</strong> to test the workflow, or start on the workbench.
                </p>
              </div>

              {/* Draggable Demo Card for Empty State */}
              <div className="max-w-md mx-auto pt-2 text-left">
                <DataCard
                  id={fallbackHistoryCard.id}
                  type="history-card"
                  title={fallbackHistoryCard.itemName}
                  subtitle={`${fallbackHistoryCard.category} • Demo Card`}
                  badge="Try Dragging Me"
                  icon={Sparkles}
                  data={fallbackHistoryCard}
                  className="border-amber ring-2 ring-amber/30"
                >
                  <div className="text-xs space-y-1">
                    <p className="text-[11px] text-ink-muted font-medium">
                      {fallbackHistoryCard.faultName}
                    </p>
                    <div className="flex justify-between pt-1 border-t border-ink-border/30 font-mono text-[10px]">
                      <span>Expected: {fallbackHistoryCard.winner}</span>
                      <span className="text-amber font-bold">Drag into Reopen ↑</span>
                    </div>
                  </div>
                </DataCard>
              </div>
            </div>
          )}
        </section>

        {/* Side-by-Side History Comparison Modal */}
        {showCompareModal && itemA && itemB && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Side-by-side history comparison"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowCompareModal(false)}
          >
            <div
              className="bg-white rounded-brand-lg max-w-3xl w-full p-6 space-y-6 shadow-elevated border border-ink-border max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-ink-border/50 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber block">
                    Comparative Inspection
                  </span>
                  <h3 className="font-heading font-extrabold text-2xl text-ink">
                    Side-by-Side Evaluation Comparison
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

              <div className="grid grid-cols-2 gap-4">
                {[itemA, itemB].map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-brand border border-ink-border/80 bg-brand-surfaceAlt/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber">
                        Case {idx === 0 ? 'A' : 'B'}
                      </span>
                      <span className="font-heading font-black text-lg text-deepGreen">
                        {item.score}/100
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-ink">{item.itemName}</h4>
                    <p className="text-[11px] text-ink-muted">{item.category}</p>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-ink-border/30">
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Winner:</span>
                        <span className="font-bold text-deepGreen">{item.winner}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Savings:</span>
                        <span className="font-mono font-bold text-ink">
                          ₹{(item.savings || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-muted">Carbon Avoided:</span>
                        <span className="font-mono font-bold text-deepGreen">
                          +{item.carbon || 0} kg
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
