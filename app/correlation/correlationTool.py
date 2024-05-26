import yfinance as yf
import pandas as pd
from datetime import datetime
import os


def fetch_stock_data(ticker, start_date, end_date):
    stock = yf.download(ticker, start=start_date, end=end_date)
    return stock['Adj Close']


def calculate_daily_returns(stock_data):
    return stock_data.pct_change().dropna()


def calculate_correlation(stock1_returns, stock2_returns):
    return stock1_returns.corr(stock2_returns)


def compare_ideas(current_ideas, new_ideas, start_date, end_date):
    correlations = []
    for current_ticker in current_ideas:
        current_data = fetch_stock_data(current_ticker, start_date, end_date)
        current_returns = calculate_daily_returns(current_data)    
        for new_ticker in new_ideas:
            new_data = fetch_stock_data(new_ticker, start_date, end_date)
            new_returns = calculate_daily_returns(new_data)            
            correlation = calculate_correlation(current_returns, new_returns)
            correlations.append([current_ticker, new_ticker, correlation])   
    return correlations


def save_correlations_to_csv(correlations, save_path):
    date_str = datetime.now().strftime('%m/%d/%Y')
    filename = f'PQRStockTickerCorrelations{date_str}.csv'
    full_path = os.path.join(save_path, filename)
    df = pd.DataFrame(correlations, columns=['Current Stock', 'New Stock', 'Correlation'])
    df.to_csv(full_path, index=False)
    print(f'Saved correlations to {full_path}')


def get_and_save_correlations(current_ideas, new_ideas, start_date, end_date, save_path):
    """
    Fetch stock data, calculate correlations, and save the results to CSV file.
    :param current_ideas: List of current stock tickers.
    :param new_ideas: List of new stock tickers.
    :param start_date: Start date for fetching stock data.
    :param end_date: End date for fetching stock data.
    :param save_path: Path where the CSV file will be saved.
    """
    correlations = compare_ideas(current_ideas, new_ideas, start_date, end_date)
    save_correlations_to_csv(correlations, save_path)


# Example usage of the API function
if __name__ == '__main__':
    current_ideas = ['AAPL', 'GOOGL', 'AMZN']
    new_ideas = ['MSFT', 'TSLA', 'NFLX']
    start_date = '2020-01-01'
    end_date = '2023-01-01'
    save_path = r'C:\Users\Wanderer\Documents\OSU-GT-STANFORD\COBRA.UNIT\!README'
    get_and_save_correlations(current_ideas, new_ideas, start_date, end_date, save_path)
