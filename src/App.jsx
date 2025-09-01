import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Pages
import Login from './pages/Login';
import OTPVerification from './pages/OTPVerification';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import ServicesDashboard from './pages/ServicesDashboard';
import SubscriptionsDashboard from './pages/SubscriptionsDashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminOverview from './pages/AdminOverview';
import AdminCharts from './pages/AdminCharts';
import AdminProfile from './pages/AdminProfile';

// Set up axios defaults
axios.defaults.baseURL = 'https://penrose-test-3.onrender.com/api';
axios.defaults.withCredentials = true;

function App() {
  // ...existing code...
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [socket, setSocket] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: profile } = await axios.get('/user/profile');
        setIsAuthenticated(true);
        setUserProfile(profile);
        console.log('Frontend /user/profile response:', profile);
      } catch {
        setIsAuthenticated(false);
        setUserProfile(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Removed automatic redirect effect to allow free navigation after login

  useEffect(() => {
    // Connect to Socket.IO server when authenticated
    if (isAuthenticated) {
      const newSocket = io('https://penrose-test-3.onrender.com', {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [isAuthenticated]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route 
            path="/" 
            element={
              !isAuthenticated ? (
                <Login setIsAuthenticated={setIsAuthenticated} setUserProfile={setUserProfile} />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <h1 className="text-3xl font-bold mb-4 text-[#fa5c36]">Welcome!</h1>
                  <p className="mb-4 text-gray-700">You are logged in. Use the navigation to access your dashboard or other pages.</p>
                </div>
              )
            }
          />
          <Route 
            path="/verify-otp" 
            element={
              !isAuthenticated ? (
                <OTPVerification setIsAuthenticated={setIsAuthenticated} setUserProfile={setUserProfile} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                userProfile?.isAdmin ? (
                  <div className="flex flex-col items-center justify-center min-h-screen">
                    <h2 className="text-2xl font-bold text-[#fa5c36] mb-4">Admins cannot access the user dashboard.</h2>
                  </div>
                ) : (
                  <Dashboard 
                    socket={socket} 
                    userProfile={userProfile} 
                    setIsAuthenticated={setIsAuthenticated} 
                    setUserProfile={setUserProfile} 
                  />
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="services" element={<ServicesDashboard />} />
            <Route path="subscriptions" element={<SubscriptionsDashboard />} />
            <Route path="profile" element={<Profile setIsAuthenticated={setIsAuthenticated} setUserProfile={setUserProfile} />} />
          </Route>
          <Route 
            path="/admin" 
            element={
              isAuthenticated && userProfile?.isAdmin ? (
                <AdminDashboard userProfile={userProfile} setIsAuthenticated={setIsAuthenticated} setUserProfile={setUserProfile} />
              ) : isAuthenticated && !userProfile?.isAdmin ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="charts" element={<AdminCharts />} />
            <Route path="profile" element={<AdminProfile userProfile={userProfile} />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

// Wrap App with Router
export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}