"use client";
import React, { CSSProperties, useState } from "react";

// Environment variables for the two backends
const backendApi = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5001";
const pythonBackendApi = process.env.PUBLIC_PYTHON_BACKEND_API || "http://localhost:8001";

const BackendMicroservicePage = () => {
  const [inputValue, setInputValue] = useState("");
  const [tickers, setTickers] = useState(""); // Store tickers as a single string
  const [tableData, setTableData] = useState([]);
  const [csvData, setCsvData] = useState('');
 
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
    </section>
  );
};

export default BackendMicroservicePage;
