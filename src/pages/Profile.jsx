import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Profile({ setIsAuthenticated }) {
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeSubscriptions: 0,
    memberSince: null
  });
  const [user, setUser] = useState({ msisdn: '', memberSince: null, provider: '', airtime: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      setLoading(true);
      const [subscriptions, transactions, userRes] = await Promise.all([
        axios.get('/subscriptions'),
        axios.get('/transactions'),
        axios.get('/user/profile')
      ]);

      const activeSubscriptions = subscriptions.data.filter(sub => sub.status === 'active');
      const totalSpent = transactions.data.reduce((total, trans) => 
        trans.type === 'charge' ? total + trans.amount : total, 0
      );

      setStats({
        totalSpent,
        activeSubscriptions: activeSubscriptions.length,
        memberSince: userRes.data.memberSince ? new Date(userRes.data.memberSince) : null
      });
      setUser({
        msisdn: userRes.data.msisdn,
        memberSince: userRes.data.memberSince ? new Date(userRes.data.memberSince) : null,
        provider: userRes.data.provider || '',
        airtime: userRes.data.airtime || 0
      });
      setTransactions(transactions.data || []);
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Airtime Balance</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                R{user.airtime.toFixed(2)}
              </dd>
            </div>
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      setIsAuthenticated(false);
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 -mb-px border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'profile' ? 'border-[#fa5c36] text-[#fa5c36]' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Info
        </button>
        <button
          className={`ml-4 px-4 py-2 -mb-px border-b-2 font-medium text-sm focus:outline-none ${activeTab === 'transactions' ? 'border-[#fa5c36] text-[#fa5c36]' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transaction History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-6 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Your account details and subscription summary.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {/* ...existing code... */}
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.msisdn || 'Not available'}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Airtime Balance</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  R{user.airtime.toFixed(2)}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Provider</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 capitalize">
                  {user.provider || 'Not set'}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.memberSince ? user.memberSince.toLocaleDateString() : 'N/A'}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Active Subscriptions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {stats.activeSubscriptions}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Total Spent</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  R{stats.totalSpent.toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Transaction History</h3>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-gray-400">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{new Date(tx.timestamp || tx.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{tx.serviceId?.name || tx.serviceId?.toString() || '-'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 capitalize">{tx.type}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">R{tx.amount.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
