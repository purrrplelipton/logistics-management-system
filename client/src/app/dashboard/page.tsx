'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@iconify-icon/react';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import CustomerDashboard from '@/components/dashboards/CustomerDashboard';
import DriverDashboard from '@/components/dashboards/DriverDashboard';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'customer':
        return <CustomerDashboard />;
      case 'driver':
        return <DriverDashboard />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-red-600">Invalid user role: {user.role}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Icon icon="solar:delivery-outline" className="text-[2rem]" />
              <span className="ml-2 font-bold text-xl">LogiTrack</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon icon="solar:user-outline" className="text-xl" />
                <span className="text-sm">{user.name}</span>
                <span className="text-xs bg-blue-500 px-2 py-1 rounded-full capitalize">
                  {user.role}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
              >
                <Icon icon="solar:logout-2 outline" className="text-xl" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user.name}! Here&apos;s what&apos;s happening with your logistics.
            </p>
          </div>
          
          {renderDashboard()}
        </div>
      </div>
    </div>
  );
}