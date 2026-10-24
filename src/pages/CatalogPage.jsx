import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Wrench, Sparkles, ShieldAlert, ArrowRight, Layers, Tag } from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { COPY } from '../copy/en.js';
import { EstimateBadge } from '../components/common/EstimateBadge.jsx';
import { Breadcrumbs } from '../components/common/Breadcrumbs.jsx';
import { MatrixHeatmap } from '../components/verdict/MatrixHeatmap.jsx';

export function CatalogPage() {
  const navigate = useNavigate();
  const { rules, updateAssessment, decisionResult } = useAssessment();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const allFaultsList = useMemo(() => {
    const list = [];
    rules.categories.forEach(cat => {
      cat.items.forEach(item => {
        item.commonFaults.forEach(faultId => {
          const fault = rules.faults[faultId];
          if (fault) {
            list.push({
              faultId,
              fault,
              item,
              category: cat,
            });
          }
        });
      });
    });
    return list;
  }, [rules]);

  const filteredFaults = useMemo(() => {
    return allFaultsList.filter(({ fault, item, category }) => {
      const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        fault.name.toLowerCase().includes(q) ||
        fault.description?.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        category.name.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allFaultsList, selectedCategory, searchTerm]);

  const handleStartWithFault = (catId, itemId, faultId, defaultPrice) => {
    updateAssessment({
      category: catId,
      itemId,
      originalPrice: defaultPrice,
      faultId,
      severity: rules.faults[faultId]?.severity || 'moderate',
    });
    navigate('/assess');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs items={[{ label: 'The Workbench', path: '/' }, { label: 'The Decision Matrix' }]} showActions={false} />

      {/* Page Header */}
      <div className="space-y-1 pb-2 border-b border-ink-border/50">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-deepGreen block">
          Parallel Circular Scoring
        </span>
        <h1 className="font-heading font-black text-3xl text-ink">
          The Decision Matrix
        </h1>
        <p className="text-xs text-ink-muted">
          Multi-dimensional breakdown across all 5 circular pathways and 6 weighted decision factors.
        </p>
      </div>

      {/* Phase B: Matrix Heatmap with Option × Factor Weights & Hover Reasons */}
      <MatrixHeatmap
        options={decisionResult.options}
        weights={decisionResult.weights || {}}
        gated={decisionResult.gated}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-ink-faint" />
          <input
            type="text"
            placeholder={COPY.catalog.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-brand border border-ink-border bg-white text-ink text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-brand font-semibold transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-brand-deep text-white'
                : 'bg-white hover:bg-brand-surfaceAlt text-ink-muted border border-ink-border'
            }`}
          >
            {COPY.catalog.filterAll}
          </button>
          {rules.categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-brand font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-brand-deep text-white'
                  : 'bg-white hover:bg-brand-surfaceAlt text-ink-muted border border-ink-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Faults Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaults.map(({ faultId, fault, item, category }, idx) => {
          const isSafety = fault.safetyRisk === 'high' || fault.safetyRisk === 'critical';

          return (
            <div
              key={`${item.id}-${faultId}-${idx}`}
              className={`p-5 rounded-brand bg-white border transition-all flex flex-col justify-between space-y-4 shadow-subtle hover:shadow-card ${
                isSafety ? 'border-safety-rustBorder/50' : 'border-ink-border/80 hover:border-brand/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-ink-faint">
                  <span className="font-mono">{category.name}</span>
                  {isSafety && (
                    <span className="inline-flex items-center gap-1 text-safety-rust font-bold bg-safety-rustLight px-1.5 py-0.5 rounded">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Safety Gate</span>
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-brand-deep block">
                    {item.name}
                  </span>
                  <h3 className="font-heading font-bold text-sm text-ink leading-snug">
                    {fault.name}
                  </h3>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                  {fault.description}
                </p>
              </div>

              <div className="pt-3 border-t border-ink-border/50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-ink-faint text-[10px] block">Est. Parts</span>
                    <span className="font-mono font-bold text-ink">${fault.partsCostEstimate}</span>
                    <EstimateBadge className="text-[9px] px-1 py-0 ml-1" />
                  </div>
                  <div>
                    <span className="text-ink-faint text-[10px] block">DIY Time</span>
                    <span className="font-mono font-semibold text-ink">{fault.diyTimeMinutes} min</span>
                  </div>
                  <div>
                    <span className="text-ink-faint text-[10px] block">Difficulty</span>
                    <span className="font-mono capitalize text-ink">{fault.diyDifficulty}</span>
                  </div>
                </div>

                <Link
                  to="/assess"
                  onClick={() => handleStartWithFault(category.id, item.id, faultId, item.defaultNewPrice)}
                  className="w-full py-2 px-3 rounded-brand text-xs font-bold bg-brand-surfaceAlt hover:bg-brand text-brand-deep hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Evaluate this Fault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
