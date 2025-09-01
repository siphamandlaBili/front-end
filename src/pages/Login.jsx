import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AuthForm({ setIsAuthenticated }) {
  const [tab, setTab] = useState('login');
  const [msisdn, setMsisdn] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [currentOTP, setCurrentOTP] = useState('');
  const [provider, setProvider] = useState('vodacom');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/auth/send-otp' : '/auth/register';
  const payload = tab === 'login' ? { msisdn } : { msisdn, name, provider };
      let response;
      try {
        response = await axios.post(endpoint, payload);
      } catch (err) {
        if (
          tab === 'login' &&
          err.response?.status === 404 &&
          err.response?.data?.message?.toLowerCase().includes('not registered')
        ) {
          toast.error('Number not registered. Please register as a user.', { duration: 6000, position: 'top-center' });
          setTab('register');
          setLoading(false);
          return;
        }
        setError(err.response?.data?.message || 'Something went wrong');
        toast.error('Failed to proceed');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('msisdn', msisdn);
      if (tab === 'register') sessionStorage.setItem('name', name);

      if (response.data.otp) {
        setCurrentOTP(response.data.otp);
        setShowOTP(true);
        toast.success(
          <div>
            <div className="font-semibold">SMS Simulation</div>
            <div className="text-sm">Your OTP is:</div>
            <div className="font-mono text-lg mt-1">{response.data.otp}</div>
          </div>,
          { duration: 8000, position: 'top-center' }
        );
      }
      navigate('/verify-otp');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#fa5c36] to-orange-400 relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: 'url(https://cdn.prod.website-files.com/6781058217ff5303f93c743c/67810fb2873399fa14b1afe5_Hero%20Top.avif)',
        }}
      ></div>
      
      {/* Semi-transparent Overlay */}
      <div className="absolute inset-0 bg-black opacity-10"></div>

      {/* Form Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden z-10 border border-white/20">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-[#fa5c36] to-orange-400 bg-clip-text">
              subscribie
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {tab === 'login' 
                ? 'Sign in to your account to continue' 
                : 'Register for a new account to get started'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === 'login'
                  ? 'bg-white text-[#fa5c36] shadow-sm'
                  : 'text-gray-600 hover:text-[#fa5c36]'
              }`}
              onClick={() => setTab('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === 'register'
                  ? 'bg-white text-[#fa5c36] shadow-sm'
                  : 'text-gray-600 hover:text-[#fa5c36]'
              }`}
              onClick={() => setTab('register')}
            >
              Register
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {tab === 'register' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fa5c36] focus:border-transparent transition"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Network Provider
                  </label>
                  <select
                    id="provider"
                    name="provider"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fa5c36] focus:border-transparent transition"
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                  >
                    <option value="vodacom">Vodacom</option>
                    <option value="mtn">MTN</option>
                    <option value="cellc">Cell C</option>
                    <option value="telkom">Telkom</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="msisdn" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                id="msisdn"
                name="msisdn"
                type="tel"
                required
                pattern="^0[0-9]{9}$"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Enter your mobile number (e.g., 0123456789)"
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
              />
              <p className="mt-2 text-xs text-gray-500">Must be a 10-digit number starting with 0</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 border border-red-100">
                <div className="text-red-700 text-sm text-center">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#fa5c36] to-orange-400 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : tab === 'login' ? 'Request OTP' : 'Register'}
            </button>
          </form>
        </div>
      </div>

      {/* OTP Notification Modal */}
      {showOTP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">OTP Sent Successfully</h3>
              <p className="text-sm text-gray-500 mb-4">
                We've sent an OTP to your mobile number. Please check your messages.
              </p>
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-xs text-gray-500 mb-2">For testing purposes, your OTP is:</p>
                <p className="text-2xl font-mono font-bold text-[#fa5c36]">{currentOTP}</p>
              </div>
              <button
                onClick={() => {
                  setShowOTP(false);
                  navigate('/verify-otp');
                }}
                className="w-full py-2 px-4 bg-[#fa5c36] text-white font-medium rounded-md shadow hover:bg-orange-500 transition"
              >
                Continue to Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}