"use client";

import React from "react";

export type Candle = {
  time: number; // seconds or ms; we will normalize
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

interface CandleChartProps {
  candles: Candle[];
  symbol: string;
  marketCap?: number;
}

// Professional candlestick chart like TradingView
export default function CandleChart({ candles, symbol, marketCap }: CandleChartProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState({ w: 800, h: 320 });
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

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

  // Generate mock data if no candles provided (for demo)
  const mockData = React.useMemo(() => {
    if (candles && candles.length > 0) return candles;
    
    const basePrice = 0.0003253;
    const data = [];
    const now = Date.now();
    
    for (let i = 0; i < 50; i++) {
      const time = now - (49 - i) * 60000; // 1 minute intervals
      const variation = (Math.random() - 0.5) * 0.00001;
      const open = i === 0 ? basePrice : data[i - 1].close;
      const volatility = 0.00002;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close = low + Math.random() * (high - low);
      const volume = Math.random() * 1000 + 100;
      
      data.push({ time, open, high, low, close, volume });
    }
    return data;
  }, [candles]);

  // Normalize timestamps and drop clearly invalid candles (0/NaN) so the scale doesn't collapse
  const series = React.useMemo(() => {
    const cleaned = (mockData || []).filter((c) => {
      const vals = [c.open, c.high, c.low, c.close];
      return vals.every((v) => Number.isFinite(v) && v > 0) && c.high >= c.low;
    });
    // Ensure ascending time order and normalize seconds/ms
    const sorted = [...cleaned].sort((a, b) => (a.time || 0) - (b.time || 0));
    return sorted.map((c) => ({
      ...c,
      time: c.time > 1e12 ? c.time : c.time * 1000,
    }));
  }, [mockData]);
  const width = size.w;
  const height = size.h;
  
  // Professional chart layout
  const padding = { top: 30, right: 100, bottom: 80, left: 60 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const volumeHeight = plotH * 0.25; // Volume takes 25% of chart height
  const priceHeight = plotH - volumeHeight - 10; // Price takes remaining space

  // Calculate price range
  const lows = series.map(c => c.low);
  const highs = series.map(c => c.high);
  const vols = series.map(c => c.volume ?? 0);
  
  let minPrice = Math.min(...lows);
  let maxPrice = Math.max(...highs);
  // Guard: if all candles had identical prices, expand a little to avoid a flat line
  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
    minPrice = 0.9;
    maxPrice = 1.1;
  }
  const priceRange = maxPrice - minPrice;
  const margin = (priceRange || Math.max(maxPrice, 1) * 0.02) * 0.1 + 1e-12;
  minPrice -= margin;
  maxPrice += margin;
  const adjustedPriceRange = maxPrice - minPrice;
  
  const maxVol = Math.max(...vols, 1);

  // Improved spacing calculation
  const candleCount = series.length;
  const availableSpace = plotW * 0.9; // Use 90% of available space
  const spacing = availableSpace / Math.max(candleCount, 1);
  const candleWidth = Math.max(1, Math.min(spacing * 0.8, 8));
  const startX = padding.left + (plotW - availableSpace) / 2;

  // Coordinate functions
  const x = (i: number) => startX + i * spacing + spacing / 2;
  const yPrice = (price: number) => padding.top + (1 - (price - minPrice) / adjustedPriceRange) * priceHeight;
  const yVolume = (vol: number) => padding.top + priceHeight + 10 + (volumeHeight * (1 - vol / maxVol));

  // Generate professional grid lines
  const priceSteps = 8;
  const priceTicks = React.useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= priceSteps; i++) {
      const price = minPrice + (adjustedPriceRange * i) / priceSteps;
      ticks.push(price);
    }
    return ticks;
  }, [minPrice, adjustedPriceRange]);

  const timeSteps = Math.min(8, series.length);
  const timeTicks = React.useMemo(() => {
    const ticks = [];
    for (let i = 0; i < timeSteps; i++) {
      const index = Math.floor((i * (series.length - 1)) / Math.max(timeSteps - 1, 1));
      ticks.push(index);
    }
    return ticks;
  }, [series.length]);

  // Mouse interaction
  const handleMouseMove = (evt: React.MouseEvent<SVGElement>) => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const mouseX = evt.clientX - rect.left;
    const relativeX = mouseX - startX;
    const index = Math.round(relativeX / spacing);
    setHoverIndex(Math.max(0, Math.min(index, series.length - 1)));
  };

  const handleMouseLeave = () => setHoverIndex(null);

  // Format functions
  const formatPrice = (price: number) => price.toFixed(6);
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toFixed(0);
  };

  if (series.length === 0) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg">
        <div className="text-slate-400">No chart available yet</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Dark trading background */}
        <rect width={width} height={height} fill="#0f172a" />
        
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
          </pattern>
        </defs>
        
        {/* Main grid */}
        <rect x={padding.left} y={padding.top} width={plotW} height={priceHeight} fill="url(#grid)" opacity="0.3"/>
        
        {/* Price level lines */}
        <g stroke="#334155" strokeWidth="0.5" opacity="0.7">
          {priceTicks.map((price, i) => (
            <line 
              key={i}
              x1={padding.left} 
              x2={padding.left + plotW} 
              y1={yPrice(price)} 
              y2={yPrice(price)} 
            />
          ))}
        </g>

        {/* Volume bars (bottom section) */}
        <g>
          {series.map((candle, i) => {
            const vol = candle.volume || 0;
            const volBarHeight = (vol / maxVol) * volumeHeight;
            const volY = padding.top + priceHeight + 10 + volumeHeight - volBarHeight;
            const up = candle.close >= candle.open;
            
            return (
              <rect
                key={`vol-${i}`}
                x={x(i) - candleWidth / 2}
                y={volY}
                width={candleWidth}
                height={volBarHeight}
                fill={up ? "#22c55e" : "#ef4444"}
                opacity={0.6}
              />
            );
          })}
        </g>

        {/* Candlesticks */}
        <g>
          {series.map((candle, i) => {
            const cx = x(i);
            const up = candle.close >= candle.open;
            const color = up ? "#22c55e" : "#ef4444";
            
            const openY = yPrice(candle.open);
            const closeY = yPrice(candle.close);
            const highY = yPrice(candle.high);
            const lowY = yPrice(candle.low);
            
            const bodyTop = Math.min(openY, closeY);
            const bodyBottom = Math.max(openY, closeY);
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);
            
            return (
              <g key={`candle-${i}`}>
                {/* Wick */}
                <line
                  x1={cx}
                  y1={highY}
                  x2={cx}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={Math.max(1, candleWidth * 0.1)}
                />
                
                {/* Body */}
                <rect
                  x={cx - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={up ? color : "#0f172a"}
                  stroke={color}
                  strokeWidth={1}
                />
              </g>
            );
          })}
        </g>

        {/* Price labels (right side) */}
        <g>
          {priceTicks.map((price, i) => (
            <g key={`price-label-${i}`}>
              <rect
                x={padding.left + plotW + 5}
                y={yPrice(price) - 8}
                width={80}
                height={16}
                fill="#334155"
                rx="3"
              />
              <text
                x={padding.left + plotW + 45}
                y={yPrice(price) + 3}
                fill="#e2e8f0"
                fontSize="11"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {formatPrice(price)}
              </text>
            </g>
          ))}
        </g>

        {/* Time labels (bottom) */}
        <g>
          {timeTicks.map((index, i) => {
            const candle = series[index];
            if (!candle) return null;
            
            const time = new Date(candle.time > 1e12 ? candle.time : candle.time * 1000);
            const timeStr = time.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
            
            return (
              <text
                key={`time-${i}`}
                x={x(index)}
                y={height - 20}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {timeStr}
              </text>
            );
          })}
        </g>

        {/* Current price line */}
        {series.length > 0 && (
          <g>
            <line
              x1={padding.left}
              x2={padding.left + plotW}
              y1={yPrice(series[series.length - 1].close)}
              y2={yPrice(series[series.length - 1].close)}
              stroke="#fbbf24"
              strokeWidth={1}
              strokeDasharray="5,5"
              opacity={0.8}
            />
            <rect
              x={padding.left + plotW + 5}
              y={yPrice(series[series.length - 1].close) - 8}
              width={80}
              height={16}
              fill="#fbbf24"
              rx="3"
            />
            <text
              x={padding.left + plotW + 45}
              y={yPrice(series[series.length - 1].close) + 3}
              fill="#0f172a"
              fontSize="11"
              textAnchor="middle"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {formatPrice(series[series.length - 1].close)}
            </text>
          </g>
        )}

        {/* Crosshair and tooltip */}
        {hoverIndex !== null && series[hoverIndex] && (
          <g>
            {/* Vertical crosshair line */}
            <line
              x1={x(hoverIndex)}
              x2={x(hoverIndex)}
              y1={padding.top}
              y2={padding.top + priceHeight}
              stroke="#60a5fa"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.8}
            />
            
            {/* Horizontal crosshair line */}
            <line
              x1={padding.left}
              x2={padding.left + plotW}
              y1={yPrice(series[hoverIndex].close)}
              y2={yPrice(series[hoverIndex].close)}
              stroke="#60a5fa"
              strokeWidth={1}
              strokeDasharray="2,2"
              opacity={0.8}
            />

            {/* Tooltip */}
            {(() => {
              const candle = series[hoverIndex];
              const time = new Date(candle.time > 1e12 ? candle.time : candle.time * 1000);
              const tooltipX = x(hoverIndex) > plotW / 2 + padding.left ? 20 : width - 200;
              
              return (
                <g>
                  <rect
                    x={tooltipX}
                    y="20"
                    width="180"
                    height="100"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="1"
                    rx="6"
                    opacity="0.95"
                  />
                  <text x={tooltipX + 10} y="40" fill="#22c55e" fontSize="12" fontWeight="bold">
                    {symbol}/HBAR
                  </text>
                  <text x={tooltipX + 10} y="55" fill="#e2e8f0" fontSize="11">
                    Price: {formatPrice(candle.close)} HBAR
                  </text>
                  <text x={tooltipX + 10} y="70" fill="#e2e8f0" fontSize="11">
                    Volume: {formatVolume(candle.volume || 0)}
                  </text>
                  <text x={tooltipX + 10} y="85" fill="#94a3b8" fontSize="10">
                    {time.toLocaleString()}
                  </text>
                  {marketCap && (
                    <text x={tooltipX + 10} y="100" fill="#fbbf24" fontSize="10">
                      MC: ${((marketCap * candle.close) / (series[series.length - 1]?.close || 1) / 1000000).toFixed(2)}M
                    </text>
                  )}
                </g>
              );
            })()}
          </g>
        )}

        {/* Chart title and info */}
        <text x="20" y="25" fill="#e2e8f0" fontSize="16" fontWeight="bold">
          {symbol}/HBAR
        </text>
        
        {series.length > 0 && (
          <text x="20" y="45" fill="#94a3b8" fontSize="12">
            Last: {formatPrice(series[series.length - 1].close)} HBAR
          </text>
        )}
      </svg>
    </div>
  );
}


