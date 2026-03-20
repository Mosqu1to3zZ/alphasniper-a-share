#!/usr/bin/env python3
"""
A-Share AI Analysis Script (using Gemini)
Usage: python3 scripts/ai_analyze.py <stock_symbol>
Example: python3 scripts/ai_analyze.py 600519
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

def get_stock_tech_data(symbol):
    """Fetch stock technical data"""
    if not is_server_running():
        if not start_server():
            return None
    
    try:
        import requests
        response = requests.get(f"http://localhost:3000/api/stock/tech/{symbol}", timeout=10)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def get_ai_analysis(symbol):
    """Get AI-powered analysis from local server"""
    if not is_server_running():
        if not start_server():
            return None
    
    try:
        import requests
        response = requests.get(f"http://localhost:3000/api/stock/analysis/{symbol}", timeout=30)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

def analyze(symbol):
    """Get AI analysis for a stock"""
    tech_data = get_stock_tech_data(symbol)
    
    if not tech_data:
        return {
            "error": "Failed to fetch stock data. Make sure npm is installed.",
            "hint": "The server will be auto-started on first run"
        }
    
    name = tech_data.get("name", symbol)
    ai_result = get_ai_analysis(symbol)
    
    if ai_result and "error" not in ai_result:
        return {
            "stock": f"{name} ({symbol})",
            "recommendation": ai_result.get("recommendation", "WATCH"),
            "confidence": ai_result.get("confidence", 0),
            "reasoning": ai_result.get("reasoning", []),
            "riskLevel": ai_result.get("riskLevel", "MEDIUM")
        }
    else:
        return {
            "stock": f"{name} ({symbol})",
            "recommendation": "WATCH",
            "confidence": 50,
            "reasoning": [
                "AI service unavailable - showing demo mode analysis",
                f"RSI: {tech_data.get('rsi', 'N/A')}",
                f"Trend: {tech_data.get('trend', 'N/A')}"
            ],
            "riskLevel": "MEDIUM",
            "note": "Configure GEMINI_API_KEY for full AI analysis"
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/ai_analyze.py <stock_symbol>")
        print("Example: python3 scripts/ai_analyze.py 600519")
        sys.exit(1)
    
    symbol = sys.argv[1]
    result = analyze(symbol)
    print(json.dumps(result, ensure_ascii=False, indent=2))
