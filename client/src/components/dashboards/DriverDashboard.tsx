'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverDeliveries, useUpdateDeliveryStatus } from '@/lib/queries';
import { Input } from '@/components/ui/Input';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  const { data: deliveries, isLoading } = useDriverDeliveries(user?._id || '');
  const updateStatusMutation = useUpdateDeliveryStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    totalAssigned: deliveries?.length || 0,
    pendingPickup: deliveries?.filter((d) => d.status === 'Pending').length || 0,
    inTransit: deliveries?.filter((d) => d.status === 'InTransit').length || 0,
    completed: deliveries?.filter((d) => d.status === 'Delivered').length || 0,
  };

  const handleStatusUpdate = async () => {
    if (selectedDelivery && newStatus) {
      try {
        await updateStatusMutation.mutateAsync({
          id: selectedDelivery,
          status: newStatus,
          notes: deliveryNotes || undefined,
        });
        setSelectedDelivery('');
        setNewStatus('');
        setDeliveryNotes('');
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Pending':
        return 'InTransit';
      case 'InTransit':
        return 'Delivered';
      default:
        return currentStatus;
    }
  };

  const canUpdateStatus = (status: string) => {
    return status === 'Pending' || status === 'InTransit';
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assigned</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAssigned}</p>
            </div>
            <Icon icon="solar:delivery-outline" className="text-5xl text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Pickup</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingPickup}</p>
            </div>
            <Icon icon="solar:clock-circle-outline" className="text-5xl text-yellow-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inTransit}</p>
            </div>
            <Icon icon="solar:box-outline" className="text-5xl text-blue-600" />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <Icon icon="solar:check-circle-outline" className="text-5xl text-green-600" />
          </div>
        </div>
      </div>

      {/* Quick Status Update */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Update Delivery Status</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Select Delivery</label>
            <select
              value={selectedDelivery}
              onChange={(e) => {
                setSelectedDelivery(e.target.value);
                const delivery = deliveries?.find((d) => d._id === e.target.value);
                if (delivery && canUpdateStatus(delivery.status)) {
                  setNewStatus(getNextStatus(delivery.status));
                }
              }}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Choose delivery...</option>
              {deliveries
                ?.filter((d) => canUpdateStatus(d.status))
                .map((delivery) => (
                  <option key={delivery._id} value={delivery._id}>
                    {delivery.trackingNumber} - {delivery.status}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              disabled={!selectedDelivery}
            >
              <option value="">Select status...</option>
              <option value="InTransit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <Input
            label="Delivery Notes"
            type="text"
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Optional notes..."
          />

          <div className="flex items-end">
            <button
              onClick={handleStatusUpdate}
              disabled={!selectedDelivery || !newStatus || updateStatusMutation.isPending}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Deliveries */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">My Assigned Deliveries</h3>
        <div className="space-y-4">
          {deliveries?.map((delivery) => (
            <div
              key={delivery._id}
              className="rounded-lg border p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{delivery.trackingNumber}</h4>
                  <p className="text-gray-600">{delivery.packageDetails.description}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      delivery.status === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : delivery.status === 'InTransit'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {delivery.status}
                  </span>
                  <p className="mt-1 text-sm text-gray-500">
                    Created: {new Date(delivery.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Pickup Address */}
                <div className="rounded-lg bg-green-50 p-4">
                  <h5 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                    <Icon
                      icon="solar:map-point-outline"
                      className="mr-2 text-base text-green-600"
                    />
                    Pickup Address
                  </h5>
                  <div className="text-sm text-gray-700">
                    <p>{delivery.pickupAddress.street}</p>
                    <p>
                      {delivery.pickupAddress.city}, {delivery.pickupAddress.state}{' '}
                      {delivery.pickupAddress.zipCode}
                    </p>
                    <p>{delivery.pickupAddress.country}</p>
                  </div>
                  <button
                    onClick={() => {
                      const address = `${delivery.pickupAddress.street}, ${delivery.pickupAddress.city}, ${delivery.pickupAddress.state} ${delivery.pickupAddress.zipCode}`;
                      window.open(
                        `https://maps.google.com/maps?q=${encodeURIComponent(address)}`,
                        '_blank',
                      );
                    }}
                    className="mt-2 flex items-center text-sm text-green-600 hover:text-green-800"
                  >
                    <Icon icon="solar:map-arrow-up-outline" className="mr-1 text-base" />
                    Get Directions
                  </button>
                </div>

                {/* Delivery Address */}
                <div className="rounded-lg bg-red-50 p-4">
                  <h5 className="mb-2 flex items-center text-sm font-semibold text-gray-900">
                    <Icon icon="solar:map-point-outline" className="mr-2 text-base text-red-600" />
                    Delivery Address
                  </h5>
                  <div className="text-sm text-gray-700">
                    <p>{delivery.deliveryAddress.street}</p>
                    <p>
                      {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state}{' '}
                      {delivery.deliveryAddress.zipCode}
                    </p>
                    <p>{delivery.deliveryAddress.country}</p>
                  </div>
                  <button
                    onClick={() => {
                      const address = `${delivery.deliveryAddress.street}, ${delivery.deliveryAddress.city}, ${delivery.deliveryAddress.state} ${delivery.deliveryAddress.zipCode}`;
                      window.open(
                        `https://maps.google.com/maps?q=${encodeURIComponent(address)}`,
                        '_blank',
                      );
                    }}
                    className="mt-2 flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <Icon icon="solar:map-arrow-up-outline" className="mr-1 text-base" />
                    Get Directions
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Package Details */}
                  <div>
                    <h6 className="mb-1 text-sm font-semibold text-gray-900">Package Details</h6>
                    <div className="text-sm text-gray-600">
                      <p>Weight: {delivery.packageDetails.weight} lbs</p>
                      {delivery.packageDetails && delivery.packageDetails.dimensions && (
                        <p>
                          Dimensions: {delivery.packageDetails.dimensions.length}&quot; x{' '}
                          {delivery.packageDetails.dimensions.width}&quot; x{' '}
                          {delivery.packageDetails.dimensions.height}&quot;
                        </p>
                      )}
                      <p>Value: ${delivery.packageDetails.value}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h6 className="mb-1 text-sm font-semibold text-gray-900">Customer</h6>
                    <div className="text-sm text-gray-600">
                      <p>
                        {typeof delivery.customerId === 'object'
                          ? delivery.customerId.name
                          : 'Unknown'}
                      </p>
                      {typeof delivery.customerId === 'object' && delivery.customerId.phone && (
                        <button
                          onClick={() => window.open(`tel:${delivery.customerId.phone}`)}
                          className="mt-1 flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Icon icon="solar:phone-outline" className="mr-1 text-base" />
                          {delivery.customerId.phone}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  {delivery.deliveryNotes && (
                    <div>
                      <h6 className="mb-1 text-sm font-semibold text-gray-900">Notes</h6>
                      <p className="text-sm text-gray-600">{delivery.deliveryNotes}</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                {canUpdateStatus(delivery.status) && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDelivery(delivery._id);
                        setNewStatus(getNextStatus(delivery.status));
                      }}
                      className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      {delivery.status === 'Pending' ? 'Start Delivery' : 'Mark as Delivered'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {deliveries?.length === 0 && (
            <div className="py-8 text-center">
              <Icon
                icon="solar:danger-circle-outline"
                className="mx-auto mb-4 text-5xl text-gray-400"
              />
              <p className="text-gray-600">No deliveries assigned to you yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
