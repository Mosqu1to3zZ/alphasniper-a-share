---
name: "ashare-news"
description: "Fetches A-share stock news and sentiment analysis. Invoke when user asks for stock news, latest market news, or wants to know news sentiment."
---

# A-Share Stock News

This skill provides news fetching and sentiment analysis for A-share stocks.

## When to Use This Skill

Invoke this skill when:
- User asks for stock news or latest market news
- User wants to know news sentiment
- User asks for news from specific sources
- User wants to correlate news with stock movement

## Execution

**This skill uses a Python script to fetch stock news.**

### Command

```bash
python3 workspace/skills/ashare-news/scripts/news.py <stock_symbol>
```

### Example

```bash
python3 workspace/skills/ashare-news/scripts/news.py 600519
```

### Output

The script returns JSON with:
- symbol: Stock symbol
- news: Array of news items (title, source, time, sentiment)
- summary: Count of positive/negative/neutral news

## News Data

Each news item includes:
- title: News headline
- source: News source (Bloomberg, Reuters, Sina Finance, etc.)
- time: Time published
- sentiment: POSITIVE/NEGATIVE/NEUTRAL

## Sentiment Analysis

- **POSITIVE**: Bullish news, upgrades, positive developments
- **NEGATIVE**: Bearish news, downgrades, risks
- **NEUTRAL**: General news, announcements

## Requirements

1. The AlphaSniper server must be running (`npm run server`)
2. Python 3 with requests library (optional, falls back to curl)

## Notes

- News is simulated in demo mode
- Combine with technical analysis (`ashare-stock-analysis`)
- Use AI analysis (`ashare-ai-analysis`) for comprehensive view
