import requests
import pandas as pd
from config import ALPACA_API_KEY, ALPACA_API_SECRET
from datetime import datetime, timedelta


def fetch_historical_data(ticker, days=14):
    """
    Fetch historical price data for the past N days.
    """
    base_url = "https://data.alpaca.markets/v2"
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    endpoint = f"{base_url}/stocks/{ticker}/bars"
    params = {
        "start": start_date.isoformat(),
        "end": end_date.isoformat(),
        "timeframe": "1Day",
    }
    headers = {
        "ALPACA-API-KEY-ID": ALPACA_API_KEY,
        "ALPACA-API-SECRET-KEY": ALPACA_API_SECRET,
    }

    response = requests.get(endpoint, headers=headers, params=params)
    response.raise_for_status()
    data = response.json()
    # Convert to a DataFrame
    df = pd.DataFrame(data["bars"])
    df["timestamp"] = pd.to_datetime(df["t"])
    df.set_index("timestamp", inplace=True)
    return df


def get_stock_quotes(ticker):
    """
    Fetch the current bid and ask prices.
    """
    base_url = "https://data.alpaca.markets/v2"
    endpoint = f"{base_url}/stocks/{ticker}/quotes/latest"
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
    }

    response = requests.get(endpoint, headers=headers)
    response.raise_for_status()
    data = response.json()

    return {
        "bid_price": data["quote"]["bp"],
        "bid_size": data["quote"]["bs"],
        "ask_price": data["quote"]["ap"],
        "ask_size": data["quote"]["as"],
    }


def calculate_optimal_buy(ticker, days=14):
    """
    Calculate an optimal buy price based on current ask and historical data.
    """
    # Fetch current quotes
    quotes = get_stock_quotes(ticker)
    if not quotes:
        return None

    current_ask = quotes["ask_price"]

    # Fetch historical data
    historical_data = fetch_historical_data(ticker, days=days)

    # Calculate historical metrics
    p10 = historical_data["c"].quantile(0.10)  # 10th percentile
    p25 = historical_data["c"].quantile(0.25)  # 25th percentile
    p50 = historical_data["c"].quantile(0.50)  # Median (50th percentile)
    rolling_low = historical_data["c"].rolling(window=days).min().iloc[-1]
    rolling_high = historical_data["c"].rolling(window=days).max().iloc[-1]
    rolling_median = historical_data["c"].rolling(window=days).median()
    rolling_median = rolling_median.iloc[-1]
    recent_volatility = historical_data["c"].rolling(window=5).std().iloc[-1]

    # Determine optimal buy price
    # Dynamic buffer
    buffer = 0.5 * recent_volatility if recent_volatility else 0
    optimal_buy_price = max(p10, current_ask - buffer)

    return {
        "current_ask": current_ask,
        "optimal_buy_price": optimal_buy_price,
        "historical_metrics": {
            "10th_percentile": p10,
            "25th_percentile": p25,
            "50th_percentile": p50,
            "rolling_low": rolling_low,
            "rolling_high": rolling_high,
            "rolling_median": rolling_median,
        },
    }
