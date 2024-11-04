const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const parse = require('csv-parse/sync').parse;
const stringify = require('csv-stringify/sync').stringify;
const { spawn } = require('child_process');
const yahooFinance = require('yahoo-finance2').default;

let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

const app = express();

app.use(cors());

app.use(bodyParser.json());

const apiKey = "8sJLC5HFPZM3Nq68mKGInCVToyXiOxpt"

const fetchStockData = async (stockTicker) => {
    const stockApiEndpoint = `https://api.polygon.io/vX/reference/financials?apiKey=${apiKey}&ticker=${stockTicker}`;
    try {
        const response = await fetch(stockApiEndpoint);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const resultWithTicker = {...data.results[0], stockTicker: stockTicker};
            
            const stockDetails = await fetchStockDetails(stockTicker);

            const stockData = {
                ...resultWithTicker,
                ...stockDetails
            }

            return stockData;
        }
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
        return data.results ? data.results.weighted_shares_outstanding : null;
    } catch (error) {
        console.error("Error fetching total shares:", error);
        return null;
    }
};

const getStockBetas = async (symbols) => {
    return new Promise((resolve, reject) => {
        const process = spawn('python', ['C:/Users/Wanderer/Documents/OSU-GT-STANFORD/COBRA.UNIT/app/betaFilter/betaFilter.py', JSON.stringify(symbols)]);
        let result = '';
        process.stdout.on('data', (data) => {
            result += data.toString();
        });
        process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        process.on('close', (code) => {
            if (code === 0) {
                try {
                    if (result.trim() === '') {
                        reject('No output from Python script');
                    } else {
                        resolve(JSON.parse(result));
                    }
                } catch (error) {
                    reject(`Error parsing JSON: ${error.message}`);
                }
            } else {
                reject(`child process exited with code ${code}`);
            }
        });
    });
};

