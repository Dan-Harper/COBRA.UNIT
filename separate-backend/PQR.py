# https://twelvedata.com/docs#income_statement

import csv
import requests

input_file_path = r"C:\Users\Wanderer\Documents\OSU to GT to STANFORD\CS361\CS-361\pqrInput.csv"
output_file_path = r"C:\Users\Wanderer\Documents\OSU to GT to STANFORD\CS361\CS-361\pqrOutput.csv"

api_key = "8sJLC5HFPZM3Nq68mKGInCVToyXiOxpt"
api_endpoint_template = "https://api.polygon.io/vX/reference/financials?ticker={stock}&apiKey={api_key}"

stocks = []

with open(input_file_path, mode='r') as csv_file:
    csv_reader = csv.reader(csv_file)
    for row in csv_reader:

        if not row[0]:
            break
        stocks.append(row[0])

headers = []

with open(output_file_path, mode='w', newline='') as csv_output:
    csv_writer = csv.writer(csv_output)

    for stock in stocks:
        api_endpoint = api_endpoint_template.format(stock=stock, api_key=api_key)
        try:
            response = requests.get(api_endpoint)
            response.raise_for_status()
            data = response.json()

            most_recent_income_statement = None
            if 'results' in data and data['results']:
                sorted_financials = sorted(data['results'], key=lambda x: x['end_date'], reverse=True)
                most_recent_income_statement = next(
                    (item for item in sorted_financials if item['financials'].get('income_statement')), None
                )

            if not headers and most_recent_income_statement:
                headers = ['ticker'] + list(most_recent_income_statement['financials']['income_statement'].keys())
                csv_writer.writerow(headers)

            if most_recent_income_statement:
                row = [stock] + [most_recent_income_statement['financials']['income_statement'].get(key, {})
                    .get('value', 'No Data') for key in headers if key != 'ticker']
                csv_writer.writerow(row)
            else:
                csv_writer.writerow([stock] + ["No Data"] * (len(headers) - 1))

        except requests.RequestException as e:
            csv_writer.writerow([stock] + ["API Error"] * (len(headers) - 1))
            print(f"API Error for {stock}: {e}")

print("CSV saved to", output_file_path)