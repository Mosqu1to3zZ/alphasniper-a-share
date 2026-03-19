---
name: "ashare-news"
description: "Fetches and analyzes A-share stock news and market sentiment. Invoke when user asks for stock news, latest market news, or wants to know news sentiment."
---

# A-Share Stock News

This skill provides news fetching and sentiment analysis for A-share stocks.

## When to Use This Skill

Invoke this skill when:
- User asks for stock news or latest market news
- User wants to know news sentiment (positive/negative/neutral)
- User asks for news from specific sources
- User wants to correlate news with stock movement
- User asks for breaking news or market updates

## News Data Structure

### NewsItem Fields
- **id**: Unique news identifier
- **title**: News headline
- **source**: News source (Bloomberg, Reuters, Sina Finance, etc.)
- **time**: Time published (e.g., "2h ago")
- **sentiment**: POSITIVE | NEGATIVE | NEUTRAL
- **url**: Link to full article

### Sentiment Analysis

- **POSITIVE**: Bullish news, upgrades, positive developments
- **NEGATIVE**: Bearish news, downgrades, risks
- **NEUTRAL**: General news, announcements

## Available News Sources

Simulated sources include:
- Bloomberg
- Reuters
- Sina Finance (新浪财经)
- East Money (东方财富)
- Caixin (财新)
- Wall Street CN (华尔街见闻)

## Usage Examples

### Fetching Stock News
When user asks for news about a specific stock:
1. Accept stock symbol/name as input
2. Fetch relevant news items
3. Include sentiment for each item
4. Present in chronological order

### Market News Overview
When user asks for general market news:
1. Fetch sector-wide news
2. Group by sentiment
3. Highlight key developments

### News Impact Assessment
When user wants to understand news impact:
1. Fetch recent news for a stock
2. Analyze sentiment distribution
3. Correlate with price movement

## Integration with AlphaSniper

In the AlphaSniper terminal:
- News is displayed in `AnalysisModal.tsx`
- Shows when user clicks on a stock for detailed analysis
- Correlates with AI analysis for comprehensive view

## News Templates (Simulated)

Sample news templates used:
- Quarterly earnings beats expectations
- Analyst upgrades/downgrades
- Sector regulatory news
- Strategic partnerships
- Market volatility impact
- New product launches
- Insider trading reports
- Supply chain developments

## Response Format

Present news in structured format:
```
📰 [News Title]
Source: [Source] | Time: [Time]
Sentiment: [POSITIVE/NEGATIVE/NEUTRAL]
---
```

## Notes

- News is simulated in demo mode
- For real news, integrate with news APIs
- Combine news analysis with technical analysis
- News sentiment is one factor in stock evaluation
- Use `ashare-ai-analysis` for comprehensive analysis including news impact
