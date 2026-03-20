---
name: "ashare-ai-analysis"
description: "AI-powered stock analysis using Gemini. Invoke when user asks for AI analysis, wants trade recommendations, or needs risk assessment."
---

# A-Share AI Stock Analysis

This skill provides AI-powered analysis for A-share stocks using Gemini AI.

## When to Use This Skill

Invoke this skill when:
- User asks for AI-powered stock analysis
- User wants a buy/sell/watch recommendation
- User needs confidence score for a trade
- User asks for risk assessment
- User asks "should I buy this stock" or similar

## Execution

**This skill uses a Python script to get AI-powered analysis.**

### Command

```bash
python3 workspace/skills/ashare-ai-analysis/scripts/ai_analyze.py <stock_symbol>
```

### Example

```bash
python3 workspace/skills/ashare-ai-analysis/scripts/ai_analyze.py 600519
```

### Output

The script returns JSON with:
- stock: Stock name and symbol
- recommendation: BUY/SELL/WATCH
- confidence: 0-100
- reasoning: Array of reasons
- riskLevel: HIGH/MEDIUM/LOW
- note: Additional information

## Recommendation Types

- **BUY**: Strong buy signal, favorable risk-reward
- **SELL**: Consider exiting or shorting
- **WATCH**: Monitor for better entry point

## Confidence Score

- 80-100: High confidence, strong signal
- 60-79: Medium-high confidence
- 40-59: Medium confidence
- 0-39: Low confidence, avoid

## Requirements

1. The AlphaSniper server must be running (`npm run server`)
2. Set GEMINI_API_KEY in .env.local for full AI functionality
3. Without API key, returns demo mode analysis

## Notes

- Requires GEMINI_API_KEY for full functionality
- For pure technical analysis, use `ashare-stock-analysis` skill
- For news, use `ashare-news` skill
