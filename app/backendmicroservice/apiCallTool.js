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