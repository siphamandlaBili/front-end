import React from 'react';
import { useState } from 'react';
import axios from 'axios';

export default function ActiveSubscriptions({ subscriptions, onSubscriptionUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnsubscribe = async (subscriptionId) => {
    try {
      setLoading(true);
      setError('');
      await axios.delete(`/subscriptions/${subscriptionId}`);
      onSubscriptionUpdate();
    } catch (err) {
      console.error('Unsubscribe error:', err);
      setError(err.response?.data?.message || 'Failed to unsubscribe');
    } finally {
      setLoading(false);
    }
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Subscriptions</h2>
      {error && (
        <div className="mb-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {activeSubscriptions.length === 0 ? (
        <p className="text-gray-500 text-sm">No active subscriptions</p>
      ) : (
        <div className="space-y-4">
          {activeSubscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="border rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {subscription.service.name}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span>Started: {new Date(subscription.startDate).toLocaleDateString()}</span>
                    <span className="mx-2">&middot;</span>
                    <span>R{subscription.service.price}/{subscription.service.billingCycle}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnsubscribe(subscription.id)}
                  disabled={loading}
                  className="px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Unsubscribe'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
