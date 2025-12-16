import React, { useEffect, useState } from "react";
import Papa from "papaparse";

const AllCryptoTable = () => {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");

  const fetchAllCoins = async () => {
    const res = await fetch("https://indodax.com/api/tickers");
    const data = await res.json();

    const formatted = Object.entries(data.tickers).map(
      ([symbol, value]) => ({
        symbol: symbol.toUpperCase(),
        last: value.last,
        high: value.high,
        low: value.low,
        vol_idr: value.vol_idr,
        vol_coin: value.vol_coin,
      })
    );

    setCoins(formatted);
  };

  useEffect(() => {
    fetchAllCoins();
    const interval = setInterval(fetchAllCoins, 10000); // refresh 10 detik
    return () => clearInterval(interval);
  }, []);

  // Filter search
  const filteredCoins = coins.filter(c =>
    c.symbol.includes(search.toUpperCase())
  );

  // Download CSV
  const downloadCSV = () => {
    const csv = Papa.unparse(filteredCoins);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "indodax_all_coin.csv";
    link.click();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>All Crypto Indodax</h2>

      <input
        placeholder="Cari coin (BTC, ETH...)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginRight: 10 }}
      />

      <button onClick={downloadCSV}>Download CSV</button>

      <table border="1" cellPadding="6" style={{ marginTop: 15 }}>
        <thead>
          <tr>
            <th>Pair</th>
            <th>Last Price</th>
            <th>High</th>
            <th>Low</th>
            <th>Volume IDR</th>
            <th>Volume Coin</th>
          </tr>
        </thead>
        <tbody>
          {filteredCoins.map((coin, i) => (
            <tr key={i}>
              <td>{coin.symbol}</td>
              <td>Rp {Number(coin.last).toLocaleString("id-ID")}</td>
              <td>Rp {Number(coin.high).toLocaleString("id-ID")}</td>
              <td>Rp {Number(coin.low).toLocaleString("id-ID")}</td>
              <td>{Number(coin.vol_idr).toLocaleString("id-ID")}</td>
              <td>{coin.vol_coin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllCryptoTable;
