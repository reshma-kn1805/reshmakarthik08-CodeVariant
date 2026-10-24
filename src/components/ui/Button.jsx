import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-brand transition-all duration-180 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-amber text-ink font-bold hover:bg-action-amberHover hover:text-white shadow-amber-glow focus-visible:ring-amber active:scale-[0.98]',
    secondary: 'bg-green text-white font-semibold hover:bg-deepGreen shadow-subtle focus-visible:ring-green active:scale-[0.98]',
    outline: 'border border-ink-border bg-white text-ink hover:bg-tint hover:border-green/40 focus-visible:ring-green active:scale-[0.98]',
    ghost: 'text-ink-muted hover:text-ink hover:bg-brand-surfaceAlt focus-visible:ring-green',
    danger: 'bg-rust text-white font-semibold hover:bg-rust/90 shadow-subtle focus-visible:ring-rust active:scale-[0.98]',
    tint: 'bg-tint text-deepGreen font-semibold hover:bg-brand-surfaceAlt border border-green/20 focus-visible:ring-green',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-bold',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
