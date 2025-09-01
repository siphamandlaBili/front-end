import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

export default function AdminOverview() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRealTime, setIsRealTime] = useState(true);

  // State for add service form
  const [showAddService, setShowAddService] = useState(false);
  const [addServiceLoading, setAddServiceLoading] = useState(false);
  const [addServiceError, setAddServiceError] = useState('');
  const [addServiceSuccess, setAddServiceSuccess] = useState('');
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'gaming',
    billingCycle: 'daily',
  });

  // Add service handler
  const handleAddService = async (e) => {
    e.preventDefault();
    setAddServiceLoading(true);
    setAddServiceError('');
    setAddServiceSuccess('');
    try {
      const res = await axios.post('/services', {
        ...serviceForm,
        price: Number(serviceForm.price),
      });
      setAddServiceSuccess('Service added successfully!');
      setServiceForm({ name: '', description: '', price: '', category: 'gaming', billingCycle: 'daily' });
      fetchStats();
    } catch (err) {
      setAddServiceError(err?.response?.data?.message || 'Failed to add service');
    } finally {
      setAddServiceLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Socket.IO for real-time updates
    const socket = io('https://penrose-test-3.onrender.com', { withCredentials: true });
    
    if (isRealTime) {
      socket.on('admin:statsUpdate', (data) => {
        setStats(data);
        setLastUpdated(new Date());
      });
    }
    
    return () => {
      socket.disconnect();
    };
  }, [isRealTime]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/admin/active-users-per-service');
      setStats(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch admin statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total active users
  const totalActiveUsers = stats.reduce((total, row) => total + (row.activeUserCount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <div className="bg-white shadow-lg rounded-2xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Overview</h2>
            <div className="flex items-center space-x-3">
              {isRealTime && (
                <span className="flex items-center bg-[#fa5c36]/10 px-2 py-1 rounded-full text-xs text-[#fa5c36]">
                  <span className="h-2 w-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  Live
                </span>
              )}
              <button
                onClick={fetchStats}
                className="bg-[#fa5c36]/10 text-[#fa5c36] hover:bg-[#fa5c36]/20 p-2 rounded-full transition-colors"
                title="Refresh data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setIsRealTime(!isRealTime)}
                className={`p-2 rounded-full transition-colors ${isRealTime ? 'bg-[#fa5c36] text-white' : 'bg-[#fa5c36]/10 text-[#fa5c36]'}`}
                title={isRealTime ? "Disable real-time updates" : "Enable real-time updates"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowAddService(true)}
            className="bg-[#fa5c36] text-white px-5 py-2 rounded-lg shadow hover:bg-[#e04e2a] transition-colors font-semibold mt-4 md:mt-0"
          >
            + Add Service
          </button>
        </div>
        {/* Stats Summary */}
        <div className="px-8 py-6 border-b border-gray-100">
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
                  <p className="text-xl font-bold text-gray-800">{totalActiveUsers.toLocaleString()}</p>
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
                  <p className="text-sm text-gray-500">Services</p>
                  <p className="text-xl font-bold text-gray-800">{stats.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="bg-[#fa5c36] p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-bold text-gray-800">
                    {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Services Table */}
        <div className="px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fa5c36]"></div>
              <p className="mt-4 text-gray-600">Loading service data...</p>
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
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Service
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Active Users
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.map((row, index) => (
                      <tr key={row.serviceId || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-[#fa5c36] font-bold">
                                {row.serviceName ? row.serviceName.charAt(0).toUpperCase() : 'S'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{row.serviceName}</div>
                              <div className="text-xs text-gray-500">Service ID: {row.serviceId || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">{row.activeUserCount}</div>
                          <div className="text-xs text-gray-500">
                            {totalActiveUsers > 0 ? Math.round((row.activeUserCount / totalActiveUsers) * 100) : 0}% of total
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Last updated and refresh button */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500 mb-3 sm:mb-0">
                  Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
                </p>
                <button 
                  onClick={fetchStats}
                  className="flex items-center text-[#fa5c36] hover:text-[#e04e2a] transition-colors text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <p className="text-gray-500 text-center">No service data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => { setShowAddService(false); setAddServiceError(''); setAddServiceSuccess(''); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold mb-4 text-[#fa5c36]">Add New Service</h3>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type="text" className="mt-1 block w-full border rounded px-3 py-2" required
                  value={serviceForm.name}
                  onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea className="mt-1 block w-full border rounded px-3 py-2" required
                  value={serviceForm.description}
                  onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (ZAR)</label>
                <input type="number" min="0" step="0.01" className="mt-1 block w-full border rounded px-3 py-2" required
                  value={serviceForm.price}
                  onChange={e => setServiceForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="mt-1 block w-full border rounded px-3 py-2" required
                  value={serviceForm.category}
                  onChange={e => setServiceForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="gaming">Gaming</option>
                  <option value="music">Music</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
                <select className="mt-1 block w-full border rounded px-3 py-2" required
                  value={serviceForm.billingCycle}
                  onChange={e => setServiceForm(f => ({ ...f, billingCycle: e.target.value }))}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              {addServiceError && <div className="text-red-500 text-sm">{addServiceError}</div>}
              {addServiceSuccess && <div className="text-green-600 text-sm">{addServiceSuccess}</div>}
              <button
                type="submit"
                className="w-full bg-[#fa5c36] text-white py-2 rounded-lg hover:bg-[#e04e2a] transition-colors"
                disabled={addServiceLoading}
              >
                {addServiceLoading ? 'Adding...' : 'Add Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}