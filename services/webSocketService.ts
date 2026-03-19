import { StockData, Trend, SignalType } from '../types';

type StockUpdateListener = (data: StockData[]) => void;
type ConnectionStatusListener = (isConnected: boolean) => void;

class StockWebSocketService {
  private subscribers: StockUpdateListener[] = [];
  private statusListeners: ConnectionStatusListener[] = [];
  private isConnected = false;
  private intervalId: number | null = null;
  
  // Internal state acting as the "Server" source of truth
  private currentData: StockData[] = [];

  constructor() {
    // Start with empty data, will be populated on connect
  }

  /**
   * Simulates establishing a WebSocket connection
   */
  async connect() {
    if (this.isConnected) return;
    
    try {
      // Fetch initial real historical data
      const response = await fetch('/api/stocks/init');
      if (!response.ok) {
        throw new Error('Failed to fetch initial stock data');
      }
      this.currentData = await response.json();
      
      this.isConnected = true;
      this.notifyStatus(true);
      this.notifySubscribers(this.currentData);
      
      this.startStream();
    } catch (error) {
      console.error("Connection failed:", error);
      // Retry connection after a delay
      setTimeout(() => this.connect(), 5000);
    }
  }

  /**
   * Closes the connection
   */
  disconnect() {
    this.isConnected = false;
    this.notifyStatus(false);
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Subscribe to stock updates
   */
  subscribe(callback: StockUpdateListener): () => void {
    this.subscribers.push(callback);
    // If already connected, send current state immediately
    if (this.isConnected && this.currentData.length > 0) {
        callback(this.currentData);
    }
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Listen to connection status changes
   */
  onStatusChange(callback: ConnectionStatusListener): () => void {
    this.statusListeners.push(callback);
    return () => {
        this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    }
  }

  private notifyStatus(status: boolean) {
    this.statusListeners.forEach(cb => cb(status));
  }

  private notifySubscribers(data: StockData[]) {
    this.subscribers.forEach(cb => cb(data));
  }

  /**
   * Fetch real-time data from the server
   */
  private async fetchRealData() {
    if (this.currentData.length === 0) return;
    
    try {
      // Get the codes from our initial data
      const codes = this.currentData.map(s => s.symbol).join(',');
      const response = await fetch(`/api/stocks?codes=${codes}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const realData = await response.json();
      
      // Merge real data with our existing data structure (to keep history, RSI, etc.)
      const updates = this.currentData.map(stock => {
        const realStock = realData.find((s: any) => s.symbol === stock.symbol);
        
        if (realStock) {
          const newPrice = realStock.price;
          const newChangePercent = realStock.changePercent;
          
          // Update Sparkline History if price changed significantly or just append
          // For a real app, we'd append intraday data. Here we just update the last point 
          // or add a new one if enough time passed. Let's just update the last point for simplicity
          // to avoid the sparkline growing infinitely during a session.
          const newHistory = [...stock.history];
          if (newHistory.length > 0) {
            newHistory[newHistory.length - 1] = { time: new Date().toLocaleTimeString(), value: newPrice };
          }

          // We keep the real RSI, MACD, MA from the init fetch, 
          // but we can slightly adjust EMA for the real-time feel if needed.
          // For now, let's just use the real indicators from the daily data.
          // The trend and signal can be updated based on the new real-time price.
          
          let newTrend = stock.trend;
          if (newPrice > stock.ma20 && stock.ma20 > stock.ma50) newTrend = Trend.UP;
          else if (newPrice < stock.ma20 && stock.ma20 < stock.ma50) newTrend = Trend.DOWN;
          else newTrend = Trend.SIDEWAYS;

          let newSignal = SignalType.NONE;
          if (newChangePercent > 5 && newPrice > stock.ma20) newSignal = SignalType.BREAKOUT;
          else if (stock.rsi < 30) newSignal = SignalType.OVERSOLD;
          else if (stock.rsi > 70 && newTrend === Trend.UP) newSignal = SignalType.MOMENTUM;
          else if (newChangePercent > 0 && stock.rsi < 40 && newTrend === Trend.DOWN) newSignal = SignalType.REVERSAL;

          return {
            ...stock,
            price: newPrice,
            changePercent: newChangePercent,
            volume: realStock.volume,
            marketCap: realStock.marketCap !== '0亿' ? realStock.marketCap : stock.marketCap,
            history: newHistory,
            trend: newTrend,
            signal: newSignal
          };
        }
        return stock;
      });

      this.currentData = updates;
      this.notifySubscribers(updates);
    } catch (error) {
      console.error("Failed to fetch real stock data:", error);
    }
  }

  private startStream() {
    if (this.intervalId) clearInterval(this.intervalId);

    // Poll every 3 seconds for real-time updates
    this.intervalId = window.setInterval(() => {
      if (!this.isConnected) return;
      this.fetchRealData();
    }, 3000);
  }
}

// Singleton instance
export const stockService = new StockWebSocketService();