import React, { useState } from 'react';
import SectionTitle from '../Common/SectionTitle';


const BackendMicroservicePage = () => {
  const [inputValue, setInputValue] = useState('');
  const [responseData, setResponseData] = useState(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a POST request to the microservice with the JSON data
      const response = await fetch('http://localhost:5001/api/processJSON', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stocks: inputValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setResponseData(data);
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <section id="backend-microservice" className="pt-16 md:pt-20 lg:pt-28">
      {/* ... Your existing content ... */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="stockInput">Enter Stock Tickers (comma-separated, uppercase)</label>
        <input
          type="text"
          id="stockInput"
          name="stocks"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button type="submit">Submit</button>
      </form>
      {responseData && (
        <div>
          <h2>Response from Microservice:</h2>
          <table>
            <thead>
              <tr>
                {/* Create table headers from the keys of the first data object */}
                {Object.keys(responseData.data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responseData.data.map((row, index) => (
                <tr key={index}>
                  {/* Create table rows with data */}
                  {Object.values(row).map((value, index) => (
                    <td key={index}>{String(value)}</td>                  ))}
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