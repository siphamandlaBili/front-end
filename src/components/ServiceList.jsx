import React from 'react';
import { useState } from 'react';
import axios from 'axios';

export default function ServiceList({ services, activeSubscriptions, onSubscriptionUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSubscribed = (serviceId) => {
    return activeSubscriptions.some(sub => 
      sub.serviceId === serviceId && sub.status === 'active'
    );
  };

  const handleSubscribe = async (serviceId) => {
    try {
      setLoading(true);
      setError('');
      await axios.post('/subscriptions', { serviceId });
      onSubscriptionUpdate();
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.response?.data?.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Services</h2>
      {error && (
        <div className="mb-4 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {service.description}
                </p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm font-medium text-gray-900">
                    R{service.price}
                  </span>
                  <span className="mx-2 text-gray-500">&middot;</span>
                  <span className="text-sm text-gray-500 capitalize">
                    {service.billingCycle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSubscribe(service.id)}
                disabled={loading || isSubscribed(service.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isSubscribed(service.id)
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : loading
                    ? 'bg-gray-100 text-gray-500 cursor-wait'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isSubscribed(service.id)
                  ? 'Subscribed'
                  : loading
                  ? 'Processing...'
                  : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
