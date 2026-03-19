---
name: "ashare-market-data"
description: "Retrieves and displays A-share market data. Invoke when user asks for stock prices, market overview, sector data, or real-time quotes."
---

# A-Share Market Data

This skill provides comprehensive market data for A-share (Chinese A-stock) market.

## When to Use This Skill

Invoke this skill when:
- User asks for stock prices or quotes
- User wants market overview or sector data
- User asks for real-time or simulated market data
- User wants to compare multiple stocks
- User asks about market cap, volume, or sector information

## Available Data Fields

### Stock Information
- **Symbol**: Stock ticker (e.g., 600519, 000001)
- **Name**: Company name
- **Price**: Current stock price
- **Change Percent**: Daily price change percentage
- **Volume**: Trading volume
- **Market Cap**: Market capitalization
- **Sector**: Industry sector

### Technical Data
- RSI (14-day)
- MACD (diff, dea, histogram)
- MA20, MA50, MA200
- EMA20, EMA50

### Market Metrics
- Current trend (UP/DOWN/SIDEWAYS)
- Signal type (BREAKOUT, REVERSAL, MOMENTUM, OVERSOLD)

## Data Sources

The AlphaSniper terminal uses simulated data for demonstration:
- Simulated real-time quotes
- Generated technical indicators
- Realistic market scenarios

For production use, integrate with:
- Tencent Finance API
- Sina Finance API
- East Money API
- Bloomberg Terminal

## Usage Examples

### Getting Stock Quote
When user asks for a stock price:
1. Accept stock symbol as input
2. Return current price, change, volume
3. Include basic technical indicators

### Market Overview
When user asks for market overview:
1. Provide index-level data (if available)
2. Show sector performance
3. Highlight top gainers/losers

### Stock Comparison
When user wants to compare stocks:
1. Accept multiple stock symbols
2. Return side-by-side comparison
3. Include key metrics and indicators

## AlphaSniper Integration

In the AlphaSniper terminal:
- `StockTerminal.tsx`: Main stock listing component
- `MarketTicker.tsx`: Scrolling market ticker
- `ComparisonView.tsx`: Stock comparison view
- `SniperScope.tsx`: Advanced stock filtering

## Filtering and Screening

Use these filters for stock screening:
- RSI range (min/max)
- Minimum volume threshold
- Signal type filter
- Trend filter (uptrend only)
- Price relative to EMA20

## Response Format

Provide market data in clear format:
```
Stock: [Name] ([Symbol])
Price: ¥[Price] ([Change]%)
Volume: [Volume]
Market Cap: [Market Cap]
Sector: [Sector]
```

## Notes

- This skill provides data retrieval and display
- For analysis, use `ashare-stock-analysis` or `ashare-ai-analysis`
- Market data is simulated in demo mode
- Real API integration required for live data
