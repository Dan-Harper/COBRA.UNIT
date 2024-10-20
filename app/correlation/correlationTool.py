import yfinance as yf
import pandas as pd
from datetime import datetime
import os


def fetch_stock_data(ticker, start_date, end_date):
    stock = yf.download(ticker, start=start_date, end=end_date)
    if stock.empty:
        print(f"No data found for {ticker}")
        return pd.Series(dtype='float64')
    return stock['Adj Close']


def calculate_daily_returns(stock_data):
    return stock_data.pct_change().dropna()


def fetch_all_data(tickers, start_date, end_date):
    stock_data = {}
    for ticker in tickers:
        stock_data[ticker] = fetch_stock_data(ticker, start_date, end_date)
    return stock_data


def compare_ideas(current_ideas, new_ideas, stock_data):
    correlations = []
    # Calculate daily returns for all current and new ideas first
    stock_returns = {ticker: calculate_daily_returns(data) for ticker, data in stock_data.items()}
    for new_ticker in new_ideas:
        new_returns = stock_returns[new_ticker]
        for current_ticker in current_ideas:
            current_returns = stock_returns[current_ticker]
            if not current_returns.empty and not new_returns.empty:
                correlation = calculate_correlation(current_returns, new_returns)
                # Add pass/fail check for correlation between 0 and 0.5
                pass_fail = "Pass" if 0 <= correlation <= 0.5 else "Fail"
                correlations.append([current_ticker, new_ticker, correlation, pass_fail])
    return correlations


def calculate_correlation(stock1_returns, stock2_returns):
    return stock1_returns.corr(stock2_returns)


def save_correlations_to_csv(correlations, save_path):
    date_str = datetime.now().strftime('%Y-%m-%d')
    filename = f'PQRStockTickerCorrelations{date_str}.csv'
    csv_file_path = os.path.join(save_path, filename)
    # Include Pass/Fail in the output CSV
    df = pd.DataFrame(correlations, columns=['Current Stock', 'New Stock', 'Correlation', 'Pass/Fail'])
    df.to_csv(csv_file_path, index=False)
    print(f'Saved correlations to {csv_file_path}')


def get_and_save_correlations(current_ideas, new_ideas, start_date, end_date, save_path):
    """
    Fetch stock data, calculate correlations, and save the results to CSV file.
    :param current_ideas: List of current stock tickers.
    :param new_ideas: List of new stock tickers.
    :param start_date: Start date for fetching stock data.
    :param end_date: End date for fetching stock data.
    :param save_path: Path where the CSV file will be saved.
    """
    all_tickers = set(current_ideas + new_ideas)
    # Fetch all stock data in one pass
    stock_data = fetch_all_data(all_tickers, start_date, end_date)    
    # Calculate correlations
    correlations = compare_ideas(current_ideas, new_ideas, stock_data)
    # Save the results to CSV
    save_correlations_to_csv(correlations, save_path)


# Example usage of the API function
if __name__ == '__main__':
    current_ideas = ['AAPL', 'GOOGL', 'AMZN']
    new_ideas = ['MSFT', 'TSLA', 'NFLX']
    start_date = '2020-01-01'
    end_date = '2023-01-01'
    save_path = r'C:\Users\Wanderer\Documents\OSU-GT-STANFORD\COBRA.UNIT\!README'
    get_and_save_correlations(current_ideas, new_ideas, start_date, end_date, save_path)
