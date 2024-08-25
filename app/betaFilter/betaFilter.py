import yfinance as yf
import pandas as pd
import sys
import json
from typing import List


def get_stock_betas(symbols: List[str]) -> pd.DataFrame:
    """
    Retrieve Beta values and Market Capitalization for a list of stock tickers.

    Parameters:
    symbols (List[str]): A list of stock ticker symbols.

    Returns:
    pd.DataFrame: A DataFrame with the stock tickers and their corresponding Beta values and Market Capitalization.
    """
    data = []

    for stock in symbols:
        try:
            ticker = yf.Ticker(stock)
            info = ticker.info
            beta = info.get('beta')
            marketcap = info.get('marketCap')
            if beta is not None and marketcap is not None:
                df_temp = pd.DataFrame({'Stock': [stock], 'Beta': [beta], 'Marketcap': [marketcap]})
                data.append(df_temp)
        except Exception as e:
            # Print an error message to stderr
            print(f"Error retrieving data for {stock}: {e}", file=sys.stderr)

    # Concatenate all the collected DataFrames
    if data:
        df = pd.concat(data, ignore_index=True)
        # Drop rows with NaN values
        df.dropna(inplace=True)
    else:
        df = pd.DataFrame(columns=['Stock', 'Beta', 'Marketcap'])

    return df

if __name__ == "__main__":
    # Read input from command line
    input_symbols = json.loads(sys.argv[1])
    
    # Get stock betas
    betas_df = get_stock_betas(input_symbols)

    # Convert DataFrame to JSON and print it
    print(betas_df.to_json(orient='records'))