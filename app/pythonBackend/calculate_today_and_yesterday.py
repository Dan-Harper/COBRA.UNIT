from calculate_likelihoods_prices import calculate_likelihoods
from fetch_price_data import fetch_today_and_yesterday_hourly


def calculate_today_and_yesterday_metrics(ticker, target_likelihoods=[85, 90]):
    """
    Calculate metrics for today and yesterday's hourly data, including percentiles and likelihoods.
    """
    # Fetch hourly data for today and yesterday
    hourly_data = fetch_today_and_yesterday_hourly(ticker)

    results = {}
    for period, data in hourly_data.items():
        # Calculate percentiles
        p10 = data["l"].quantile(0.10)
        p25 = data["l"].quantile(0.25)
        p50 = data["l"].quantile(0.50)

        # Calculate likelihood prices (85% and 90%)
        likelihood_prices = calculate_likelihoods(data, target_likelihoods)

        # Calculate optimal buy price
        optimal_buy_price = p10
        # 10th percentile is typically the most conservative optimal buy price

        # Store metrics for the period (today or yesterday)
        results[period] = {
            "percentiles": {"10th": p10, "25th": p25, "50th": p50},
            "likelihood_prices": likelihood_prices,
            "optimal_buy_price": optimal_buy_price,
        }

    return results
