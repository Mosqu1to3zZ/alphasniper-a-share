#!/usr/bin/env python3
"""
A-Share Stock Technical Analysis Script
Usage: python3 scripts/analyze.py <stock_symbol>
Example: python3 scripts/analyze.py 600519
"""

import sys
import os
import json
import subprocess
import time
import signal

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SERVER_PROCESS = None

def is_server_running():
    """Check if the AlphaSniper server is running"""
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
    global SERVER_PROCESS
    
    print("Starting AlphaSniper server...", file=sys.stderr)
    
    # Start server in background
    SERVER_PROCESS = subprocess.Popen(
        ["npm", "run", "server"],
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid
    )
    
    # Wait for server to be ready
    if wait_for_server():
        print("Server is ready!", file=sys.stderr)
        return True
    else:
        print("Failed to start server", file=sys.stderr)
        return False

def get_stock_data(symbol):
    """Fetch stock data from local AlphaSniper server"""
    
    # Ensure server is running
    if not is_server_running():
        if not start_server():
            return {"error": "Failed to start AlphaSniper server"}
    
    try:
        import requests
        response = requests.get(f"http://localhost:3000/api/stock/tech/{symbol}", timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"Failed to fetch data: {response.status_code}"}
    except ImportError:
        # Fallback to curl
        result = subprocess.run(
            ["curl", "-s", f"http://localhost:3000/api/stock/tech/{symbol}"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            try:
                return json.loads(result.stdout)
            except:
                return {"error": "Failed to parse response"}
        else:
            return {"error": "Failed to fetch data"}
    except Exception as e:
        return {"error": str(e)}

def analyze_stock(symbol):
    """Analyze stock and return technical analysis"""
    data = get_stock_data(symbol)
    
    if "error" in data:
        return data
    
    # Extract key indicators
    price = data.get("price", 0)
    change = data.get("changePercent", 0)
    rsi = data.get("rsi", 0)
    macd = data.get("macd", {})
    trend = data.get("trend", "UNKNOWN")
    signal = data.get("signal", "NONE")
    name = data.get("name", symbol)
    
    # Determine RSI status
    if rsi > 70:
        rsi_status = "Overbought"
    elif rsi < 30:
        rsi_status = "Oversold"
    else:
        rsi_status = "Neutral"
    
    # Determine MACD signal
    histogram = macd.get("histogram", 0)
    if histogram > 0:
        macd_signal = "Golden Cross (Bullish)"
    elif histogram < 0:
        macd_signal = "Death Cross (Bearish)"
    else:
        macd_signal = "Neutral"
    
    # Build analysis result
    result = {
        "stock": f"{name} ({symbol})",
        "price": f"¥{price} ({change:+.2f}%)",
        "rsi": f"{rsi} - {rsi_status}",
        "macd": f"Histogram: {histogram} - {macd_signal}",
        "trend": trend,
        "signal": signal,
        "analysis": f"Current trend is {trend} with {signal} signal. RSI is at {rsi} ({rsi_status})."
    }
    
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/analyze.py <stock_symbol>")
        print("Example: python3 scripts/analyze.py 600519")
        sys.exit(1)
    
    symbol = sys.argv[1]
    result = analyze_stock(symbol)
    print(json.dumps(result, ensure_ascii=False, indent=2))
