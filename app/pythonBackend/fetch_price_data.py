import requests
import pandas as pd
from config import ALPACA_API_KEY, ALPACA_API_SECRET
from datetime import datetime, timedelta


def fetch_hourly_data(ticker, start_date, end_date):
    """
    Fetch hourly price data for a specific date range.
    """
    base_url = "https://data.alpaca.markets/v2"
    endpoint = f"{base_url}/stocks/{ticker}/bars"
    params = {
        "start": start_date.isoformat(),
        "end": end_date.isoformat(),
        "timeframe": "1Hour",  # Hourly data
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


def fetch_today_and_yesterday_hourly(ticker):
    """
    Fetch hourly data for today and yesterday.
    """
    now = datetime.now()
    today_start = datetime(now.year, now.month, now.day)
    yesterday_start = today_start - timedelta(days=1)
    yesterday_end = today_start - timedelta(seconds=1)

    # Fetch hourly data for today and yesterday
    today_data = fetch_hourly_data(ticker, start_date=today_start, end_date=now)
    yesterday_data = fetch_hourly_data(
        ticker,
        start_date=yesterday_start,
        end_date=yesterday_end
    )

    return {"today": today_data, "yesterday": yesterday_data}
