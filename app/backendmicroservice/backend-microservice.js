const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(cors());

app.use(bodyParser.json());

const apiKey = "8sJLC5HFPZM3Nq68mKGInCVToyXiOxpt"

const fetchStockData = async (stockTicker) => {
    const stockApiEndpoint = `https://api.polygon.io/vX/reference/financials?apiKey=${apiKey}&ticker=${stockTicker}`;
    try {
        const response = await fetch(stockApiEndpoint);
        const data = await response.json();
        console.log("API Response for", stockTicker, ":", data);
        return data.results && data.results.length > 0 ? data.results[0] : null;
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return null;
    }
};

const fetchStockPrice = async (stockTicker) => {
    // Update the API endpoint to fetch the previous close price
    const prevCloseApiEndpoint = `https://api.polygon.io/v2/aggs/ticker/${stockTicker}/prev?adjusted=true&apiKey=${apiKey}`;

    try {
        const response = await fetch(prevCloseApiEndpoint);
        const data = await response.json();
        if (!response.ok) {
            console.error("API response error:", response.status, response.statusText, data);
            return null;
        }
        // Extract the previous close price from the response
        return data && data.results && data.results.length > 0 ? data.results[0].c : null;
    } catch (error) {
        console.error("Error fetching stock price:", error);
        return null;
    }
};

const fetchTotalShares = async (stockTicker) => {
    const tickerDetailsEndpoint = `https://api.polygon.io/v3/reference/tickers/${stockTicker}?apiKey=${apiKey}`;
    try {
        const response = await fetch(tickerDetailsEndpoint);
        const data = await response.json();
        return data.results ? data.results.share_class_shares_outstanding : null;
    } catch (error) {
        console.error("Error fetching total shares:", error);
        return null;
    }
};

