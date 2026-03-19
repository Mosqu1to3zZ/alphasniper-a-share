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

## Usage Examples

### Setting an Alert
When user wants to set a price alert:
1. Accept stock symbol and trigger condition
2. Create alert with unique ID
3. Store timestamp
4. Confirm alert creation

### Checking Alerts
When user asks for active alerts:
1. List all active alerts
2. Show trigger conditions
3. Show creation time

### Alert Management
- Delete specific alerts
- Clear all alerts
- Enable/disable alerts

## Integration with AlphaSniper

In the AlphaSniper terminal:
- `AlertToast.tsx`: Toast notifications for alerts
- Alerts triggered in real-time
- Visual and audio notifications

## Response Format

Present alerts in structured format:
```
Active Alerts:
----------------
[Stock Name] ([Symbol])
Trigger: [Trigger Condition]
Created: [Timestamp]
---
```

## Notes

- Alerts are stored in application state
- Alerts trigger toast notifications in UI
- For persistent alerts, integrate with backend
- Combine with technical analysis for better alert timing
