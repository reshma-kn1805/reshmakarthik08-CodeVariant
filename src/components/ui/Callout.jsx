import React from 'react';
import { Info, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function Callout({
  children,
  title = '',
  variant = 'info',
  className = '',
  icon: CustomIcon,
}) {
  const configs = {
    info: {
      wrapper: 'bg-tint/70 border-green/30 text-deepGreen',
      icon: Info,
      iconColor: 'text-green',
    },
    warning: {
      wrapper: 'bg-action-amberLight border-amber/40 text-ink',
      icon: AlertTriangle,
      iconColor: 'text-amber',
    },
    danger: {
      wrapper: 'bg-safety-rustLight border-safety-rustBorder text-rust',
      icon: ShieldAlert,
      iconColor: 'text-rust',
    },
    safety: {
      wrapper: 'bg-safety-rustLight border-safety-rustBorder text-rust',
      icon: ShieldAlert,
      iconColor: 'text-rust',
    },
    success: {
      wrapper: 'bg-tint border-green/40 text-deepGreen',
      icon: CheckCircle2,
      iconColor: 'text-green',
    },
    neutral: {
      wrapper: 'bg-white border-ink-border text-ink',
      icon: Info,
      iconColor: 'text-ink-muted',
    },
  };

  const current = configs[variant] || configs.info;
  const IconComponent = CustomIcon || current.icon;

  return (
    <div
      role="region"
      className={`rounded-brand p-4 border flex items-start gap-3 shadow-xs ${current.wrapper} ${className}`}
    >
      <div className={`shrink-0 mt-0.5 ${current.iconColor}`}>
        <IconComponent className="w-5 h-5 stroke-[2]" />
      </div>

      <div className="flex-1 min-w-0 text-xs sm:text-sm leading-relaxed">
        {title && (
          <h4 className="font-heading font-bold text-sm text-ink mb-1 block">
            {title}
          </h4>
        )}
        <div className="font-medium text-ink-muted">{children}</div>
      </div>
    </div>
  );
}
