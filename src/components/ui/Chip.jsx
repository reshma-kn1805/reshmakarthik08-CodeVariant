import React from 'react';

export function Chip({
  children,
  selected = false,
  onClick,
  className = '',
  size = 'md',
  ...props
}) {
  const isInteractive = Boolean(onClick);

  const sizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-xs sm:text-sm px-3.5 py-1.5',
    lg: 'text-sm px-4 py-2 font-medium',
  };

  return (
    <button
      type="button"
      disabled={!isInteractive}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-brand-pill font-medium transition-all select-none ${
        selected
          ? 'bg-deepGreen text-white shadow-xs font-semibold'
          : isInteractive
          ? 'bg-white hover:bg-brand-surfaceAlt text-ink-muted hover:text-ink border border-ink-border cursor-pointer'
          : 'bg-brand-surfaceAlt text-ink-muted border border-ink-border/50 cursor-default'
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
