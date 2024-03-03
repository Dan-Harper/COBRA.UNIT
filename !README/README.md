Stock Tickers Get Financial Data

Clone Repo

Install Node on your computer. You can check if installed with command prompt: node -v

Open terminal at root of folder: npm install express

Search 'const outputFilePath' you will find the file in backend-microservice.js,
 change file path to your local CSV, this will be written to, in order to save state.

Open terminal from root folder file.
  npm run build
  npm run start-dev

Open browser.

http://localhost:3000/

Click menu

Click Back page

Enter stock tickers in capital letters separated by commas, click submit. 

Result will be returned in GUI, also those stocks and values are written to the CSV file path.

You can go to terminal and control to end website