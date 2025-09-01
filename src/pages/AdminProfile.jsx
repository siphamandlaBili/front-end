import React from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function AdminProfile({ userProfile, setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      if (setIsAuthenticated) setIsAuthenticated(false);
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-6 sm:px-6 bg-gradient-to-r from-[#fa5c36] to-[#ff7f50] text-white">
          <h3 className="text-2xl font-bold">Admin Profile</h3>
          <p className="mt-1 max-w-2xl text-sm opacity-90">Administrator account details</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">MSISDN</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userProfile?.msisdn || 'Not provided'}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Provider</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 capitalize">{userProfile?.provider || 'Not provided'}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{userProfile?.memberSince ? new Date(userProfile.memberSince).toLocaleDateString() : 'Not provided'}</dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <span className="bg-[#fa5c36] text-white px-3 py-1 rounded-full text-xs font-bold">Admin</span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="mt-6 px-4 pb-6 flex space-x-4">
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            Edit Profile
          </button>
          <button className="flex-1 bg-[#fa5c36] hover:bg-[#e04e2a] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            View Activity
          </button>
        </div>
      </div>
    </div>
  );
}