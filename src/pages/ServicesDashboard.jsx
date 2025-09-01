import React from 'react';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';

const categories = ['All', 'Gaming', 'Music', 'Quiz'];

export default function ServicesDashboard() {
  const { socket } = useOutletContext();
  const [services, setServices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [billingModal, setBillingModal] = useState(null);
  const [subscribingId, setSubscribingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, subscriptionsRes] = await Promise.all([
        axios.get('/services'),
        axios.get('/subscriptions')
      ]);
      setServices(servicesRes.data);
      setSubscriptions(subscriptionsRes.data);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = (serviceId) => {
    return subscriptions.some(sub => {
      // sub.serviceId can be an object (populated) or string (id)
      const subId = typeof sub.serviceId === 'object' ? sub.serviceId._id : sub.serviceId;
      return subId === serviceId && sub.status === 'active';
    });
  };

  const handleSubscribe = async (serviceId) => {
    setSubscribingId(serviceId);
    try {
      const res = await axios.post('/subscriptions', { serviceId });
      if (res.data.billing) {
        // Find the service to get billingCycle
        const service = services.find(s => s._id === serviceId);
        setBillingModal({
          provider: res.data.billing.provider,
          reference: res.data.billing.reference,
          amount: res.data.billing.amount,
          timestamp: res.data.billing.timestamp,
          billingCycle: service?.billingCycle || ''
        });
      }
      toast.success('Successfully subscribed to service');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setSubscribingId(null);
    }
  };

  const filteredServices = services.filter(service => 
    selectedCategory === 'All' || 
    service.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Billing Confirmation Modal */}
      {billingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#ffffff41] backdrop-blur-sm"></div>
          <div className="relative bg-white bg-opacity-95 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#fa5c36] mb-2">Subscription Billed</h3>
              <p className="text-gray-700 mb-2">You have been billed for this service.</p>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="text-sm text-gray-600 mb-1">Provider: <span className="font-semibold capitalize">{billingModal.provider}</span></div>
                <div className="text-sm text-gray-600 mb-1">Amount: <span className="font-semibold">R{billingModal.amount}</span></div>
                <div className="text-sm text-gray-600 mb-1">Billing Cycle: <span className="font-semibold capitalize">{billingModal.billingCycle}</span></div>
                <div className="text-sm text-gray-600 mb-1">Reference: <span className="font-mono">{billingModal.reference}</span></div>
                <div className="text-xs text-gray-400 mt-2">{new Date(billingModal.timestamp).toLocaleString()}</div>
              </div>
              <button
                className="w-full py-2 px-4 bg-[#fa5c36] text-white font-medium rounded-md shadow hover:bg-orange-500 transition"
                onClick={() => setBillingModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Available Services</h2>
      </div>

      <div className="mt-4">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-[#fa5c36]/20 p-1">
            {categories.map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-[#fa5c36] focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-[#fa5c36] shadow'
                      : 'text-[#fa5c36] hover:bg-white/[0.12] hover:text-orange-700'
                  )
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <div
            key={service._id}
            className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
          >
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {service.name}
                </h3>
                <p className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-[#fa5c36]">
                  {service.category}
                </p>
              </div>
              <p className="mt-3 text-gray-500">{service.description}</p>
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900">
                  R{service.price}/{service.billingCycle}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3">
              <button
                onClick={() => handleSubscribe(service._id)}
                disabled={isSubscribed(service._id) || subscribingId === service._id}
                className={clsx(
                  'w-full rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 flex items-center justify-center',
                  isSubscribed(service._id)
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : 'bg-[#fa5c36] text-white hover:bg-orange-500 focus-visible:outline-[#fa5c36]'
                )}
              >
                {subscribingId === service._id ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Subscribing...
                  </>
                ) : isSubscribed(service._id) ? 'Subscribed' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
