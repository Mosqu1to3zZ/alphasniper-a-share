---
name: "ashare-stock-analysis"
description: "Analyzes A-share stocks using technical indicators (RSI, MACD, MA, EMA). Invoke when user asks to analyze stock technicals, screen for buy signals, or evaluate stock momentum."
---

# A-Share Stock Technical Analysis

This skill provides comprehensive technical analysis for A-share (Chinese A-stock) market analysis.

## When to Use This Skill

Invoke this skill when:
- User asks to analyze a stock's technical indicators
- User wants to screen stocks for buy/sell signals
- User asks about stock momentum or trend
- User wants to evaluate RSI, MACD, MA, EMA levels
- User asks about stock breakout or reversal signals

## Execution

**This skill uses a Python script to fetch and analyze stock data.**

### Command

```bash
python3 workspace/skills/ashare-stock-analysis/scripts/analyze.py <stock_symbol>
```

### Example

```bash
python3 workspace/skills/ashare-stock-analysis/scripts/analyze.py 600519
```

### Output

The script returns JSON with:
- stock: Stock name and symbol
- price: Current price and change
- rsi: RSI value and status (Overbought/Oversold/Neutral)
- macd: MACD histogram and signal
- trend: UP/DOWN/SIDEWAYS
- signal: BREAKOUT/REVERSAL/MOMENTUM/OVERSOLD/NONE
- analysis: Text summary

## Technical Indicators

### RSI (Relative Strength Index)
- **14-day RSI** is used
- Overbought: RSI > 70
- Oversold: RSI < 30
- Neutral: 30-70

### MACD (Moving Average Convergence Divergence)
- Diff (MACD Line): Short EMA - Long EMA
- DEA (Signal Line): EMA of Diff
- Histogram: Diff - DEA

### Moving Averages
- MA20: 20-day Simple Moving Average
- MA50: 50-day Simple Moving Average
- MA200: 200-day Simple Moving Average
- EMA20: 20-day Exponential Moving Average
- EMA50: 50-day Exponential Moving Average

### Trend Signals
- **UPTREND**: Price above MA20, MA20 > MA50
- **DOWNTREND**: Price below MA20, MA20 < MA50
- **SIDEWAYS**: Price near MA20, no clear direction

### Signal Types
- **BREAKOUT**: Price breaking key resistance
- **REVERSAL**: Price showing reversal signals
- **MOMENTUM**: Strong momentum in current direction
- **OVERSOLD**: RSI below 30, potential bounce
- **NONE**: No clear signal

## Requirements

1. The AlphaSniper server must be running (`npm run server`)
2. Python 3 with requests library (optional, falls back to curl)

## Notes

- This skill focuses on technical analysis only
- For AI-powered analysis, use the `ashare-ai-analysis` skill
- For news, use the `ashare-news` skill
