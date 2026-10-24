import React from 'react';

/**
 * RadarChart: Inline SVG radar chart comparing the top Winner vs Runner-up
 * across the 6 scoring factors (Cost, Practicality, Remaining Life, Environment, Safety, Effort).
 * Pure inline SVG — zero external heavy dependencies.
 */
export function RadarChart({ winner, runnerUp, className = '' }) {
  if (!winner || !runnerUp) return null;

  const factors = [
    { key: 'cost', label: 'Cost' },
    { key: 'practicality', label: 'Practicality' },
    { key: 'remainingLife', label: 'Remaining Life' },
    { key: 'environment', label: 'Environment' },
    { key: 'safety', label: 'Safety' },
    { key: 'effort', label: 'Effort' },
  ];

  const size = 280;
  const center = size / 2;
  const maxRadius = 100;
  const numAxes = factors.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Helper to calculate (x, y) given radius and index
  const getCoordinates = (radius, index) => {
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Concentric polygon grid levels: 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Build polygon points string for a given option
  const getOptionPoints = (option) => {
    return factors
      .map((f, i) => {
        const rating = option.factors?.[f.key]?.rating ?? 5; // 0 to 10 scale
        const r = (rating / 10) * maxRadius;
        const pt = getCoordinates(r, i);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  };

  const winnerPoints = getOptionPoints(winner);
  const runnerUpPoints = getOptionPoints(runnerUp);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        aria-label={`Radar chart comparing ${winner.name} and ${runnerUp.name}`}
      >
        {/* Background concentric grid polygons */}
        {gridLevels.map((lvl, idx) => {
          const pts = factors
            .map((_, i) => {
              const pt = getCoordinates(maxRadius * lvl, i);
              return `${pt.x},${pt.y}`;
            })
            .join(' ');
          return (
            <polygon
              key={idx}
              points={pts}
              fill="none"
              stroke="#D1DDD6"
              strokeWidth={idx === gridLevels.length - 1 ? '1.5' : '1'}
              strokeDasharray={idx < gridLevels.length - 1 ? '3 3' : undefined}
            />
          );
        })}

        {/* Radial spoke lines */}
        {factors.map((_, i) => {
          const pt = getCoordinates(maxRadius, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={pt.x}
              y2={pt.y}
              stroke="#D1DDD6"
              strokeWidth="1"
            />
          );
        })}

        {/* Runner-up polygon (subtle dashed gray/amber) */}
        <polygon
          points={runnerUpPoints}
          fill="rgba(122, 140, 132, 0.15)"
          stroke="#7A8C84"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Winner polygon (rich green/amber glow) */}
        <polygon
          points={winnerPoints}
          fill="rgba(46, 125, 91, 0.28)"
          stroke="#2E7D5B"
          strokeWidth="2.5"
        />

        {/* Winner data points */}
        {factors.map((f, i) => {
          const rating = winner.factors?.[f.key]?.rating ?? 5;
          const pt = getCoordinates((rating / 10) * maxRadius, i);
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#1D4D3F"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Factor Axis Labels */}
        {factors.map((f, i) => {
          const labelDist = maxRadius + 22;
          const pt = getCoordinates(labelDist, i);
          const isTop = i === 0;
          const isBottom = i === 3;
          const textAnchor = isTop || isBottom ? 'middle' : pt.x > center ? 'start' : 'end';

          return (
            <text
              key={f.key}
              x={pt.x}
              y={pt.y + 4}
              textAnchor={textAnchor}
              className="text-[10px] font-mono font-semibold fill-ink"
            >
              {f.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-deepGreen border-2 border-white shadow-xs" />
          <span className="font-bold text-ink">#1 {winner.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 border-t-2 border-dashed border-ink-faint" />
          <span className="text-ink-muted">#2 {runnerUp.name}</span>
        </div>
      </div>
    </div>
  );
}
