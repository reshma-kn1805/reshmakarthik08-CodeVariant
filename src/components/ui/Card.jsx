import React from 'react';

export function Card({
  children,
  className = '',
  variant = 'default',
  as: Component = 'div',
  ...props
}) {
  const variants = {
    default: 'bg-white border border-ink-border/80 shadow-subtle',
    elevated: 'bg-white border border-ink-border/80 shadow-card',
    tint: 'bg-tint/60 border border-green/20',
    interactive: 'bg-white border border-ink-border/80 hover:border-green hover:shadow-card cursor-pointer transition-all',
    rust: 'bg-safety-rustLight border border-safety-rustBorder text-rust',
  };

  return (
    <Component
      className={`rounded-brand-lg p-5 sm:p-6 ${variants[variant] || variants.default} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-3 flex items-start justify-between gap-3 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '', as: Component = 'h3' }) {
  return <Component className={`font-heading font-bold text-lg text-ink ${className}`}>{children}</Component>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-xs text-ink-muted leading-relaxed ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`space-y-3 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`mt-4 pt-3 border-t border-ink-border/50 flex items-center justify-between gap-3 ${className}`}>{children}</div>;
}
