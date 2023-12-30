"use client";
import React, { CSSProperties, useState } from 'react';

const BackendMicroservicePage = () => {
  const [inputValue, setInputValue] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [csvData, setCsvData] = useState('');
  const [tableData, setTableData] = useState([]);

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

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const parseCSV = (csv) => {
    let lines = csv.split('\n').filter(line => line.trim());
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
        body: JSON.stringify({ stocks: inputValue }),
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

        <button type="submit" style={styles.button}>Submit</button>
      </form>

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
    </section>
  );
};

export default BackendMicroservicePage;