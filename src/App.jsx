import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const App = () => {
  const [tickers, setTickers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [days, setDays] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [realtimeMode, setRealtimeMode] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [useFallbackData, setUseFallbackData] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Fallback data untuk demo jika API tidak bisa diakses
  const fallbackData = {
    "btc_idr": {
      "high": "975000000",
      "low": "920000000",
      "vol_btc": "450.12345678",
      "vol_idr": "425000000000",
      "last": "950000000",
      "buy": "949500000",
      "sell": "950500000",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Bitcoin"
    },
    "eth_idr": {
      "high": "65000000",
      "low": "58000000",
      "vol_eth": "1250.543210",
      "vol_idr": "75000000000",
      "last": "62000000",
      "buy": "61900000",
      "sell": "62100000",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Ethereum"
    },
    "bnb_idr": {
      "high": "9500000",
      "low": "8800000",
      "vol_bnb": "3500.123456",
      "vol_idr": "32000000000",
      "last": "9200000",
      "buy": "9190000",
      "sell": "9210000",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Binance Coin"
    },
    "ada_idr": {
      "high": "12500",
      "low": "11000",
      "vol_ada": "50000.123456",
      "vol_idr": "550000000",
      "last": "12000",
      "buy": "11950",
      "sell": "12050",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Cardano"
    },
    "xrp_idr": {
      "high": "9500",
      "low": "8500",
      "vol_xrp": "75000.543210",
      "vol_idr": "650000000",
      "last": "9000",
      "buy": "8950",
      "sell": "9050",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Ripple"
    },
    "sol_idr": {
      "high": "2500000",
      "low": "2200000",
      "vol_sol": "5000.123456",
      "vol_idr": "11500000000",
      "last": "2350000",
      "buy": "2345000",
      "sell": "2355000",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Solana"
    },
    "doge_idr": {
      "high": "1500",
      "low": "1300",
      "vol_doge": "1000000.123456",
      "vol_idr": "1400000000",
      "last": "1400",
      "buy": "1395",
      "sell": "1405",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Dogecoin"
    },
    "dot_idr": {
      "high": "85000",
      "low": "78000",
      "vol_dot": "15000.123456",
      "vol_idr": "1250000000",
      "last": "82000",
      "buy": "81900",
      "sell": "82100",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Polkadot"
    },
    "matic_idr": {
      "high": "12000",
      "low": "10500",
      "vol_matic": "50000.123456",
      "vol_idr": "550000000",
      "last": "11500",
      "buy": "11450",
      "sell": "11550",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Polygon"
    },
    "avax_idr": {
      "high": "550000",
      "low": "480000",
      "vol_avax": "12000.123456",
      "vol_idr": "6000000000",
      "last": "520000",
      "buy": "519000",
      "sell": "521000",
      "server_time": Math.floor(Date.now() / 1000),
      "name": "Avalanche"
    }
  };

  // CORS proxy options untuk development
  const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/'
  ];

  // Fetch realtime tickers data dengan CORS proxy
  const fetchTickers = useCallback(async () => {
    try {
      let data;
      
      if (useFallbackData) {
        // Gunakan fallback data untuk demo
        data = { tickers: fallbackData };
      } else {
        // Coba berbagai proxy CORS
        let lastError = null;
        
        for (const proxy of CORS_PROXIES) {
          try {
            const url = `${proxy}${encodeURIComponent('https://indodax.com/api/tickers')}`;
            
            const response = await fetch(url, {
              headers: {
                'Accept': 'application/json',
              },
              mode: 'cors'
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            data = await response.json();
            break;
          } catch (err) {
            lastError = err;
            continue;
          }
        }
        
        if (!data) {
          setUseFallbackData(true);
          data = { tickers: fallbackData };
        }
      }
      
      setTickers(data.tickers);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setUseFallbackData(true);
      setTickers(fallbackData);
      setError('Menggunakan data demo. Untuk data realtime, silakan setup CORS proxy.');
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [useFallbackData]);

  // Fetch historical data for selected coin
  const fetchHistoricalData = async (pair, daysToFetch) => {
    if (!pair) return;
    
    try {
      const currentData = tickers[pair];
      if (!currentData) return;
      
      const basePrice = parseFloat(currentData.last) || 1000000;
      const simulatedData = [];
      const today = new Date();
      
      for (let i = daysToFetch; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        const dayVariation = (daysToFetch - i) / daysToFetch;
        const randomFactor = 0.9 + Math.random() * 0.2;
        const trendFactor = 1 + (dayVariation * 0.1);
        
        const price = basePrice * randomFactor * trendFactor;
        const volume = (parseFloat(currentData.vol_idr) || 1000) * randomFactor;
        
        simulatedData.push({
          date: date.toLocaleDateString('id-ID', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }),
          timestamp: date.getTime(),
          high: price * (1.02 + Math.random() * 0.03),
          low: price * (0.95 + Math.random() * 0.03),
          open: price * (0.98 + Math.random() * 0.02),
          close: price,
          volume: volume,
          pair: pair
        });
      }
      
      setHistoricalData(simulatedData);
    } catch (err) {
      console.error('Error generating historical data:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTickers();
    
    let interval;
    if (realtimeMode) {
      interval = setInterval(fetchTickers, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchTickers, realtimeMode]);

  // Fetch historical data when selected coin or days change
  useEffect(() => {
    if (selectedCoin) {
      fetchHistoricalData(selectedCoin, days);
    }
  }, [selectedCoin, days, tickers]);

  // Handle coin selection
  const handleCoinSelect = (coinPair) => {
    setSelectedCoin(coinPair);
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Prepare data for CSV download
  const prepareCSVData = () => {
    const csvRows = [];
    const headers = ['Pair', 'Nama', 'Last Price', 'Buy', 'Sell', 'High', 'Low', 'Volume IDR', 'Volume Coin', 'Server Time'];
    csvRows.push(headers.join(','));
    
    Object.entries(tickers).forEach(([pair, data]) => {
      const row = [
        pair,
        data.name || pair.split('_')[0].toUpperCase(),
        data.last,
        data.buy,
        data.sell,
        data.high,
        data.low,
        data.vol_idr || 0,
        data[`vol_${pair.split('_')[0]}`] || data.vol_btc || data.vol_usdt || 0,
        new Date(data.server_time * 1000).toISOString()
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  };

  // Download CSV
  const downloadCSV = () => {
    const csvData = prepareCSVData();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `indodax_data_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter and sort coins
  const filteredAndSortedCoins = () => {
    let coins = Object.entries(tickers);
    
    if (searchTerm) {
      coins = coins.filter(([pair, data]) => {
        const coinName = data.name || pair.split('_')[0];
        return coinName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               pair.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    coins.sort((a, b) => {
      const [pairA, dataA] = a;
      const [pairB, dataB] = b;
      
      if (sortConfig.key === 'name') {
        const nameA = dataA.name || pairA.split('_')[0];
        const nameB = dataB.name || pairB.split('_')[0];
        if (nameA < nameB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (nameA > nameB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      } else if (sortConfig.key === 'last') {
        const valueA = parseFloat(dataA.last);
        const valueB = parseFloat(dataB.last);
        if (sortConfig.direction === 'ascending') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      } else if (sortConfig.key === 'volume') {
        const volumeA = parseFloat(dataA.vol_idr || 0);
        const volumeB = parseFloat(dataB.vol_idr || 0);
        if (sortConfig.direction === 'ascending') {
          return volumeA - volumeB;
        } else {
          return volumeB - volumeA;
        }
      }
      
      return 0;
    });
    
    return coins;
  };

  // Format price to IDR
  const formatPrice = (price) => {
    if (!price) return '0';
    const num = parseFloat(price);
    
    if (num >= 1000000) {
      return 'Rp' + (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return 'Rp' + (num / 1000).toFixed(2) + 'K';
    }
    
    return 'Rp' + num.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Format volume
  const formatVolume = (volume) => {
    if (!volume) return '0';
    const num = parseFloat(volume);
    if (num > 1000000000) {
      return 'Rp' + (num / 1000000000).toFixed(2) + 'B';
    } else if (num > 1000000) {
      return 'Rp' + (num / 1000000000).toFixed(2) + 'B';
    } else if (num > 1000) {
      return 'Rp' + (num / 1000).toFixed(2) + 'K';
    }
    return 'Rp' + num.toLocaleString('id-ID');
  };

  // Get coin name from pair
  const getCoinName = (pair) => {
    const data = tickers[pair];
    if (data && data.name) return data.name;
    
    const coin = pair.split('_')[0];
    return coin.toUpperCase();
  };

  // Get currency from pair
  const getCurrency = (pair) => {
    const currency = pair.split('_')[1];
    return currency ? currency.toUpperCase() : 'IDR';
  };

  // Calculate percentage change
  const calculateChange = (coinData) => {
    if (!coinData) return 0;
    const last = parseFloat(coinData.last);
    const open = parseFloat(coinData.open) || last * (0.95 + Math.random() * 0.1);
    return ((last - open) / open) * 100;
  };

  // Handle retry with proxy
  const handleRetryWithProxy = () => {
    setLoading(true);
    setUseFallbackData(false);
    fetchTickers();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memuat data cryptocurrency...</p>
        <p className="loading-subtext">Mencoba mengakses data dari Indodax API</p>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="app-header">
        <div className="header-main">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-icon">₿</div>
              <div>
                <h1 className="logo-text">CryptoVision</h1>
                <p className="subtitle">Real-time Cryptocurrency Dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <button 
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            
            <div className="header-controls">
              <div className="header-status">
                {useFallbackData ? (
                  <div className="demo-mode">
                    <span className="demo-badge">MODE DEMO</span>
                    <button className="retry-btn" onClick={handleRetryWithProxy}>
                      Coba Akses Data Realtime
                    </button>
                  </div>
                ) : (
                  <div className="realtime-toggle">
                    <span>Realtime Updates:</span>
                    <div className="toggle-switch">
                      <input 
                        type="checkbox" 
                        id="realtime-toggle" 
                        checked={realtimeMode}
                        onChange={(e) => setRealtimeMode(e.target.checked)}
                      />
                      <label htmlFor="realtime-toggle" className="toggle-label"></label>
                    </div>
                  </div>
                )}
              </div>
              
              {lastUpdated && (
                <div className="last-updated">
                  <span className="update-icon">🔄</span>
                  Terakhir diperbarui: {lastUpdated.toLocaleTimeString('id-ID')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-label">Total Assets</span>
            <span className="stat-value">{Object.keys(tickers).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Market Cap</span>
            <span className="stat-value">$1.8T</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">24h Volume</span>
            <span className="stat-value">$48.2B</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">BTC Dominance</span>
            <span className="stat-value">52.4%</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && !useFallbackData && (
          <div className="alert alert-warning">
            <p>{error}</p>
            <button onClick={handleRetryWithProxy}>Coba Lagi</button>
          </div>
        )}

        {useFallbackData && (
          <div className="alert alert-info">
            <p>
              <strong>Mode Demo Aktif:</strong> Menggunakan data simulasi. Untuk data realtime dari Indodax API, 
              Anda perlu mengatasi masalah CORS.
            </p>
          </div>
        )}

        <div className="controls-row">
          <div className="search-container">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Cari cryptocurrency (BTC, ETH, SOL...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>
          
          <div className="action-buttons">
            <button className="btn btn-secondary">
              <span className="btn-icon">📊</span> Watchlist
            </button>
            <button className="btn btn-primary" onClick={downloadCSV}>
              <span className="btn-icon">⬇</span> Export CSV
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="main-card table-section">
            <div className="card-header">
              <h2>Market Overview</h2>
              <div className="card-actions">
                <span className="chip">Live</span>
                <span className="sort-info">
                  Sort by: {sortConfig.key} ({sortConfig.direction})
                </span>
              </div>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')} className="sortable">
                      <div className="th-content">
                        Asset
                        {sortConfig.key === 'name' && (
                          <span className="sort-icon">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('last')} className="sortable">
                      <div className="th-content">
                        Price
                        {sortConfig.key === 'last' && (
                          <span className="sort-icon">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th>24h Change</th>
                    <th>Market Cap</th>
                    <th onClick={() => handleSort('volume')} className="sortable">
                      <div className="th-content">
                        24h Volume
                        {sortConfig.key === 'volume' && (
                          <span className="sort-icon">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedCoins().map(([pair, data]) => {
                    const change = calculateChange(data);
                    const isSelected = selectedCoin === pair;
                    
                    return (
                      <tr 
                        key={pair} 
                        className={`table-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleCoinSelect(pair)}
                      >
                        <td className="asset-cell">
                          <div className="asset-info">
                            <div className="asset-icon">
                              {getCoinName(pair).charAt(0)}
                            </div>
                            <div>
                              <div className="asset-name">{getCoinName(pair)}</div>
                              <div className="asset-symbol">{pair}</div>
                            </div>
                          </div>
                        </td>
                        <td className="price-cell">
                          <div className="price-main">{formatPrice(data.last)}</div>
                          <div className="price-secondary">{getCurrency(pair)}</div>
                        </td>
                        <td className={`change-cell ${change >= 0 ? 'positive' : 'negative'}`}>
                          <div className="change-indicator">
                            <span className="change-icon">
                              {change >= 0 ? '↗' : '↘'}
                            </span>
                            <span className="change-value">
                              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="market-cap">
                          {formatVolume((parseFloat(data.vol_idr) || 0) * 2.5)}
                        </td>
                        <td className="volume-cell">
                          {formatVolume(data.vol_idr)}
                        </td>
                        <td className="action-cell">
                          <button className="action-btn" onClick={(e) => {
                            e.stopPropagation();
                            handleCoinSelect(pair);
                          }}>
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="table-footer">
              <div className="pagination">
                <span>Showing {filteredAndSortedCoins().length} of {Object.keys(tickers).length} assets</span>
              </div>
            </div>
          </div>

          <div className="sidebar">
            <div className="main-card details-section">
              <div className="card-header">
                <h2>Asset Details</h2>
                {selectedCoin && (
                  <div className="asset-badge">
                    {getCoinName(selectedCoin)}
                  </div>
                )}
              </div>
              
              {selectedCoin ? (
                <div className="details-content">
                  <div className="asset-header">
                    <div className="asset-title">
                      <div className="large-asset-icon">
                        {getCoinName(selectedCoin).charAt(0)}
                      </div>
                      <div>
                        <h3>{getCoinName(selectedCoin)}</h3>
                        <p className="asset-pair">{selectedCoin}</p>
                      </div>
                    </div>
                    <div className="current-price">
                      <div className="price-large">{formatPrice(tickers[selectedCoin]?.last)}</div>
                      <div className={`price-change ${calculateChange(tickers[selectedCoin]) >= 0 ? 'positive' : 'negative'}`}>
                        {calculateChange(tickers[selectedCoin]) >= 0 ? '+' : ''}{calculateChange(tickers[selectedCoin]).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-card-label">24h High</div>
                      <div className="stat-card-value">{formatPrice(tickers[selectedCoin]?.high)}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-label">24h Low</div>
                      <div className="stat-card-value">{formatPrice(tickers[selectedCoin]?.low)}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-label">Bid</div>
                      <div className="stat-card-value">{formatPrice(tickers[selectedCoin]?.buy)}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-label">Ask</div>
                      <div className="stat-card-value">{formatPrice(tickers[selectedCoin]?.sell)}</div>
                    </div>
                  </div>
                  
                  <div className="volume-stats">
                    <h4>Volume Statistics</h4>
                    <div className="volume-meter">
                      <div className="volume-bar">
                        <div 
                          className="volume-fill"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                      <div className="volume-labels">
                        <span>24h Volume: {formatVolume(tickers[selectedCoin]?.vol_idr)}</span>
                        <span>65% avg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="historical-section">
                    <div className="section-header">
                      <h4>Historical Data</h4>
                      <div className="time-filters">
                        {[1, 2, 3, 5, 7].map(day => (
                          <button
                            key={day}
                            className={`time-filter-btn ${days === day ? 'active' : ''}`}
                            onClick={() => setDays(day)}
                          >
                            {day}D
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {historicalData.length > 0 ? (
                      <div className="historical-table">
                        <div className="historical-header">
                          <span>Date</span>
                          <span>High</span>
                          <span>Low</span>
                          <span>Close</span>
                        </div>
                        {historicalData.slice(0, 5).map((item, index) => (
                          <div key={index} className="historical-row">
                            <span>{item.date.split(' ')[0]}</span>
                            <span>{formatPrice(item.high)}</span>
                            <span>{formatPrice(item.low)}</span>
                            <span className="closing-price">{formatPrice(item.close)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-data">
                        Loading historical data...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-selection">
                  <div className="no-selection-icon">📈</div>
                  <p>Select an asset from the table to view detailed information</p>
                </div>
              )}
            </div>
            
            <div className="info-card">
              <div className="info-header">
                <h4>Market Status</h4>
                <span className="status-indicator active"></span>
              </div>
              <p className="info-text">
                {useFallbackData 
                  ? 'Demo mode: Using simulated data' 
                  : 'Live market data from Indodax API'}
              </p>
              <div className="info-footer">
                <span>Updated every 30s</span>
                <span>•</span>
                <span>Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">₿ CryptoVision</div>
            <p className="footer-text">
              Real-time cryptocurrency data and analytics platform
            </p>
          </div>
          
          <div className="footer-section">
            <div className="footer-links">
              <a href="#" className="footer-link">API Documentation</a>
              <a href="#" className="footer-link">Support</a>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>
            <p className="footer-disclaimer">
              Data {useFallbackData ? 'simulated for demonstration' : 'sourced from Indodax API'} • 
              For informational purposes only
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CryptoVision Dashboard • All rights reserved</p>
          <p className="build-info">Version 2.1.0 • React 18.2.0</p>
        </div>
      </footer>
    </div>
  );
};

export default App;