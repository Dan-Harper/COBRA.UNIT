

Gross Margin = Gross Profit / Revenue
Rule: Check 40% or higher

Net Profit Margin = (revenue - cost) / revenue 
Rule: Check 20% or higher
Great companies convert 20% or more of their revenue into net income.



SG&A Margin = SG&A Expense / Gross Profit
Rule: check 30% or lower

R&D = R&D Expense / Gross Profit
Rule: Check 30% or lower 

Depreciation Margin = Depreciation / Gross Profit
Rule: check 10% or lower
Logic: Buffett doesn't like businesses that need to invest in depreciating assets to maintain their competitive advantage.

Interest Expense Margin = Interest Expense / Operating Income
Rule: check 15% or lower
Great businesses don’t need debt to finance themselves.

Income Tax Expenses = Taxes Paid / Pre-Tax Income
Rule: Current Corporate Tax Rate
Great businesses are so profitable that they are forced to pay their full tax load.

Earnings Per Share Growth = Year 2 EPS / Year 1 EPS
Rule: Positive & Growing
Great companies increase profits every year.

BALANCE SHEET:
Cash & Debt = Cash > Debt
Rule: More cash than debt
Great companies don't need debt to fund themselves.
Great companies generate lots of cash without needing much debt.

Retained Earnings
Equation: Year 1 / Year 2
Rule: Consistent growth
Great companies grow retained earnings each year.

CASH FLOW STATEMENT:
Capex Margin = Capex / Net Income
Rule: <25%
Great companies don't need much equipment to generate profits.

Create program for CSV approach calling 
  to API then filtering within CSV file

Chris's idea in repository, to track the stocks from each weeks
   only from the first week the stock showed up on the radar,
   track the performance each week from initial price to the price of that week
   


Business Plan Template:
https://docs.google.com/document/d/1rTTs8mAV_Xm1djpKt5V8kxhtzgeFxRgeIywu_FvP72k/edit


Moving to a Database and ML-Based Architecture:
Steps:

    Data Collection: Use an API like Alpha Vantage, IEX Cloud, or similar to fetch stock financial metrics.
    Data Storage: Store this data in a relational database like MySQL or a time-series database like InfluxDB.
    Data Preprocessing: Normalize and clean the data. Calculate additional financial metrics if needed.
    Feature Selection: Choose relevant features like P/E ratios, trading volumes, 52-week highs/lows, etc., based on your hypothesis or prior research.
    Model Training: Train machine learning models (e.g., Random Forests, SVM, Neural Networks) on historical data.
    Backtesting: Simulate the model's performance on historical data to assess its predictive accuracy.
    Evaluation and Iteration: Evaluate metrics like Sharpe ratios, drawdown, and overall return. Refine the model accordingly.

Relevant Data:
Read research to see what data is most relevant to collect and train the model with

    Price and Volume Data: Open, Close, High, Low, Volume
    Financial Statements: Income Statement, Balance Sheet, Cash Flow
    Ratios: P/E, P/B, Debt-to-Equity
    Technical Indicators: Moving Averages, RSI, MACD

Daily Trading Decisions:

After training and backtesting, your model should be capable of making predictions on whether a stock will go up or down. Every day:

    Fetch the latest data for the stocks you're monitoring.
    Preprocess this data in the same way as your training data.
    Run the preprocessed data through your trained model.
    The model should output buy/sell/hold signals for the stocks based on your threshold criteria.


Create signup for emails, and email list.

Build infrastructure that tracks when users lasted used the service, we want an email to be sent every two weeks per email list.

From email list, will send updates for the service

Build an infrastructure that allows for A/B testing of users!
   Like Duolingo
   It is alright to launch A/B testing that fails, the majority will fail, and this is alright.




Invite everyone we know who works in finance and who we want to recruit
    to Friday night events, give product to user, give phone number,
     ask if they have feedback on the product to text us, and I will text them asking for feedback 
     on the product

Plaid pitched to 100 VCs

VCs take startups more serious if you already are in the Silicon Valley and pitching