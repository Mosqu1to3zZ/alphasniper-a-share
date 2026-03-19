import React, { useEffect } from 'react';
import { X, Crosshair } from 'lucide-react';
import { Alert } from '../types';
import { useTranslation } from 'react-i18next';

export const AlertContainer: React.FC<{ alerts: Alert[]; removeAlert: (id: string) => void }> = ({ alerts, removeAlert }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80 pointer-events-none">
      {alerts.map(alert => (
        <AlertToast key={alert.id} alert={alert} onDismiss={() => removeAlert(alert.id)} />
      ))}
    </div>
  );
};

const AlertToast: React.FC<{ alert: Alert; onDismiss: () => void }> = ({ alert, onDismiss }) => {
  const { t } = useTranslation();
  useEffect(() => {
    // Auto dismiss after 5 seconds
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="pointer-events-auto bg-crypto-card border border-crypto-border border-l-4 border-l-crypto-accent shadow-2xl rounded p-4 flex items-start gap-3 animate-in slide-in-from-right duration-300 relative overflow-hidden group">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-crypto-accent/5 pointer-events-none" />
      
      <div className="bg-crypto-accent/20 p-2 rounded-full relative z-10 shrink-0">
        <Crosshair className="w-4 h-4 text-crypto-accent animate-spin-slow" />
      </div>
      
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex justify-between items-center mb-1">
           <h4 className="text-[10px] font-bold text-crypto-accent uppercase tracking-wider">{t('sniper_alert')}</h4>
           <span className="text-[10px] text-crypto-muted">{new Date(alert.timestamp).toLocaleTimeString()}</span>
        </div>
        
        <div className="flex justify-between items-baseline mb-1">
            <span className="font-bold text-white truncate text-sm">{alert.stockName}</span>
            <span className="text-xs text-crypto-muted font-mono">{alert.stockSymbol}</span>
        </div>
        
        <div className="text-xs font-mono font-bold text-crypto-up bg-crypto-up/10 inline-block px-1.5 py-0.5 rounded border border-crypto-up/20">
            {alert.trigger}
        </div>
      </div>
      
      <button 
        onClick={onDismiss} 
        className="text-crypto-muted hover:text-white transition-colors relative z-10 p-1 hover:bg-white/10 rounded"
      >
        <X className="w-4 h-4" />
      </button>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};