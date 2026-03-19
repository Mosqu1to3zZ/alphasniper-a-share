import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StockData, SniperFilter, SignalType, SortKey, SortDirection, Alert, AutoTradeSettings, Trade } from './types';
import { checkStockAgainstFilter } from './utils/sniperHelper';
import { stockService } from './services/webSocketService';
import { analyzeStockWithGemini } from './services/geminiService';
import { SniperScope } from './components/SniperScope';
import { StockTerminal } from './components/StockTerminal';
import { AnalysisModal } from './components/AnalysisModal';
import { ComparisonView } from './components/ComparisonView';
import { MarketTicker } from './components/MarketTicker';
import { AlertContainer } from './components/AlertToast';
import { AutoTradePanel } from './components/AutoTradePanel';
import { Crosshair, TrendingUp, BarChart3, Radio, List, Target, Star, Wifi, WifiOff, Layers, Trash2, Globe } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type ViewMode = 'TOP_200' | 'TARGETS' | 'WATCHLIST';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'changePercent', direction: 'desc' });
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('TOP_200');
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Comparison State
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Auto-Trade State
  const [autoTradeSettings, setAutoTradeSettings] = useState<AutoTradeSettings>({
    enabled: false,
    riskTolerance: 'MEDIUM',
    maxPositionSize: 10000
  });
  const [trades, setTrades] = useState<Trade[]>([]);
  const autoTradeSettingsRef = useRef(autoTradeSettings);

  useEffect(() => {
    autoTradeSettingsRef.current = autoTradeSettings;
  }, [autoTradeSettings]);

  // Alert System State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const prevFilterRef = useRef<SniperFilter | null>(null);
  const prevMatchedIdsRef = useRef<Set<string>>(new Set());
  const isFirstRun = useRef(true);

  // Filter State
  const [filter, setFilter] = useState<SniperFilter>({
    minRsi: 0,
    maxRsi: 100,
    minVolume: 0,
    signals: [],
    onlyUptrend: false,
    priceAboveEma20: false
  });
  
  // Real-time Data Connection
  useEffect(() => {
    // Connect to WebSocket service
    stockService.connect();

    // Subscribe to data updates
    const unsubscribeData = stockService.subscribe((data) => {
      setStocks(data);
      if (data.length > 0) {
        setIsLoading(false);
      }
    });

    // Subscribe to status changes
    const unsubscribeStatus = stockService.onStatusChange((status) => {
      setIsLive(status);
    });

    return () => {
      unsubscribeData();
      unsubscribeStatus();
      stockService.disconnect();
    };
  }, []);

  // Alert System Logic
  useEffect(() => {
    // 1. Identify current matching stocks using standardized helper
    const currentMatches = stocks.filter(stock => checkStockAgainstFilter(stock, filter));
    const currentMatchIds = new Set(currentMatches.map(s => s.id));

    // Check if filter configuration has changed significantly
    // (Simple ref comparison works because setFilter creates new object)
    const filterChanged = prevFilterRef.current !== filter;

    if (filterChanged || isFirstRun.current) {
      // If filter changed or it's first run, just establish the baseline.
      prevMatchedIdsRef.current = currentMatchIds;
      prevFilterRef.current = filter;
      isFirstRun.current = false;
    } else {
      // Data update cycle: Check for NEW entrants into the sniper scope
      const newAlerts: Alert[] = [];
      const currentSettings = autoTradeSettingsRef.current;
      
      currentMatches.forEach(stock => {
        if (!prevMatchedIdsRef.current.has(stock.id)) {
          // Stock wasn't in the list before, now it is -> ALERT
          const triggerReason = stock.signal !== 'NONE' ? stock.signal : 
                               (stock.rsi < 30) ? 'RSI OVERSOLD' : 
                               (stock.rsi > 70) ? 'RSI OVERBOUGHT' : 'TREND ENTRY';
          
          newAlerts.push({
            id: `${stock.id}-${Date.now()}`,
            stockName: stock.name,
            stockSymbol: stock.symbol,
            trigger: triggerReason,
            timestamp: Date.now()
          });

          toast.success(t('newMatchAlert'), {
            description: t('stockMatched', { name: stock.name, symbol: stock.symbol }),
          });

          // Auto-Trade Logic
          if (currentSettings.enabled) {
            analyzeStockWithGemini(stock).then(analysis => {
              if (typeof analysis === 'string') return; // Error case

              let shouldTrade = false;
              let tradeType: 'BUY' | 'SELL' = 'BUY';

              if (analysis.recommendation === 'BUY') {
                tradeType = 'BUY';
                if (currentSettings.riskTolerance === 'HIGH') {
                  shouldTrade = analysis.confidence >= 50;
                } else if (currentSettings.riskTolerance === 'MEDIUM') {
                  shouldTrade = analysis.confidence >= 70 && analysis.riskLevel !== 'HIGH';
                } else {
                  shouldTrade = analysis.confidence >= 85 && analysis.riskLevel === 'LOW';
                }
              } else if (analysis.recommendation === 'SELL') {
                tradeType = 'SELL';
                if (currentSettings.riskTolerance === 'HIGH') {
                  shouldTrade = analysis.confidence >= 50;
                } else if (currentSettings.riskTolerance === 'MEDIUM') {
                  shouldTrade = analysis.confidence >= 70;
                } else {
                  shouldTrade = analysis.confidence >= 85;
                }
              }

              if (shouldTrade) {
                const shares = Math.floor(currentSettings.maxPositionSize / stock.price);
                if (shares > 0) {
                  const newTrade: Trade = {
                    id: `trade-${Date.now()}-${stock.id}-${Math.random()}`,
                    stockId: stock.id,
                    symbol: stock.symbol,
                    name: stock.name,
                    type: tradeType,
                    price: stock.price,
                    shares: shares,
                    timestamp: Date.now(),
                    reason: `AI ${tradeType} Signal (Confidence: ${analysis.confidence}%, Risk: ${analysis.riskLevel}) - ${analysis.reasoning[0]}`
                  };
                  setTrades(prev => [...prev, newTrade]);
                }
              }
            });
          }
        }
      });

      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev.slice(-4), ...newAlerts]); // Keep max 5-6 alerts visual
      }
      
      // Update baseline for next tick
      prevMatchedIdsRef.current = currentMatchIds;
    }

  }, [stocks, filter]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Sort Handler
  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const toggleWatchlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleCompare = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareList(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) return prev; // Limit to 5
      return [...prev, id];
    });
  };

  // Calculate counts for tabs
  const targetsCount = useMemo(() => {
    return stocks.filter(stock => checkStockAgainstFilter(stock, filter)).length;
  }, [stocks, filter]);

  // Filter & Sort Logic for Display
  const filteredAndSortedStocks = useMemo(() => {
    let result = stocks;

    // 1. Filter based on View Mode
    if (viewMode === 'TOP_200') {
      result = stocks;
    } else if (viewMode === 'TARGETS') {
      result = stocks.filter(stock => checkStockAgainstFilter(stock, filter));
    } else if (viewMode === 'WATCHLIST') {
      result = stocks.filter(s => watchlist.includes(s.id));
    }

    // 2. Sort
    return result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // @ts-ignore
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [stocks, filter, sortConfig, viewMode, watchlist]);

  // Dashboard Stats
  const breakoutCount = stocks.filter(s => s.signal === SignalType.BREAKOUT).length;
  const avgSentiment = stocks.length > 0 ? stocks.reduce((acc, s) => acc + (s.changePercent > 0 ? 1 : 0), 0) / stocks.length * 100 : 50;
  const volSpikeCount = stocks.filter(s => s.volume > 10000000).length; // Arbitrary threshold for "spike"

  // Ticker Data (Sorted by biggest movers for interest)
  const tickerData = useMemo(() => {
     return [...stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }, [stocks]);

  // Derive comparison stocks object
  const comparisonStocks = useMemo(() => {
     return stocks.filter(s => compareList.includes(s.id));
  }, [stocks, compareList]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-bg text-crypto-text flex flex-col items-center justify-center font-sans">
        <div className="w-16 h-16 border-4 border-crypto-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold text-white tracking-widest">{t('initializing')}</h2>
        <p className="text-crypto-muted mt-2 font-mono">{t('fetching_data')}</p>
        <p className="text-crypto-muted text-xs mt-1 font-mono opacity-50">{t('loading_time')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crypto-bg text-crypto-text pb-20 font-sans flex flex-col">
      <Toaster theme="dark" position="top-right" />
      
      {/* Navbar */}
      <nav className="h-16 border-b border-crypto-border bg-crypto-card/50 backdrop-blur-md sticky top-0 z-40 flex-none">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-crypto-accent rounded flex items-center justify-center neon-glow">
              <Crosshair className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-white">ALPHA<span className="text-crypto-accent">SNIPER</span>_A-SHARE</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-crypto-muted">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')}>
              <Globe className="w-3 h-3 text-crypto-accent" />
              <span>{i18n.language === 'en' ? 'EN' : '中文'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5">
               {isLive ? <Wifi className="w-3 h-3 text-crypto-up" /> : <WifiOff className="w-3 h-3 text-crypto-down" />}
               <span className={isLive ? 'text-crypto-up font-bold' : 'text-crypto-down'}>
                  {isLive ? t('websocket_live') : t('disconnected')}
               </span>
            </div>
            <span>INDEX: 3,240.15</span>
            <div className="px-5 py-2 bg-crypto-accent hover:bg-blue-600 text-white font-bold rounded cursor-pointer transition-colors shadow-lg shadow-blue-900/20">
              {t('login')}
            </div>
          </div>
        </div>
      </nav>

      {/* Market Ticker */}
      <MarketTicker items={tickerData} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        
        {/* Market Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-crypto-card p-4 rounded-lg border border-crypto-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
               <TrendingUp className="w-16 h-16 text-crypto-up" />
            </div>
            <p className="text-crypto-muted text-xs font-mono uppercase">{t('marketPulse')}</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{avgSentiment.toFixed(0)}% <span className="text-sm font-normal text-crypto-muted">{t('up')}</span></h3>
            <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
               <div className="bg-crypto-up h-full transition-all duration-1000" style={{ width: `${avgSentiment}%` }}></div>
            </div>
          </div>

          <div className="bg-crypto-card p-4 rounded-lg border border-crypto-border">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-crypto-muted text-xs font-mono uppercase">{t('breakoutSignals')}</p>
                 <h3 className="text-2xl font-bold mt-1 text-crypto-up">{breakoutCount}</h3>
               </div>
               <BarChart3 className="text-crypto-muted w-5 h-5" />
            </div>
          </div>

           <div className="bg-crypto-card p-4 rounded-lg border border-crypto-border">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-crypto-muted text-xs font-mono uppercase">{t('volSpike')}</p>
                 <h3 className="text-2xl font-bold mt-1 text-white">{volSpikeCount}</h3>
               </div>
               <Radio className="text-crypto-accent w-5 h-5 animate-pulse" />
            </div>
          </div>
           
           <div className="bg-gradient-to-br from-crypto-accent/20 to-crypto-card p-4 rounded-lg border border-crypto-accent/30 flex flex-col justify-center items-center text-center cursor-pointer hover:border-crypto-accent transition-colors" onClick={() => stocks.length > 0 && setSelectedStock(stocks[0])}>
              <span className="text-crypto-accent font-bold text-sm uppercase tracking-widest mb-1">{t('starPick')}</span>
              <span className="text-white font-bold text-lg">{stocks.length > 0 ? stocks[0].name : 'Loading...'}</span>
              <span className="text-crypto-up text-xs font-mono mt-1">+{t('aiRecommendation')}</span>
           </div>
        </div>

        {/* Filters */}
        <SniperScope filter={filter} setFilter={setFilter} />

        {/* Tab Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 border-b border-crypto-border pb-1 gap-4">
           
           {/* Main Tabs */}
           <div className="flex w-full md:w-auto bg-crypto-card/50 rounded-t-lg overflow-hidden border-x border-t border-crypto-border">
              
              <button 
                onClick={() => setViewMode('TOP_200')}
                className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${
                   viewMode === 'TOP_200' 
                   ? 'bg-crypto-card border-crypto-accent text-white' 
                   : 'bg-transparent border-transparent text-crypto-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <List className="w-4 h-4" />
                {t('dashboard')}
              </button>

              <button 
                onClick={() => setViewMode('TARGETS')}
                className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${
                   viewMode === 'TARGETS' 
                   ? 'bg-crypto-card border-crypto-accent text-white' 
                   : 'bg-transparent border-transparent text-crypto-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Target className="w-4 h-4" />
                {t('sniperScope')}
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${targetsCount > 0 ? 'bg-crypto-accent text-white' : 'bg-crypto-border text-crypto-muted'}`}>
                  {targetsCount}
                </span>
              </button>

              <button 
                onClick={() => setViewMode('WATCHLIST')}
                className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-4 text-sm font-bold tracking-wide transition-all border-b-2 ${
                   viewMode === 'WATCHLIST' 
                   ? 'bg-crypto-card border-crypto-accent text-white' 
                   : 'bg-transparent border-transparent text-crypto-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Star className="w-4 h-4" />
                {t('portfolio')}
                <span className="ml-1 text-[10px] bg-crypto-border text-crypto-muted px-1.5 py-0.5 rounded-full">
                  {watchlist.length}
                </span>
              </button>

           </div>

           <div className="hidden md:flex items-center gap-4 px-4 pb-2">
             <div className="text-xs text-crypto-muted font-mono flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-crypto-up animate-pulse' : 'bg-crypto-down'}`}></span>
                {isLive ? t('stream_active') : t('reconnecting')}
             </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <StockTerminal 
            stocks={filteredAndSortedStocks} 
            onSelectStock={(stock) => setSelectedStock(stock)}
            sortConfig={sortConfig}
            onSort={handleSort}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
            compareList={compareList}
            onToggleCompare={toggleCompare}
          />
        </div>

      </main>

      {/* Floating Compare Action Bar */}
      {compareList.length > 0 && (
         <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-crypto-card border border-crypto-accent rounded-full shadow-2xl shadow-blue-900/40 p-1.5 pl-6 pr-2 flex items-center gap-4">
               <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="bg-crypto-accent w-6 h-6 rounded-full flex items-center justify-center text-xs">{compareList.length}</span>
                  <span className="hidden md:inline">{t('stocks_selected')}</span>
               </div>
               <div className="h-6 w-px bg-white/10 mx-2"></div>
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCompareList([])}
                    className="p-2 text-crypto-muted hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                     <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowComparison(true)}
                    className="flex items-center gap-2 bg-crypto-accent hover:bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors"
                  >
                     <Layers className="w-4 h-4" /> {t('compare_now')}
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Alert Overlay */}
      <AlertContainer alerts={alerts} removeAlert={removeAlert} />

      {/* Auto Trade Panel */}
      <AutoTradePanel 
        settings={autoTradeSettings} 
        onUpdateSettings={setAutoTradeSettings} 
        trades={trades} 
      />

      {/* Footer */}
      <footer className="border-t border-crypto-border mt-12 py-8 text-center text-crypto-muted text-xs font-mono">
        <p>{t('footer_title')}</p>
        <p className="mt-2 opacity-50">{t('footer_desc')}</p>
      </footer>

      {/* Analysis Modal */}
      {selectedStock && (
        <AnalysisModal 
          stock={selectedStock} 
          onClose={() => setSelectedStock(null)}
          isWatched={watchlist.includes(selectedStock.id)}
          onToggleWatchlist={() => toggleWatchlist(selectedStock.id)}
        />
      )}

      {/* Comparison View */}
      {showComparison && (
        <ComparisonView 
          stocks={comparisonStocks} 
          onClose={() => setShowComparison(false)} 
        />
      )}
    </div>
  );
};

export default App;