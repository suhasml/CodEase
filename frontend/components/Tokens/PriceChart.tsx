"use client";

import React from 'react';

type PricePoint = {
  timestamp: number;
  price: number;
  volume?: number;
};

interface PriceChartProps {
  data: PricePoint[];
  symbol: string;
  streamUrl?: string;
}

// Simple, dependency-free responsive area/line chart using SVG
export default function PriceChart({ data, symbol, streamUrl }: PriceChartProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const [series, setSeries] = React.useState<PricePoint[]>(data);

  React.useEffect(() => { setSeries(data); }, [data]);
  React.useEffect(() => {
    if (!streamUrl) return;
    const es = new EventSource(streamUrl);
    es.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        if (payload && payload.price && payload.timestamp) {
          setSeries(prev => {
            const base = prev.length ? prev.slice(-47) : [];
            base.push({ timestamp: Number(payload.timestamp), price: Number(payload.price), volume: 0 });
            return [...base];
          });
        }
      } catch {}
    };
    es.onerror = () => { try { es.close(); } catch {} };
    return () => { try { es.close(); } catch {} };
  }, [streamUrl]);

  const width = 800; // logical width
  const height = 300; // logical height
  // Reduce side paddings to minimize empty space on left/right
  const padding = { top: 16, right: 8, bottom: 26, left: 36 };

  const prices = series.map(d => d.price);
  const volumes = series.map(d => d.volume ?? 0);

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1;
  const priceRange = Math.max(maxPrice - minPrice, 1e-9);
  const maxVolume = Math.max(...volumes, 1);

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const x = (i: number) => padding.left + (i / Math.max(series.length - 1, 1)) * plotW;
  const y = (p: number) => padding.top + (1 - (p - minPrice) / priceRange) * plotH;
  const yVol = (v: number) => padding.top + plotH - (v / maxVolume) * Math.min(plotH * 0.25, 60);

  // Build line path
  const linePath = series
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.price)}`)
    .join(' ');

  // Build area path
  const areaPath = `M ${padding.left} ${padding.top + plotH} ${series
    .map((d, i) => `L ${x(i)} ${y(d.price)}`)
    .join(' ')} L ${padding.left + plotW} ${padding.top + plotH} Z`;

  // X ticks: 6 evenly spaced
  const xTicks = Array.from({ length: 6 }, (_, i) => Math.round((i * (series.length - 1)) / 5));
  // Y ticks: 5
  const yTicks = Array.from({ length: 5 }, (_, i) => minPrice + (priceRange * i) / 4);

  return (
    <div ref={containerRef} className="w-full h-80">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id="pc-price" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pc-volume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        <g stroke="#374151" strokeWidth={0.6} opacity={0.35}>
          {yTicks.map((_, i) => (
            <line
              key={`gy-${i}`}
              x1={padding.left}
              x2={padding.left + plotW}
              y1={padding.top + (plotH * i) / 4}
              y2={padding.top + (plotH * i) / 4}
            />
          ))}
          {xTicks.map((ti, i) => (
            <line key={`gx-${i}`} x1={x(ti)} x2={x(ti)} y1={padding.top} y2={padding.top + plotH} />
          ))}
        </g>

        {/* Volume bars */}
        <g>
          {series.map((d, i) => (
            <rect
              key={`vol-${i}`}
              x={x(i) - 2}
              y={yVol(d.volume ?? 0)}
              width={4}
              height={padding.top + plotH - yVol(d.volume ?? 0)}
              fill="url(#pc-volume)"
            />
          ))}
        </g>

        {/* Area under price */}
        <path d={areaPath} fill="url(#pc-price)" />

        {/* Price line */}
        <path d={linePath} fill="none" stroke="#60a5fa" strokeWidth={2} />

        {/* Axes labels */}
        <g fontSize={10} fill="#9CA3AF">
          {yTicks.map((v, i) => (
            <text key={`yl-${i}`} x={padding.left - 8} y={padding.top + (plotH * (4 - i)) / 4 + 4} textAnchor="end">
              {v.toFixed(6)}
            </text>
          ))}
          {xTicks.map((ti, i) => (
            <text key={`xl-${i}`} x={x(ti)} y={padding.top + plotH + 18} textAnchor="middle">
              {(() => {
                const pt = data[ti];
                if (!pt) return '';
                const d = new Date(pt.timestamp);
                return `${d.getHours()}:00`;
              })()}
            </text>
          ))}
        </g>

        {/* Hover interaction */}
        <g>
          {series.map((d, i) => (
            <circle
              key={`dot-${i}`}
              cx={x(i)}
              cy={y(d.price)}
              r={hoverIndex === i ? 4 : 2.5}
              fill="#60a5fa"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}

          {hoverIndex !== null && series[hoverIndex] && (
            <g>
              <line
                x1={x(hoverIndex)}
                x2={x(hoverIndex)}
                y1={padding.top}
                y2={padding.top + plotH}
                stroke="#60a5fa"
                strokeOpacity={0.3}
              />
              <rect
                x={Math.min(x(hoverIndex) + 8, padding.left + plotW - 140)}
                y={padding.top + 8}
                width={130}
                height={46}
                rx={6}
                fill="#111827"
                stroke="#1f2937"
              />
              <text x={Math.min(x(hoverIndex) + 16, padding.left + plotW - 132)} y={padding.top + 26} fill="#e5e7eb" fontSize={12}>
                {`${symbol}/HBAR: ${series[hoverIndex].price.toFixed(6)}`}
              </text>
              <text x={Math.min(x(hoverIndex) + 16, padding.left + plotW - 132)} y={padding.top + 42} fill="#9ca3af" fontSize={11}>
                {new Date(series[hoverIndex].timestamp).toLocaleTimeString()}
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}


