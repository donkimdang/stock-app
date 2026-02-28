import { useState, useEffect, useRef } from 'react';

function App() {
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [symbol, setSymbol] = useState("");
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);

  const intervalRef = useRef(null);

  const fetchStock = async () => {
    const apiKey = 'd51o8hhr01qiituq2lh0d51o8hhr01qiituq2lhg';
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const newRow = {
        symbol: symbol,
        open: data.o,
        high: data.h,
        low: data.l,
        current: data.c,
        previous: data.pc,
        time: new Date().toLocaleTimeString()
      };

      setRows(prev => [...prev, newRow]);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symbol) return;

    await fetchStock();

    const totalMs = (parseInt(minutes) || 0) * 60000 + (parseInt(seconds) || 0) * 1000;
    if (totalMs > 0) {
      setRunning(true);
    }
  };

  const handleStop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  };

  const handleRefresh = () => {
    if (symbol) fetchStock();
  };

  useEffect(() => {
    if (running) {
      const totalMs = (parseInt(minutes) || 0) * 60000 + (parseInt(seconds) || 0) * 1000;
      intervalRef.current = setInterval(() => {
        fetchStock();
      }, totalMs);
    }

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  return (
    <div>
      <h1>Stock Price Tracker</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Minutes"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          min="0"
        />
        <input
          type="number"
          placeholder="Seconds"
          value={seconds}
          onChange={(e) => setSeconds(e.target.value)}
          min="0"
        />
        <input
          placeholder="Stock Symbol (e.g. AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        />
        <button type="submit">Submit</button>
      </form>

      <div>
        {running && <button onClick={handleStop}>Stop</button>}
        {symbol && <button onClick={handleRefresh}>Refresh</button>}
      </div>

      <table border="1">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Open Price</th>
            <th>High Price</th>
            <th>Low Price</th>
            <th>Current Price</th>
            <th>Previous Close Price</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.symbol}</td>
              <td>{row.open}</td>
              <td>{row.high}</td>
              <td>{row.low}</td>
              <td>{row.current}</td>
              <td>{row.previous}</td>
              <td>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {running && (
        <p>Auto-refreshing every {minutes || "0"}m {seconds || "0"}s</p>
      )}
    </div>
  );
}

export default App;
