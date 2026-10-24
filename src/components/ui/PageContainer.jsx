import React from 'react';

export function PageContainer({
  children,
  maxWidth = '5xl',
  className = '',
  as: Component = 'div',
  ...props
}) {
  const maxWidths = {
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <Component
      className={`w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 ${maxWidths[maxWidth] || maxWidths['5xl']} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
