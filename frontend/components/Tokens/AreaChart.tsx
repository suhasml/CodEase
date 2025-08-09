"use client";

import React from "react";

type AreaPoint = {
  time: number; // seconds or ms
  price: number; // close price in HBAR (or any unit)
  hbar?: number; // HBAR in/out for that trade
  token?: number; // token amount out/in for that trade
  side?: 'buy' | 'sell' | null;
  mc?: number; // market cap after the trade (absolute)
};

interface AreaChartProps {
  points: AreaPoint[];
  symbol: string;
  marketCapLatest?: number;
}

export default function AreaChart({ points, symbol, marketCapLatest }: AreaChartProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({ w: 800, h: 320 });
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const [hoverPos, setHoverPos] = React.useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth || 800, h: el.clientHeight || 320 });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth || 800, h: el.clientHeight || 320 });
    return () => ro.disconnect();
  }, []);

  const data = React.useMemo(() => {
    const cleaned = (points || []).filter((p) => Number.isFinite(p.price) && p.price > 0);
    const sorted = [...cleaned].sort((a, b) => (a.time || 0) - (b.time || 0));
    return sorted.map((p) => ({ ...p, time: p.time > 1e12 ? p.time : p.time * 1000 }));
  }, [points]);

  const width = size.w;
  const height = size.h;
  const padding = { top: 30, right: 80, bottom: 40, left: 60 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const prices = data.map((d) => d.price);
  let minPrice = Math.min(...prices);
  let maxPrice = Math.max(...prices);
  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || minPrice === maxPrice) {
    // Expand a bit to avoid flat line
    const p = Number.isFinite(maxPrice) ? maxPrice : 1;
    minPrice = p * 0.98;
    maxPrice = p * 1.02;
  }
  const margin = (maxPrice - minPrice) * 0.1 + 1e-12;
  minPrice -= margin;
  maxPrice += margin;
  const priceRange = maxPrice - minPrice;

  const x = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * plotW;
  const y = (price: number) => padding.top + (1 - (price - minPrice) / priceRange) * plotH;

  // Build price area path
  const areaPath = React.useMemo(() => {
    if (data.length === 0) return "";
    const d: string[] = [];
    data.forEach((pt, i) => {
      const xi = x(i);
      const yi = y(pt.price);
      if (i === 0) {
        d.push(`M ${xi} ${y(minPrice)} L ${xi} ${yi}`);
      } else {
        d.push(`L ${xi} ${yi}`);
      }
    });
    // close to baseline
    const lastX = x(data.length - 1);
    d.push(`L ${lastX} ${y(minPrice)} Z`);
    return d.join(" ");
  }, [data, width, height, minPrice, maxPrice]);

  // Build price line path
  const linePath = React.useMemo(() => {
    if (data.length === 0) return "";
    return data
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(pt.price)}`)
      .join(" ");
  }, [data, width, height, minPrice, maxPrice]);

  // No separate MC overlay path; MC will be shown in tooltip and optional markers

  const priceTicks = React.useMemo(() => {
    const steps = 6;
    return new Array(steps + 1).fill(0).map((_, i) => minPrice + (priceRange * i) / steps);
  }, [minPrice, priceRange]);

  const timeTicks = React.useMemo(() => {
    const steps = Math.min(8, data.length);
    return new Array(steps).fill(0).map((_, i) => Math.floor((i * (data.length - 1)) / Math.max(steps - 1, 1)));
  }, [data.length]);

  const handleMouseMove = (evt: React.MouseEvent<SVGElement>) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mouseX = evt.clientX - rect.left - padding.left;
    const index = Math.round((mouseX / Math.max(plotW, 1)) * (data.length - 1));
    setHoverIndex(Math.max(0, Math.min(index, data.length - 1)));
    setHoverPos({ x: evt.clientX - rect.left, y: evt.clientY - rect.top });
  };

  const handleMouseLeave = () => setHoverIndex(null);

  const formatPrice = (p: number) => p.toFixed(6);
  const formatMc = (v?: number) => {
    if (!Number.isFinite(v)) return "-";
    if (v! >= 1_000_000_000) return `${(v! / 1_000_000_000).toFixed(2)}B`;
    if (v! >= 1_000_000) return `${(v! / 1_000_000).toFixed(2)}M`;
    if (v! >= 1_000) return `${(v! / 1_000).toFixed(2)}K`;
    return v!.toFixed(0);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background */}
        <rect width={width} height={height} fill="#0f172a" />

        {/* Grid */}
        <g stroke="#1e293b" strokeWidth="0.5" opacity="0.6">
          {priceTicks.map((t, i) => (
            <line key={`h-${i}`} x1={padding.left} x2={padding.left + plotW} y1={y(t)} y2={y(t)} />
          ))}
          {timeTicks.map((idx, i) => (
            <line key={`v-${i}`} x1={x(idx)} x2={x(idx)} y1={padding.top} y2={padding.top + plotH} />
          ))}
        </g>

        {/* Price area */}
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill="url(#priceGradient)" />}
        {linePath && <path d={linePath} fill="none" stroke="#22c55e" strokeWidth={2} />}

        {/* Trade markers */}
        {data.map((pt, i) => (
          <circle
            key={`m-${i}`}
            cx={x(i)}
            cy={y(pt.price)}
            r={2.5}
            fill={pt.side === 'sell' ? '#ef4444' : '#22c55e'}
            opacity={0.9}
          />
        ))}

        {/* Axes labels */}
        <g>
          {priceTicks.map((t, i) => (
            <text key={`pt-${i}`} x={padding.left - 8} y={y(t) + 3} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">
              {formatPrice(t)}
            </text>
          ))}
          {timeTicks.map((idx, i) => {
            const dt = new Date(data[idx].time);
            const s = dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
            return (
              <text key={`tt-${i}`} x={x(idx)} y={height - 14} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                {s}
              </text>
            );
          })}
        </g>

        {/* Current markers */}
        {/* Removed current-price yellow line per request */}

        {/* Crosshair + tooltip */}
        {hoverIndex !== null && data[hoverIndex] && (
          <g>
            <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={padding.top} y2={padding.top + plotH} stroke="#60a5fa" strokeWidth={1} strokeDasharray="2,2" />
            {(() => {
              const pt = data[hoverIndex];
              const mc = data[hoverIndex].mc;
              const tooltipW = 180;
              const tooltipH = 90;
              const defaultX = (hoverPos?.x ?? x(hoverIndex)) + 12;
              const defaultY = (hoverPos?.y ?? y(pt.price)) - tooltipH - 12;
              let tooltipX = defaultX;
              let tooltipY = defaultY;
              // Keep inside bounds: prefer above cursor; if not enough space, place below
              if (tooltipX + tooltipW > width - 8) tooltipX = (hoverPos?.x ?? x(hoverIndex)) - tooltipW - 12;
              if (tooltipX < 8) tooltipX = 8;
              if (tooltipY < padding.top + 4) tooltipY = (hoverPos?.y ?? y(pt.price)) + 12;
              return (
                <g>
                  <rect x={tooltipX} y={tooltipY} width={180} height={90} fill="#1e293b" stroke="#475569" strokeWidth={1} rx={6} opacity={0.95} />
                  <text x={tooltipX + 10} y={tooltipY + 20} fill="#22c55e" fontSize={12} fontWeight="bold">
                    {symbol}/HBAR
                  </text>
                  <text x={tooltipX + 10} y={tooltipY + 36} fill="#e2e8f0" fontSize={11}>
                    Price: {pt.price}
                  </text>
                  <text x={tooltipX + 10} y={tooltipY + 50} fill="#e2e8f0" fontSize={11}>
                    HBAR: {pt.hbar ?? '-'}  •  Tokens: {pt.token ?? '-'}
                  </text>
                  <text x={tooltipX + 10} y={tooltipY + 64} fill="#93c5fd" fontSize={11}>
                    MC: {formatMc(mc)}{pt.side ? `  •  ${pt.side.toUpperCase()}` : ''}
                  </text>
                  <text x={tooltipX + 10} y={tooltipY + 78} fill="#94a3b8" fontSize={10}>
                    {new Date(pt.time).toLocaleString()}
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        {data.length === 0 && (
          <g>
            <text
              x={width / 2}
              y={height / 2}
              fill="#94a3b8"
              fontSize={14}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              No chart available yet
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}


