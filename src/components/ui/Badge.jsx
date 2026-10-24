import React from 'react';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-brand-surfaceAlt text-ink-muted border border-ink-border/60',
    estimate: 'bg-brand-surfaceAlt text-ink-muted border border-ink-border/50 uppercase tracking-wider',
    amber: 'bg-action-amberLight text-action-amberHover border border-amber/30 font-semibold',
    green: 'bg-tint text-deepGreen border border-green/30 font-semibold',
    rust: 'bg-safety-rustLight text-rust border border-safety-rustBorder font-semibold',
    solidGreen: 'bg-green text-white font-bold',
    solidAmber: 'bg-amber text-ink font-bold',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.2 rounded-full',
    md: 'text-xs px-2.5 py-0.5 rounded-full',
    lg: 'text-sm px-3 py-1 rounded-brand-pill',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
