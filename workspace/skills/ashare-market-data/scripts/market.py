#!/usr/bin/env python3
"""
A-Share Market Data Script
Usage: python3 scripts/market.py [stock_symbols]
Example: python3 scripts/market.py 600519,000001
       python3 scripts/market.py  # all stocks
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

def get_all_stocks():
    """Get all stocks with technical data"""
    if not is_server_running():
        if not start_server():
            return None
    
    try:
        import requests
        response = requests.get("http://localhost:3000/api/stocks/init", timeout=30)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def get_stocks(codes):
    """Get specific stocks"""
    if not is_server_running():
        if not start_server():
            return None
    
    try:
        import requests
        response = requests.get(f"http://localhost:3000/api/stocks?codes={codes}", timeout=10)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def fetch_market(symbols=None):
    """Fetch market data"""
    if symbols:
        stocks = get_stocks(symbols)
        if stocks:
            return {"type": "quote", "data": stocks}
    
    stocks = get_all_stocks()
    if stocks:
        return {"type": "full", "count": len(stocks), "data": stocks[:10]}
    
    return {"error": "Failed to fetch market data"}

if __name__ == "__main__":
    symbols = sys.argv[1] if len(sys.argv) > 1 else None
    result = fetch_market(symbols)
    print(json.dumps(result, ensure_ascii=False, indent=2))
