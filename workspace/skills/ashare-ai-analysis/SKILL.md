---
name: "ashare-ai-analysis"
description: "Provides AI-powered stock analysis using Gemini. Invoke when user asks for AI analysis, wants trade recommendations, or needs risk assessment for A-share stocks."
---

# A-Share AI Stock Analysis

This skill provides AI-powered analysis for A-share stocks using Gemini AI to generate trading recommendations.

## When to Use This Skill

Invoke this skill when:
- User asks for AI-powered stock analysis
- User wants a buy/sell/watch recommendation
- User needs confidence score for a trade
- User asks for risk assessment
- User wants reasoning based on technicals + fundamentals
- User asks "should I buy this stock" or similar

## Analysis Components

### Input Data
Provide the following stock data for analysis:
- Stock symbol and name
- Current price and daily change percentage
- RSI (14-day)
- MACD (diff, dea, histogram)
- Moving averages (MA20, MA50, EMA20, EMA50, MA200)
- Current trend (UP/DOWN/SIDEWAYS)
- Signal type (BREAKOUT, REVERSAL, MOMENTUM, OVERSOLD)
- Historical data (last 5 days recommended)

### AI Output Format

The AI analysis returns:
```json
{
  "recommendation": "BUY" | "SELL" | "WATCH",
  "confidence": 0-100,
  "reasoning": ["reason1", "reason2", "reason3"],
  "riskLevel": "HIGH" | "MEDIUM" | "LOW"
}
```

## Recommendation Types

- **BUY**: Strong buy signal, favorable risk-reward
- **SELL**: Consider exiting or shorting
- **WATCH**: Monitor for better entry point or more confirmation

## Confidence Score

- 80-100: High confidence, strong signal
- 60-79: Medium-high confidence
- 40-59: Medium confidence, require more analysis
- 0-39: Low confidence, avoid

## Risk Levels

- **HIGH**: Volatile, uncertain, or unfavorable conditions
- **MEDIUM**: Moderate risk, careful position sizing recommended
- **LOW**: Stable setup with good risk-reward ratio

## Usage Examples

### Basic AI Analysis
When user asks for AI analysis of a stock:
1. Collect technical indicator data
2. Format prompt with stock data
3. Call Gemini API with structured response schema
4. Parse and present results

### Prompt Template
```
Analyze the following A-Share stock for a sniper trade setup.
Stock: {name} ({symbol})
Current Price: {price}
Change: {changePercent}%
Current RSI: {rsi}
EMA20: {ema20}
Trend: {trend}
Signal: {signal}

Recent Historical Data (Last 5 days):
{historicalData}

Based on this data, provide a trade recommendation. Consider the trend, RSI levels, MACD momentum, and recent price action.
```

## Integration with AlphaSniper

This skill is integrated with the AlphaSniper A-Share terminal:
- Uses `geminiService.ts` for API calls
- Supports demo mode when API key is missing
- Returns structured JSON for programmatic use

## Notes

- Requires GEMINI_API_KEY for full functionality
- In demo mode, returns simulated analysis
- For pure technical analysis without AI, use `ashare-stock-analysis` skill
- Always combine AI analysis with personal research
