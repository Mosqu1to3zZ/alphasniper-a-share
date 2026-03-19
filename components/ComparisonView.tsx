import React, { useMemo } from 'react';
import { StockData } from '../types';
import { X, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface ComparisonViewProps {
  stocks: StockData[];
  onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ stocks, onClose }) => {
  const { t } = useTranslation();
  // Colors for different lines
  const COLORS = ['#2962ff', '#00c076', '#ff3b30', '#f59e0b', '#8b5cf6', '#ec4899'];

  const chartData = useMemo(() => {
    if (stocks.length === 0) return [];
    
    // Normalize data to percentage change from first point to allow comparing different price scales
    const maxLength = Math.max(...stocks.map(s => s.history.length));
    const data = [];

    for (let i = 0; i < maxLength; i++) {
      const point: any = { index: i };
      let hasData = false;
      
      stocks.forEach(stock => {
        // Handle varying history lengths by aligning to the end
        const offset = maxLength - stock.history.length;
        if (i >= offset) {
            const historyPoint = stock.history[i - offset];
            if (historyPoint) {
                point.time = historyPoint.time;
                // Normalize to percentage growth relative to the first visible point of THIS stock
                const startPrice = stock.history[0].value;
                const currentPrice = historyPoint.value;
                const percentChange = ((currentPrice - startPrice) / startPrice) * 100;
                point[stock.symbol] = percentChange;
                hasData = true;
            }
        }
      });
      
      if (hasData) data.push(point);
    }
    return data;
  }, [stocks]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-crypto-card border border-crypto-border w-full max-w-6xl h-[85vh] rounded-xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-crypto-border">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-crypto-accent/20 rounded text-crypto-accent">
               <Layers className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight">{t('multi_asset_comparison')}</h2>
               <p className="text-xs text-crypto-muted font-mono">
                  {t('performance_deviation')}
               </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
           {/* Chart */}
           <div className="h-[400px] w-full bg-[#0b0e11] rounded-lg border border-crypto-border p-4 mb-6">
              <h3 className="text-xs font-mono text-crypto-muted uppercase mb-4 ml-2">{t('normalized_performance')}</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151a21', border: '1px solid #2b3139', color: '#fff' }}
                    itemStyle={{ fontSize: '12px' }}
                    labelStyle={{ marginBottom: '8px', color: '#9ca3af' }}
                    formatter={(value: number) => [value.toFixed(2) + '%', '']}
                  />
                  <Legend />
                  {stocks.map((stock, index) => (
                    <Line 
                      key={stock.id}
                      type="monotone" 
                      dataKey={stock.symbol} 
                      name={stock.name}
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 gap-4">
              <div className="overflow-x-auto rounded border border-crypto-border">
                <table className="w-full text-left border-collapse bg-[#0b0e11]">
                   <thead>
                      <tr className="border-b border-crypto-border bg-white/5">
                        <th className="p-4 text-xs font-mono text-crypto-muted uppercase w-40">{t('metric')}</th>
                        {stocks.map(stock => (
                          <th key={stock.id} className="p-4 text-sm font-bold text-white min-w-[180px]">
                            {stock.name} <span className="text-xs font-normal text-crypto-muted block">{stock.symbol}</span>
                          </th>
                        ))}
                      </tr>
                   </thead>
                    <tbody className="divide-y divide-crypto-border/30 text-sm">
                      <tr>
                        <td className="p-4 text-crypto-muted font-mono">{t('current_price')}</td>
                        {stocks.map(stock => (
                          <td key={stock.id} className="p-4 font-mono text-lg">¥{stock.price.toFixed(2)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-crypto-muted font-mono">{t('24h_change')}</td>
                        {stocks.map(stock => (
                          <td key={stock.id} className={`p-4 font-mono font-bold ${stock.changePercent >= 0 ? 'text-crypto-up' : 'text-crypto-down'}`}>
                             {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-crypto-muted font-mono">{t('rsi')} (14)</td>
                         {stocks.map(stock => (
                          <td key={stock.id} className="p-4 font-mono">
                             <div className="flex items-center gap-2">
                               <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full ${stock.rsi > 70 ? 'bg-crypto-down' : stock.rsi < 30 ? 'bg-crypto-up' : 'bg-blue-500'}`} 
                                    style={{ width: `${stock.rsi}%` }}
                                 />
                               </div>
                               <span className={stock.rsi > 70 ? 'text-crypto-down' : stock.rsi < 30 ? 'text-crypto-up' : ''}>
                                  {stock.rsi.toFixed(1)}
                               </span>
                             </div>
                          </td>
                        ))}
                      </tr>
                       <tr>
                        <td className="p-4 text-crypto-muted font-mono">{t('trend_strength')}</td>
                         {stocks.map(stock => (
                          <td key={stock.id} className="p-4 font-mono">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${stock.trend === 'UP' ? 'bg-crypto-up/10 text-crypto-up' : stock.trend === 'DOWN' ? 'bg-crypto-down/10 text-crypto-down' : 'bg-white/5 text-crypto-muted'}`}>
                                {t(stock.trend.toLowerCase()) || stock.trend}
                              </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 text-crypto-muted font-mono">{t('ema_deviation')}</td>
                         {stocks.map(stock => {
                           const deviation = ((stock.price - stock.ema20) / stock.ema20) * 100;
                           return (
                              <td key={stock.id} className="p-4 font-mono text-xs">
                                <span className={deviation > 0 ? 'text-blue-400' : 'text-orange-400'}>
                                  {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}%
                                </span> 
                                <span className="text-gray-500 ml-1">vs EMA20</span>
                              </td>
                           );
                        })}
                      </tr>
                      <tr>
                         <td className="p-4 text-crypto-muted font-mono">{t('market_cap')}</td>
                         {stocks.map(stock => (
                          <td key={stock.id} className="p-4 font-mono text-crypto-muted">{stock.marketCap}</td>
                        ))}
                      </tr>
                      <tr>
                         <td className="p-4 text-crypto-muted font-mono">{t('sector')}</td>
                         {stocks.map(stock => (
                          <td key={stock.id} className="p-4 font-mono text-white">{stock.sector}</td>
                        ))}
                      </tr>
                      <tr>
                         <td className="p-4 text-crypto-muted font-mono">{t('latest_signal')}</td>
                         {stocks.map(stock => (
                          <td key={stock.id} className="p-4 font-mono text-white text-xs">{stock.signal !== 'NONE' ? t(stock.signal.toLowerCase()) : '-'}</td>
                        ))}
                      </tr>
                   </tbody>
                </table>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};