app.post('/api/processJSON', async (req, res) => {

    try {

        const requestData = req.body;
        const stocks = requestData.stocks.split(',').map(stock => stock.trim().toUpperCase());

        const stockDataPromises = stocks.map(async (stock) => {
            const stockData = await fetchStockData(stock);
            console.log(`Fetched stock data for ${stock}:`, stockData);

            const stockPrice = await fetchStockPrice(stock);
            console.log(`Stock price for ${stock}:`, stockPrice);

            const totalShares = await fetchTotalShares(stock);
            console.log(`Total shares for ${stock}:`, totalShares);

            if (stockData) {
                stockData.stock_price = stockPrice;
                stockData.total_shares = totalShares;
            }
            return stockData;
        });

        const fetchedStockData = await Promise.all(stockDataPromises);
        
        console.log("Fetched stock data:", fetchedStockData);

        let headers = new Set(["Ticker"]);

        let calculatedHeaders = [
            "stockPrice",
            "totalShares",
            "grossMargin",
            "netProfitMargin",
            "peRatio",
            "pbRatio",
            "debtToEquity",
            "marketCap",
            "currentRatio",
            "ROA",
            "ROE",
            "ROIC",
            "SGnAMargin",
            "researchAndDevelopment",
            "incomeTaxExpenses",
            "cashAndDebt"
        ];

        // Generate headers from the fetched data
        fetchedStockData.forEach(data => {
            if (data && data.financials) {
                Object.keys(data.financials).forEach(section => {
                    Object.keys(data.financials[section]).forEach(key => {
                        headers.add(key);
                    });
                });
            } else {
                console.log(`Financials not available for a stock, skipping header generation for this stock.`);
            }
        });

        let passFailHeaders = [
            "grossMarginCheck1",
            "grossMarginCheck2",
            "netProfitMarginCheck1",
            "netProfitMarginCheck2",
            "peTimesPbRatioCheck",
            "marketCapCheck",
            "currentRatioCheck",
            "ROACheck",
            "ROECheck",
            "ROICCheck",
            "SGnAMarginCheck",
            "researchAndDevelopmentCheck",
            "incomeTaxExpensesCheck",
            "cashAndDebtCheck"
        ];

        let csvHeaders = Array.from(headers).concat(calculatedHeaders).concat(passFailHeaders).concat(['totalPasses']);        
        let csvContent = csvHeaders.join(',') + '\n';
        
        // Process each stock's data
        fetchedStockData.forEach(data => {
            if (data) {
                const ticker = data.ticker || 'N/A'; // Adjust based on actual data structure
                let rowData = [ticker]; // Start row with ticker
        
                // Calculate financial metrics
                const financialMetrics = calculateFinancials(data.financials, data.stock_price, data.total_shares);
        
                // Manually handle stockPrice and totalShares
                rowData.push(data.stock_price !== undefined ? data.stock_price : 'N/A');
                rowData.push(data.total_shares !== undefined ? data.total_shares : 'N/A');
        
                // Append financial data for each header
                csvHeaders.forEach(header => {
                    if (header === 'Ticker' || header === 'stockPrice' || header === 'totalShares') {
                        // These have been already handled
                    } else if (financialMetrics[header] !== undefined) {
                        rowData.push(financialMetrics[header]);
                    } else if (passFailHeaders.includes(header)) {
                        // New condition to handle pass/fail check results
                        // Directly append the result of the check from the passFailResults object
                        const checkResult = financialMetrics.passFailResults[header];
                        rowData.push(checkResult !== undefined ? checkResult : 'N/A');
                    } else {
                        // Attempt to find the value in financial data or default to 'N/A'
                        let value = 'N/A';
                        ['balance_sheet', 'income_statement', 'cash_flow_statement', 'comprehensive_income'].forEach(section => {
                            if (data.financials && data.financials[section] && data.financials[section][header]) {
                                // Assume each property might be an object with a 'value' key or a direct numeric/string value
                                const fieldValue = data.financials[section][header].hasOwnProperty('value') ? data.financials[section][header].value : data.financials[section][header];
                                if (fieldValue !== undefined) {
                                    value = fieldValue;
                                }
                            }
                        });
                        rowData.push(value);
                    }
                });
                console.log(`Row data for ${ticker}:`, rowData.join(','));
                csvContent += rowData.join(',') + '\n';
            } else {
                console.log(`No data available for one of the stocks.`);
            }
        });
    
        

        // Write the CSV content to a file
        const outputFilePath = 'C:/Users/Wanderer/Documents/OSU-GT-STANFORD/COBRA.UNIT/!README/pqrOutput.csv';
        fs.writeFileSync(outputFilePath, csvContent);
        const csvData = fs.readFileSync(outputFilePath, 'utf8');
        res.json({ csvData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});


function calculateFinancials(financials, stockPrice, totalShares) {
    
    console.log("Financial data received:", financials);

    function getNestedValue(path, financials, defaultValue = 0) {
        return path.reduce((currentObject, key) => {
            return (currentObject && key in currentObject) ? currentObject[key] : defaultValue;
        }, financials);
    }

    const grossProfit = getNestedValue(['income_statement', 'gross_profit', 'value'], financials);
    const revenues = getNestedValue(['income_statement', 'revenues', 'value'], financials);
    const netIncomeLoss = getNestedValue(['income_statement', 'net_income_loss', 'value'], financials);
    const dilutedEarningsPerShare = getNestedValue(['income_statement', 'diluted_earnings_per_share', 'value'], financials);
    const totalAssets = getNestedValue(['balance_sheet', 'assets', 'value'], financials);
    const totalEquity = getNestedValue(['balance_sheet', 'equity', 'value'], financials);
    const totalLiabilities = getNestedValue(['balance_sheet', 'liabilities', 'value'], financials);    
    const currentAssets = getNestedValue(['balance_sheet', 'current_assets', 'value'], financials);
    const currentLiabilities = getNestedValue(['balance_sheet', 'current_liabilities', 'value'], financials);
    // remove this if debt to equity is fixed const debt = currentLiabilities / noncurrent_liabilities;
    const costsAndExpenses = getNestedValue(['income_statement', 'costs_and_expenses', 'value'], financials);
    const research_and_development = getNestedValue(['income_statement', 'research_and_development', 'value'], financials);
    const cash = getNestedValue(['balance_sheet', 'cash', 'value'], financials);
    const income_tax_expense_benefit = getNestedValue(['income_statement', 'income_tax_expense_benefit', 'value'], financials);
    const income_loss_from_continuing_operations_before_tax = getNestedValue(['income_statement', 'income_loss_from_continuing_operations_before_tax', 'value'], financials);

    // is this correct?
    const longTermDebt = getNestedValue(['balance_sheet', 'long_term_debt', 'value'], financials);

    const grossMargin = revenues > 0 ? grossProfit / revenues : 0;
    const netProfitMargin = (netIncomeLoss / revenues) * 100;
    const peRatio = dilutedEarningsPerShare > 0 ? stockPrice / dilutedEarningsPerShare : 0;
    const totalShareHolderEquity = totalAssets - totalLiabilities;
    // may need to add preferred equity calculation if it exists here in order to refine book value per share calculation
    const bookValuePerShare = totalShareHolderEquity / totalShares;
    const pbRatio = stockPrice / bookValuePerShare;
    const peTimesPbRatio = peRatio * pbRatio;
    const debtToEquity = totalEquity > 0 ? totalLiabilities / totalEquity : 0;
    const marketCap = totalShares * stockPrice;
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const ROA = totalAssets > 0 ? netIncomeLoss / totalAssets * 100 : 0;
    const ROE = totalEquity > 0 ? netIncomeLoss / totalEquity * 100 : 0;
    const ROIC = (totalEquity + totalLiabilities) > 0 ? netIncomeLoss / (totalEquity + totalLiabilities) * 100 : 0;
    const SGnA = grossProfit - costsAndExpenses;
    const SGnAMargin = (SGnA / revenues) * 100;
    const researchAndDevelopment = (research_and_development / grossProfit) * 100;
    const incomeTaxExpenses = (income_tax_expense_benefit - income_loss_from_continuing_operations_before_tax) * 100;
    const cashAndDebt = cash > longTermDebt ? 1 : 0;
    // above calculations have been confirmed correct

    // Pass/Fail checks
    const passFailResults = {
        grossMarginCheck1: grossMargin > 0.2 ? 1 : 0,
        grossMarginCheck2: grossMargin > 0.4 ? 1 : 0,
        netProfitMarginCheck1: netProfitMargin > 10 ? 1 : 0,
        netProfitMarginCheck2: netProfitMargin > 20 ? 1 : 0,
        peTimesPbRatioCheck: peTimesPbRatio < 22.5 ? 1 : 0,
        marketCapCheck: marketCap < 250000000 ? 1 : 0,
        currentRatioCheck: currentRatio > 1.5 ? 1 : 0,
        ROACheck: ROA > 20 ? 1 : 0,
        ROECheck: ROE > 15 ? 1 : 0,
        ROICCheck: ROIC > 15 ? 1 : 0,
        SGnAMarginCheck: SGnAMargin < 30 ? 1 : 0,
        researchAndDevelopmentCheck: researchAndDevelopment <= 30 ? 1 : 0,
        incomeTaxExpensesCheck: incomeTaxExpenses > 17 ? 1 : 0,
        cashAndDebtCheck: cashAndDebt
    };

    const totalPasses = Object.values(passFailResults).reduce((sum, value) => sum + value, 0);

    return {
        grossMargin,
        netProfitMargin,
        peRatio,
        pbRatio,
        peTimesPbRatio,
        debtToEquity,
        marketCap,
        currentRatio,
        ROA,
        ROE,
        ROIC,
        SGnA,
        SGnAMargin,
        researchAndDevelopment,
        //depreciationMargin,
        //interestExpense,
        //interestExpenseMargin,
        incomeTaxExpenses,
        //EPSGrowth,
        cashAndDebt,
        //retainedEarningsGrowth,
        //capex,
        //capexMargin
        passFailResults,
        totalPasses
    };
}

app.use(express.static('build'));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.html');
});

app.listen(5001, () => {
    console.log('Microservice server is running on port 5001');
});