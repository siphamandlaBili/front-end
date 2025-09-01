import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminDashboardLayout from '../components/AdminDashboardLayout';

export default function AdminDashboard({ userProfile, setIsAuthenticated, setUserProfile }) {
  return (
    <AdminDashboardLayout setIsAuthenticated={setIsAuthenticated} setUserProfile={setUserProfile}>
      <Outlet context={{ userProfile }} />
    </AdminDashboardLayout>
  );
}
