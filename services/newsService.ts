import { StockData, NewsItem } from '../types';

export const fetchStockNews = async (stock: StockData): Promise<NewsItem[]> => {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 600));

  const templates = [
    { text: `${stock.name} Quarterly Revenue Beats Market Expectations`, sentiment: 'POSITIVE' },
    { text: `Major Analysts Upgrade ${stock.name} to Overweight Rating`, sentiment: 'POSITIVE' },
    { text: `${stock.sector} Sector Faces Short-term Regulatory Headwinds`, sentiment: 'NEGATIVE' },
    { text: `New Strategic Partnership Announced by ${stock.name}`, sentiment: 'POSITIVE' },
    { text: `Global Market Volatility Impacts ${stock.name} Share Price`, sentiment: 'NEGATIVE' },
    { text: `${stock.name} to Hold Annual Shareholder Meeting Next Month`, sentiment: 'NEUTRAL' },
    { text: `Institutional Investors Increase Stake in ${stock.name} Significantly`, sentiment: 'POSITIVE' },
    { text: `Technical Analysis: ${stock.name} Approaches Key Resistance Level`, sentiment: 'NEUTRAL' },
    { text: `${stock.name} Launches New Product Line in Asian Markets`, sentiment: 'POSITIVE' },
    { text: `Insider Trading Report: Executives Buy Dip in ${stock.name}`, sentiment: 'POSITIVE' },
    { text: `Supply Chain Disruptions May Affect ${stock.name} Q3 Output`, sentiment: 'NEGATIVE' }
  ];

  // Randomly select 3-5 items to keep it dynamic
  const count = Math.floor(Math.random() * 3) + 3;
  // Simple shuffle
  const shuffled = templates.sort(() => 0.5 - Math.random());
  
  const sources = ['Bloomberg', 'Reuters', 'Sina Finance', 'East Money', 'Caixin', 'Wall Street CN'];

  return shuffled.slice(0, count).map((item, i) => ({
    id: `news-${stock.id}-${i}-${Date.now()}`,
    title: item.text,
    source: sources[Math.floor(Math.random() * sources.length)],
    time: `${Math.floor(Math.random() * 12) + 1}h ago`,
    sentiment: item.sentiment as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
    url: '#'
  }));
};