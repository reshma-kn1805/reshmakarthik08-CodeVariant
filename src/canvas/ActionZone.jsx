import React, { useState, useEffect, useContext } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CanvasContext } from './CanvasProvider.jsx';
import { getZoneById } from '../config/zones.js';
import { Sparkles, AlertCircle, ArrowDownCircle, CheckCircle2, Inbox } from 'lucide-react';

/**
 * ActionZone: Droppable container for The Canvas Protocol
 * Features:
 * - Clear idle, hover-valid, hover-invalid, and success states
 * - Inline sound-free confirmation badge (no buttons)
 * - Friendly empty states
 * - Dashed outline with prominent verb label
 * - Mobile sticky tray support
 */
export function ActionZone({
  id,
  label,
  hint,
  accepts,
  activeCard = null,
  isBouncing = false,
  mobileSticky = false,
  confirmationMessage = null,
  emptyState = null,
  className = '',
  children,
}) {
  const canvas = useContext(CanvasContext);
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

  // Track inline success confirmation
  const [showSuccess, setShowSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');

  const contextConfirmation = canvas?.dropConfirmations?.[id];
  const effectiveConfirm = confirmationMessage || contextConfirmation;

  useEffect(() => {
    if (effectiveConfirm) {
      setSuccessText(effectiveConfirm);
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2800);
      return () => clearTimeout(timer);
    }
  }, [effectiveConfirm]);

  // Check compatibility with card currently being dragged
  const effectiveActiveCard = activeCard ?? canvas?.activeCard ?? null;
  const effectiveIsBouncing = isBouncing || canvas?.bouncingZoneId === id;
  const isDragging = Boolean(effectiveActiveCard);
  const isValidTarget = effectiveActiveCard && acceptedTypes.includes(effectiveActiveCard.type);
  const isInvalidTarget = effectiveActiveCard && !acceptedTypes.includes(effectiveActiveCard.type);

  // Dynamic visual states
  let stateClasses = 'border-ink-border/80 bg-brand-surfaceAlt/25 text-ink-muted hover:border-ink-border';

  if (isOver && isValidTarget) {
    // Valid hover: Amber Glow
    stateClasses =
      'border-amber bg-amber/15 shadow-[0_0_24px_rgba(230,126,34,0.45)] ring-2 ring-amber/70 text-ink scale-[1.015]';
  } else if (isOver && isInvalidTarget) {
    // Invalid hover: Rust Warning
    stateClasses =
      'border-safety-rust bg-safety-rust/15 shadow-[0_0_24px_rgba(192,57,43,0.45)] ring-2 ring-safety-rust/70 text-safety-rust scale-[0.99]';
  } else if (isDragging && isValidTarget) {
    // Compatible zone during active drag
    stateClasses =
      'border-amber/70 bg-amberLight/40 text-amber animate-pulse border-2';
  } else if (effectiveIsBouncing) {
    // Rejected / Incomplete pulse
    stateClasses =
      'border-safety-rust bg-safety-rustLight/50 text-safety-rust ring-2 ring-safety-rust animate-bounce';
  } else if (showSuccess) {
    // Success state
    stateClasses =
      'border-deepGreen bg-tint/80 text-deepGreen ring-2 ring-deepGreen/40';
  }

  return (
    <div
      ref={setNodeRef}
      id={id}
      data-zone-id={id}
      data-accepts={acceptedTypes.join(',')}
      className={`relative min-h-[96px] rounded-brand-lg border-2 border-dashed p-4 flex flex-col justify-center items-center text-center transition-all duration-200 select-none ${
        mobileSticky
          ? 'sticky bottom-16 sm:relative sm:bottom-auto z-20 shadow-elevated bg-white/95 backdrop-blur-xs'
          : ''
      } ${stateClasses} ${className}`}
    >
      {/* Verb Label & State Indicator */}
      <div className="flex items-center gap-2 mb-1">
        {isOver && isValidTarget ? (
          <Sparkles className="w-5 h-5 text-amber animate-spin" />
        ) : isOver && isInvalidTarget ? (
          <AlertCircle className="w-5 h-5 text-safety-rust animate-pulse" />
        ) : showSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-deepGreen animate-bounce" />
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

      {/* Inline Sound-Free Confirmation Badge (No buttons) */}
      {showSuccess && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-deepGreen text-white text-[11px] font-mono font-bold animate-in fade-in zoom-in-95 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>{successText || 'Card Placed Successfully'}</span>
        </div>
      )}

      {/* Friendly Empty State if no cards slotted */}
      {!children && emptyState && !isDragging && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-faint font-mono">
          <Inbox className="w-3.5 h-3.5 opacity-60" />
          <span>{emptyState}</span>
        </div>
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
