import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wrench,
  Home,
  PlusCircle,
  History,
  LayoutGrid,
  Sparkles,
  Leaf,
  Scale,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { useAssessment } from '../../state/AssessmentContext.jsx';
import { COPY } from '../../copy/en.js';

export function Sidebar({ onOpenExamples }) {
  const location = useLocation();
  const { history, resetAssessment } = useAssessment();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Calculate session impact
  const sessionCount = history.length;
  const totalSavings = history.reduce((acc, item) => acc + (item.savings || 0), 0);
  const totalCarbon = history.reduce((acc, item) => acc + (item.carbon || 0), 0);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Assess an item', path: '/assess', icon: PlusCircle },
    { name: 'History', path: '/history', icon: History, count: sessionCount },
    { name: 'The Matrix', path: '/explore', icon: LayoutGrid },
    { name: '48s Demo Video', path: '/demo', icon: Sparkles },
  ];

  return (
    <aside
      className="hidden min-[900px]:flex fixed top-0 left-0 bottom-0 w-64 bg-[#16382E] text-white flex-col justify-between p-5 z-40 shadow-card border-r border-white/10 select-none"
      aria-label="Primary Navigation"
    >
      {/* Top: Wordmark & Navigation */}
      <div className="space-y-6">
        {/* Wordmark - Clicking goes home */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-brand p-1 -m-1"
          title="Fix It First — Home"
        >
          <div className="w-10 h-10 rounded-brand bg-white/10 group-hover:bg-amber group-hover:text-ink text-white flex items-center justify-center transition-colors shadow-inner">
            <Wrench className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-heading font-black text-xl text-white tracking-tight block leading-tight group-hover:text-amber transition-colors">
              Fix It First
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 block font-semibold">
              Decision Workshop
            </span>
          </div>
        </Link>

        {/* Primary Nav Links */}
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-brand text-xs font-semibold transition-all duration-200 group ${
                  active
                    ? 'bg-white/15 text-white shadow-xs font-bold ring-1 ring-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-amber' : 'text-white/50 group-hover:text-white'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber text-ink">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Examples button */}
          <button
            type="button"
            onClick={onOpenExamples}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-brand text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber/80 group-hover:text-amber" />
              <span>Examples</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/70">
              30s
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom: "This Session" Card & Quick Actions */}
      <div className="space-y-3">
        {/* "This session" Card */}
        <div className="p-3.5 rounded-[18px] bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/60">
              This Session
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-white/70">Assessed:</span>
              <span className="font-mono font-bold text-sm text-white tabular-nums">
                {sessionCount} {sessionCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {sessionCount > 0 ? (
              <>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-white/60">Est. savings:</span>
                  <span className="font-mono font-bold text-amber tabular-nums">
                    ₹{totalSavings.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-white/60">CO₂ avoided:</span>
                  <span className="font-mono font-bold text-emerald-300 tabular-nums">
                    +{totalCarbon} kg
                  </span>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-white/50 leading-snug">
                Zero evaluations yet. Start by assessing an item or exploring examples.
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5">
          <span>Workshop v1.2</span>
          <span>100% Offline Math</span>
        </div>
      </div>
    </aside>
  );
}
