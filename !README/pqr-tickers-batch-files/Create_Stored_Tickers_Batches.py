import os
import sys

# Add project root to path to import config
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))
from path_config import PQR_TICKERS_BATCH_DIR

def batch_stored_tickers(batch_size=49):
    """
    Create batch files from Stored_Tickers.txt with specified batch size.
    Deletes old Stored_Tickers_Batch_*.txt files before creating new ones.
    """
    input_file = os.path.join(PQR_TICKERS_BATCH_DIR, 'Stored_Tickers.txt')

    # Delete old batch files
    for filename in os.listdir(PQR_TICKERS_BATCH_DIR):
        if filename.startswith('Stored_Tickers_Batch_') and filename.endswith('.txt'):
            file_path = os.path.join(PQR_TICKERS_BATCH_DIR, filename)
            os.remove(file_path)
            print(f'Deleted old batch file: {filename}')

    # Read the input file
    with open(input_file, 'r') as file:
        content = file.read()

    # Split the content into a list of tickers, assuming they're separated by commas
    tickers = content.split(',')

    # Remove leading/trailing whitespaces and empty entries
    tickers = [ticker.strip() for ticker in tickers if ticker.strip()]

    # Remove duplicates while preserving order
    seen = set()
    unique_tickers = []
    for ticker in tickers:
        if ticker not in seen:
            seen.add(ticker)
            unique_tickers.append(ticker)

    print(f'Total unique tickers: {len(unique_tickers)}')

    # Calculate the total number of batches needed
    total_batches = len(unique_tickers) // batch_size + (1 if len(unique_tickers) % batch_size != 0 else 0)

    # Iterate over the number of batches and write to separate files
    for i in range(total_batches):
        # Get the tickers for the current batch
        start_index = i * batch_size
        end_index = min(start_index + batch_size, len(unique_tickers))
        batch_tickers = unique_tickers[start_index:end_index]

        # Prepare the batch content, join them with commas
        batch_content = ', '.join(batch_tickers)

        # Write the batch to a new file
        output_file = os.path.join(PQR_TICKERS_BATCH_DIR, f'Stored_Tickers_Batch_{i+1}.txt')
        with open(output_file, 'w') as output:
            output.write(batch_content)

        print(f'Written batch {i+1} with {len(batch_tickers)} tickers to Stored_Tickers_Batch_{i+1}.txt')

    print(f'\nTotal batches created: {total_batches}')
    return total_batches

if __name__ == '__main__':
    batch_stored_tickers()
