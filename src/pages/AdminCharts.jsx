import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminCharts() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      // In a real app, you would pass the timeRange as a parameter
      const res = await axios.get(`/admin/active-users-per-service?range=${timeRange}`);
      setStats(res.data);
    } catch (err) {
      setError('Failed to fetch statistics data. Please try again.');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to format numbers with commas
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : 0;
  };

  // Calculate total active users
  const totalActiveUsers = stats.reduce((total, row) => total + (row.activeUserCount || 0), 0);

  const chartData = {
    labels: stats.map(row => row.serviceName),
    datasets: [
      {
        label: 'Active Users',
        data: stats.map(row => row.activeUserCount),
        backgroundColor: [
          '#fa5c36',
          '#ff7f50',
          '#ff9966',
          '#ffb380',
          '#fdcc8a',
          '#fed976'
        ],
        borderColor: '#fa5c36',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: '#e04e2a'
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
        padding: 10,
        cornerRadius: 8
      },
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#fa5c36] to-[#ff7f50] p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Service Usage Statistics</h2>
            <p className="mt-2 opacity-90">Active users across different services</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex space-x-2">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    timeRange === range 
                      ? 'bg-white text-[#fa5c36]' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Summary */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="bg-[#fa5c36] p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Active Users</p>
                <p className="text-xl font-bold text-gray-800">{formatNumber(totalActiveUsers)}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="bg-[#fa5c36] p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Services Tracked</p>
                <p className="text-xl font-bold text-gray-800">{stats.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="bg-[#fa5c36] p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Range</p>
                <p className="text-xl font-bold text-gray-800 capitalize">{timeRange}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fa5c36]"></div>
            <p className="mt-4 text-gray-600">Loading chart data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 p-4 bg-red-50 rounded-lg">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-500 text-center mb-4">{error}</p>
            <button 
              onClick={fetchStats}
              className="px-4 py-2 bg-[#fa5c36] text-white rounded-lg hover:bg-[#e04e2a] transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        ) : stats.length > 0 ? (
          <>
            <div className="h-64 md:h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="mt-6 flex justify-center">
              <button 
                onClick={fetchStats}
                className="flex items-center text-[#fa5c36] hover:text-[#e04e2a] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 p-4 bg-gray-50 rounded-lg">
            <div className="bg-gray-200 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-center">No data available for the selected time period.</p>
          </div>
        )}
      </div>
    </div>
  );
}