import requests
import pandas as pd
from config import APCA_API_KEY, APCA_API_SECRET
from datetime import datetime, timedelta, timezone


def format_datetime(dt):
    """
    Format a datetime object to 'YYYY-MM-DDTHH:MM:SSZ'.
    """
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_historical_data(ticker, days=14):
    """
    Fetch historical price data for the past N days.
    """
    end_date = datetime.now(timezone.utc) - timedelta(minutes=16)
    start_date = (end_date - timedelta(days=days)).replace(tzinfo=timezone.utc)

    base_url = "https://data.alpaca.markets/v2/stocks/bars"
    start_str = format_datetime(start_date)
    end_str = format_datetime(end_date)

    # Manually construct the URL query string
    query_string = f"?symbols={ticker}&timeframe=1Day&start={start_str}&end={end_str}&feed=iex"
    url = base_url + query_string

    headers = {
        "accept": "application/json",
        "APCA-API-KEY-ID": APCA_API_KEY,
        "APCA-API-SECRET-KEY": APCA_API_SECRET,
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    # Convert to a DataFrame
    df = pd.DataFrame(data["bars"][ticker])
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
        "accept": "application/json",
        "APCA-API-KEY-ID": APCA_API_KEY,
        "APCA-API-SECRET-KEY": APCA_API_SECRET,
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
