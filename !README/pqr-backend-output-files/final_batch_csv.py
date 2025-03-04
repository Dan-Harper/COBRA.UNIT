import os
import glob
import csv

# Define the folder where the output CSV files are located
output_folder = "C:/Users/Wanderer/Documents/OSU-GT-STANFORD/COBRA.UNIT/!README/pqr-backend-output-files"
final_output_file = os.path.join(output_folder, "pqrFinalOutput.csv")

# Function to get all pqrOutput files (sorted)
def get_output_files():
    return sorted(glob.glob(os.path.join(output_folder, "pqrOutput*.csv")))

# Step 1: Determine the farthest right `totalPasses` column across all files
def get_farthest_total_passes_index(output_files):
    max_total_passes_index = 0

    for file in output_files:
        with open(file, 'r', newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)  # Read the header row
            
            try:
                total_passes_index = header.index('totalPasses')
                max_total_passes_index = max(max_total_passes_index, total_passes_index)
            except ValueError:
                pass  # If 'totalPasses' is not found, ignore that file

    return max_total_passes_index

# Step 2: Shift data and write to final CSV
def align_and_write_data(output_files, max_total_passes_index):
    with open(final_output_file, 'w', newline='', encoding='utf-8') as final_file:
        writer = csv.writer(final_file)
        first_file = True  # Track first file to write the header

        for file in output_files:
            print(f"Processing file: {file}")

            with open(file, 'r', newline='', encoding='utf-8') as f:
                reader = csv.reader(f)
                rows = list(reader)
                
                if not rows:
                    continue  # Skip empty files
                
                header = rows[0]
                
                try:
                    file_total_passes_index = header.index('totalPasses')
                except ValueError:
                    print(f"Skipping {file} (No 'totalPasses' column found)")
                    continue  # Skip this file if 'totalPasses' is missing

                shift_amount = max_total_passes_index - file_total_passes_index
                
                # If this is the first file, write the header
                if first_file:
                    writer.writerow(header + [''] * shift_amount)  # Pad header
                    first_file = False

                # Shift data rows to align with max `totalPasses` column
                for row in rows[1:]:  # Skip header row
                    writer.writerow(row + [''] * shift_amount)

if __name__ == "__main__":
    output_files = get_output_files()

    if not output_files:
        print("No files found.")
    else:
        max_total_passes_index = get_farthest_total_passes_index(output_files)  # Step 1
        align_and_write_data(output_files, max_total_passes_index)  # Step 2
        print(f"Data has been successfully written to {final_output_file}")
