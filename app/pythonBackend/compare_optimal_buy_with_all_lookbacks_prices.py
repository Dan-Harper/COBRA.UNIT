from datetime import datetime, timedelta
from calculate_likelihoods_prices import calculate_likelihoods
from fetch_historical_data_prices import fetch_historical_data
from fetch_price_data import fetch_hourly_data, fetch_today_and_yesterday_hourly


def calculate_optimal_buy_with_short_lookbacks(ticker, days):
    """
    Calculate optimal buy prices with hourly data for today, yesterday, and longer lookbacks.
    """
    # Fetch daily historical data
    historical_data = fetch_historical_data(ticker, days=days)

    # Fetch hourly data for today and yesterday
    hourly_short_data = fetch_today_and_yesterday_hourly(ticker)

    # Fetch hourly data for longer lookbacks
    hourly_long_data = fetch_hourly_data(ticker, start_date=datetime.now() - timedelta(days=days), end_date=datetime.now())

    # Calculate daily percentiles
    p10 = historical_data["c"].quantile(0.10)
    p25 = historical_data["c"].quantile(0.25)
    p50 = historical_data["c"].quantile(0.50)

    # Calculate short-term metrics
    today_low = hourly_short_data["today"]["l"].min()
    today_high = hourly_short_data["today"]["h"].max()
    yesterday_low = hourly_short_data["yesterday"]["l"].min()
    yesterday_high = hourly_short_data["yesterday"]["h"].max()

    # Calculate long-term metrics
    long_hourly_low = hourly_long_data["l"].min()
    long_hourly_high = hourly_long_data["h"].max()

    # Likelihood prices (e.g., 85% and 90%) from historical data
    likelihood_prices = calculate_likelihoods(
        historical_data, target_likelihoods=[85, 90]
    )

    # Combine all metrics for optimal buy price
    optimal_buy_price = min(p10, today_low, yesterday_low)

    return {
        "lookback_period": days,
        "percentiles": {"10th": p10, "25th": p25, "50th": p50},
        "hourly_metrics": {
            "today": {"low": today_low, "high": today_high},
            "yesterday": {"low": yesterday_low, "high": yesterday_high},
            "long_hourly": {"low": long_hourly_low, "high": long_hourly_high},
        },
        "likelihood_prices": likelihood_prices,
        "optimal_buy_price": optimal_buy_price,
    }
