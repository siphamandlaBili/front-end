import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function OTPVerification({ setIsAuthenticated }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const navigate = useNavigate();

  useEffect(() => {
    const msisdn = sessionStorage.getItem('msisdn');
    if (!msisdn) {
      navigate('/');
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const msisdn = sessionStorage.getItem('msisdn');
    if (!msisdn) {
      navigate('/');
      return;
    }

    try {
      await axios.post('/auth/verify-otp', { msisdn, otp });
      sessionStorage.removeItem('msisdn');
      setIsAuthenticated(true);
      // Fetch user profile to check if admin
      const { data: profile } = await axios.get('/user/profile');
      if (profile.isAdmin) {
        window.location.replace('/admin');
      } else {
        window.location.replace('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    const msisdn = sessionStorage.getItem('msisdn');

    try {
      await axios.post('/auth/send-otp', { msisdn });
      setCountdown(300); // Reset countdown
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
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
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden z-10 border border-white/20 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#fa5c36] to-orange-400 bg-clip-text text-transparent">
            OTP Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to your mobile number
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-orange-50 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#fa5c36] mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-[#fa5c36]">
              Expires in: {formatTime(countdown)}
            </span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#fa5c36] focus:border-transparent transition text-center text-xl font-semibold tracking-widest"
              placeholder="••••••"
              pattern="[0-9]{6}"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Enter the 6-digit code sent to your phone
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 border border-red-100">
              <div className="text-red-700 text-sm text-center flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#fa5c36] to-orange-400 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : 'Verify OTP'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || countdown > 280}
              className="text-[#fa5c36] hover:text-orange-500 text-sm font-medium disabled:opacity-50 flex items-center justify-center w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Resend OTP {countdown > 280 && `(available in ${formatTime(countdown - 280)})`}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-[#fa5c36] transition-colors flex items-center justify-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}