'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { useDeliveries, useUsers, useDrivers, useAssignDriver } from '@/lib/queries';

export default function AdminDashboard() {
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');

  const { data: deliveries, isLoading: deliveriesLoading } = useDeliveries();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: drivers, isLoading: driversLoading } = useDrivers();
  const assignDriverMutation = useAssignDriver();

  if (deliveriesLoading || usersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading dashboard"
          data-testid="dashboard-loading"
          className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"
        />
      </div>
    );
  }

  const stats = {
    totalDeliveries: deliveries?.length || 0,
    pendingDeliveries: deliveries?.filter((d) => d.status === 'Pending').length || 0,
    inTransitDeliveries: deliveries?.filter((d) => d.status === 'InTransit').length || 0,
    completedDeliveries: deliveries?.filter((d) => d.status === 'Delivered').length || 0,
    totalUsers: users?.length || 0,
    totalDrivers: users?.filter((u) => u.role === 'driver').length || 0,
    totalCustomers: users?.filter((u) => u.role === 'customer').length || 0,
  };

  const handleAssignDriver = async () => {
    if (selectedDelivery && selectedDriver) {
      try {
        await assignDriverMutation.mutateAsync({
          deliveryId: selectedDelivery,
          driverId: selectedDriver,
        });
        setSelectedDelivery('');
        setSelectedDriver('');
      } catch (error) {
        console.error('Failed to assign driver:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDeliveries}</p>
            </div>
            <Icon icon="solar:box-outline" className="text-5xl text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingDeliveries}</p>
            </div>
            <Icon icon="solar:clock-circle-outline" className="text-5xl text-yellow-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inTransitDeliveries}</p>
            </div>
            <Icon icon="solar:delivery-outline" className="text-5xl text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedDeliveries}</p>
            </div>
            <Icon icon="solar:check-circle-outline" className="text-5xl text-green-600" />
          </div>
        </div>
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Icon
              icon="solar:users-group-rounded-outline"
              className="text-[2.5rem] text-purple-600"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drivers</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalDrivers}</p>
            </div>
            <Icon icon="solar:delivery-outline" className="text-[2.5rem] text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalCustomers}</p>
            </div>
            <Icon
              icon="solar:users-group-rounded-outline"
              className="text-[2.5rem] text-green-600"
            />
          </div>
        </div>
      </div>

      {/* Driver Assignment */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Assign Driver to Delivery</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="pending-delivery-select"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Select Pending Delivery
            </label>
            <select
              id="pending-delivery-select"
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Choose delivery...</option>
              {deliveries
                ?.filter((d) => d.status === 'Pending')
                .map((delivery) => (
                  <option key={delivery._id} value={delivery._id}>
                    {delivery.trackingNumber} - {delivery.packageDetails.description}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="driver-select" className="mb-2 block text-sm font-medium text-gray-700">
              Select Driver
            </label>
            <select
              id="driver-select"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              disabled={driversLoading}
            >
              <option value="">Choose driver...</option>
              {drivers?.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} - {driver.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAssignDriver}
              disabled={!selectedDelivery || !selectedDriver || assignDriverMutation.isPending}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {assignDriverMutation.isPending ? 'Assigning...' : 'Assign Driver'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Recent Deliveries</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tracking #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {deliveries?.slice(0, 10).map((delivery) => (
                <tr key={delivery._id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {delivery.trackingNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {typeof delivery.customerId === 'object' ? delivery.customerId.name : 'Unknown'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {typeof delivery.driverId === 'object' && delivery.driverId ? (
                      delivery.driverId.name
                    ) : (
                      <span className="text-yellow-600">Unassigned</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        delivery.status === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : delivery.status === 'InTransit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {delivery.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(delivery.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
