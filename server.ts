import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import iconv from "iconv-lite";
import { REAL_A_SHARES } from "./constants";
import { Trend, SignalType, StockData } from "./types";
import { RSI, MACD, SMA, EMA } from "technicalindicators";
import { fetchStockNews } from "./services/newsService";
import { analyzeStockWithGemini } from "./services/geminiService";

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// Helper to determine the prefix for Tencent API
const getPrefix = (code: string) => {
  if (code.startsWith('6')) return 'sh' + code;
  if (code.startsWith('4') || code.startsWith('8') || code.startsWith('9')) return 'bj' + code;
  return 'sz' + code;
};

let stockCache: StockData[] = [];

async function initializeStockCache() {
  console.log("Initializing stock cache with real historical data...");
  const newCache: StockData[] = [];
  
  // Fetch historical data in chunks to avoid rate limits
  const chunkSize = 10;
  for (let i = 0; i < REAL_A_SHARES.length; i += chunkSize) {
    const chunk = REAL_A_SHARES.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (stock) => {
      try {
        const prefix = getPrefix(stock.code);
        // Fetch 250 days of daily K-line data
        const response = await axios.get(`http://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${prefix},day,,,250,qfq`);
        const dataObj = response.data?.data?.[prefix];
        if (!dataObj) return;
        
        const klines = dataObj.qfqday || dataObj.day; // qfqday is forward-adjusted, day is unadjusted
        if (!klines || klines.length === 0) return;
        
        // kline format: [date, open, close, high, low, volume]
        const closes = klines.map((k: any) => parseFloat(k[2]));
        const dates = klines.map((k: any) => k[0]);
        const currentPrice = closes[closes.length - 1];
        const previousClose = closes.length > 1 ? closes[closes.length - 2] : currentPrice;
        const changePercent = ((currentPrice - previousClose) / previousClose) * 100;
        const volume = parseFloat(klines[klines.length - 1][5]) * 100; // in shares
        
        // Calculate indicators
        const rsiValues = RSI.calculate({ period: 14, values: closes });
        const rsi = rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : 50;
        
        const macdValues = MACD.calculate({
          values: closes,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          SimpleMAOscillator: false,
          SimpleMASignal: false
        });
        const macd = macdValues.length > 0 ? macdValues[macdValues.length - 1] : { MACD: 0, signal: 0, histogram: 0 };
        
        const ma20Values = SMA.calculate({ period: 20, values: closes });
        const ma20 = ma20Values.length > 0 ? ma20Values[ma20Values.length - 1] : currentPrice;
        
        const ma50Values = SMA.calculate({ period: 50, values: closes });
        const ma50 = ma50Values.length > 0 ? ma50Values[ma50Values.length - 1] : currentPrice;
        
        const ma200Values = SMA.calculate({ period: 200, values: closes });
        const ma200 = ma200Values.length > 0 ? ma200Values[ma200Values.length - 1] : currentPrice;
        
        const ema20Values = EMA.calculate({ period: 20, values: closes });
        const ema20 = ema20Values.length > 0 ? ema20Values[ema20Values.length - 1] : currentPrice;
        
        const ema50Values = EMA.calculate({ period: 50, values: closes });
        const ema50 = ema50Values.length > 0 ? ema50Values[ema50Values.length - 1] : currentPrice;
        
        let trend = Trend.SIDEWAYS;
        if (currentPrice > ma20 && ma20 > ma50) trend = Trend.UP;
        else if (currentPrice < ma20 && ma20 < ma50) trend = Trend.DOWN;
        
        let signal = SignalType.NONE;
        if (changePercent > 5 && currentPrice > ma20) signal = SignalType.BREAKOUT;
        else if (rsi < 30) signal = SignalType.OVERSOLD;
        else if (rsi > 70 && trend === Trend.UP) signal = SignalType.MOMENTUM;
        else if (changePercent > 0 && rsi < 40 && trend === Trend.DOWN) signal = SignalType.REVERSAL;
        
        // Generate history for sparkline (last 20 days)
        const history = closes.slice(-20).map((c: number, idx: number) => ({
          time: dates[dates.length - 20 + idx] || '',
          value: c
        }));
        
        // Generate detailed historical data (last 30 days)
        const historicalData = klines.slice(-30).map((k: any, idx: number) => {
          const c = parseFloat(k[2]);
          const rsiVal = rsiValues[rsiValues.length - 30 + idx] || 50;
          const macdVal = macdValues[macdValues.length - 30 + idx]?.histogram || 0;
          
          let aiRec: 'BUY' | 'SELL' | 'WATCH' = 'WATCH';
          if (rsiVal < 35 && macdVal > 0) aiRec = 'BUY';
          else if (rsiVal > 65 && macdVal < 0) aiRec = 'SELL';
          
          return {
            date: k[0],
            price: c,
            rsi: parseFloat(rsiVal.toFixed(1)),
            macd: parseFloat(macdVal.toFixed(2)),
            aiRecommendation: aiRec
          };
        });
        
        newCache.push({
          id: stock.code,
          symbol: stock.code,
          name: stock.name,
          price: currentPrice,
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: volume,
          marketCap: '0亿', // We can update this later with real-time API
          sector: stock.sector,
          rsi: parseFloat(rsi.toFixed(1)),
          macd: {
            diff: parseFloat((macd.MACD || 0).toFixed(2)),
            dea: parseFloat((macd.signal || 0).toFixed(2)),
            histogram: parseFloat((macd.histogram || 0).toFixed(2))
          },
          ma20: parseFloat(ma20.toFixed(2)),
          ma50: parseFloat(ma50.toFixed(2)),
          ema20: parseFloat(ema20.toFixed(2)),
          ema50: parseFloat(ema50.toFixed(2)),
          ma200: parseFloat(ma200.toFixed(2)),
          trend,
          signal,
          history,
          historicalData
        });
      } catch (err) {
        console.error(`Failed to fetch historical data for ${stock.code}:`, err);
      }
    }));
    
    // Small delay between chunks
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  stockCache = newCache;
  console.log(`Stock cache initialized with ${stockCache.length} stocks.`);
}

