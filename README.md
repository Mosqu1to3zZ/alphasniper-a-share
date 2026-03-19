<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AlphaSniper A-Share

A high-precision, crypto-style terminal for sniping A-share stocks using technical indicators and AI analysis.

## OpenClaw Integration

This repository includes **5 skills** that OpenClaw can automatically discover and install:

### Available Skills

| Skill | Description |
|-------|-------------|
| `ashare-stock-analysis` | Technical analysis using RSI, MACD, MA, EMA indicators |
| `ashare-ai-analysis` | AI-powered stock analysis using Gemini |
| `ashare-market-data` | Market data, stock prices and quotes |
| `ashare-news` | Stock news and sentiment analysis |
| `ashare-alerts` | Price alerts and notifications management |

### Auto-Installation

OpenClaw will automatically detect skills from this repository by reading the `moltbot.json` file. When you provide the repository URL to OpenClaw, it will:

1. Clone the repository
2. Read `moltbot.json` to find skill definitions
3. Automatically install all skills from `workspace/skills/` directory

### Skills Location

All skills are stored in `workspace/skills/`:
```
workspace/skills/
├── ashare-stock-analysis/SKILL.md
├── ashare-ai-analysis/SKILL.md
├── ashare-market-data/SKILL.md
├── ashare-news/SKILL.md
└── ashare-alerts/SKILL.md
```

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
