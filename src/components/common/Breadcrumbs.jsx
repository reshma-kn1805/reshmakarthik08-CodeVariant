import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, PlusCircle, ArrowLeft } from 'lucide-react';
import { useAssessment } from '../../state/AssessmentContext.jsx';

export function Breadcrumbs({ items = [], showActions = true }) {
  const navigate = useNavigate();
  const { setCurrentStep, resetAssessment } = useAssessment();

  const handleAssessAnother = () => {
    resetAssessment();
    setCurrentStep(1);
    navigate('/assess');
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-6 border-b border-ink-border/50 text-xs"
    >
      {/* Breadcrumb path */}
      <ol className="flex items-center gap-1.5 text-ink-muted flex-wrap">
        <li>
          <Link
            to="/"
            className="hover:text-ink flex items-center gap-1 p-1 -m-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber"
            title="Return to Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="font-medium">Home</span>
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-ink-faint shrink-0" />
              {isLast || !item.path ? (
                <span className="font-bold text-ink max-w-[200px] truncate" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-ink transition-colors max-w-[160px] truncate focus-visible:ring-2 focus-visible:ring-amber"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Visible Action Buttons */}
      {showActions && (
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-brand border border-ink-border/80 bg-white hover:bg-brand-surfaceAlt text-ink font-semibold transition-all hover:border-ink-muted focus-visible:ring-2 focus-visible:ring-amber"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </Link>

          <button
            type="button"
            onClick={handleAssessAnother}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-brand bg-amber hover:bg-action-amberHover text-ink hover:text-white shadow-amber-glow font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Assess another item</span>
          </button>
        </div>
      )}
    </nav>
  );
}
