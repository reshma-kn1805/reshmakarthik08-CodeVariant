import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, History, LayoutGrid, Sparkles } from 'lucide-react';
import { useAssessment } from '../../state/AssessmentContext.jsx';

export function BottomTabBar({ onOpenExamples }) {
  const location = useLocation();
  const { history } = useAssessment();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Assess', path: '/assess', icon: PlusCircle },
    { label: 'History', path: '/history', icon: History, count: history.length },
    { label: 'Matrix', path: '/explore', icon: LayoutGrid },
  ];

  return (
    <nav
      className="min-[900px]:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#16382E] text-white/80 border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-elevated select-none pb-[calc(env(safe-area-inset-bottom)+0.35rem)]"
      aria-label="Mobile Navigation Bar"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-brand transition-colors relative min-w-[56px] min-h-[44px] ${
              active ? 'text-amber font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {typeof item.count === 'number' && item.count > 0 && (
                <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber text-ink min-w-[14px] text-center">
                  {item.count}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Examples Tab */}
      <button
        type="button"
        onClick={onOpenExamples}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-brand text-white/70 hover:text-white transition-colors min-w-[56px] min-h-[44px] cursor-pointer"
      >
        <Sparkles className="w-5 h-5 text-amber/90" />
        <span className="text-[10px] mt-0.5 font-medium">Examples</span>
      </button>
    </nav>
  );
}
