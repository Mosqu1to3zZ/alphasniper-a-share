import { StockData, SniperFilter } from '../types';

export const checkStockAgainstFilter = (stock: StockData, filter: SniperFilter): boolean => {
  if (stock.rsi < filter.minRsi || stock.rsi > filter.maxRsi) return false;
  if (filter.onlyUptrend && stock.price <= stock.ma50) return false;
  if (filter.priceAboveEma20 && stock.price <= stock.ema20) return false;
  if (filter.signals.length > 0) {
    if (!filter.signals.includes(stock.signal)) return false;
  }
  return true;
};