import React from 'react';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

export default function Dashboard({ socket }) {

  return (
    <DashboardLayout>
      <Outlet context={{ socket }} />
    </DashboardLayout>
  );
}
