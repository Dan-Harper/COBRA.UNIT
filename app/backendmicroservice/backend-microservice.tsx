// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const csv = require('csv-parser');
const fs = require('fs');

// Create an Express app
const app = express();

// Use bodyParser middleware to parse JSON requests
app.use(bodyParser.json());

// Define an API endpoint to process JSON data
app.post('/api/processJSON', async (req, res) => {
    // Try-catch block to handle errors gracefully
    try {
        // Extract data from the request body
        const requestData = req.body;
        // Split stock tickers and convert them to uppercase
        const stocks = requestData.stocks.split(',').map(stock => stock.trim().toUpperCase());
        // API key for the external API
        const apiKey = '8sJLC5HFPZM3Nq68mKGInCVToyXiOxpt';
        
        // Array to store the output data
        const outputData = [];

        // Dynamically import 'node-fetch' as an ES module
        const fetch = (await import('node-fetch')).default;

        // Loop through each stock ticker
        for (const stock of stocks) {
            // Define the API endpoint for fetching stock data
            const apiEndpoint = `https://api.polygon.io/vX/reference/financials?ticker=${stock}&apiKey=${apiKey}`;

            try {
                // Make a fetch request to the API endpoint
                const response = await fetch(apiEndpoint);
                // Check if the response is OK
                if (response.ok) {
                    // Parse the JSON response
                    const data = await response.json();

                    // Check if there is data and extract the most recent income statement
                    if ((data as any).results && (data as any).results.length > 0) {
                        const mostRecentIncomeStatement = (data as any).results[0];


                        // Prepare the row for CSV
                        const rowData = {
                            ticker: stock,
                            ...mostRecentIncomeStatement,
                        };

                        // Push the row data to the output array
                        outputData.push(rowData);
                    } else {
                        // Handle the case where no data is found for the stock
                        outputData.push({ ticker: stock, message: 'No Data' });
                    }
                } else {
                    // Handle API request failure
                    outputData.push({ ticker: stock, message: 'API Error' });
                }
            } catch (error) {
                // Log and push internal server errors
                console.error(error);
                outputData.push({ ticker: stock, message: 'Internal server error' });
            }
        }

        // Define the CSV file path
        const outputFilePath = 'C:/Users/Wanderer/Documents/OSU to STANFORD/CS361/CS-361/pqrOutput.csv';
        
        // Write the CSV file
        fs.writeFileSync(outputFilePath, '');
        fs.createReadStream(outputFilePath)
            .pipe(csv())
            .on('data', () => {})
            .on('end', () => {
                // Add headers to the CSV file
                const headers = Object.keys(outputData[0]).join(',');
                fs.writeFileSync(outputFilePath, `${headers}\n`, { flag: 'a' });

                // Write data to the CSV file
                for (const rowData of outputData) {
                    const row = Object.values(rowData).join(',');
                    fs.writeFileSync(outputFilePath, `${row}\n`, { flag: 'a' });
                }

                // Send JSON response to the front end
                res.json({ message: 'Request processed successfully', data: outputData });
            });
    } catch (error) {
        // Handle any other errors
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the React and Next.js frontend (assuming it's in the 'build' directory)
app.use(express.static('build'));

// Define a catch-all route for serving the React app
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html');
});

// Start the microservice server on port 5001
app.listen(5001, () => {
    console.log('Microservice server is running on port 5001');
});