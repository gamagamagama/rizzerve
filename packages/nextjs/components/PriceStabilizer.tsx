import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Zap,
  RefreshCw,
  DollarSign
} from 'lucide-react';

const PriceStabilizer = () => {
  const [currentPrice, setCurrentPrice] = useState(100);
  const [basePrice, setBasePrice] = useState(100);
  const [volatilityReduction, setVolatilityReduction] = useState(0.7); // 70% reduction
  const [priceHistory, setPriceHistory] = useState([]);
  const [rawPriceHistory, setRawPriceHistory] = useState([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    startSimulation();
  }, []);

  const startSimulation = () => {
    if (simulationRunning) return;
    
    setSimulationRunning(true);
    const interval = setInterval(() => {
      // Generate raw price with high volatility
      const volatility = 0.15; // 15% volatility
      const trend = 0.0001; // Slight upward trend
      const randomChange = (Math.random() - 0.5) * volatility * 2;
      const newRawPrice = Math.max(0.1, parseFloat(basePrice) * (1 + trend + randomChange));
      
      // Apply stabilization - reduce volatility while preserving trend
      const priceDiff = newRawPrice - parseFloat(basePrice);
      const stabilizedDiff = priceDiff * (1 - volatilityReduction);
      const stabilizedPrice = parseFloat(basePrice) + stabilizedDiff;
      
      setCurrentPrice(stabilizedPrice);
      setBasePrice(prev => prev * (1 + trend)); // Update base with trend
      
      // Update histories
      const timestamp = Date.now();
      setPriceHistory(prev => {
        const newHistory = [...prev, { price: stabilizedPrice, timestamp }];
        return newHistory.slice(-30);
      });
      
      setRawPriceHistory(prev => {
        const newHistory = [...prev, { price: newRawPrice, timestamp }];
        return newHistory.slice(-30);
      });
      
    }, 1000);

    return () => clearInterval(interval);
  };

  const stopSimulation = () => {
    setSimulationRunning(false);
  };

  const applyStabilization = () => {
    setLoading(true);
    setStatus('Applying enhanced stabilization...');
    
    setTimeout(() => {
      setVolatilityReduction(prev => Math.min(0.9, prev + 0.1));
      setStatus('Volatility reduction increased');
      setLoading(false);
    }, 1500);
  };

  const calculateVolatility = (prices) => {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i].price - prices[i-1].price) / prices[i-1].price);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * 100;
  };

  const rawVolatility = calculateVolatility(rawPriceHistory);
  const stabilizedVolatility = calculateVolatility(priceHistory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <Activity className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-gray-800">Price Movement Stabilizer</h1>
            <p className="text-gray-600">Reducing volatility while preserving natural price trends</p>
          </div>

          {/* Price Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-800">Current Price</h3>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ${currentPrice.toFixed(4)}
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-green-800">Volatility Reduction</h3>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {(volatilityReduction * 100).toFixed(0)}%
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-purple-800">Stabilized Vol.</h3>
                <TrendingDown className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {stabilizedVolatility.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Price Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Raw Price Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Raw Price (High Volatility)</h3>
              <div className="h-40 bg-white rounded border p-2">
                <div className="h-full flex items-end space-x-1">
                  {rawPriceHistory.slice(-20).map((point, index) => {
                    const minPrice = Math.min(...rawPriceHistory.map(p => p.price)) * 0.95;
                    const maxPrice = Math.max(...rawPriceHistory.map(p => p.price)) * 1.05;
                    const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 100;
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-red-400 rounded-t transition-all duration-300"
                        style={{ height: `${Math.max(5, height)}%` }}
                        title={`$${point.price.toFixed(4)}`}
                      />
                    );
                  })}
                </div>
              </div>
              <p className="text-sm text-red-600 mt-2">
                Volatility: {rawVolatility.toFixed(1)}%
              </p>
            </div>

            {/* Stabilized Price Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Stabilized Price (Reduced Volatility)</h3>
              <div className="h-40 bg-white rounded border p-2">
                <div className="h-full flex items-end space-x-1">
                  {priceHistory.slice(-20).map((point, index) => {
                    const minPrice = Math.min(...priceHistory.map(p => p.price)) * 0.95;
                    const maxPrice = Math.max(...priceHistory.map(p => p.price)) * 1.05;
                    const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 100;
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-blue-400 rounded-t transition-all duration-300"
                        style={{ height: `${Math.max(5, height)}%` }}
                        title={`$${point.price.toFixed(4)}`}
                      />
                    );
                  })}
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Volatility: {stabilizedVolatility.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* <button
              onClick={simulationRunning ? stopSimulation : startSimulation}
              className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                simulationRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {simulationRunning ? 'Stop Simulation' : 'Start Simulation'}
            </button> */}
            
            <button
              onClick={applyStabilization}
              disabled={loading || volatilityReduction >= 0.9}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>{loading ? 'Applying...' : 'Enhance Stabilization'}</span>
            </button>
          </div>

          {/* Status */}
          {status && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-green-800 font-medium">{status}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              <strong>How it works:</strong> The stabilizer reduces price volatility by {(volatilityReduction * 100).toFixed(0)}% 
              while preserving natural market trends. Prices can still rise or fall, but with smoother movements.
            </p>
            <div className="flex justify-center items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded mr-1"></div>
                Raw Price
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded mr-1"></div>
                Stabilized Price
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceStabilizer;