import React, { useState } from 'react';
import { AutoTradeSettings, Trade } from '../types';
import { Settings, Play, Square, ShieldAlert, DollarSign, Activity, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AutoTradePanelProps {
  settings: AutoTradeSettings;
  onUpdateSettings: (settings: AutoTradeSettings) => void;
  trades: Trade[];
}

export const AutoTradePanel: React.FC<AutoTradePanelProps> = ({ settings, onUpdateSettings, trades }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleAutoTrade = () => {
    onUpdateSettings({ ...settings, enabled: !settings.enabled });
  };

  const setRiskTolerance = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    onUpdateSettings({ ...settings, riskTolerance: risk });
  };

  const setMaxPosition = (amount: number) => {
    onUpdateSettings({ ...settings, maxPositionSize: amount });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg shadow-black/50 flex items-center justify-center transition-all hover:scale-105 z-40 ${settings.enabled ? 'bg-crypto-up text-black' : 'bg-crypto-card border border-crypto-border text-white'}`}
      >
        <Activity className={`w-6 h-6 ${settings.enabled ? 'animate-pulse' : ''}`} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-crypto-card border border-crypto-accent/50 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-crypto-card to-crypto-accent/10 p-4 flex justify-between items-center border-b border-crypto-border">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-crypto-accent" />
          <h3 className="font-bold text-white tracking-tight">{t('ai_auto_trade')}</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-crypto-muted hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Status Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-crypto-muted">{t('system_status')}</span>
          <button 
            onClick={toggleAutoTrade}
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors ${settings.enabled ? 'bg-crypto-up/20 text-crypto-up border border-crypto-up/50' : 'bg-crypto-bg border border-crypto-border text-crypto-muted hover:text-white'}`}
          >
            {settings.enabled ? <><Play className="w-3 h-3" /> {t('active')}</> : <><Square className="w-3 h-3" /> {t('paused')}</>}
          </button>
        </div>

        {/* Risk Tolerance */}
        <div className="space-y-2">
          <span className="text-sm font-mono text-crypto-muted flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> {t('risk_tolerance')}
          </span>
          <div className="flex gap-2">
            {['LOW', 'MEDIUM', 'HIGH'].map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskTolerance(risk as any)}
                className={`flex-1 py-2 text-xs font-bold rounded border transition-colors ${settings.riskTolerance === risk ? (risk === 'HIGH' ? 'bg-red-500/20 border-red-500 text-red-500' : risk === 'MEDIUM' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-green-500/20 border-green-500 text-green-500') : 'bg-crypto-bg border-crypto-border text-crypto-muted hover:bg-white/5'}`}
              >
                {t(risk.toLowerCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Max Position Size */}
        <div className="space-y-2">
          <span className="text-sm font-mono text-crypto-muted flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> {t('max_position_size')}
          </span>
          <input 
            type="range" 
            min="1000" 
            max="100000" 
            step="1000"
            value={settings.maxPositionSize}
            onChange={(e) => setMaxPosition(Number(e.target.value))}
            className="w-full accent-crypto-accent"
          />
          <div className="text-right font-mono text-white text-sm">
            ¥{settings.maxPositionSize.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="border-t border-crypto-border bg-[#0b0e11] flex-1 max-h-60 flex flex-col">
        <div className="p-3 border-b border-crypto-border/50 text-xs font-mono text-crypto-muted uppercase tracking-wider">
          {t('recent_executions')}
        </div>
        <div className="overflow-y-auto custom-scrollbar p-2 space-y-2 flex-1">
          {trades.length === 0 ? (
            <div className="text-center text-crypto-muted text-xs py-4">{t('no_trades')}</div>
          ) : (
            trades.slice().reverse().map(trade => (
              <div key={trade.id} className="bg-crypto-card p-2 rounded border border-white/5 text-xs flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${trade.type === 'BUY' ? 'text-crypto-up' : 'text-crypto-down'}`}>{trade.type}</span>
                    <span className="text-white">{trade.symbol}</span>
                  </div>
                  <div className="text-crypto-muted mt-1 truncate max-w-[180px]" title={trade.reason}>{trade.reason}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-white">¥{trade.price.toFixed(2)}</div>
                  <div className="text-crypto-muted text-[10px]">{trade.shares} {t('shrs')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
