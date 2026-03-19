import React from 'react';
import { StockData } from '../types';

interface MarketTickerProps {
  items: StockData[];
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ items }) => {
  // Use the first 15 items for the ticker
  const tickerItems = items.slice(0, 15);

  return (
    <div className="w-full bg-[#0d1117] border-b border-crypto-border overflow-hidden h-8 flex items-center relative z-30">
      <div className="flex animate-scroll whitespace-nowrap hover:pause-animation">
        {/* Duplicate items multiple times for seamless infinite scroll */}
        {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
          <div key={`${item.id}-${i}`} className="inline-flex items-center gap-3 px-6 text-[10px] font-mono border-r border-white/5">
            <span className="text-crypto-muted font-bold">{item.name}</span>
            <span className={item.changePercent >= 0 ? 'text-crypto-up' : 'text-crypto-down'}>
              {item.price.toFixed(2)}
            </span>
            <span className={item.changePercent >= 0 ? 'text-crypto-up' : 'text-crypto-down'}>
              {item.changePercent > 0 ? '↑' : '↓'} {Math.abs(item.changePercent).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
       <style>{`
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
      `}</style>
    </div>
  );
};