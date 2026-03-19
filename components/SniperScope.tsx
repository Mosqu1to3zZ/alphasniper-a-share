import React from 'react';
import { SniperFilter, SignalType } from '../types';
import { Target, Activity, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SniperScopeProps {
  filter: SniperFilter;
  setFilter: React.Dispatch<React.SetStateAction<SniperFilter>>;
}

export const SniperScope: React.FC<SniperScopeProps> = ({ filter, setFilter }) => {
  const { t } = useTranslation();
  const toggleSignal = (s: SignalType) => {
    if (filter.signals.includes(s)) {
      setFilter(prev => ({ ...prev, signals: prev.signals.filter(i => i !== s) }));
    } else {
      setFilter(prev => ({ ...prev, signals: [...prev.signals, s] }));
    }
  };

  return (
    <div className="bg-crypto-card border border-crypto-border rounded-lg p-4 mb-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4 text-crypto-accent">
        <Target className="w-5 h-5" />
        <h2 className="text-lg font-bold font-mono tracking-wider">{t('sniper_scope_config')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Signal Filters */}
        <div className="space-y-2">
          <label className="text-xs text-crypto-muted font-mono uppercase">{t('signal')}</label>
          <div className="flex flex-wrap gap-2">
            {[SignalType.BREAKOUT, SignalType.REVERSAL, SignalType.MOMENTUM, SignalType.OVERSOLD].map((sig) => (
              <button
                key={sig}
                onClick={() => toggleSignal(sig)}
                className={`px-3 py-1 text-xs rounded-full font-bold transition-all border ${
                  filter.signals.includes(sig)
                    ? 'bg-crypto-accent/20 border-crypto-accent text-crypto-accent neon-glow'
                    : 'bg-transparent border-crypto-border text-crypto-muted hover:border-crypto-muted'
                }`}
              >
                {t(sig.toLowerCase())}
              </button>
            ))}
          </div>
        </div>

        {/* RSI Slider */}
        <div className="space-y-2">
           <label className="text-xs text-crypto-muted font-mono uppercase flex justify-between">
             <span>{t('rsi')} {t('range')}</span>
             <span className="text-white">{filter.minRsi} - {filter.maxRsi}</span>
           </label>
           <div className="flex gap-2 items-center">
             <span className="text-xs text-crypto-muted">0</span>
             <input 
               type="range" 
               min="0" max="100" 
               value={filter.maxRsi}
               onChange={(e) => setFilter(prev => ({...prev, maxRsi: parseInt(e.target.value)}))}
               className="w-full h-1 bg-crypto-border rounded-lg appearance-none cursor-pointer accent-crypto-accent"
             />
             <span className="text-xs text-crypto-muted">100</span>
           </div>
        </div>

        {/* Trend & EMA Toggle */}
        <div className="space-y-2">
           <label className="text-xs text-crypto-muted font-mono uppercase">{t('trend')} & {t('filters')}</label>
           <div className="flex flex-col gap-2">
             <button
              onClick={() => setFilter(prev => ({ ...prev, onlyUptrend: !prev.onlyUptrend }))}
              className={`w-full flex items-center justify-between px-3 py-2 rounded border transition-colors text-xs ${
                filter.onlyUptrend 
                 ? 'bg-crypto-up/10 border-crypto-up text-crypto-up'
                 : 'bg-crypto-card border-crypto-border text-crypto-muted'
              }`}
             >
               <span>MA20 &gt; MA50 ({t('trend')})</span>
               <Activity className="w-3 h-3" />
             </button>
             <button
              onClick={() => setFilter(prev => ({ ...prev, priceAboveEma20: !prev.priceAboveEma20 }))}
              className={`w-full flex items-center justify-between px-3 py-2 rounded border transition-colors text-xs ${
                filter.priceAboveEma20 
                 ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                 : 'bg-crypto-card border-crypto-border text-crypto-muted'
              }`}
             >
               <span>{t('price')} &gt; EMA20</span>
               <Zap className="w-3 h-3" />
             </button>
           </div>
        </div>
        
         {/* Presets */}
         <div className="space-y-2">
           <label className="text-xs text-crypto-muted font-mono uppercase">{t('quick_presets')}</label>
           <div className="flex gap-2">
             <button 
                onClick={() => setFilter({ minRsi: 0, maxRsi: 30, minVolume: 0, signals: [SignalType.OVERSOLD, SignalType.REVERSAL], onlyUptrend: false, priceAboveEma20: false })}
                className="flex-1 py-1 text-xs bg-crypto-down/10 text-crypto-down border border-crypto-down/30 rounded hover:bg-crypto-down/20"
             >
               {t('bottom_fish')}
             </button>
             <button 
                onClick={() => setFilter({ minRsi: 50, maxRsi: 80, minVolume: 0, signals: [SignalType.BREAKOUT], onlyUptrend: true, priceAboveEma20: true })}
                className="flex-1 py-1 text-xs bg-crypto-up/10 text-crypto-up border border-crypto-up/30 rounded hover:bg-crypto-up/20"
             >
               {t('moon_shot')}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
