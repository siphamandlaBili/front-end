import React from 'react';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard({ socket, setIsAuthenticated, setUserProfile }) {
  return (
    <DashboardLayout setIsAuthenticated={setIsAuthenticated} setUserProfile={setUserProfile}>
      <Outlet context={{ socket }} />
    </DashboardLayout>
  );
}
