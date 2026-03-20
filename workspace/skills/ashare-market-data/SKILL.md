---
name: "ashare-market-data"
description: "Retrieves A-share market data, stock prices and quotes. Invoke when user asks for stock prices, market overview, or real-time quotes."
---

# A-Share Market Data

This skill provides comprehensive market data for A-share (Chinese A-stock) market.

## When to Use This Skill

Invoke this skill when:
- User asks for stock prices or quotes
- User wants market overview or sector data
- User asks for real-time or simulated market data
- User wants to compare multiple stocks

## Execution

**This skill uses a Python script to fetch market data.**

### Command

```bash
python3 workspace/skills/ashare-market-data/scripts/market.py [stock_symbols]
```

### Examples

```bash
# Get all stocks (first 10)
python3 workspace/skills/ashare-market-data/scripts/market.py

# Get specific stocks
python3 workspace/skills/ashare-market-data/scripts/market.py 600519,000001
```

### Output

The script returns JSON with:
- type: "quote" or "full"
- data: Array of stock data
- count: Number of stocks

## Available Data

### Stock Information
- symbol: Stock ticker (e.g., 600519)
- name: Company name
- price: Current stock price
- changePercent: Daily change percentage
- volume: Trading volume
- marketCap: Market capitalization
- sector: Industry sector

### Technical Data
- rsi: 14-day RSI
- macd: MACD (diff, dea, histogram)
- ma20, ma50, ma200
- ema20, ema50
- trend: UP/DOWN/SIDEWAYS
- signal: BREAKOUT/REVERSAL/MOMENTUM/OVERSOLD

## Requirements

1. The AlphaSniper server must be running (`npm run server`)
2. Python 3 with requests library (optional, falls back to curl)

## Notes

- For detailed analysis, use `ashare-stock-analysis` skill
- For AI analysis, use `ashare-ai-analysis` skill
- For news, use `ashare-news` skill
