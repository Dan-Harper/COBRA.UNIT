def batch_tickers(input_file, batch_size=49):
    # Read the input file
    with open(input_file, 'r') as file:
        content = file.read()
    
    # Split the content into a list of tickers, assuming they're separated by commas and newlines
    tickers = content.split(',')
    
    # Remove leading/trailing whitespaces from each ticker
    tickers = [ticker.strip() for ticker in tickers if ticker.strip()]
    
    # Calculate the total number of batches needed
    total_batches = len(tickers) // batch_size + (1 if len(tickers) % batch_size != 0 else 0)
    
    # Iterate over the number of batches and write to separate files
    for i in range(total_batches):
        # Get the tickers for the current batch
        start_index = i * batch_size
        end_index = min(start_index + batch_size, len(tickers))
        batch_tickers = tickers[start_index:end_index]
        
        # Prepare the batch content, join them with commas
        batch_content = ', '.join(batch_tickers)
        
        # Write the batch to a new file
        output_file = f'PQR_Tickers_Batch_{i+1}.txt'
        with open(output_file, 'w') as output:
            output.write(batch_content)
        
        print(f'Written batch {i+1} to {output_file}')

# Example usage
input_file = 'PQR Tickers output.txt'  # Replace with your actual input file
batch_tickers(input_file)