import React, { useState, useEffect } from 'react';
import { StockData, Trend, SignalType, SortKey, SortDirection } from '../types';
import { TrendingUp, TrendingDown, Minus, Zap, Eye, ChevronUp, ChevronDown, Star, ChevronLeft, ChevronRight, Square, CheckSquare } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';

interface StockTerminalProps {
  stocks: StockData[];
  onSelectStock: (stock: StockData) => void;
  sortConfig: { key: SortKey; direction: SortDirection };
  onSort: (key: SortKey) => void;
  watchlist: string[];
  onToggleWatchlist: (id: string, e: React.MouseEvent) => void;
  compareList: string[];
  onToggleCompare: (id: string, e: React.MouseEvent) => void;
}

export const StockTerminal: React.FC<StockTerminalProps> = ({ 
  stocks, 
  onSelectStock, 
  sortConfig, 
  onSort, 
  watchlist, 
  onToggleWatchlist,
  compareList,
  onToggleCompare
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Reset to valid page when stocks length changes (e.g. filtering)
  useEffect(() => {
    const maxPage = Math.ceil(stocks.length / itemsPerPage) || 1;
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [stocks.length, itemsPerPage]);

  const totalPages = Math.ceil(stocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStocks = stocks.slice(startIndex, startIndex + itemsPerPage);

  const getTrendIcon = (trend: Trend) => {
    switch (trend) {
      case Trend.UP: return <TrendingUp className="w-4 h-4 text-crypto-up" />;
      case Trend.DOWN: return <TrendingDown className="w-4 h-4 text-crypto-down" />;
      default: return <Minus className="w-4 h-4 text-crypto-muted" />;
    }
  };

  const getSignalBadge = (signal: SignalType) => {
    switch (signal) {
      case SignalType.BREAKOUT: 
        return <span className="text-[10px] px-2 py-0.5 rounded bg-crypto-up/20 text-crypto-up border border-crypto-up/40 font-bold animate-pulse">BREAKOUT</span>;
      case SignalType.REVERSAL: 
        return <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold">REVERSAL</span>;
      case SignalType.MOMENTUM: 
        return <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold">MOMENTUM</span>;
      case SignalType.OVERSOLD: 
        return <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold">OVERSOLD</span>;
      default: return null;
    }
  };

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortConfig.key !== colKey) return <div className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-crypto-accent" /> : <ChevronDown className="w-3 h-3 text-crypto-accent" />;
  };

  const HeaderCell = ({ label, sortKey, align = 'left' }: { label: string, sortKey?: SortKey, align?: string }) => (
    <th 
      className={`px-4 py-3 text-xs font-mono text-crypto-muted uppercase cursor-pointer hover:text-white transition-colors ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`}
      onClick={() => sortKey && onSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
        {label}
        {sortKey && <SortIcon colKey={sortKey} />}
      </div>
    </th>
  );

  return (
    <div className="bg-crypto-card border border-crypto-border rounded-lg overflow-hidden shadow-lg flex flex-col">
      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-left">
          <thead className="bg-[#1b2129] border-b border-crypto-border sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-xs font-mono text-crypto-muted uppercase w-10 text-center">
                 <span className="sr-only">Select</span>
              </th>
              <th className="px-4 py-3 text-xs font-mono text-crypto-muted uppercase w-10">
                 <span className="sr-only">Watch</span>
              </th>
              <HeaderCell label={`${t('symbol')} / Name`} sortKey="symbol" />
              <HeaderCell label={`${t('price')} (¥)`} sortKey="price" align="right" />
              <HeaderCell label={`${t('24h')} Change`} sortKey="changePercent" align="right" />
              <HeaderCell label={t('trend')} align="center" />
              <HeaderCell label={`${t('rsi')}(14)`} sortKey="rsi" align="center" />
              <HeaderCell label={`Sniper ${t('signal')}`} sortKey="signal" align="center" />
              <th className="px-4 py-3 text-xs font-mono text-crypto-muted uppercase w-32">{t('micro_chart')}</th>
              <th className="px-4 py-3 text-xs font-mono text-crypto-muted uppercase text-right">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-crypto-border/50">
            {currentStocks.map((stock) => {
              const isWatched = watchlist.includes(stock.id);
              const isSelected = compareList.includes(stock.id);

              return (
                <tr 
                  key={stock.id} 
                  className={`hover:bg-white/5 transition-colors cursor-pointer group ${isSelected ? 'bg-crypto-accent/5' : ''}`}
                  onClick={() => onSelectStock(stock)}
                >
                   <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => onToggleCompare(stock.id, e)}
                      className="p-1 text-crypto-muted hover:text-crypto-accent transition-colors"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-crypto-accent" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={(e) => onToggleWatchlist(stock.id, e)}
                      className={`p-1 rounded hover:bg-white/10 ${isWatched ? 'text-yellow-400' : 'text-crypto-muted hover:text-white'}`}
                    >
                      <Star className={`w-4 h-4 ${isWatched ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white group-hover:text-crypto-accent transition-colors">{stock.name}</span>
                      <span className="text-xs text-crypto-muted font-mono">{stock.symbol}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {stock.price.toFixed(2)}
                    <div className="text-[10px] text-crypto-muted">EMA20: {stock.ema20.toFixed(2)}</div>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono text-sm ${stock.changePercent >= 0 ? 'text-crypto-up' : 'text-crypto-down'}`}>
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">{getTrendIcon(stock.trend)}</div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-sm">
                    <span className={`${stock.rsi > 70 ? 'text-crypto-down' : stock.rsi < 30 ? 'text-crypto-up' : 'text-crypto-muted'}`}>
                      {stock.rsi.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getSignalBadge(stock.signal)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-10 w-28">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={stock.history}>
                           <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={stock.changePercent >= 0 ? '#00c076' : '#ff3b30'} 
                              strokeWidth={2} 
                              dot={false} 
                              isAnimationActive={false}
                            />
                           <YAxis domain={['dataMin', 'dataMax']} hide />
                         </LineChart>
                       </ResponsiveContainer>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-2 hover:bg-crypto-accent/20 rounded-full text-crypto-accent transition-colors" title="Analyze">
                      <Zap className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="border-t border-crypto-border p-4 bg-[#1b2129] flex items-center justify-between sticky bottom-0 z-10">
         <div className="flex items-center gap-2 text-xs text-crypto-muted">
            <span>{t('show')}</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-crypto-bg border border-crypto-border rounded px-2 py-1 text-white focus:outline-none focus:border-crypto-accent cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>{t('rows_per_page')}</span>
         </div>

         {stocks.length > 0 && (
           <div className="flex items-center gap-2">
              <span className="text-xs text-crypto-muted mr-2">
                 {t('page')} {currentPage} {t('of')} {totalPages || 1}
              </span>
              <button 
                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                 disabled={currentPage === 1}
                 className="p-1.5 rounded bg-crypto-bg border border-crypto-border hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
              >
                 <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                 disabled={currentPage === totalPages || totalPages === 0}
                 className="p-1.5 rounded bg-crypto-bg border border-crypto-border hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
              >
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
         )}
      </div>

      {stocks.length === 0 && (
         <div className="p-12 text-center text-crypto-muted flex flex-col items-center">
           <Eye className="w-12 h-12 mb-4 opacity-50" />
           <p>{t('no_targets')}</p>
           <p className="text-xs mt-2">{t('adjust_filters')}</p>
         </div>
      )}
    </div>
  );
};