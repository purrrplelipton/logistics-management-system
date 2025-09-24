'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, LogOut, User, Package } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8" />
              <span className="ml-2 font-bold text-xl">LogiTrack</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span className="text-sm">{user.name}</span>
                <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Welcome!</h3>
                    <p className="text-gray-600">
                      You are logged in as {user.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Role</h3>
                    <p className="text-gray-600 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <Truck className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Status</h3>
                    <p className="text-gray-600">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Features for {user.role}:
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {user.role === 'admin' && (
                    <>
                      <li>Manage all deliveries and view system analytics</li>
                      <li>Assign drivers to pending deliveries</li>
                      <li>Manage users (customers and drivers)</li>
                      <li>Monitor system performance and metrics</li>
                    </>
                  )}
                  {user.role === 'customer' && (
                    <>
                      <li>Create new delivery requests with detailed package information</li>
                      <li>Track delivery status in real-time</li>
                      <li>View delivery history and past orders</li>
                      <li>Update profile and contact information</li>
                    </>
                  )}
                  {user.role === 'driver' && (
                    <>
                      <li>View assigned deliveries and route information</li>
                      <li>Update delivery status and add delivery notes</li>
                      <li>Access customer contact details</li>
                      <li>Get directions to pickup and delivery locations</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}