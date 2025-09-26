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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
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
          <div className="py-8 text-center">
            <p className="text-red-600">Invalid user role: {user.role}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <Icon icon="solar:delivery-outline" className="text-[2rem]" />
              <span className="ml-2 text-xl font-bold">LogiTrack</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon icon="solar:user-outline" className="text-xl" />
                <span className="text-sm">{user.name}</span>
                <span className="rounded-full bg-blue-500 px-2 py-1 text-xs capitalize">
                  {user.role}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-1 transition-colors hover:text-blue-200"
              >
                <Icon icon="solar:logout-2 outline" className="text-xl" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h1>
            <p className="mt-1 text-gray-600">
              Welcome back, {user.name}! Here&apos;s what&apos;s happening with your logistics.
            </p>
          </div>

          {renderDashboard()}
        </div>
      </div>
    </div>
  );
}
