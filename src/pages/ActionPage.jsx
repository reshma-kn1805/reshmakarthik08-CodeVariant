import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Wrench,
  Shield,
  Layers,
  Recycle,
  ShoppingBag,
  Share2,
  Printer,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { useAssessment } from '../state/AssessmentContext.jsx';
import { COPY } from '../copy/en.js';
import { EstimateBadge } from '../components/common/EstimateBadge.jsx';

export function ActionPage() {
  const { decisionResult, selectedOption, setSelectedOptionId, rules } = useAssessment();
  const [completedSteps, setCompletedSteps] = useState({});

  const { item, fault, safety, options } = decisionResult;
  const activeOption = selectedOption || decisionResult.winner;

  const toggleStep = (stepIdx) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepIdx]: !prev[stepIdx],
    }));
  };

  const diySteps = fault?.diySteps || [
    'Disconnect power / remove batteries.',
    'Inspect mechanical fasteners and casing.',
    'Clean out accumulated dust or debris.',
    'Test continuity and mechanical operation before final reassembly.',
  ];

  const toolsRequired = fault?.toolsRequired || ['Standard screwdriver set', 'Microfiber cloth'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-border/60">
        <div>
          <Link
            to="/verdict"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-deep hover:text-brand mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Decision Matrix</span>
          </Link>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
            {COPY.actionPlaybook.title}
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Targeting: <strong className="text-ink">{item?.name}</strong> • Fault: <strong className="text-ink">{fault?.name}</strong>
          </p>
        </div>

        <Link
          to="/verdict"
          className="px-3 py-2 rounded-brand bg-white hover:bg-brand-surfaceAlt text-brand-deep border border-ink-border text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Layers className="w-4 h-4 text-amber" />
          <span>Decision Table (Export via Zone)</span>
        </Link>
      </div>

      {/* Path Selector Tabs (Allows viewing playbook for any of the 5 options) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
        {options.map((opt) => {
          const isSelected = opt.id === activeOption.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedOptionId(opt.id)}
              className={`px-3 py-2 rounded-brand font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-brand-deep text-white shadow-xs'
                  : 'bg-white hover:bg-brand-surfaceAlt text-ink-muted border border-ink-border/60'
              }`}
            >
              <span>{opt.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-brand text-white' : 'bg-brand-surfaceAlt text-ink'}`}>
                {opt.score}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Action Card Banner */}
      <div className="p-5 rounded-brand-lg bg-brand-surface border border-brand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-brand-deep tracking-wider block mb-0.5">
            Active Playbook
          </span>
          <h2 className="font-heading font-extrabold text-xl text-ink">
            {activeOption.name}
          </h2>
          <p className="text-xs text-ink-muted mt-1 max-w-xl leading-relaxed">
            {activeOption.verdictSummary}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-ink-faint block">Estimated Cost</span>
            <span className="font-mono font-bold text-lg text-ink">${activeOption.costEstimate}</span>
            <EstimateBadge className="text-[9px] px-1 py-0 mt-0.5 block" />
          </div>
        </div>
      </div>

      {/* Content specific to active option */}
      {/* 1. DIY Repair Playbook */}
      {(activeOption.id === 'repair' || activeOption.id === 'repair_diy') && (
        <div className="space-y-6">
          {/* Tools & Parts Required */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-brand bg-white border border-ink-border/80 shadow-xs space-y-2">
              <span className="font-heading font-bold text-sm text-ink block">
                {COPY.actionPlaybook.toolsNeeded}
              </span>
              <ul className="space-y-1.5 text-xs text-ink-muted">
                {toolsRequired.map((tool, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-brand bg-white border border-ink-border/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-ink block">
                  {COPY.actionPlaybook.partsNeeded}
                </span>
                <EstimateBadge />
              </div>
              <p className="text-xs text-ink-muted">
                Estimated replacement parts cost: <strong className="text-ink">${activeOption.costEstimate}</strong>
              </p>
              <p className="text-[11px] text-ink-faint leading-relaxed">
                Check reliable replacement part sources: manufacturer official parts portal, iFixit, or local hardware specialist.
              </p>
            </div>
          </div>

          {/* Interactive Step-by-Step Checklist */}
          <div className="p-6 rounded-brand-lg bg-white border border-ink-border shadow-subtle space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-ink">
              {COPY.actionPlaybook.diyChecklistTitle}
            </h3>

            <div className="space-y-3">
              {diySteps.map((step, idx) => {
                const isDone = Boolean(completedSteps[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3.5 rounded-brand border cursor-pointer transition-all flex items-start gap-3 ${
                      isDone
                        ? 'bg-brand-surfaceAlt/60 border-brand/40 text-ink line-through opacity-75'
                        : 'bg-white border-ink-border/80 hover:border-brand text-ink'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-brand flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                        isDone ? 'bg-brand text-white' : 'border border-ink-border bg-brand-surface'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 text-xs leading-relaxed font-medium">
                      <span className="font-bold text-ink mr-2">Step {idx + 1}:</span>
                      <span>{step}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Professional Repair Playbook */}
      {activeOption.id === 'repair_pro' && (
        <div className="p-6 rounded-brand-lg bg-white border border-ink-border shadow-subtle space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-ink">
            {COPY.actionPlaybook.proChecklistTitle}
          </h3>
          <p className="text-xs text-ink-muted">
            Before handing your item to a repair shop, use these questions to protect against overcharging or counterfeit components:
          </p>

          <div className="space-y-3">
            {COPY.actionPlaybook.proChecklist.map((tip, idx) => (
              <div key={idx} className="p-3.5 rounded-brand bg-brand-surface border border-ink-border/60 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-tint text-brand-deep font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-ink leading-relaxed font-medium">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Reuse / Pass Along Playbook */}
      {activeOption.id === 'reuse' && (
        <div className="p-6 rounded-brand-lg bg-white border border-ink-border shadow-subtle space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-ink">
            Responsible Donation & Re-homing Guidelines
          </h3>
          <div className="space-y-3 text-xs text-ink-muted">
            <div className="p-3.5 rounded-brand bg-brand-surface border border-ink-border/60">
              <span className="font-bold text-ink block mb-1">Local Repair Cafes & Maker Spaces</span>
              <p>Community repair events love items with minor defects as hands-on teaching examples for apprentices.</p>
            </div>
            <div className="p-3.5 rounded-brand bg-brand-surface border border-ink-border/60">
              <span className="font-bold text-ink block mb-1">Direct Gifting via Freecycle / Buy Nothing</span>
              <p>Post honestly with photos describing the minor fault. Hobbyists frequently claim and refurbish them within hours.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Repurpose / Upcycle Playbook */}
      {activeOption.id === 'repurpose' && (
        <div className="p-6 rounded-brand-lg bg-white border border-ink-border shadow-subtle space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-ink">
            {COPY.actionPlaybook.upcycleTitle}
          </h3>
          {activeOption.featuredIdea ? (
            <div className="p-4 rounded-brand bg-brand-surface border border-brand/20 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-brand tracking-wider">
                Recommended Project: {activeOption.featuredIdea.difficulty} • {activeOption.featuredIdea.timeMinutes} mins
              </span>
              <h4 className="font-heading font-bold text-base text-ink">
                {activeOption.featuredIdea.title}
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                {activeOption.featuredIdea.description}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* 5. Replace Playbook */}
      {activeOption.id === 'replace' && (
        <div className="p-6 rounded-brand-lg bg-white border border-ink-border shadow-subtle space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-ink">
            Smart & Circular Replacement Checklist
          </h3>
          <div className="space-y-3 text-xs text-ink-muted">
            <div className="p-3.5 rounded-brand bg-brand-surface border border-ink-border/60">
              <strong className="text-ink block mb-0.5">Prioritize Repairability Index</strong>
              <p>When shopping for replacement, look for modular designs with readily available replacement parts and standard screws.</p>
            </div>
            <div className="p-3.5 rounded-brand bg-brand-surface border border-ink-border/60">
              <strong className="text-ink block mb-0.5">Trade-in or Core Deposit Credit</strong>
              <p>Ask the retailer if they provide trade-in discounts for your old unit so its aluminum, copper, and circuit boards can be recycled.</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Recycle Playbook */}
      {activeOption.id === 'recycle' && (
        <div className="p-6 rounded-brand-lg bg-white border border-ink-border shadow-subtle space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-ink">
            {COPY.actionPlaybook.recycleTitle}
          </h3>
          <div className="space-y-3 text-xs text-ink-muted">
            {COPY.actionPlaybook.recycleGuidelines.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-brand bg-brand-surface border border-ink-border/60 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span className="font-medium text-ink">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
