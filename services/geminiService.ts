import { GoogleGenAI, Type } from "@google/genai";
import { StockData, AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeStockWithGemini = async (stock: StockData): Promise<AIAnalysisResult | string> => {
  if (!process.env.API_KEY) {
    // Return a mock structured response for demo mode
    return {
      recommendation: 'WATCH',
      confidence: 65,
      reasoning: [
        `Demo Mode: API Key missing. Showing simulated analysis.`,
        `RSI is at ${stock.rsi}, suggesting ${stock.rsi > 70 ? 'overbought' : stock.rsi < 30 ? 'oversold' : 'neutral'} conditions.`,
        `Trend is currently ${stock.trend}.`
      ],
      riskLevel: 'MEDIUM'
    };
  }

  const historicalDataStr = stock.historicalData 
    ? stock.historicalData.slice(-5).map(d => `Date: ${d.date}, Price: ${d.price}, RSI: ${d.rsi}, MACD: ${d.macd}`).join('\n    ')
    : 'No historical data available.';

  const prompt = `
    Analyze the following A-Share stock for a sniper trade setup.
    Stock: ${stock.name} (${stock.symbol})
    Current Price: ${stock.price}
    Change: ${stock.changePercent}%
    Current RSI: ${stock.rsi}
    EMA20: ${stock.ema20}
    Trend: ${stock.trend}
    Signal: ${stock.signal}

    Recent Historical Data (Last 5 days):
    ${historicalDataStr}

    Based on this data, provide a trade recommendation. Consider the trend, RSI levels, MACD momentum, and recent price action.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendation: { type: Type.STRING, enum: ['BUY', 'SELL', 'WATCH'] },
            confidence: { type: Type.INTEGER, description: "0-100 score of trade quality" },
            reasoning: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 bullet points explaining the technicals" 
            },
            riskLevel: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] }
          },
          required: ['recommendation', 'confidence', 'reasoning', 'riskLevel']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "System Error: Unable to perform AI analysis.";
  }
};
