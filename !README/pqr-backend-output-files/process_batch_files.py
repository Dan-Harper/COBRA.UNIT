import os
import glob
import requests

# Define the folder containing the batch files
batch_folder = "C:/Users/Wanderer/Documents/OSU-GT-STANFORD/COBRA.UNIT/!README/pqr-tickers-batch-files"

# Define the backend service URL (replace with the actual URL of your backend service)
backend_url = "http://localhost:5001/api/processJSON"

# Function to read the batch file and call the backend service
def process_batch_file(file_path):
    # Read the contents of the batch file
    with open(file_path, 'r') as file:
        stock_data = file.read().strip()
    
    # Prepare the JSON payload to send to the backend service
    payload = {
        "stocks": stock_data
    }
    
    # Make the request to the backend service
    try:
        response = requests.post(backend_url, json=payload)
        if response.status_code == 200:
            print(f"Successfully processed {file_path}")
        else:
            print(f"Error processing {file_path}: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error sending request for {file_path}: {e}")

# Function to get all the batch files
def get_batch_files():
    # Use glob to find all the batch files (e.g., PQR_Tickers_Batch_1.txt, PQR_Tickers_Batch_2.txt, etc.)
    return glob.glob(os.path.join(batch_folder, "PQR_Tickers_Batch_*.txt"))

# Iterate over each batch file and call the backend service
def process_all_batches():
    batch_files = get_batch_files()
    batch_files.sort()  # Sort the files to ensure they are processed in the correct order

    for batch_file in batch_files:
        process_batch_file(batch_file)

if __name__ == "__main__":
    process_all_batches()
