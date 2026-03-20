#!/usr/bin/env python3
"""
A-Share Stock News Script
Usage: python3 scripts/news.py <stock_symbol>
Example: python3 scripts/news.py 600519
"""

import sys
import os
import json
import subprocess
import time

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def is_server_running():
    """Check if server is running"""
    try:
        import requests
        response = requests.get("http://localhost:3000/api/health", timeout=2)
        return response.status_code == 200
    except:
        return False

def wait_for_server(timeout=60):
    """Wait for server to be ready"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if is_server_running():
            return True
        time.sleep(2)
    return False

def start_server():
    """Start the AlphaSniper server"""
    print("Starting AlphaSniper server...", file=sys.stderr)
    subprocess.Popen(
        ["npm", "run", "server"],
        cwd=PROJECT_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setsid
    )
    if wait_for_server():
        print("Server is ready!", file=sys.stderr)
        return True
    return False

def get_news(symbol):
    """Fetch stock news"""
    if not is_server_running():
        if not start_server():
            return None
    
    try:
        import requests
        response = requests.get(f"http://localhost:3000/api/stock/news/{symbol}", timeout=10)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def fetch_news(symbol):
    """Fetch and display news for a stock"""
    news = get_news(symbol)
    
    if news is None:
        return {
            "error": "Failed to fetch news",
            "hint": "Server will be auto-started"
        }
    
    positive = sum(1 for n in news if n.get("sentiment") == "POSITIVE")
    negative = sum(1 for n in news if n.get("sentiment") == "NEGATIVE")
    neutral = sum(1 for n in news if n.get("sentiment") == "NEUTRAL")
    
    return {
        "symbol": symbol,
        "news": news,
        "summary": {
            "positive": positive,
            "negative": negative,
            "neutral": neutral
        }
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/news.py <stock_symbol>")
        print("Example: python3 scripts/news.py 600519")
        sys.exit(1)
    
    symbol = sys.argv[1]
    result = fetch_news(symbol)
    print(json.dumps(result, ensure_ascii=False, indent=2))
