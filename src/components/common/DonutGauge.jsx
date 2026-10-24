import React, { useEffect, useState } from 'react';

export function DonutGauge({
  score = 0,
  size = 120,
  strokeWidth = 10,
  label = '',
  sublabel = '/ 100',
  color = '#2E7D5B',
  trackColor = 'rgba(255, 255, 255, 0.15)',
  className = '',
  animate = true,
}) {
  const [displayScore, setDisplayScore] = useState(0);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion || !animate) {
      setDisplayScore(score);
      return;
    }

    let start = 0;
    const duration = 700; // ms
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (score - start) * ease);
      setDisplayScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setDisplayScore(score);
      }
    };

    const animId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animId);
  }, [score, animate, prefersReducedMotion]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 0.1s linear',
          }}
        />
      </svg>

      {/* Center score readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span className="font-heading font-black text-2xl sm:text-3xl tracking-tight leading-none tabular-nums font-mono">
          {displayScore}
        </span>
        {sublabel && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-current opacity-80 mt-0.5">
            {sublabel}
          </span>
        )}
        {label && (
          <span className="text-[11px] font-bold tracking-tight truncate max-w-[80px] mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
