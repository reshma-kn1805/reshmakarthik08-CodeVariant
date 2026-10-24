import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Lock } from 'lucide-react';

/**
 * DataCard: Accessible draggable card for The Canvas Protocol
 * Features:
 * - Grip handle with touch-action: none
 * - Tilt and elevation on lift
 * - Prefers-reduced-motion compliance
 * - Locked state with rust styling for safety-gated options
 */
export function DataCard({
  id,
  type,
  data = {},
  title,
  subtitle,
  badge,
  icon: Icon,
  isLocked = false,
  lockReason,
  className = '',
  children,
  onClick,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      id,
      type,
      data,
      title: title || data.title || data.name || id,
      isLocked,
    },
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)${!window?.matchMedia('(prefers-reduced-motion: reduce)').matches ? ' rotate(2deg) scale(1.02)' : ''}`
      : undefined,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative select-none rounded-brand-lg border transition-all duration-200 ${
        isDragging
          ? 'opacity-85 shadow-card-hover border-amber bg-white z-50 ring-2 ring-amber/40'
          : isLocked
          ? 'bg-safety-rustLight/20 border-safety-rust/40 text-ink/80 opacity-90'
          : 'bg-white border-ink-border/80 shadow-subtle hover:border-amber/60 hover:shadow-card'
      } ${className}`}
      data-card-id={id}
      data-card-type={type}
    >
      {/* Top Header Bar with Grip Handle */}
      <div className="flex items-center justify-between p-3 pb-2 border-b border-ink-border/30 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <div
              className={`w-7 h-7 rounded-brand flex items-center justify-center shrink-0 ${
                isLocked ? 'bg-safety-rustLight text-safety-rust' : 'bg-brand-surfaceAlt text-brand-deep'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.2]" />
            </div>
          )}
          <div className="min-w-0">
            {title && (
              <h4 className="font-heading font-bold text-sm text-ink truncate leading-snug">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[11px] text-ink-muted truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                isLocked
                  ? 'bg-safety-rust text-white'
                  : 'bg-amberLight text-ink'
              }`}
            >
              {badge}
            </span>
          )}

          {isLocked && (
            <div
              className="p-1 rounded text-safety-rust"
              title={lockReason || 'Locked due to critical safety hazard'}
              aria-label="Locked by safety gate"
            >
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          )}

          {/* Dedicated Accessible Drag Grip Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 rounded hover:bg-brand-surfaceAlt text-ink-faint hover:text-ink cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-amber touch-none transition-colors"
            title="Drag card (or press Space to lift, arrows to target zone, Space to drop)"
            aria-label={`Drag handle for ${title || type}`}
            role="button"
            tabIndex={0}
          >
            <GripVertical className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 text-xs text-ink-muted space-y-2">
        {children}

        {isLocked && lockReason && (
          <div className="p-2 rounded-brand bg-safety-rustLight/50 border border-safety-rust/30 text-[11px] text-safety-rust font-semibold flex items-center gap-1.5 mt-2">
            <Lock className="w-3 h-3 shrink-0" />
            <span>{lockReason}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Overlay clone rendered while dragging
 */
export function DragOverlayCard({ card }) {
  if (!card) return null;
  const { title, type, subtitle, badge, isLocked } = card;

  return (
    <div className="select-none rounded-brand-lg border border-amber bg-white shadow-elevated p-3 min-w-[240px] max-w-[320px] ring-2 ring-amber/50 rotate-3 scale-105 pointer-events-none">
      <div className="flex items-center justify-between gap-2 border-b border-ink-border/30 pb-2">
        <div className="min-w-0">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber block">
            {type}
          </span>
          <h4 className="font-heading font-bold text-sm text-ink truncate">
            {title || 'Card'}
          </h4>
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amberLight text-ink">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-ink-muted mt-1.5">{subtitle}</p>}
    </div>
  );
}
