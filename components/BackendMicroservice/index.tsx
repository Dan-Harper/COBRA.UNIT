"use client";
import React, { CSSProperties, useState } from 'react';

const BackendMicroservicePage = () => {
  const [inputValue, setInputValue] = useState('');
  const [responseData] = useState(null);
  const [setCsvData] = useState('');
  const [tableData, setTableData] = useState([]);
  const [currency, setCurrency] = useState('COP');

  const styles: Record<string, CSSProperties> = {
    input: {
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px',
      marginBottom: '10px',
      width: '100%',
    },
    button: {
      backgroundColor: 'purple',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '10px 15px',
      cursor: 'pointer',
    },
    spacing: {
      marginTop: '20px',
      marginBottom: '20px',
    },
    largerSpacing: {
      marginTop: '40px',
      marginBottom: '40px',
    },
    tableStyle: {
      borderCollapse: 'collapse',
      width: '100%',
      border: '1px solid #ddd',
      textAlign: 'left',
    },
    th: {
      padding: '8px',
      border: '1px solid #ddd',
      backgroundColor: '#f3f3f3',
    },
    td: {
      padding: '8px',
      border: '1px solid #ddd',
    }
  };

  const responseAttributes = [
    { name: 'status', type: 'string', description: 'The status of this request\'s response.' },
    { name: 'request_id', type: 'string', description: 'A request id assigned by the server.' },
    { name: 'ticker', type: 'object', description: 'The most recent daily bar for this ticker.' },
    { name: 'c', type: 'number', description: 'The close price for the symbol in the given time period.' },
    { name: 'h', type: 'number', description: 'The highest price for the symbol in the given time period.' },
    { name: 'l', type: 'number', description: 'The lowest price for the symbol in the given time period.' },
    { name: 'o', type: 'number', description: 'The open price for the symbol in the given time period.' },
    { name: 'otc', type: 'boolean', description: 'Whether or not this aggregate is for an OTC ticker. This field will be left off if false.' },
    { name: 'v', type: 'number', description: 'The trading volume of the symbol in the given time period.' },
    { name: 'vw', type: 'number', description: 'The volume weighted average price.' },
    { name: 'fmv', type: 'number', description: 'Fair market value, available only on Business plans.' },
    { name: 'lastQuote', type: 'object', description: 'The most recent quote for this ticker, returned if the plan includes quotes.' },
    { name: 'P', type: 'number', description: 'The ask price.' },
    { name: 'S', type: 'integer', description: 'The ask size in lots.' },
    { name: 'p', type: 'number', description: 'The bid price.' },
    { name: 's', type: 'integer', description: 'The bid size in lots.' },
    { name: 't', type: 'integer', description: 'The nanosecond accuracy SIP Unix Timestamp.' },
    { name: 'lastTrade', type: 'object', description: 'The most recent trade for this ticker.' },
    { name: 'c', type: 'array [integer]', description: 'The trade conditions.' },
    { name: 'i', type: 'string', description: 'The Trade ID which uniquely identifies a trade.' },
    { name: 'p', type: 'number', description: 'The price of the trade.' },
    { name: 's', type: 'integer', description: 'The size (volume) of the trade.' },
    { name: 't', type: 'integer', description: 'The nanosecond accuracy SIP Unix Timestamp.' },
    { name: 'x', type: 'integer', description: 'The exchange ID.' },
    { name: 'min', type: 'object', description: 'The most recent minute bar for this ticker.' },
    { name: 'av', type: 'integer', description: 'The accumulated volume.' },
    { name: 'c', type: 'number', description: 'The close price for the symbol in the given time period.' },
    { name: 'h', type: 'number', description: 'The highest price for the symbol in the given time period.' },
    { name: 'l', type: 'number', description: 'The lowest price for the symbol in the given time period.' },
    { name: 'n', type: 'integer', description: 'The number of transactions in the aggregate window.' },
    { name: 'o', type: 'number', description: 'The open price for the symbol in the given time period.' },
    { name: 'otc', type: 'boolean', description: 'Whether or not this aggregate is for an OTC ticker.' },
    { name: 't', type: 'integer', description: 'The Unix Msec timestamp for the start of the aggregate window.' },
    { name: 'v', type: 'number', description: 'The trading volume of the symbol in the given time period.' },
    { name: 'vw', type: 'number', description: 'The volume weighted average price.' },
    { name: 'prevDay', type: 'object', description: 'The previous day\'s bar for this ticker.' },
    { name: 'c', type: 'number', description: 'The close price for the symbol in the given time period.' },
    { name: 'h', type: 'number', description: 'The highest price for the symbol in the given time period.' },
    { name: 'l', type: 'number', description: 'The lowest price for the symbol in the given time period.' },
    { name: 'o', type: 'number', description: 'The open price for the symbol in the given time period.' },
    { name: 'otc', type: 'boolean', description: 'Whether or not this aggregate is for an OTC ticker.' },
    { name: 'v', type: 'number', description: 'The trading volume of the symbol in the given time period.' },
    { name: 'vw', type: 'number', description: 'The volume weighted average price.' },
    { name: 'ticker', type: 'string', description: 'The exchange symbol that this item is traded under.' },
    { name: 'todaysChange', type: 'number', description: 'The value of the change from the previous day.' },
    { name: 'todaysChangePerc', type: 'number', description: 'The percentage change since the previous day.' },
    { name: 'updated', type: 'integer', description: 'The last updated timestamp.' }
  ];

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const parseCSV = (csv) => {

    let lines = csv.split('\n').filter(line => line.trim());
  
    lines = lines.filter(line => !line.startsWith('Values in'));
  
    const headers = lines[0].split(',').map(header => header.trim());
  
    let allData = [];
    for (let i = 1; i < lines.length; i++) {
      const rowValues = lines[i].split(',').map(value => value.trim());
  
      if (rowValues.length !== headers.length) continue;
  
      const rowData = headers.reduce((obj, header, index) => {
        obj[header] = rowValues[index];
        return obj;
      }, {});
  
      allData.push(rowData);
    }
  
    return allData;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/processJSON', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stocks: inputValue, currency }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setCsvData(data.csvData);
        const parsedData = parseCSV(data.csvData);
        setTableData(parsedData);
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  return (
    <section id="backendmicroservice" className="pt-16 md:pt-20 lg:pt-28">
    <form onSubmit={handleSubmit} style={styles.spacing}>
      <label htmlFor="stockInput">Enter Stock Tickers (comma-separated, uppercase)</label>
        
        <input
          type="text"
          id="stockInput"
          name="stocks"
          value={inputValue}
          onChange={handleInputChange}
          style={styles.input}
        />

        <label htmlFor="currencyInput">Convert Dollars to Input Currency:</label>
        <input
          type="text"
          id="currencyInput"
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>Submit</button>
      </form>

      <div style={styles.spacing}>
        <h3>Common Currencies:</h3>
        <ul>
          <li>Colombia - COP</li>
          <li>Canada - CAD</li>
          <li>United Kingdom - GBP</li>
          <li>Japan - JPY</li>
          <li>China - CNY</li>
          <li>India - INR</li>
        </ul>
      </div>

      {responseData && (
        <div>
          <h2>Response from Microservice:</h2>
        </div>
      )}

      {tableData.length > 0 && (
        <div style={styles.largerSpacing}>
          <h2>CSV Data:</h2>
          <table style={styles.tableStyle}>
            <thead>
              <tr>
                {Object.keys(tableData[0]).map(header => (
                  <th key={header} style={styles.th}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx} style={styles.td}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      

      <div style={styles.largerSpacing}>
        <h2>Response Attribute Definitions:</h2>
        <ul>
          {responseAttributes.map(attr => (
            <li key={attr.name}>
              <strong>{attr.name} ({attr.type}):</strong> {attr.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default BackendMicroservicePage;