app.post('/api/processJSON', async (req, res) => {

    try {

        const requestData = req.body;
        const stocks = requestData.stocks.split(',').map(stock => stock.trim().toUpperCase());

        const stockDataPromises = stocks.map(async (stock) => {
            const stockData = await fetchStockData(stock);
            if (!stockData) return null;
            console.log(`Fetched stock data for ${stock}:`, stockData);
            console.log(`Stock ticker data for ${stock}:`, stockData.stockTicker)

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

        const fetchedStockData = (await Promise.all(stockDataPromises)).filter(data => data);        
       
        console.log("Fetched stock data:", fetchedStockData);

        const betaData = await getStockBetas(stocks);

        // Add Beta values to stock data
        fetchedStockData.forEach(data => {
            const betaInfo = betaData.find(beta => beta.Stock === data.stockTicker);
            if (betaInfo) {
                data.beta = betaInfo.Beta;
            } else {
                data.beta = null; 
                // Handle case where beta is not available
            }
        });

        let headers = new Set(["Ticker"]);

        let calculatedHeaders = [
            "stockPrice",
            "totalShares",
            "grossMargin",
            "netProfitMargin",
            "peRatio",
            "priceToBookRatio",
            "debtToEquity",
            "marketCap",
            "currentRatio",
            "cashAndCashEquivalents",
            "ROA",
            "returnOnEquity",
            "ROIC",
            "researchAndDevelopment",
            "incomeTaxExpenses",
            "beta",
            "quickRatio",
            "enterpriseValue",
            "enterpriseToRevenue",
            // yahoo finance variables below
            "sector",
            "industry",
            "volume",
            "quoteType",
            "priceVolume",
            "earningsYield"
        ];

        // Generate headers from the fetched data for dynamic financial data
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
            "peTimesPriceToBookRatioCheck",
            "marketCapCheck",
            "currentRatioCheck",
            "ROACheck",
            "returnOnEquityCheck",
            "ROICCheck",
            "researchAndDevelopmentCheck",
            "incomeTaxExpensesCheck",
            "betaCheck",
            "priceVolumeCheck",
            "earningsYieldCheck"
        ];

        let csvHeaders = Array.from(headers).concat(calculatedHeaders).concat(passFailHeaders).concat(['totalPasses']);
        let csvContent = csvHeaders.join(',') + '\n';
        
        // Process each stock's data
        fetchedStockData.forEach(data => {
            if (data) {
                let rowData = [data.stockTicker]

                const revenues = data.financials?.income_statement?.revenues?.value || 0;
                
                const financialMetrics = calculateFinancials(data.financials, data.stock_price, data.total_shares, data.beta, data.volume);

                // Calculating derived fields
                const enterpriseToRevenue = calculateEnterpriseValueToRevenue(
                    financialMetrics.marketCap,
                    financialMetrics.longTermDebt,
                    financialMetrics.cashAndCashEquivalents,
                    revenues
                );
                
                const enterpriseValue = financialMetrics.marketCap + financialMetrics.longTermDebt - financialMetrics.cashAndCashEquivalents;
                
                // Append financial data for each header
                csvHeaders.forEach(header => {
                    if (header === 'Ticker') {
                        // Ticker has already been handled
                    } else if (header === 'stockPrice') {
                        rowData.push(data.stock_price !== undefined ? data.stock_price : 'N/A');
                    } else if (header === 'totalShares') {
                        rowData.push(data.total_shares !== undefined ? data.total_shares : 'N/A');
                    } else if (header === 'beta') {
                        rowData.push(data.beta !== undefined ? data.beta : 'N/A');
                    } else if (header === 'cashAndCashEquivalents') {
                        rowData.push(financialMetrics.cashAndCashEquivalents !== undefined ? financialMetrics.cashAndCashEquivalents : 'N/A');
                    } else if (header === 'enterpriseValue') {
                        rowData.push(enterpriseValue !== 'N/A' ? enterpriseValue : 'N/A');
                    } else if (header === 'enterpriseToRevenue') {
                        rowData.push(enterpriseToRevenue !== 'N/A' ? enterpriseToRevenue : 'N/A');
                    } else if (header === 'quickRatio') {
                        rowData.push(data.quickRatio !== undefined ? data.quickRatio : 'N/A');
                    } else if (['sector', 'industry', 'volume', 'quoteType'].includes(header)) {
                            rowData.push(data[header] !== undefined ? data[header] : 'N/A');
                    }  else if (financialMetrics[header] !== undefined) {
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
                console.log(`Row data for ${data.stockTicker}:`, rowData.join(','));
                csvContent += stringify([rowData], { quoted: true });
            } else {
                console.log(`No data available for one of the stocks.`);
            }
        });
    
        

        // Write the CSV content to a file
        const outputFilePath = 'C:/Users/Wanderer/Documents/OSU-GT-STANFORD/COBRA.UNIT/!README/pqrOutput.csv';
        fs.writeFile(outputFilePath, csvContent, async (err) => {
            if (err) {
                console.error("Error writing file:", err);
                res.status(500).send('Error writing CSV file');
                return;
            }

            console.log('CSV written.');
            await sortAndRewriteCSV(outputFilePath);
            fs.readFile(outputFilePath, 'utf8', (err, data) => {
                if (err) {
                    console.error("Error reading sorted CSV:", err);
                    res.status(500).send('Error reading sorted CSV file');
                    return;
                }
                console.log('CSV sorted and read successfully.');
                res.json({ data });
            });
        });
    } catch (error) {
        console.error("Error during processing:", error);
        res.status(500).send('Internal Server Error');
    }
});


function calculateFinancials(financials, stockPrice, totalShares, beta, volume) {
    
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
    const inventory = getNestedValue(['balance_sheet', 'inventory', 'value'], financials);
    const longTermDebt = getNestedValue(['balance_sheet', 'long_term_debt', 'value'], financials);
    const accountsReceivable = getNestedValue(['balance_sheet', 'accounts_receivable', 'value'], financials);
    const otherCurrentAssets = getNestedValue(['balance_sheet', 'other_current_assets', 'value'], financials);
    // remove this if debt to equity is fixed const debt = currentLiabilities / noncurrent_liabilities;
    const costsAndExpenses = getNestedValue(['income_statement', 'costs_and_expenses', 'value'], financials);
    const research_and_development = getNestedValue(['income_statement', 'research_and_development', 'value'], financials);
    const income_tax_expense_benefit = getNestedValue(['income_statement', 'income_tax_expense_benefit', 'value'], financials);
    const income_loss_from_continuing_operations_before_tax = getNestedValue(['income_statement', 'income_loss_from_continuing_operations_before_tax', 'value'], financials);
    const income_loss_from_continuing_operations_after_tax = getNestedValue(['income_statement', 'income_loss_from_continuing_operations_after_tax', 'value'], financials);

    const quickRatio = currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0;
    
    let cashAndCashEquivalents;
    if (currentAssets !== undefined && inventory !== undefined && accountsReceivable !== undefined && otherCurrentAssets !== undefined) {
        cashAndCashEquivalents = currentAssets - inventory - accountsReceivable - otherCurrentAssets;
    } else {
        cashAndCashEquivalents = 'N/A';
    }

    const grossMargin = revenues > 0 ? grossProfit / revenues : 0;
    const netProfitMargin = (netIncomeLoss / revenues) * 100;
    const peRatio = dilutedEarningsPerShare > 0 ? stockPrice / dilutedEarningsPerShare : 0;
    const totalShareHolderEquity = totalAssets - totalLiabilities;
    // may need to add preferred equity calculation if it exists here in order to refine book value per share calculation
    const bookValuePerShare = totalShareHolderEquity / totalShares;
    const priceToBookRatio = stockPrice / bookValuePerShare;
    const peTimesPriceToBookRatio = peRatio * priceToBookRatio;
    const debtToEquity = totalEquity > 0 ? totalLiabilities / totalEquity : 0;
    const marketCap = totalShares * stockPrice;
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const ROA = totalAssets > 0 ? netIncomeLoss / totalAssets * 100 : 0;
    const returnOnEquity = totalEquity > 0 ? netIncomeLoss / totalEquity * 100 : 0;
    const ROIC = (totalEquity + longTermDebt) > 0 ? income_loss_from_continuing_operations_after_tax / (totalEquity + longTermDebt) * 100 : 0;
    const priceVolume = stockPrice && volume ? stockPrice * volume : 'N/A';
    // check if this is correct
    const researchAndDevelopment = (research_and_development / grossProfit) * 100;
    // this calculates the tax rate, however how to confirm they are paying their fair share?
    const incomeTaxExpenses = (income_tax_expense_benefit / income_loss_from_continuing_operations_before_tax) * 100;
    const earningsYield = stockPrice > 0 && dilutedEarningsPerShare > 0 ? (dilutedEarningsPerShare / stockPrice) * 100 : 'N/A';

    // Pass/Fail checks
    const passFailResults = {
        grossMarginCheck1: grossMargin > 0.2 ? 1 : 0,
        grossMarginCheck2: grossMargin > 0.4 ? 1 : 0,
        netProfitMarginCheck1: netProfitMargin > 10 ? 1 : 0,
        netProfitMarginCheck2: netProfitMargin > 20 ? 1 : 0,
        peTimesPriceToBookRatioCheck: peTimesPriceToBookRatio < 22.5 ? 1 : 0,
        marketCapCheck: marketCap > 350000000 ? -10 : 0,
        currentRatioCheck: currentRatio > 1.5 ? 1 : 0,
        ROACheck: ROA > 20 ? 1 : 0,
        returnOnEquityCheck: returnOnEquity > 15 ? 1 : 0,
        ROICCheck: ROIC > 15 ? 1 : 0,
        researchAndDevelopmentCheck: researchAndDevelopment <= 30 ? 1 : 0,
        incomeTaxExpensesCheck: incomeTaxExpenses > 13 ? 1 : 0,
        betaCheck: beta !== undefined && beta >= 0.6 && beta <= 0.8 ? 1 : 0,
        priceVolumeCheck: priceVolume < 1000000 ? 1 : 0,
        earningsYieldCheck: earningsYield !== 'N/A' && earningsYield > 6 ? 3 : 0
    };

    const totalPasses = Object.values(passFailResults).reduce((sum, value) => sum + value, 0);

    return {
        cashAndCashEquivalents,
        longTermDebt,
        quickRatio,
        grossMargin,
        netProfitMargin,
        peRatio,
        priceToBookRatio,
        peTimesPriceToBookRatio,
        debtToEquity,
        marketCap,
        currentRatio,
        ROA,
        returnOnEquity,
        ROIC,
        researchAndDevelopment,
        //depreciationMargin,
        //interestExpense,
        //interestExpenseMargin,
        incomeTaxExpenses,
        //EPSGrowth,
        //retainedEarningsGrowth,
        //capex,
        //capexMargin
        priceVolume,
        earningsYield: earningsYield !== 'N/A' ? `${earningsYield.toFixed(2)}%` : 'N/A',
        passFailResults,
        totalPasses
    };
}

const fetchStockDetails = async (stockTicker) => {
    try {
        const stockInfo = await yahooFinance.quoteSummary(stockTicker, { modules: ['summaryProfile', 'price'] });

        const stockDetails = {
            ticker: stockTicker,
            sector: stockInfo.summaryProfile.sector || 'N/A',
            industry: stockInfo.summaryProfile.industry || 'N/A',
            volume: stockInfo.price.regularMarketVolume || 'N/A',
            quoteType: stockInfo.price.quoteType || 'N/A',
        };

        return stockDetails;
    } catch (error) {
        console.error("Error fetching stock details:", error);
        return null;
    }
};

const calculateEnterpriseValueToRevenue = (marketCap, longTermDebt, cashAndCashEquivalents, revenues) => {
    const enterpriseValue = marketCap + longTermDebt - cashAndCashEquivalents;
    return revenues > 0 ? enterpriseValue / revenues : 'N/A';
};

// Function to read, sort, and rewrite the CSV
async function sortAndRewriteCSV(filePath) {
    try {
        fs.readFile(filePath, 'utf8', (err, csvData) => {
            if (err) {
                throw err;
            }
            const records = parse(csvData, {
                columns: true,
                skip_empty_lines: true
            });

            records.sort((a, b) => Number(b.totalPasses) - Number(a.totalPasses));

            const sortedCsv = stringify(records, { header: true });
            fs.writeFile(filePath, sortedCsv, (err) => {
                if (err) {
                    throw err;
                }
                console.log('CSV has been sorted and rewritten based on totalPasses.');
            });
        });
    } catch (error) {
        console.error('Failed to read, sort, or write the CSV:', error);
    }
}

app.use(express.static('build'));

app.get('*', (req, res) => {
    res.sendFile(__dirname + '/build/index.d.ts');
});

app.listen(5001, () => {
    console.log('Microservice server is running on port 5001');
});
