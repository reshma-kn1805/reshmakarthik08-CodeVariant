import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Coffee,
  Smartphone,
  Zap,
  Headphones,
  Wind,
  Armchair,
  Bike,
  ShoppingBag,
  Wrench,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { COPY } from '../copy/en.js';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { CanvasProvider, DataCard, ActionZone } from '../canvas/index.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { DonutGauge } from '../components/common/DonutGauge.jsx';
import examplesData from '../data/examples.json';

const CATEGORY_ICONS = {
  kitchen_appliance: Coffee,
  phone_or_laptop: Smartphone,
  charger_or_cable: Zap,
  audio_device: Headphones,
  fan_or_cooler: Wind,
  furniture: Armchair,
  bicycle: Bike,
  bag_or_footwear: ShoppingBag,
};

export function HomePage() {
  const navigate = useNavigate();
  const { rules, loadExample, updateAssessment, assessment, history } = useAssessment();
  const [searchQuery, setSearchQuery] = useState('');

  // Ghost card disappears once user successfully drops a card
  const [hasSucceeded, setHasSucceeded] = useState(() => {
    try {
      return localStorage.getItem('fix_it_first_has_dropped') === 'true';
    } catch (e) {
      return false;
    }
  });

  const categories = rules.categories || [];
  const query = searchQuery.trim().toLowerCase();

  // Filter 3 target example cards
  const targetExampleIds = ['mixer_grinder_spin', 'swollen_battery_phone', 'chair_expensive_repair'];
  const threeExamples = useMemo(() => {
    return examplesData.filter((e) => targetExampleIds.includes(e.id));
  }, []);

  const handleDropSuccess = (result) => {
    try {
      localStorage.setItem('fix_it_first_has_dropped', 'true');
    } catch (e) {
      // ignore
    }
    setHasSucceeded(true);

    if (result.effects?.loadExampleId) {
      loadExample(result.effects.loadExampleId);
    }
    if (result.effects?.navigate) {
      if (result.state?.assessment) {
        updateAssessment(result.state.assessment);
      }
      navigate(result.effects.navigate);
    }
  };

  // Check matching status for live highlight
  const isCategoryMatch = (cat) => {
    if (!query) return true;
    return (
      cat.name?.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query) ||
      cat.id?.toLowerCase().includes(query)
    );
  };

  const isExampleMatch = (ex) => {
    if (!query) return true;
    return (
      ex.title?.toLowerCase().includes(query) ||
      ex.subtitle?.toLowerCase().includes(query) ||
      ex.highlight?.toLowerCase().includes(query)
    );
  };

  const sessionSavings = history.reduce((acc, h) => acc + (h.savings || 0), 0);
  const sessionCarbon = history.reduce((acc, h) => acc + (h.carbon || 0), 0);

  return (
    <CanvasProvider
      stateContext={{ assessment, history }}
      onDropSuccess={handleDropSuccess}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: 'The Workbench (Canvas Mode)' }]} showActions={false} />

        {/* Hero Section - The Workbench */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/15 border border-amber/40 text-ink text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber fill-amber" />
            <span className="font-mono uppercase font-bold tracking-wider">Canvas Protocol Active</span>
            <span className="text-ink-muted">• Drag to Act</span>
          </div>

          <h1 className="font-heading font-black text-4xl sm:text-6xl text-ink tracking-tight leading-[1.08]">
            The Workbench.<br />
            <span className="text-deepGreen italic font-serif">Don't toss it. Decide it.</span>
          </h1>

          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Drag items from the parts bin directly into the action zone to begin diagnosis or test real-world scenarios. All primary decisions are driven by physical drag-and-drop.
          </p>

          {/* Search Field (Only highlights matching cards; strictly NO submit button) */}
          <div className="pt-2 max-w-md mx-auto relative">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="parts-bin-search"
                type="text"
                placeholder="Highlight cards in parts bin (e.g. mixer, phone, chair)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-brand bg-white border border-ink-border text-xs text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-amber shadow-xs transition-colors"
                aria-label="Filter parts bin"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-faint hover:text-ink font-mono font-bold"
                  aria-label="Clear filter"
                >
                  Clear
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-[11px] text-ink-muted mt-1 text-left font-mono">
                Highlighting cards matching "{searchQuery}" — Drag any card into the Action Zone below.
              </p>
            )}
          </div>
        </section>

        {/* Action Zone: Large "Start Assessment" Target */}
        <section className="max-w-2xl mx-auto space-y-3">
          <ActionZone
            id="zone-start-assessment"
            label="Drop card to start assessment"
            hint="Drag any category card from below to configure diagnosis, or drag an example card for an instant verdict."
            emptyState="Empty slot • Drop a Category or Example card to begin"
            mobileSticky={true}
            className="min-h-[140px] bg-white border-brand-deep/30 shadow-card"
          />

          {/* First visit animated ghost card */}
          {!hasSucceeded && (
            <div className="flex flex-col items-center justify-center p-3 rounded-brand bg-amber/10 border border-amber/40 animate-pulse text-center space-y-1">
              <div className="flex items-center gap-2 text-amber text-xs font-bold uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4 animate-spin text-amber" />
                <span>Drag a card into the glowing zone</span>
              </div>
              <p className="text-[11px] text-ink-muted">
                Pick up a Category card or Example card below and drop it into the zone above to begin.
              </p>
            </div>
          )}
        </section>

        {/* 3 Real-World Example Cards Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-ink-border/50 pb-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber block">
                Instant Scenarios (3 Preloaded Demos)
              </span>
              <h2 className="font-heading font-extrabold text-xl text-ink">
                Drag an Example to Verdict
              </h2>
            </div>
            <span className="text-xs text-ink-muted hidden sm:inline">
              Grab handle & drop above to run instant calculation
            </span>
          </div>

          {threeExamples.filter(isExampleMatch).length === 0 ? (
            <div className="p-6 rounded-brand-lg border border-dashed border-ink-border bg-white text-center text-xs text-ink-muted">
              No example scenarios match "{searchQuery}". Clear the search above to view all demos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {threeExamples.map((ex) => {
                const matches = isExampleMatch(ex);
                const isSafety = ex.expectedWinner === 'recycle';

                return (
                  <div
                    key={ex.id}
                    className={`transition-opacity duration-200 ${
                      matches ? 'opacity-100 ring-2 ring-amber/30 rounded-brand-lg' : 'opacity-40'
                    }`}
                  >
                    <DataCard
                      id={ex.id}
                      type="example"
                      title={ex.title}
                      subtitle={ex.subtitle}
                      badge={ex.badge}
                      icon={isSafety ? AlertTriangle : Wrench}
                      data={ex}
                    >
                      <p className="text-[11px] text-ink leading-relaxed font-medium">
                        {ex.highlight}
                      </p>
                      <div className="pt-2 border-t border-ink-border/30 flex items-center justify-between text-[10px] font-mono text-ink-muted">
                        <span>Category: {ex.assessment?.category?.replace(/_/g, ' ')}</span>
                        <span className="text-amber font-bold">Drag to Zone ↑</span>
                      </div>
                    </DataCard>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 8 Draggable Category Cards Section (Parts Bin) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-ink-border/50 pb-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen block">
                The Parts Bin (8 Categories)
              </span>
              <h2 className="font-heading font-extrabold text-xl text-ink">
                Choose an Equipment Type
              </h2>
            </div>
            <span className="text-xs text-ink-muted hidden sm:inline">
              Drag into the Start Assessment zone to open /assess prefilled
            </span>
          </div>

          {categories.filter(isCategoryMatch).length === 0 ? (
            <div className="p-6 rounded-brand-lg border border-dashed border-ink-border bg-white text-center text-xs text-ink-muted">
              No equipment categories match "{searchQuery}". Clear the search above to view all 8 types.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {categories.map((cat) => {
                const IconComp = CATEGORY_ICONS[cat.id] || Wrench;
                const matches = isCategoryMatch(cat);

                return (
                  <div
                    key={cat.id}
                    className={`transition-opacity duration-200 ${
                      matches ? 'opacity-100' : 'opacity-35'
                    }`}
                  >
                    <DataCard
                      id={cat.id}
                      type="category"
                      title={cat.name}
                      subtitle={`Lifespan: ${cat.expectedLifespanYears || 5}y`}
                      icon={IconComp}
                      data={cat}
                      badge="Category"
                    >
                      <p className="text-[11px] text-ink-muted line-clamp-2">
                        {cat.description}
                      </p>
                    </DataCard>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Session Impact Summary Row with DonutGauge */}
        <section className="p-6 rounded-brand-lg bg-white border border-ink-border/80 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen">
              Session Telemetry
            </span>
            <h3 className="font-heading font-bold text-lg text-ink">
              100% Offline Decision Engine
            </h3>
            <p className="text-xs text-ink-muted max-w-md leading-relaxed">
              Every evaluation scores net repair economics, embodied carbon, and personal effort without sponsored recommendations.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="text-[10px] font-mono text-ink-muted uppercase block">Cases Evaluated</span>
              <span className="font-heading font-black text-2xl text-ink">{history.length}</span>
            </div>
            <div className="h-10 w-px bg-ink-border/50" />
            <div className="text-center">
              <span className="text-[10px] font-mono text-ink-muted uppercase block">Net Savings</span>
              <span className="font-heading font-black text-2xl text-deepGreen">₹{sessionSavings.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-10 w-px bg-ink-border/50" />
            <DonutGauge
              score={Math.min(sessionCarbon * 5, 100)}
              size={64}
              strokeWidth={6}
              sublabel="kg CO₂"
              color="#2E7D5B"
            />
          </div>
        </section>
      </div>
    </CanvasProvider>
  );
}
