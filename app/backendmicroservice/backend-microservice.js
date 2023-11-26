// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// Create an Express app
const app = express();

// Use bodyParser middleware to parse JSON requests
app.use(bodyParser.json());

const fetchStockData = async (stock) => {

    const apiKey = "8sJLC5HFPZM3Nq68mKGInCVToyXiOxpt"

    const apiEndpoint = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${stock}&apiKey=${apiKey}`;

    try {
    
        const response = await fetch(apiEndpoint);

        const data = await response.json();

        console.log("API Response for stock", stock, ":", data);

        if (response.ok && data.tickers && data.tickers.length > 0) {

            const stockInfo = data.tickers[0];

            const stockData = {
                "ticker": stockInfo.ticker || '',
                "day.c": stockInfo.day?.c || 0,
                "day.h": stockInfo.day?.h || 0,
                "day.l": stockInfo.day?.l || 0,
                "day.o": stockInfo.day?.o || 0,
                "day.v": stockInfo.day?.v || 0,
                "day.vw": stockInfo.day?.vw || 0,
                "lastQuote.P": stockInfo.lastQuote?.P || 0,
                "lastQuote.S": stockInfo.lastQuote?.S || 0,
                "lastQuote.p": stockInfo.lastQuote?.p || 0,
                "lastQuote.s": stockInfo.lastQuote?.s || 0,
                "lastQuote.t": stockInfo.lastQuote?.t || 0,
                "lastTrade.c": stockInfo.lastTrade?.c?.join(', ') || '',
                "lastTrade.i": stockInfo.lastTrade?.i || '',
                "lastTrade.p": stockInfo.lastTrade?.p || 0,
                "lastTrade.s": stockInfo.lastTrade?.s || 0,
                "lastTrade.t": stockInfo.lastTrade?.t || 0,
                "lastTrade.x": stockInfo.lastTrade?.x || 0,
                "min.av": stockInfo.min?.av || 0,
                "min.c": stockInfo.min?.c || 0,
                "min.h": stockInfo.min?.h || 0,
                "min.l": stockInfo.min?.l || 0,
                "min.n": stockInfo.min?.n || 0,
                "min.o": stockInfo.min?.o || 0,
                "min.t": stockInfo.min?.t || 0,
                "min.v": stockInfo.min?.v || 0,
                "min.vw": stockInfo.min?.vw || 0,
                "prevDay.c": stockInfo.prevDay?.c || 0,
                "prevDay.h": stockInfo.prevDay?.h || 0,
                "prevDay.l": stockInfo.prevDay?.l || 0,
                "prevDay.o": stockInfo.prevDay?.o || 0,
                "prevDay.v": stockInfo.prevDay?.v || 0,
                "prevDay.vw": stockInfo.prevDay?.vw || 0,
                "todaysChange": stockInfo?.todaysChange || 0,
                "todaysChangePerc": stockInfo?.todaysChangePerc || 0,
                "updated": stockInfo?.updated || 0
            };
            
            return stockData;
        } else {
            console.log("No data found for stock", stock);
            return null;
        }
    } catch (error) {
        console.error("Error fetching data for stock:", stock);
        return null;
    }
};


// Define an API endpoint to process JSON data
app.post('/api/processJSON', async (req, res) => {
    try {
        // Extract requestData from the request body
        const requestData = req.body;

        // Continue with your existing logic
        const stocks = requestData.stocks.split(',').map(stock => stock.trim().toUpperCase());

        // Initialize outputData array
        let outputData = [];
        
        const headers = {
            "ticker": "Ticker",
            "day.c": "Day Close",
            "day.h": "Day High",
            "day.l": "Day Low",
            "day.o": "Day Open",
            "day.v": "Day Volume",
            "day.vw": "Day VWAP",
            "lastQuote.P": "Last Quote Ask Price",
            "lastQuote.S": "Last Quote Ask Size",
            "lastQuote.p": "Last Quote Bid Price",
            "lastQuote.s": "Last Quote Bid Size",
            "lastQuote.t": "Last Quote Timestamp",
            "lastTrade.c": "Last Trade Conditions",
            "lastTrade.i": "Last Trade ID",
            "lastTrade.p": "Last Trade Price",
            "lastTrade.s": "Last Trade Size",
            "lastTrade.t": "Last Trade Timestamp",
            "lastTrade.x": "Last Trade Exchange ID",
            "min.av": "Minute Accumulated Volume",
            "min.c": "Minute Close",
            "min.h": "Minute High",
            "min.l": "Minute Low",
            "min.n": "Minute Number of Transactions",
            "min.o": "Minute Open",
            "min.t": "Minute Timestamp",
            "min.v": "Minute Volume",
            "min.vw": "Minute VWAP",
            "prevDay.c": "Previous Day Close",
            "prevDay.h": "Previous Day High",
            "prevDay.l": "Previous Day Low",
            "prevDay.o": "Previous Day Open",
            "prevDay.v": "Previous Day Volume",
            "prevDay.vw": "Previous Day VWAP",
            "todaysChange": "Today's Change",
            "todaysChangePerc": "Today's Change Percentage",
            "updated": "Last Updated Timestamp"
        };

        const stockDataPromises = stocks.map(stock => fetchStockData(stock));

        const fetchedStockData = await Promise.all(stockDataPromises);

        console.log("Fetched stock data:", fetchedStockData); // Log fetched data

        outputData = fetchedStockData.filter(data => data != null);

        const outputFilePath = 'C:/Users/Wanderer/Documents/OSU to STANFORD/CS361/CS-361/pqrOutput.csv';
        fs.writeFileSync(outputFilePath, Object.keys(headers).join(',') + '\n', { flag: 'w' });

        for (const rowData of outputData) {
            const row = Object.keys(headers).map(header => rowData[header] || '').join(',');
            fs.writeFileSync(outputFilePath, `${row}\n`, { flag: 'a' });
        }

        res.json({ message: 'Request processed successfully', data: outputData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.use(express.static('build'));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html');
});

app.listen(5001, () => {
    console.log('Microservice server is running on port 5001');
});