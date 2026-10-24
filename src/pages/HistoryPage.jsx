import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  History,
  ArrowRight,
  Trash2,
  Sparkles,
  Clock,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit3,
  ExternalLink,
  X,
  Plus,
  Scale,
  Leaf,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { PageContainer, Card, Badge, Button } from '../components/ui/index.js';
import { EstimateBadge } from '../components/common/EstimateBadge.jsx';

export function HistoryPage() {
  const navigate = useNavigate();
  const {
    history,
    deleteHistoryItem,
    clearHistory,
    updateAssessment,
    setCurrentStep,
    loadExample,
    examples,
  } = useAssessment();

  // State for side-by-side comparison: holds up to 2 item IDs
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Toggle selection for comparison
  const toggleSelectForCompare = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        // Replace second selection
        return [prev[0], id];
      }
      return [...prev, id];
    });
  };

  const handleOpenVerdict = (id) => {
    navigate(`/verdict/${id}`);
  };

  const handleEditAndRerun = (item) => {
    if (item.assessment) {
      updateAssessment(item.assessment);
      setCurrentStep(1);
      navigate('/assess');
    }
  };

  // Compare pair
  const compareItemA = history.find((h) => h.id === selectedIds[0]);
  const compareItemB = history.find((h) => h.id === selectedIds[1]);

  return (
    <PageContainer maxWidth="5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-deepGreen tracking-wider">
                Session Log
              </span>
              <Badge variant="green" size="sm">
                {history.length} {history.length === 1 ? 'assessment' : 'assessments'}
              </Badge>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mt-0.5">
              Decision History
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              All evaluations performed in this session. Saved locally in browser memory with zero tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {selectedIds.length === 2 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCompareModal(true)}
                className="gap-1.5"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Compare Selected (2)</span>
              </Button>
            )}

            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all session history?')) {
                    clearHistory();
                    setSelectedIds([]);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-rust px-2.5 py-1.5 rounded border border-ink-border/60 hover:border-rust/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Comparison floating banner if exactly 2 are selected */}
        {selectedIds.length > 0 && (
          <div className="p-3.5 rounded-brand-lg bg-brand-surface border-2 border-amber/50 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-action-amberLight text-action-amberHover">
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-ink">
                  {selectedIds.length === 2
                    ? '2 items selected for side-by-side comparison'
                    : '1 item selected. Select 1 more to compare.'}
                </span>
                <span className="text-ink-muted block text-[11px]">
                  {selectedIds.length === 2
                    ? 'Compare trade-offs, repair economics, and recommended pathways.'
                    : 'Click "Compare" on any second item below.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedIds.length === 2 && (
                <button
                  type="button"
                  onClick={() => setShowCompareModal(true)}
                  className="px-3 py-1.5 rounded-brand bg-amber text-ink hover:text-white text-xs font-bold hover:bg-action-amberHover transition-all flex items-center gap-1 cursor-pointer shadow-amber-glow"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>View Side-by-Side</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 ? (
          <Card className="text-center py-12 px-4 space-y-5">
            <div className="w-14 h-14 rounded-full bg-brand-surface text-green border border-ink-border flex items-center justify-center mx-auto">
              <History className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-heading font-bold text-lg text-ink">No assessments yet</h3>
              <p className="text-xs text-ink-muted">
                Run an item assessment to see your options ranked with honest estimates, carbon footprint, and clear next steps.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setCurrentStep(1);
                  navigate('/assess');
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Assessment</span>
              </Button>
            </div>

            {/* Quick-load example seeds */}
            <div className="pt-6 border-t border-ink-border/50 max-w-xl mx-auto">
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-faint mb-3">
                Or seed session with a 1-click example:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                {examples.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                      const id = loadExample(ex.id);
                      navigate(`/verdict/${id}`);
                    }}
                    className="p-2.5 rounded-brand bg-white border border-ink-border hover:border-amber text-xs hover:shadow-subtle transition-all cursor-pointer"
                  >
                    <span className="font-bold text-ink block truncate">{ex.title}</span>
                    <span className="text-[11px] text-ink-muted block truncate mt-0.5">
                      {ex.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          /* List of past decisions */
          <div className="space-y-3">
            {history.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isGated = Boolean(item.gated);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-brand-lg bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-amber ring-2 ring-amber/20 bg-action-amberLight/30'
                      : 'border-ink-border hover:border-ink-muted'
                  }`}
                >
                  {/* Left: Info and Compare checkbox */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelectForCompare(item.id)}
                      title={isSelected ? 'Remove from comparison' : 'Select for side-by-side comparison'}
                      className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-amber border-amber text-ink'
                          : 'border-ink-border/80 hover:border-amber text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-ink-faint">
                        <span className="capitalize font-medium text-ink-muted">
                          {item.category?.replace(/_/g, ' ')}
                        </span>
                        <span>•</span>
                        <span>{item.dateStr || 'Recent'}</span>
                        {isGated && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rust bg-safety-rustLight px-1.5 py-0.5 rounded border border-safety-rustBorder">
                            <ShieldAlert className="w-3 h-3 text-rust" />
                            Gated Hazard
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading font-bold text-base text-ink truncate">
                        {item.itemName}
                      </h3>

                      <p className="text-xs text-ink-muted truncate">
                        Issue: <span className="text-ink">{item.faultName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle: Winner & Metric Badges */}
                  <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-ink-border/60 sm:pl-4">
                    <div className="text-right">
                      <span className="text-[10px] text-ink-faint uppercase tracking-wider block font-medium">
                        Top Recommendation
                      </span>
                      <span
                        className={`text-xs font-bold block ${
                          isGated ? 'text-rust' : 'text-deepGreen'
                        }`}
                      >
                        {item.winner}
                      </span>
                      <span className="font-mono text-xs text-ink-muted block">
                        Score: <span className="font-bold text-ink">{item.score}</span>/100
                      </span>
                    </div>

                    <div className="text-right pl-3 border-l border-ink-border/60">
                      <span className="text-[10px] text-ink-faint uppercase tracking-wider block font-medium">
                        Net Savings
                      </span>
                      <span className="font-mono text-sm font-bold text-ink">
                        ₹{(item.savings || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-green block font-medium">
                        +{item.carbon || 0} kg CO₂
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink-border/40">
                    <button
                      type="button"
                      onClick={() => handleOpenVerdict(item.id)}
                      className="px-3 py-1.5 rounded-brand bg-amber hover:bg-action-amberHover text-ink hover:text-white shadow-xs text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      title="View full decision verdict"
                    >
                      <span>Verdict</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEditAndRerun(item)}
                      className="p-1.5 rounded hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink transition-colors cursor-pointer"
                      title="Edit parameters and re-evaluate"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-1.5 rounded hover:bg-safety-rustLight text-ink-faint hover:text-rust transition-colors cursor-pointer"
                      title="Delete from session history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compare Modal / Drawer */}
        {showCompareModal && compareItemA && compareItemB && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-brand-lg border border-ink-border max-w-4xl w-full p-6 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-ink-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded bg-action-amberLight text-action-amberHover">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-xl text-ink">
                      Side-by-Side Decision Comparison
                    </h2>
                    <p className="text-xs text-ink-muted">
                      Direct trade-off breakdown between two evaluated items
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompareModal(false)}
                  className="p-1.5 rounded hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dual Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Item A */}
                <div className="p-4 rounded-brand-lg bg-brand-surface/40 border border-ink-border/80 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-green tracking-wider block">
                      Item A • {compareItemA.category}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-ink">
                      {compareItemA.itemName}
                    </h3>
                    <p className="text-xs text-ink-muted">{compareItemA.faultName}</p>
                  </div>

                  <div className="p-3 rounded bg-white border border-ink-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Top Verdict:</span>
                      <span className="font-bold text-deepGreen">{compareItemA.winner}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Overall Score:</span>
                      <span className="font-mono font-bold text-ink">{compareItemA.score} / 100</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Repair vs Replace:</span>
                      <span className="font-mono text-ink">
                        ₹{compareItemA.assessment?.repairCost} vs ₹{compareItemA.assessment?.replaceCost}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Net Purchase Savings:</span>
                      <span className="font-mono font-bold text-green">
                        ₹{(compareItemA.savings || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Carbon Avoided:</span>
                      <span className="font-mono text-ink">
                        {compareItemA.carbon || 0} kg CO₂
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowCompareModal(false);
                        handleOpenVerdict(compareItemA.id);
                      }}
                    >
                      Open Verdict
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCompareModal(false);
                        handleEditAndRerun(compareItemA);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Item B */}
                <div className="p-4 rounded-brand-lg bg-brand-surface/40 border border-ink-border/80 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-green tracking-wider block">
                      Item B • {compareItemB.category}
                    </span>
                    <h3 className="font-heading font-bold text-lg text-ink">
                      {compareItemB.itemName}
                    </h3>
                    <p className="text-xs text-ink-muted">{compareItemB.faultName}</p>
                  </div>

                  <div className="p-3 rounded bg-white border border-ink-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Top Verdict:</span>
                      <span className="font-bold text-deepGreen">{compareItemB.winner}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Overall Score:</span>
                      <span className="font-mono font-bold text-ink">{compareItemB.score} / 100</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Repair vs Replace:</span>
                      <span className="font-mono text-ink">
                        ₹{compareItemB.assessment?.repairCost} vs ₹{compareItemB.assessment?.replaceCost}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Net Purchase Savings:</span>
                      <span className="font-mono font-bold text-green">
                        ₹{(compareItemB.savings || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-ink-muted">Carbon Avoided:</span>
                      <span className="font-mono text-ink">
                        {compareItemB.carbon || 0} kg CO₂
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowCompareModal(false);
                        handleOpenVerdict(compareItemB.id);
                      }}
                    >
                      Open Verdict
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCompareModal(false);
                        handleEditAndRerun(compareItemB);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom footer */}
              <div className="pt-2 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setShowCompareModal(false)}>
                  Close Comparison
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
