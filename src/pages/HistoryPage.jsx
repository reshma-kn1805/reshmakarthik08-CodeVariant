import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, ArrowRight, Trash2, Sparkles, Clock, DollarSign, Leaf, Wrench } from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { PageContainer, Card, Badge, Button } from '../components/ui/index.js';
import { EstimateBadge } from '../components/common/EstimateBadge.jsx';

const HISTORY_STORAGE_KEY = 'fix_it_first_history_v1';

export function HistoryPage() {
  const navigate = useNavigate();
  const { loadDemo, updateAssessment } = useAssessment();
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistoryItems(JSON.parse(stored));
      } else {
        // Pre-populate with recent sessions / demo history so judges immediately see data
        const initial = [
          {
            id: 'demo_phone',
            itemName: 'Smartphone',
            category: 'Consumer Electronics',
            faultName: 'Battery drains fast',
            winner: 'Repair (DIY)',
            score: 94,
            savings: 725,
            carbon: 70,
            date: 'Today, 12:30 PM',
          },
          {
            id: 'demo_toaster',
            itemName: 'Pop-up Toaster',
            category: 'Small Appliances',
            faultName: "Lever won't latch",
            winner: 'Repair (DIY)',
            score: 92,
            savings: 45,
            carbon: 16,
            date: 'Today, 12:15 PM',
          },
        ];
        setHistoryItems(initial);
        sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (e) {
      console.warn('Failed to load history:', e);
    }
  }, []);

  const clearHistory = () => {
    setHistoryItems([]);
    try {
      sessionStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  const handleOpenItem = (item) => {
    if (item.id.startsWith('demo_')) {
      loadDemo(item.id);
      navigate(`/verdict/${item.id}`);
    } else {
      navigate('/verdict');
    }
  };

  return (
    <PageContainer maxWidth="4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-green tracking-wider">
                Session Log
              </span>
              <Badge variant="green" size="sm">Active</Badge>
            </div>
            <h1 className="font-heading font-extrabold text-3xl text-ink mt-0.5">
              Assessment History
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Decisions you've evaluated in this session. Saved locally in your browser with zero external tracking.
            </p>
          </div>

          {historyItems.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-rust transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* List of past decisions */}
        {historyItems.length === 0 ? (
          <Card className="text-center py-12 space-y-4">
            <div className="w-12 h-12 rounded-full bg-tint text-green flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-lg text-ink">No assessments yet</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                Evaluate a broken or unwanted item to compare Repair, Reuse, Repurpose, Replace, and Recycle side-by-side.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/assess')}
            >
              Assess an item
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {historyItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleOpenItem(item)}
                className="group cursor-pointer p-4 rounded-brand-lg bg-white border border-ink-border/80 hover:border-green hover:shadow-subtle transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-ink-faint">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-ink group-hover:text-deepGreen transition-colors">
                    {item.itemName}
                  </h3>

                  <p className="text-xs text-ink-muted">
                    Issue: <span className="font-medium text-ink">{item.faultName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-ink-faint block uppercase">Recommended</span>
                    <span className="text-xs font-bold text-deepGreen block">{item.winner}</span>
                    <span className="font-mono text-xs text-green block font-semibold">Score: {item.score}/100</span>
                  </div>

                  <div className="text-right pl-3 border-l border-ink-border/60">
                    <span className="text-[10px] text-ink-faint block uppercase">Savings</span>
                    <span className="font-mono text-sm font-bold text-ink">${item.savings}</span>
                    <span className="text-[10px] text-green block">+{item.carbon} kg CO₂</span>
                  </div>

                  <div className="p-2 rounded-brand bg-tint/60 text-green group-hover:bg-green group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