// API routes go here
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/stocks/init", (req, res) => {
  if (stockCache.length === 0) {
    return res.status(503).json({ error: "Stock cache is initializing" });
  }
  res.json(stockCache);
});

app.get("/api/stocks", async (req, res) => {
  try {
    const codes = req.query.codes as string;
    if (!codes) {
      return res.status(400).json({ error: "No codes provided" });
    }

    const codeArray = codes.split(',');
    
    // Chunk the requests to avoid URL length limits (Tencent API usually handles ~50-100 per request)
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < codeArray.length; i += chunkSize) {
      chunks.push(codeArray.slice(i, i + chunkSize));
    }

    const allResults = [];

    for (const chunk of chunks) {
      const queryStr = chunk.map(getPrefix).join(',');
      const response = await axios.get(`http://qt.gtimg.cn/q=${queryStr}`, {
        responseType: 'arraybuffer'
      });

      const data = iconv.decode(response.data, 'gbk');
      
      // Parse the response
      const lines = data.split('\n').filter(line => line.trim() !== '');
      const result = lines.map(line => {
        // Example line: v_sh600519="1~贵州茅台~600519~1545.00~1540.00~1542.00~...
        const match = line.match(/v_(.*?)="(.*?)";/);
        if (!match) return null;
        
        const parts = match[2].split('~');
        if (parts.length < 40) return null;

        return {
          id: parts[2], // code
          symbol: parts[2],
          name: parts[1],
          price: parseFloat(parts[3]) || 0,
          previousClose: parseFloat(parts[4]) || 0,
          open: parseFloat(parts[5]) || 0,
          volume: (parseFloat(parts[36]) || 0) * 100, // Volume in shares
          marketCap: parts[45] ? parts[45] + '亿' : '0亿', // Market cap
          changePercent: parseFloat(parts[32]) || 0, // Change percent
        };
      }).filter(Boolean);
      
      allResults.push(...result);
    }

    res.json(allResults);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.get("/api/stock/analysis/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = stockCache.find(s => s.symbol === symbol);
    
    if (!stock) {
      return res.status(404).json({ error: "Stock not found in cache. Try again later." });
    }
    
    const analysis = await analyzeStockWithGemini(stock);
    res.json(analysis);
  } catch (error) {
    console.error("Error analyzing stock:", error);
    res.status(500).json({ error: "Failed to analyze stock" });
  }
});

app.get("/api/stock/news/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = stockCache.find(s => s.symbol === symbol);
    
    if (!stock) {
      const stockInfo = REAL_A_SHARES.find(s => s.code === symbol);
      if (!stockInfo) {
        return res.status(404).json({ error: "Stock not found" });
      }
      stock = {
        id: symbol,
        symbol: symbol,
        name: stockInfo.name,
        sector: stockInfo.sector
      } as StockData;
    }
    
    const news = await fetchStockNews(stock);
    res.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.get("/api/stock/tech/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const stock = stockCache.find(s => s.symbol === symbol);
    
    if (!stock) {
      return res.status(404).json({ error: "Stock not found in cache. Try again later." });
    }
    
    res.json({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      changePercent: stock.changePercent,
      volume: stock.volume,
      rsi: stock.rsi,
      macd: stock.macd,
      ma20: stock.ma20,
      ma50: stock.ma50,
      ma200: stock.ma200,
      ema20: stock.ema20,
      ema50: stock.ema50,
      trend: stock.trend,
      signal: stock.signal,
      history: stock.history,
      historicalData: stock.historicalData
    });
  } catch (error) {
    console.error("Error getting technical data:", error);
    res.status(500).json({ error: "Failed to get technical data" });
  }
});

async function startServer() {
  // Initialize stock cache in the background
  initializeStockCache().catch(console.error);

  // Vite middleware for development - use appType: 'custom' to have more control
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    
    // Use Vite's connect instance as middleware
    // Important: We need to let API routes pass through before Vite handles them
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
