import React, { useState } from 'react';
import { 
  RefreshCw, 
  Download, 
  TrendingUp, 
  TrendingDown,
  BarChart2,
  Filter
} from 'react-feather';
import styled from 'styled-components';
import CoinList from './CoinList';
import CoinDetail from './CoinDetail';
import HistoricalChart from './HistoricalChart';
import { PulseLoader } from 'react-spinners';

// Styled Components untuk desain modern[citation:3][citation:6]
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const DashboardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: ${props => props.primary ? '#4F46E5' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.primary ? '#4F46E5' : 'rgba(255, 255, 255, 0.2)'};
  
  &:hover {
    transform: translateY(-2px);
    background: ${props => props.primary ? '#4338CA' : 'rgba(255, 255, 255, 0.2)'};
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
`;

const TimeButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: ${props => props.active ? '#4F46E5' : 'transparent'};
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#4338CA' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: 20px;
  color: white;
`;

const Dashboard = ({
  tickers,
  loading,
  error,
  selectedCoin,
  coinDetails,
  historicalData,
  timeRange,
  onSelectCoin,
  onRefresh,
  onTimeRangeChange,
  onExportCSV,
  onExportHistorical
}) => {
  const [viewMode, setViewMode] = useState('grid');
  
  if (loading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <PulseLoader color="#ffffff" size={20} />
          <p>Memuat data dari Indodax...</p>
        </LoadingContainer>
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>
          <BarChart2 size={32} />
          Indodax Crypto Tracker
        </Title>
        
        <ControlPanel>
          <TimeRangeSelector>
            {['1h', '24h', '7d', '30d'].map(range => (
              <TimeButton
                key={range}
                active={timeRange === range}
                onClick={() => onTimeRangeChange(range)}
              >
                {range}
              </TimeButton>
            ))}
          </TimeRangeSelector>
          
          <Button onClick={onRefresh}>
            <RefreshCw size={18} />
            Refresh
          </Button>
          
          <Button primary onClick={onExportCSV}>
            <Download size={18} />
            Export CSV
          </Button>
        </ControlPanel>
      </DashboardHeader>
      
      {error && (
        <ErrorMessage>
          <TrendingDown size={20} />
          {error}
          <Button onClick={onRefresh} style={{ marginLeft: '15px' }}>
            Coba Lagi
          </Button>
        </ErrorMessage>
      )}
      
      <DashboardGrid>
        <CoinList
          tickers={tickers}
          selectedCoin={selectedCoin}
          onSelectCoin={onSelectCoin}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <CoinDetail
          coinDetails={coinDetails}
          selectedCoin={selectedCoin}
          onExportHistorical={onExportHistorical}
        />
      </DashboardGrid>
      
      <HistoricalChart
        historicalData={historicalData}
        coinName={selectedCoin}
      />
    </DashboardContainer>
  );
};

export default Dashboard;