export enum Trend {
  UP = 'UP',
  DOWN = 'DOWN',
  SIDEWAYS = 'SIDEWAYS'
}

export enum SignalType {
  BREAKOUT = 'BREAKOUT', // 突破
  REVERSAL = 'REVERSAL', // 反转
  MOMENTUM = 'MOMENTUM', // 动能
  OVERSOLD = 'OVERSOLD', // 超卖
  NONE = 'NONE'
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  rsi: number;
  macd: number;
  aiRecommendation?: 'BUY' | 'SELL' | 'WATCH';
}

export interface StockData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number; // Simulated daily volume
  marketCap: string;
  sector: string;
  rsi: number; // 14-day RSI
  macd: {
    diff: number;
    dea: number;
    histogram: number;
  };
  ma20: number;
  ma50: number;
  ema20: number; // Added EMA
  ema50: number; // Added EMA
  ma200: number;
  trend: Trend;
  signal: SignalType;
  history: { time: string; value: number }[]; // For sparklines
  historicalData?: HistoricalDataPoint[]; // For detailed historical analysis
}

export interface SniperFilter {
  minRsi: number;
  maxRsi: number;
  minVolume: number;
  signals: SignalType[];
  onlyUptrend: boolean;
  priceAboveEma20: boolean; // New filter
}

export type SortKey = 'symbol' | 'price' | 'changePercent' | 'rsi' | 'signal';
export type SortDirection = 'asc' | 'desc';

export interface AIAnalysisResult {
  recommendation: 'BUY' | 'SELL' | 'WATCH';
  confidence: number;
  reasoning: string[];
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Alert {
  id: string;
  stockName: string;
  stockSymbol: string;
  trigger: string;
  timestamp: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  url: string;
}

export interface Trade {
  id: string;
  stockId: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  price: number;
  shares: number;
  timestamp: number;
  reason: string;
}

export interface AutoTradeSettings {
  enabled: boolean;
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  maxPositionSize: number; // Max amount to invest per trade
}