import React from 'react';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Tab } from '@headlessui/react';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const tabs = [
  { name: 'Active', status: 'active' },
  { name: 'Cancelled', status: 'cancelled' },
  { name: 'All', status: 'all' }
];

export default function SubscriptionsDashboard() {
  const { socket } = useOutletContext();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchSubscriptions();

    if (socket) {
      socket.on('subscription:update', handleSubscriptionUpdate);
      return () => socket.off('subscription:update');
    }
  }, [socket]);

  const handleSubscriptionUpdate = (data) => {
    if (data.type === 'subscribe') {
      setSubscriptions(prev => [...prev, data.subscription]);
      toast.success('New subscription added');
    } else if (data.type === 'unsubscribe') {
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === data.subscriptionId 
            ? { ...sub, status: 'cancelled' }
            : sub
        )
      );
      toast.success('Subscription cancelled');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriptionId) => {
    setCancellingId(subscriptionId);
    try {
      await axios.delete(`/subscriptions/${subscriptionId}`);
      // Optimistically update state
      setSubscriptions(prev => prev.map(sub =>
        sub._id === subscriptionId ? { ...sub, status: 'cancelled' } : sub
      ));
      toast.success('Subscription cancelled');
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    selectedStatus === 'all' ? true : sub.status === selectedStatus
  );

  const calculateBillingCycle = (subscription) => {
    const startDate = new Date(subscription.startDate);
    const nextBilling = new Date(startDate);
    
    switch (subscription.service.billingCycle) {
      case 'daily':
        nextBilling.setDate(nextBilling.getDate() + 1);
        break;
      case 'weekly':
        nextBilling.setDate(nextBilling.getDate() + 7);
        break;
      case 'monthly':
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
      default:
        return 'N/A';
    }

    return nextBilling.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">My Subscriptions</h2>
      </div>

      <div className="mt-4">
        <Tab.Group onChange={(index) => setSelectedStatus(tabs[index].status)}>
          <Tab.List className="flex space-x-1 rounded-xl bg-[#fa5c36]/20 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-[#fa5c36] focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-[#fa5c36] shadow'
                      : 'text-[#fa5c36] hover:bg-white/[0.12] hover:text-orange-700'
                  )
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      <div className="mt-6 space-y-4">
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No subscriptions</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any {selectedStatus !== 'all' ? selectedStatus : ''} subscriptions yet.
            </p>
          </div>
        ) : (
          filteredSubscriptions.map((subscription) => {
            // Defensive: skip if service is missing
            if (!subscription.service) return null;
            return (
              <div
                key={subscription._id}
                className="bg-white shadow sm:rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subscription.service.name}
                      </h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>{subscription.service.description}</p>
                      </div>
                      <div className="mt-3 flex items-center text-sm">
                        <span className="text-gray-600 mr-4">
                          Started: {new Date(subscription.startDate).toLocaleDateString()}
                        </span>
                        <span className="text-gray-600 mr-4">
                          Next billing: {calculateBillingCycle(subscription)}
                        </span>
                        <span className="font-medium text-[#fa5c36]">
                          R{subscription.service.price}/{subscription.service.billingCycle}
                        </span>
                      </div>
                    </div>
                    <div className="ml-5 flex items-center">
                      {subscription.status === 'active' ? (
                        <>
                          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                          <span className="mr-4 text-sm font-medium text-green-600">Active</span>
                          <button
                            onClick={() => handleUnsubscribe(subscription._id)}
                            className={clsx(
                              "inline-flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-100",
                              cancellingId === subscription._id && "opacity-60 cursor-not-allowed"
                            )}
                            disabled={cancellingId === subscription._id}
                          >
                            {cancellingId === subscription._id ? (
                              <>
                                <svg className="animate-spin h-4 w-4 mr-2 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                Cancelling...
                              </>
                            ) : (
                              "Cancel"
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-600">Cancelled</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
