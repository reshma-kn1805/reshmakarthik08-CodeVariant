import React from 'react';

/**
 * BreakEvenChart: Inline SVG line chart projecting "Cost over the next N years"
 * for Repair vs Replace with the break-even point prominently marked.
 * Pure inline SVG — zero external heavy dependencies.
 */
export function BreakEvenChart({
  repairCost = 250,
  replaceCost = 3500,
  years = 5,
  className = '',
}) {
  const width = 420;
  const height = 210;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Yearly data points
  // Repair: Starts at repairCost, accrues ~8% maintenance per year
  // Replace: Starts at replaceCost, accrues ~4% maintenance per year
  const data = [];
  for (let y = 0; y <= years; y++) {
    const repairCumulative = Math.round(repairCost + y * (repairCost * 0.12));
    const replaceCumulative = Math.round(replaceCost + y * (replaceCost * 0.05));
    data.push({
      year: y,
      repair: repairCumulative,
      replace: replaceCumulative,
    });
  }

  const maxVal = Math.max(replaceCost * 1.35, 5000);
  const minVal = 0;

  const getX = (y) => padLeft + (y / years) * chartW;
  const getY = (val) => padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  // SVG paths
  const repairPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.year)} ${getY(d.repair)}`)
    .join(' ');

  const replacePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.year)} ${getY(d.replace)}`)
    .join(' ');

  // Break-even occurs where initial savings offset replacement:
  // Typically at ~Year 1-2 when repair has paid for itself completely vs buying new
  const breakEvenYear = Math.min(
    Math.max(Number((repairCost / (replaceCost / years)).toFixed(1)), 0.8),
    years - 0.5
  );
  const breakEvenCost = Math.round(repairCost + breakEvenYear * (repairCost * 0.12));
  const breakEvenX = getX(breakEvenYear);
  const breakEvenY = getY(breakEvenCost);

  const netSavings = Math.max(0, replaceCost - repairCost);

  return (
    <div className={`flex flex-col space-y-2 select-none ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-heading font-bold text-ink">
          Cost Over Next {years} Years (Repair vs Replace)
        </span>
        <span className="text-[11px] font-mono font-bold text-deepGreen bg-tint px-2 py-0.5 rounded border border-green/20">
          Break-even: ~{breakEvenYear}y
        </span>
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        aria-label={`Line chart projecting repair versus replace cost over ${years} years with break-even point marked.`}
      >
        {/* Horizontal gridlines */}
        {[0, 0.33, 0.66, 1].map((pct, i) => {
          const val = Math.round(minVal + pct * (maxVal - minVal));
          const y = getY(val);
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#D1DDD6"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <text
                x={padLeft - 6}
                y={y + 3.5}
                textAnchor="end"
                className="text-[9px] font-mono fill-ink-muted"
              >
                ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Vertical year gridlines & X axis labels */}
        {data.map((d) => {
          const x = getX(d.year);
          return (
            <g key={d.year}>
              <line
                x1={x}
                y1={padTop}
                x2={x}
                y2={padTop + chartH}
                stroke="#D1DDD6"
                strokeWidth="0.75"
              />
              <text
                x={x}
                y={padTop + chartH + 16}
                textAnchor="middle"
                className="text-[10px] font-mono fill-ink-muted"
              >
                Y{d.year}
              </text>
            </g>
          );
        })}

        {/* Replace Path (Orange/Rust-tinged line) */}
        <path
          d={replacePath}
          fill="none"
          stroke="#C8553D"
          strokeWidth="2.5"
          strokeDasharray="5 3"
        />

        {/* Repair Path (Forest Green line) */}
        <path
          d={repairPath}
          fill="none"
          stroke="#2E7D5B"
          strokeWidth="3"
        />

        {/* Data points for Repair */}
        {data.map((d) => (
          <circle
            key={`rep-${d.year}`}
            cx={getX(d.year)}
            cy={getY(d.repair)}
            r="3"
            fill="#1D4D3F"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
        ))}

        {/* Break-even indicator marker */}
        <line
          x1={breakEvenX}
          y1={padTop}
          x2={breakEvenX}
          y2={padTop + chartH}
          stroke="#E39A2D"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <circle
          cx={breakEvenX}
          cy={breakEvenY}
          r="5.5"
          fill="#E39A2D"
          stroke="#FFFFFF"
          strokeWidth="2"
          className="animate-pulse"
        />

        {/* Break-even callout tag */}
        <g transform={`translate(${Math.min(breakEvenX + 6, width - padRight - 90)}, ${Math.max(breakEvenY - 26, padTop + 4)})`}>
          <rect
            width="88"
            height="20"
            rx="5"
            fill="#16382E"
            opacity="0.92"
          />
          <text
            x="44"
            y="13"
            textAnchor="middle"
            className="text-[9px] font-mono font-bold fill-white"
          >
            Break-even {breakEvenYear}y
          </text>
        </g>
      </svg>

      {/* Chart Legend */}
      <div className="flex items-center justify-between pt-1 border-t border-ink-border/30 text-[11px] font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-deepGreen" />
            <span className="font-bold text-ink">Repair (₹{repairCost})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-safety-rust" />
            <span className="text-ink-muted">Replace (₹{replaceCost})</span>
          </div>
        </div>
        <span className="font-bold text-deepGreen">
          Net Pocket Savings: ₹{netSavings.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
