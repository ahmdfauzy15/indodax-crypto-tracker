import axios from 'axios';

// Konfigurasi untuk menghindari CORS
const API_BASE_URL = 'https://api.allorigins.win/raw?url=';
const INDOdax_URL = 'https://indodax.com/api';

// Alternatif: Gunakan CORS proxy jika diperlukan
const createProxyUrl = (endpoint) => {
  return `${API_BASE_URL}${encodeURIComponent(`${INDOdax_URL}/${endpoint}`)}`;
};

// Fetch semua ticker
export const fetchAllTickers = async () => {
  try {
    const response = await axios.get(createProxyUrl('tickers'));
    return response.data;
  } catch (error) {
    console.error('Error fetching all tickers:', error);
    
    // Fallback: coba langsung (mungkin berhasil di production)
    try {
      const directResponse = await axios.get(`${INDOdax_URL}/tickers`);
      return directResponse.data;
    } catch (directError) {
      throw new Error('Failed to fetch data from Indodax');
    }
  }
};

// Fetch data spesifik coin
export const fetchTickerData = async (pair) => {
  try {
    const response = await axios.get(createProxyUrl(`ticker/${pair}`));
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${pair}:`, error);
    
    // Fallback
    try {
      const directResponse = await axios.get(`${INDOdax_URL}/ticker/${pair}`);
      return directResponse.data;
    } catch (directError) {
      throw new Error(`Failed to fetch ${pair} data`);
    }
  }
};

// Fetch data trades (untuk riwayat)
export const fetchTradeHistory = async (pair) => {
  try {
    const response = await axios.get(createProxyUrl(`trades/${pair}`));
    return response.data;
  } catch (error) {
    console.error(`Error fetching trades for ${pair}:`, error);
    return [];
  }
};