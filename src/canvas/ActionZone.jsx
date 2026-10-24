import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { getZoneById } from '../config/zones.js';
import { Sparkles, AlertCircle, ArrowDownCircle } from 'lucide-react';

/**
 * ActionZone: Droppable container for The Canvas Protocol
 * Features:
 * - Dashed outline with prominent verb label
 * - Valid hover glows amber
 * - Invalid hover turns rust
 * - Rejection pulse animation
 */
export function ActionZone({
  id,
  label,
  hint,
  accepts,
  activeCard = null,
  isBouncing = false,
  mobileSticky = false,
  className = '',
  children,
}) {
  const zoneConfig = getZoneById(id) || {};
  const acceptedTypes = accepts || zoneConfig.accepts || [];
  const displayLabel = label || zoneConfig.label || 'Drop Card Here';
  const displayHint = hint || zoneConfig.hint || '';

  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      id,
      accepts: acceptedTypes,
      zone: zoneConfig,
    },
  });

  // Check compatibility with card currently being dragged
  const isDragging = Boolean(activeCard);
  const isValidTarget = activeCard && acceptedTypes.includes(activeCard.type);
  const isInvalidTarget = activeCard && !acceptedTypes.includes(activeCard.type);

  // Dynamic visual states
  let stateClasses = 'border-ink-border/80 bg-brand-surfaceAlt/30 text-ink-muted';

  if (isOver && isValidTarget) {
    // Valid hover: Amber Glow
    stateClasses =
      'border-amber bg-amber/15 shadow-[0_0_20px_rgba(230,126,34,0.4)] ring-2 ring-amber/60 text-ink scale-[1.01]';
  } else if (isOver && isInvalidTarget) {
    // Invalid hover: Rust Warning
    stateClasses =
      'border-safety-rust bg-safety-rust/15 shadow-[0_0_20px_rgba(192,57,43,0.4)] ring-2 ring-safety-rust/60 text-safety-rust';
  } else if (isDragging && isValidTarget) {
    // Compatible zone during active drag
    stateClasses =
      'border-amber/60 bg-amberLight/30 text-amber animate-pulse border-2';
  } else if (isBouncing) {
    // Rejected / Incomplete pulse
    stateClasses =
      'border-safety-rust bg-safety-rustLight/50 text-safety-rust ring-2 ring-safety-rust animate-bounce';
  }

  return (
    <div
      ref={setNodeRef}
      id={id}
      data-zone-id={id}
      data-accepts={acceptedTypes.join(',')}
      className={`relative min-h-[96px] rounded-brand-lg border-2 border-dashed p-4 flex flex-col justify-center items-center text-center transition-all duration-200 select-none ${
        mobileSticky ? 'sticky bottom-16 sm:relative sm:bottom-auto z-20 shadow-elevated bg-white/95 backdrop-blur-xs' : ''
      } ${stateClasses} ${className}`}
    >
      {/* Verb Label & State Indicator */}
      <div className="flex items-center gap-2 mb-1">
        {isOver && isValidTarget ? (
          <Sparkles className="w-5 h-5 text-amber animate-spin" />
        ) : isOver && isInvalidTarget ? (
          <AlertCircle className="w-5 h-5 text-safety-rust animate-pulse" />
        ) : (
          <ArrowDownCircle className="w-5 h-5 opacity-60 text-ink-faint" />
        )}

        <span className="font-heading font-bold text-sm tracking-tight text-ink">
          {displayLabel}
        </span>
      </div>

      {displayHint && (
        <p className="text-[11px] max-w-sm text-ink-muted leading-tight">
          {displayHint}
        </p>
      )}

      {/* Embedded slotted content (if cards have been dropped into the zone) */}
      {children && (
        <div className="w-full mt-3 pt-3 border-t border-ink-border/30">
          {children}
        </div>
      )}
    </div>
  );
}
