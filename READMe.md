Stock Ticker Get Close Price and Open Price

Clone Repo

Search 'const outputFilePath' you will find the file in backend-microservice.js,
 change file path to a local CSV, this will be written to, in order to save state.

Open apiCallTool.js
  From root file, open app, open backendmicroservice, open apiCallTool.js, feel free to edit with stock tickers within data.
  const data = { stocks : "GOOG, AAPL, AMZN }
  Save file.

Open terminal from root file.
  npm run start-backend

Open a new terminal from root file.
  cd app
  cd backendmicroservice
  node apiCallTool.js

The API call from apiCallTool.js to backend-microservice.js should be complete.

You will have a returned JSON in the apiCallTool.js terminal.

Also, you will have a CSV in your pqrOutput.csv that wrote the data from the stock tickers API call.

I will add the connection to the front end soon, I am fixing a bug for backend and front end running at the same time.




If the front end is not at 3000 local port and back end is not at 5001 local port,
    send a message to Dan to resolve.

Open browser.

http://localhost:3000/

Click menu

Click Back page

Enter stock tickers in capital letters separated by commas, click submit. 

Result will be returned in GUI, also those stocks and values are written to the CSV file path.



**Communication Contract to use Stock Ticker Get Close Price and Open Price**

**Instruction for how to programatically REQUEST data**
1. Prepare the Request URL and data:
   To request data you will need to send a POST request to the endpoint 'http://localhost:5001/api/processJSON'
   along with the data of stock or stocks in a JSON.
2. You will need to make the POST request.

Example call in JavaScript

(async () => {
    const fetch = (await import('node-fetch')).default;

    const url = 'http://localhost:5001/api/processJSON';
    const data = { stocks: "GOOG, AAPL" };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error:', error);
    }
})();

**Instructions for how to programmatically RECEIVE data**
1. Receive data response:
    A JSON response will be sent back upon success.
2. Handle the JSON Response.
    Parse the JSON for data.

Example call:

const url = 'http://localhost:5001/api/processJSON';
const requestData = { stocks: "GOOG, AAPL" };

async function makeApiCall() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });
        const responseData = await response.json();
        console.log('Received Data:', responseData);
    } catch (error) {
        console.error('Error:', error);
    }
}
makeApiCall();

**UML sequence diagram**
![image](https://github.com/Dan-Harper/CS-361/assets/91751962/e63c2f75-14ae-401d-ae18-894c338d72b9)
