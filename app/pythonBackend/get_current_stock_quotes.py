import requests
from config import ALPACA_API_KEY, ALPACA_API_SECRET


def get_stock_quotes(ticker):
    base_url = "https://data.alpaca.markets/v2"
    endpoint = f"{base_url}/stocks/{ticker}/quotes/latest"

    headers = {
        "ALPACA-API-KEY-ID": ALPACA_API_KEY,
        "ALPACA-API-SECRET-KEY": ALPACA_API_SECRET,
    }

    try:
        response = requests.get(endpoint, headers=headers)
        response.raise_for_status()
        data = response.json()

        return {
            "bid_price": data["quote"]["bp"],
            "bid_size": data["quote"]["bs"],
            "ask_price": data["quote"]["ap"],
            "ask_size": data["quote"]["as"],
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching quotes: {e}")
        return None
