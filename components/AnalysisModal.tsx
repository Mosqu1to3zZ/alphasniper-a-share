import React, { useEffect, useState } from 'react';
import { StockData, AIAnalysisResult, NewsItem } from '../types';
import { X, Cpu, AlertTriangle, ShieldCheck, TrendingUp, DollarSign, Star, Newspaper, Activity, History } from 'lucide-react';
import { analyzeStockWithGemini } from '../services/geminiService';
import { fetchStockNews } from '../services/newsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { useTranslation } from 'react-i18next';

interface AnalysisModalProps {
  stock: StockData | null;
  onClose: () => void;
  isWatched: boolean;
  onToggleWatchlist: () => void;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ stock, onClose, isWatched, onToggleWatchlist }) => {
  const { t } = useTranslation();
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'HISTORY'>('CURRENT');

  useEffect(() => {
    if (stock) {
      setLoading(true);
      setNewsLoading(true);
      setResult(null);
      setNews([]);
      setErrorMsg('');
      setActiveTab('CURRENT');
      
      // Fetch AI Analysis
      analyzeStockWithGemini(stock)
        .then((res) => {
          if (typeof res === 'string') {
            setErrorMsg(res);
          } else {
            setResult(res);
          }
        })
        .catch(() => setErrorMsg(t('analysis_failed')))
        .finally(() => setLoading(false));

      // Fetch News
      fetchStockNews(stock)
        .then((data) => setNews(data))
        .catch(console.error)
        .finally(() => setNewsLoading(false));
    }
  }, [stock]);

  if (!stock) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-crypto-card border border-crypto-accent w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-crypto-card to-crypto-accent/10 p-6 flex justify-between items-start border-b border-crypto-border">
          <div>
             <div className="flex items-center gap-3">
               <h2 className="text-3xl font-bold text-white tracking-tight">{stock.name}</h2>
               <span className="px-2 py-1 bg-crypto-bg rounded text-xs font-mono text-crypto-muted">{stock.symbol}</span>
             </div>
             <div className="flex items-center gap-4 mt-2">
                <span className="text-2xl font-mono text-white">¥{stock.price.toFixed(2)}</span>
                <span className={`text-lg font-mono ${stock.changePercent >= 0 ? 'text-crypto-up' : 'text-crypto-down'}`}>
                  {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
                </span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-crypto-border bg-[#0b0e11]">
          <button 
            onClick={() => setActiveTab('CURRENT')}
            className={`flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${activeTab === 'CURRENT' ? 'text-crypto-accent border-b-2 border-crypto-accent bg-crypto-accent/5' : 'text-crypto-muted hover:text-white hover:bg-white/5'}`}
          >
            <Activity className="w-4 h-4" /> {t('current_state', 'Current State')}
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${activeTab === 'HISTORY' ? 'text-crypto-accent border-b-2 border-crypto-accent bg-crypto-accent/5' : 'text-crypto-muted hover:text-white hover:bg-white/5'}`}
          >
            <History className="w-4 h-4" /> {t('historical_analysis', 'Historical Analysis')}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {activeTab === 'CURRENT' ? (
            <>
              {/* Tech Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-crypto-bg p-3 rounded border border-crypto-border">
                  <span className="text-xs text-crypto-muted uppercase block mb-1">{t('rsi')} (14)</span>
                  <span className={`text-sm font-semibold font-mono ${stock.rsi > 70 ? 'text-crypto-down' : stock.rsi < 30 ? 'text-crypto-up' : 'text-white'}`}>{stock.rsi.toFixed(1)}</span>
                </div>
                 <div className="bg-crypto-bg p-3 rounded border border-crypto-border">
                  <span className="text-xs text-crypto-muted uppercase block mb-1">EMA 20</span>
                  <span className="text-sm font-semibold text-white font-mono">{stock.ema20.toFixed(2)}</span>
                </div>
                <div className="bg-crypto-bg p-3 rounded border border-crypto-border">
                  <span className="text-xs text-crypto-muted uppercase block mb-1">{t('trend')}</span>
                  <span className="text-sm font-semibold text-white flex items-center gap-1">
                     {stock.trend === 'UP' ? <span className="text-crypto-up">{t('bullish')}</span> : stock.trend === 'DOWN' ? <span className="text-crypto-down">{t('bearish')}</span> : t('sideways', 'Sideways')}
                  </span>
                </div>
                 <div className="bg-crypto-bg p-3 rounded border border-crypto-border">
                  <span className="text-xs text-crypto-muted uppercase block mb-1">{t('signal')}</span>
                  <span className="text-sm font-semibold text-white font-mono">{stock.signal}</span>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="bg-[#0b0e11] rounded-lg p-6 border border-crypto-accent/30 relative mb-6">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2 text-crypto-accent">
                     <Cpu className="w-5 h-5 animate-pulse" />
                     <h3 className="font-bold font-mono text-sm uppercase tracking-wider">Gemini Sniper {t('ai_analysis', 'AI_Analysis')}</h3>
                  </div>
                  {result && (
                    <div className={`px-3 py-1 rounded text-xs font-bold border ${result.recommendation === 'BUY' ? 'border-crypto-up text-crypto-up bg-crypto-up/10' : result.recommendation === 'SELL' ? 'border-crypto-down text-crypto-down bg-crypto-down/10' : 'border-crypto-muted text-crypto-muted'}`}>
                      {result.recommendation} ({(result.confidence)}%)
                    </div>
                  )}
                </div>
                
                <div className="min-h-[120px]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-3 py-4">
                      <div className="w-2 h-2 bg-crypto-accent rounded-full animate-ping"></div>
                      <span className="text-crypto-accent text-xs animate-pulse">{t('connecting_neural_net')}</span>
                    </div>
                  ) : errorMsg ? (
                     <div className="text-red-400 font-mono text-sm p-4 text-center">{errorMsg}</div>
                  ) : result ? (
                    <div className="space-y-4">
                       {/* Risk Level */}
                       <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-crypto-muted uppercase">{t('risk_level')}</span>
                          <div className="flex gap-1">
                             {[1, 2, 3].map(lvl => (
                               <div key={lvl} className={`w-8 h-2 rounded-sm ${
                                 (result.riskLevel === 'LOW' && lvl <= 1) ? 'bg-green-500' :
                                 (result.riskLevel === 'MEDIUM' && lvl <= 2) ? 'bg-yellow-500' :
                                 (result.riskLevel === 'HIGH' && lvl <= 3) ? 'bg-red-500' : 'bg-gray-800'
                               }`} />
                             ))}
                          </div>
                          <span className={`text-xs font-bold ${result.riskLevel === 'HIGH' ? 'text-red-500' : result.riskLevel === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}`}>{result.riskLevel}</span>
                       </div>

                       {/* Reasoning */}
                       <div className="space-y-2">
                         {result.reasoning.map((reason, idx) => (
                           <div key={idx} className="flex gap-3 text-sm text-gray-300">
                             <div className="min-w-[4px] h-[4px] mt-2 rounded-full bg-crypto-accent" />
                             <p>{reason}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* News Feed Section */}
              <div>
                 <div className="flex items-center gap-2 text-crypto-muted mb-3">
                    <Newspaper className="w-4 h-4" />
                    <h3 className="font-bold font-mono text-xs uppercase tracking-wider">{t('relevant_intelligence')}</h3>
                 </div>
                 <div className="space-y-2">
                    {newsLoading ? (
                       <div className="text-center py-4 text-crypto-muted text-xs animate-pulse">{t('scanning_news')}</div>
                    ) : news.length > 0 ? (
                       news.map(item => (
                         <div key={item.id} className="bg-[#1b2129] border border-white/5 hover:border-crypto-accent/50 p-3 rounded transition-colors group cursor-default">
                            <div className="flex justify-between items-start gap-4">
                               <div>
                                  <p className="text-sm text-gray-200 font-medium leading-snug group-hover:text-white">{item.title}</p>
                                  <div className="flex items-center gap-2 mt-2 text-[10px] text-crypto-muted font-mono">
                                     <span className="text-crypto-accent">{item.source}</span>
                                     <span>{item.time}</span>
                                  </div>
                               </div>
                               <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                                 item.sentiment === 'POSITIVE' ? 'border-crypto-up/30 text-crypto-up bg-crypto-up/5' :
                                 item.sentiment === 'NEGATIVE' ? 'border-crypto-down/30 text-crypto-down bg-crypto-down/5' :
                                 'border-crypto-muted/30 text-crypto-muted bg-white/5'
                               }`}>
                                 {item.sentiment}
                               </span>
                            </div>
                         </div>
                       ))
                    ) : (
                       <div className="text-center py-2 text-crypto-muted text-xs">{t('no_recent_news')}</div>
                    )}
                 </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Historical Charts */}
              <div className="bg-[#0b0e11] rounded-lg p-4 border border-crypto-border">
                <h3 className="font-bold font-mono text-xs uppercase tracking-wider text-crypto-muted mb-4">{t('price_ai_history')}</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stock.historicalData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" vertical={false} />
                      <XAxis dataKey="date" stroke="#848e9c" fontSize={10} tickFormatter={(val) => val.substring(5)} />
                      <YAxis yAxisId="left" stroke="#848e9c" fontSize={10} domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#151a21', borderColor: '#2b3139', color: '#eaecef' }}
                        itemStyle={{ color: '#eaecef' }}
                        labelStyle={{ color: '#848e9c' }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="price" stroke="#2962ff" strokeWidth={2} dot={false} />
                      {/* We can use scatter or custom dots for AI recommendations, but let's keep it simple with a line for now, and maybe a bar for MACD below */}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#0b0e11] rounded-lg p-4 border border-crypto-border">
                <h3 className="font-bold font-mono text-xs uppercase tracking-wider text-crypto-muted mb-4">{t('rsi_macd_trends')}</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stock.historicalData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" vertical={false} />
                      <XAxis dataKey="date" stroke="#848e9c" fontSize={10} hide />
                      <YAxis yAxisId="rsi" orientation="left" stroke="#848e9c" fontSize={10} domain={[0, 100]} />
                      <YAxis yAxisId="macd" orientation="right" stroke="#848e9c" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#151a21', borderColor: '#2b3139', color: '#eaecef' }}
                      />
                      <Line yAxisId="rsi" type="monotone" dataKey="rsi" stroke="#eab308" strokeWidth={1.5} dot={false} />
                      <Bar yAxisId="macd" dataKey="macd" fill="#8b5cf6" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-[#0b0e11] rounded-lg p-4 border border-crypto-border">
                <h3 className="font-bold font-mono text-xs uppercase tracking-wider text-crypto-muted mb-4">{t('ai_rec_history')}</h3>
                <div className="grid grid-cols-5 gap-2">
                  {(stock.historicalData || []).slice(-10).map((day, i) => (
                    <div key={i} className="bg-crypto-card p-2 rounded border border-white/5 text-center">
                      <div className="text-[9px] text-crypto-muted mb-1">{day.date.substring(5)}</div>
                      <div className={`text-[10px] font-bold ${day.aiRecommendation === 'BUY' ? 'text-crypto-up' : day.aiRecommendation === 'SELL' ? 'text-crypto-down' : 'text-crypto-muted'}`}>
                        {day.aiRecommendation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
             <button className="flex-1 py-3 bg-crypto-up hover:bg-crypto-up/90 text-black font-bold rounded uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-900/20">
               <DollarSign className="w-4 h-4" /> {t('place_limit_order')}
             </button>
             <button 
               onClick={onToggleWatchlist}
               className={`flex-1 py-3 border font-bold rounded uppercase tracking-widest transition-transform active:scale-95 flex items-center justify-center gap-2 ${isWatched ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400' : 'bg-crypto-card hover:bg-crypto-card/80 border-crypto-border text-white'}`}
             >
               <Star className={`w-4 h-4 ${isWatched ? 'fill-yellow-400' : ''}`} />
               {isWatched ? t('watched') : t('add_to_watchlist')}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};