import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Coins, Shield, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TreasuryManager = () => {
  const [selectedScenario, setSelectedScenario] = useState(0);

  const scenarios = [
    {
      label: "Bull Market Rally",
      icon: <TrendingUp className="w-4 h-4 text-green-500" />,
      prices: { BTC: 65000, SP500: 4800, GOLD: 1950 },
      allocation: { BTC: 40, SP500: 35, GOLD: 25 },
      risk: "Medium",
      return: "+12-18%",
      color: "green",
      chartData: [
        { day: 1, BTC: 100, SP500: 100, GOLD: 100, Token: 100 },
        { day: 2, BTC: 105, SP500: 102, GOLD: 101, Token: 102 },
        { day: 3, BTC: 115, SP500: 108, GOLD: 102, Token: 106 },
        { day: 4, BTC: 125, SP500: 112, GOLD: 103, Token: 110 },
        { day: 5, BTC: 135, SP500: 118, GOLD: 105, Token: 115 },
        { day: 6, BTC: 140, SP500: 120, GOLD: 106, Token: 118 },
        { day: 7, BTC: 150, SP500: 125, GOLD: 108, Token: 123 }
      ]
    },
    {
        label: "Market Crash",
        icon: <TrendingDown className="w-4 h-4 text-red-500" />,
        prices: { BTC: 18000, SP500: 2800, GOLD: 2150 },
        allocation: { BTC: 10, SP500: 10, GOLD: 80 },
        risk: "Very Low",
        return: "+1 to +6%",
        color: "red",
        chartData: [
          { day: 1, BTC: 100, SP500: 100, GOLD: 100, Token: 100 },
          { day: 2, BTC: 85, SP500: 92, GOLD: 105, Token: 103.2 },
          { day: 3, BTC: 70, SP500: 82, GOLD: 110, Token: 106.2 },
          { day: 4, BTC: 55, SP500: 75, GOLD: 115, Token: 109.0 },
          { day: 5, BTC: 45, SP500: 68, GOLD: 120, Token: 111.6 },
          { day: 6, BTC: 40, SP500: 65, GOLD: 122, Token: 112.8 },
          { day: 7, BTC: 38, SP500: 62, GOLD: 125, Token: 115.2 }
        ]
      },
    {
      label: "Volatile Sideways",
      icon: <Activity className="w-4 h-4 text-yellow-500" />,
      prices: { BTC: 42000, SP500: 4200, GOLD: 1980 },
      allocation: { BTC: 30, SP500: 40, GOLD: 30 },
      risk: "Medium",
      return: "5-10%",
      color: "yellow",
      chartData: [
        { day: 1, BTC: 100, SP500: 100, GOLD: 100, Token: 100 },
        { day: 2, BTC: 110, SP500: 95, GOLD: 102, Token: 102 },
        { day: 3, BTC: 95, SP500: 105, GOLD: 98, Token: 99 },
        { day: 4, BTC: 115, SP500: 90, GOLD: 105, Token: 104 },
        { day: 5, BTC: 85, SP500: 110, GOLD: 95, Token: 98 },
        { day: 6, BTC: 105, SP500: 98, GOLD: 103, Token: 102 },
        { day: 7, BTC: 108, SP500: 102, GOLD: 101, Token: 104 }
      ]
    },
    {
      label: "Economic Recovery",
      icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
      prices: { BTC: 48000, SP500: 4600, GOLD: 1850 },
      allocation: { BTC: 35, SP500: 45, GOLD: 20 },
      risk: "Medium",
      return: "+10-16%",
      color: "blue",
      chartData: [
        { day: 1, BTC: 100, SP500: 100, GOLD: 100, Token: 100 },
        { day: 2, BTC: 108, SP500: 105, GOLD: 102, Token: 105 },
        { day: 3, BTC: 118, SP500: 112, GOLD: 103, Token: 111 },
        { day: 4, BTC: 125, SP500: 118, GOLD: 105, Token: 116 },
        { day: 5, BTC: 132, SP500: 125, GOLD: 106, Token: 122 },
        { day: 6, BTC: 138, SP500: 130, GOLD: 108, Token: 127 },
        { day: 7, BTC: 145, SP500: 135, GOLD: 110, Token: 133 }
      ]
    }
  ];

  const current = scenarios[selectedScenario];

  const formatPrice = (price) => `$${price.toLocaleString()}`;

  const getRiskStyle = (risk) => {
    const styles = {
      Low: 'text-green-600 bg-green-100',
      Medium: 'text-yellow-600 bg-yellow-100',
      High: 'text-red-600 bg-red-100'
    };
    return styles[risk] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Treasury Management Scenarios</h1>
        <p className="text-gray-600">Analyze market conditions and treasury allocation strategies</p>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {scenarios.map((scenario, index) => (
          <button
            key={index}
            onClick={() => setSelectedScenario(index)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedScenario === index
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {scenario.icon}
              <span className="font-semibold text-sm">{scenario.label}</span>
            </div>
            <p className="text-xs text-gray-600">{scenario.return}</p>
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Asset Performance - {current.label}
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={current.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value.toFixed(1)}`, name]} />
              <Legend />
              <Line type="monotone" dataKey="BTC" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="SP500" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="GOLD" stroke="#eab308" strokeWidth={2} />
              <Line type="monotone" dataKey="Token" stroke="#10b981" strokeWidth={3} name="RIZZ" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Prices & Treasury */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Market Prices
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">Bitcoin</span>
                <span className="font-bold">{formatPrice(current.prices.BTC)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">S&P 500</span>
                <span className="font-bold">{formatPrice(current.prices.SP500)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">Gold</span>
                <span className="font-bold">{formatPrice(current.prices.GOLD)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Treasury Allocation
            </h3>
            <div className="space-y-4">
              {Object.entries(current.allocation).map(([asset, percentage]) => (
                <div key={asset} className="flex items-center justify-between">
                  <span className="text-gray-700">{asset === 'BTC' ? 'Bitcoin' : asset === 'SP500' ? 'S&P 500' : 'Gold'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          asset === 'BTC' ? 'bg-orange-500' : 
                          asset === 'SP500' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                    <span className="font-semibold w-8 text-right">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analysis & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Scenario Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-1">Risk Level</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskStyle(current.risk)}`}>
                  {current.risk}
                </span>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-1">Expected Return</h4>
                <span className="font-bold text-gray-900">{current.return}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500">Treasury Value</h4>
              <p className="text-xl font-bold text-gray-900">$2.4M</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <h4 className="text-sm font-medium text-gray-500">Backing Ratio</h4>
              <p className="text-xl font-bold text-green-600">125%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
        <h3 className="font-semibold text-green-900 mb-1">🎯 Stabilization Effect</h3>
        <p className="text-green-800 text-sm">
          RIZZ (green line) shows reduced volatility compared to individual assets while capturing upside through diversified treasury backing.
        </p>
      </div>
    </div>
  );
};

export default TreasuryManager;