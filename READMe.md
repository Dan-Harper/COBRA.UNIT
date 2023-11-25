Stock Ticker Get Close Price and Open Price

Clone Repo

Search CSV file path, change file path to a local CSV, this will be written to, in order to save state.

Open terminal.
    npm run build
    npm run start-dev

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

const axios = require('axios');

const requestData = {
  stocks: 'AAPL,MSFT,GOOGL'
};

axios.post('http://localhost:5001/api/processJSON', requestData, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log(response.data);
})
.catch(error => {
  console.error('Error:', error);
});

**Instructions for how to programmatically RECEIVE data**
1. Receive data response:
    A JSON response will be sent back upon success.
2. Handle the JSON Resposne
    Parse the JSON for data.

Example call:

axios.post('http://localhost:5001/api/processJSON', requestData, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  const responseData = response.data;
  // Process the received data
  console.log('Received Data:', responseData);
})
.catch(error => {
  console.error('Error:', error);
});

**UML sequence diagram**
![image](https://github.com/Dan-Harper/CS-361/assets/91751962/e63c2f75-14ae-401d-ae18-894c338d72b9)
