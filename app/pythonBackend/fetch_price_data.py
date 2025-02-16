import requests
import pandas as pd
from config import APCA_API_KEY, APCA_API_SECRET
from datetime import datetime, timedelta, timezone


def format_datetime(dt):
    """
    Format a datetime object to 'YYYY-MM-DDTHH:MM:SSZ'.
    """
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_hourly_data(ticker, start_date, end_date):
    """
    Fetch hourly price data for a specific date range.
    """
    start_date = start_date.replace(tzinfo=timezone.utc)
    end_date = end_date.replace(tzinfo=timezone.utc)

    end_date = min(end_date - timedelta(minutes=16), datetime.now(timezone.utc) - timedelta(minutes=16))

    base_url = "https://data.alpaca.markets/v2/stocks/bars"
    start_str = format_datetime(start_date)
    end_str = format_datetime(end_date)

    # Manually construct the URL to avoid URL encoding issues
    query_string = f"?symbols={ticker}&timeframe=1Hour&start={start_str}&end={end_str}&feed=iex"
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


def fetch_today_and_yesterday_hourly(ticker):
    """
    Fetch hourly data for today and yesterday.
    """
    now = datetime.now(timezone.utc) - timedelta(minutes=16)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
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
