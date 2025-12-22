"use client";
import React, { CSSProperties, useState } from "react";

// Environment variables for the two backends
const backendApi = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5001";
const pythonBackendApi = process.env.PUBLIC_PYTHON_BACKEND_API || "http://localhost:8001";

const BackendMicroservicePage = () => {
  const [inputValue, setInputValue] = useState("");
  const [tickers, setTickers] = useState("");
  const [tableData, setTableData] = useState([]);
  const [csvData, setCsvData] = useState('');
  const [password, setPassword] = useState("");
  const [hashedPassword, setHashedPassword] = useState("");
  const [ticker, setTicker] = useState("");
  const [lookbacksResult, setLookbacksResult] = useState("");
  const [storedTickersResult, setStoredTickersResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const styles: Record<string, CSSProperties> = {
    title: {
      fontSize: "2rem",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "20px",
      color: "white",
    },
    input: {
      border: "1px solid #ccc",
      borderRadius: "4px",
      padding: "8px",
      marginBottom: "10px",
      width: "100%",
    },
    button: {
      backgroundColor: "purple",
      color: "white",
      border: "none",
      borderRadius: "4px",
      padding: "10px 15px",
      cursor: "pointer",
    },
    spacing: {
      marginTop: "20px",
      marginBottom: "20px",
    },
    responseBox: {
      whiteSpace: "pre-wrap",
      backgroundColor: "purple",
      padding: "10px",
      borderRadius: "5px",
      marginTop: "10px",
    },
    link: {
      display: "block",
      textAlign: "center",
      fontSize: "1.5rem",
      color: "#007bff",
      textDecoration: "underline",
      fontWeight: "bold",
      marginBottom: "20px",
    },
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordHashing = async (e) => {
    e.preventDefault();
    try {
      console.log("Calling Password Hash API:", `${pythonBackendApi}/hash-password`);
      const response = await fetch(`${pythonBackendApi}/hash-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setHashedPassword(data.hashed_password); // Store hashed password in state
      } else {
        console.error("Error hashing password:", response.statusText);
      }
    } catch (error) {
      console.error("Error hashing password:", error);
    }
  };

  const handleTickerChange = (e) => {
    setTicker(e.target.value);
  };

  const handleCompareLookbacks = async (e) => {
    e.preventDefault();
    try {
      console.log("Calling Compare Lookbacks API:", `${pythonBackendApi}/compare-lookbacks`);
      const response = await fetch(`${pythonBackendApi}/compare-lookbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });

      if (response.ok) {
        const data = await response.json();
        setLookbacksResult(JSON.stringify(data, null, 2)); // Format JSON for display
      } else {
        console.error("Error fetching lookbacks data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching lookbacks data:", error);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleScraperSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Calling Scraper API:", `${pythonBackendApi}/scrape`);
      const response = await fetch(`${pythonBackendApi}/scrape`, {
        method: "POST",
      });

      if (response.ok) {
        const tickersResponse = await response.text(); // Fetch tickers as a single string
        setTickers(tickersResponse); // Set tickers directly as the string
      } else {
        console.error("Error fetching scraper data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching scraper data:", error);
    }
  };

  const copyTickersToClipboard = () => {
    navigator.clipboard.writeText(tickers).then(
      () => {
        alert("Tickers copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const handleProcessStoredTickers = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStoredTickersResult("Processing stored tickers... This may take several minutes.");

    try {
      console.log("Calling Process Stored Tickers API:", `${backendApi}/api/processStoredTickers`);
      const response = await fetch(`${backendApi}/api/processStoredTickers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setStoredTickersResult(
          `Success! Processed ${data.totalProcessed} tickers across ${data.totalBatches} batches.\n\nCSV Output:\n${data.data}`
        );
        const parsedData = parseCSV(data.data);
        setTableData(parsedData);
      } else {
        const errorText = await response.text();
        console.error("Error processing stored tickers:", response.statusText);
        setStoredTickersResult(`Error: ${response.statusText}\n${errorText}`);
      }
    } catch (error) {
      console.error("Error processing stored tickers:", error);
      setStoredTickersResult(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSV = (csv) => {
    const lines = csv.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((header) => header.trim());

    const allData = [];
    for (let i = 1; i < lines.length; i++) {
      const rowValues = lines[i].split(",").map((value) => value.trim());
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
      console.log("Calling Main Backend API:", `${backendApi}/api/processJSON`);
      const response = await fetch(`${backendApi}/api/processJSON`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stocks: inputValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setCsvData(data.csvData);
        const parsedData = parseCSV(data.csvData);
        setTableData(parsedData);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <section id="backendmicroservice" className="pt-16 md:pt-20 lg:pt-28">
      <h1 style={styles.title}>PQR Technical Document</h1>
      <a 
        href="https://docs.google.com/document/d/1UIe2nRIo6l14IjHAFvFOoj8VAlo474KQgGPuX_zicsE/edit?tab=t.0" 
        target="_blank" 
        rel="noopener noreferrer"
        style={styles.link}
      >
        PQR Technical Document
      </a>
      
      <h1 style={styles.title}>PQR Scrapers</h1>
      <form onSubmit={handleScraperSubmit} style={styles.spacing}>
        <button type="submit" style={styles.button}>
          Run Scrapers
        </button>
      </form>
      {tickers && (
        <div>
          <div style={styles.responseBox}>
            {tickers}
          </div>
          <div style={{ marginTop: "20px" }}>
            <button onClick={copyTickersToClipboard} style={styles.button}>
              Copy Tickers
            </button>
          </div>
        </div>
      )}

      <h1 style={styles.title}>Process Stored Tickers</h1>
      <form onSubmit={handleProcessStoredTickers} style={styles.spacing}>
        <button type="submit" style={styles.button} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Process Stored Tickers from Batches"}
        </button>
      </form>
      {storedTickersResult && (
        <div style={styles.responseBox}>
          <strong>Result:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '400px', overflow: 'auto' }}>
            {storedTickersResult}
          </pre>
        </div>
      )}

      <h1 style={styles.title}>PQR Radar</h1>
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
        <button type="submit" style={styles.button}>
          Submit
        </button>
      </form>

      {tableData.length > 0 && (
        <div style={styles.spacing}>
          <h2>CSV Data:</h2>
          <table>
            <thead>
              <tr>
                {Object.keys(tableData[0]).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h1 style={styles.title}>Compare Lookbacks</h1>
      <form onSubmit={handleCompareLookbacks} style={styles.spacing}>
        <label htmlFor="tickerInput">Enter Stock Ticker:</label>
        <input
          type="text"
          id="tickerInput"
          value={ticker}
          onChange={handleTickerChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Compare Lookbacks
        </button>
      </form>

      {lookbacksResult && (
        <div style={styles.responseBox}>
          <strong>Lookbacks Result:</strong>
          <pre>{lookbacksResult}</pre>
        </div>
      )}

      <h1 style={styles.title}>Password Hash Feature</h1>
      <form onSubmit={handlePasswordHashing} style={styles.spacing}>
        <label htmlFor="passwordInput">Password:</label>
        <input
          type="password"
          id="passwordInput"
          value={password}
          onChange={handlePasswordChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Hash Password
        </button>
      </form>

      {hashedPassword && (
        <div style={styles.responseBox}>
          <strong>Hashed Password:</strong>
          <p>{hashedPassword}</p>
        </div>
      )}
    </section>
  );
};

export default BackendMicroservicePage;
