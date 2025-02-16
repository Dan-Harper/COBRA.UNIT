from fastapi import APIRouter, HTTPException
from calculate_today_and_yesterday import calculate_today_and_yesterday_metrics
from compare_optimal_buy_with_all_lookbacks_prices import calculate_optimal_buy_with_short_lookbacks
from pydantic import BaseModel

router = APIRouter()


class TickerRequest(BaseModel):
    ticker: str


@router.post("/compare-lookbacks", tags=["Lookbacks"])
def compare_all_lookbacks(request: TickerRequest):
    """
    Compare optimal buy prices for today, yesterday, 7-day, and 14-day lookbacks.
    """
    ticker = request.ticker
    # Calculate today and yesterday metrics
    today_yesterday_metrics = calculate_today_and_yesterday_metrics(ticker)
    if not today_yesterday_metrics:
        raise HTTPException(status_code=404, detail="Unable to fetch data for today and yesterday.")

    # Calculate for 7 days
    result_7d = calculate_optimal_buy_with_short_lookbacks(ticker, days=7)
    if not result_7d:
        raise HTTPException(status_code=404, detail="Unable to fetch 7-day historical data.")

    # Calculate for 14 days
    result_14d = calculate_optimal_buy_with_short_lookbacks(ticker, days=14)
    if not result_14d:
        raise HTTPException(status_code=404, detail="Unable to fetch 14-day historical data.")

    # Logging
    print("\nToday and Yesterday Results:")
    for period, metrics in today_yesterday_metrics.items():
        print(f"\n  {period.capitalize()} Metrics:")
        print(f"    Percentiles: {metrics['percentiles']}")
        print(f"    Optimal Buy Price: {metrics['optimal_buy_price']:.2f}")
        print("    Likelihood Prices:")
        for likelihood, price in metrics["likelihood_prices"].items():
            print(f"      {likelihood} Likelihood Price: {price:.2f}")

    print("\n7-Day Lookback Results:")
    print(f"  Percentiles: {result_7d['percentiles']}")
    print(f"  Long Hourly Metrics: {result_7d['hourly_metrics']['long_hourly']}")
    print(f"  Optimal Buy Price: {result_7d['optimal_buy_price']:.2f}")
    print("  Likelihood Prices:")
    for likelihood, price in result_7d["likelihood_prices"].items():
        print(f"    {likelihood} Likelihood Price: {price:.2f}")

    print("\n14-Day Lookback Results:")
    print(f"  Percentiles: {result_14d['percentiles']}")
    print(f"  Long Hourly Metrics: {result_14d['hourly_metrics']['long_hourly']}")
    print(f"  Optimal Buy Price: {result_14d['optimal_buy_price']:.2f}")
    print("  Likelihood Prices:")
    for likelihood, price in result_14d["likelihood_prices"].items():
        print(f"    {likelihood} Likelihood Price: {price:.2f}")

    return {
        "today": today_yesterday_metrics["today"],
        "yesterday": today_yesterday_metrics["yesterday"],
        "7d": result_7d,
        "14d": result_14d,
    }
