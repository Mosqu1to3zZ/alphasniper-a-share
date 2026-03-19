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

## Technical Indicators Available

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

## Usage Examples

### Analyzing a Stock
When user provides a stock symbol (e.g., 600519), analyze:
1. Current price and daily change
2. RSI level and interpretation
3. MACD histogram and signal
4. Price relative to MAs (MA20, MA50, MA200)
5. Current trend and signal type
6. Risk assessment

### Screening Criteria
For stock screening, apply filters:
- RSI range (min/max)
- Minimum volume
- Signal types (BREAKOUT, REVERSAL, etc.)
- Only uptrend stocks
- Price above EMA20

## Response Format

Provide analysis in a structured format:
```
Stock: [Name] ([Symbol])
Price: [Price] ([Change]%)
RSI: [Value] - [Overbought/Oversold/Neutral]
MACD: [Histogram value] - [Signal interpretation]
Trend: [UP/DOWN/SIDEWAYS]
Signal: [BREAKOUT/REVERSAL/MOMENTUM/OVERSOLD/NONE]
MA Analysis: [Price relative to MAs]
Risk Level: [HIGH/MEDIUM/LOW]
```

## Notes

- This skill focuses on technical analysis only
- For AI-powered fundamental analysis, use the `ashare-ai-analysis` skill
- This skill is part of the AlphaSniper A-Share trading terminal
