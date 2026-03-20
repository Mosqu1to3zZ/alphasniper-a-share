---
name: "ashare-alerts"
description: "Manages stock price alerts and notifications. Invoke when user wants to set price alerts, check active alerts, or configure notification triggers for A-share stocks."
---

# A-Share Stock Alerts

This skill manages price alerts and notifications for A-share stocks.

## When to Use This Skill

Invoke this skill when:
- User wants to set price alerts
- User asks to check active alerts
- User wants to configure alert triggers
- User asks to delete or modify alerts
- User asks for notification settings

## Current Implementation

**Note: This feature is primarily UI-based in the AlphaSniper terminal.**

Users can set alerts through the web interface:
- Click on a stock in the terminal
- Set price alert conditions
- Receive toast notifications when triggered

## Alert Data Structure

### Alert Fields
- **id**: Unique alert identifier
- **stockName**: Company name
- **stockSymbol**: Stock symbol
- **trigger**: Alert trigger condition
- **timestamp**: When alert was created

## Alert Trigger Types

Price-based triggers:
- Price above/below threshold
- RSI overbought/oversold
- Price breakout detection
- Volume spike alerts
- MACD crossover

## Future API Endpoints (Planned)

```
GET  /api/alerts              - Get all active alerts
POST /api/alerts              - Create a new alert
DELETE /api/alerts/:id        - Delete an alert
```

## Usage Examples

### Setting an Alert (UI)
Currently, alerts can be set through the AlphaSniper web interface:
1. Open the stock terminal
2. Click on a stock
3. Configure alert conditions
4. Save the alert

### Alert Usage in Analysis
When providing stock analysis:
1. Consider setting price alerts for entry/exit points
2. Set RSI-based alerts for overbought/oversold conditions
3. Use MACD crossover alerts for trend changes

## Integration with AlphaSniper

In the AlphaSniper terminal:
- `AlertToast.tsx`: Toast notifications for alerts
- Alerts triggered in real-time during stock monitoring
- Visual and audio notifications

## Response Format

Present alerts in structured format:
```
🔔 Active Alerts
================
[Stock Name] ([Symbol])
Trigger: [Trigger Condition]
Created: [Timestamp]
---
```

## Notes

- Alerts are stored in application state
- Alerts trigger toast notifications in UI
- For persistent alerts, integrate with backend
- Combine with technical analysis (`ashare-stock-analysis`) for better alert timing
- Use AI analysis (`ashare-ai-analysis`) for smart alert recommendations
