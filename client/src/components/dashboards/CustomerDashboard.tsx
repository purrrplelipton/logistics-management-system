'use client';

import React, { useState } from 'react';
import { Package, Plus, Clock, Truck, CheckCircle, MapPin, Weight, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerDeliveries, useCreateDelivery } from '@/lib/queries';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    packageDetails: {
      description: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      value: ''
    }
  });

  const { data: deliveries, isLoading } = useCustomerDeliveries(user?._id || '');
  const createDeliveryMutation = useCreateDelivery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    totalDeliveries: deliveries?.length || 0,
    pendingDeliveries: deliveries?.filter(d => d.status === 'Pending').length || 0,
    inTransitDeliveries: deliveries?.filter(d => d.status === 'InTransit').length || 0,
    completedDeliveries: deliveries?.filter(d => d.status === 'Delivered').length || 0,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('pickupAddress.') || name.startsWith('deliveryAddress.')) {
      const [addressType, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [addressType]: {
          ...prev[addressType as keyof typeof prev],
          [field]: value
        }
      }));
    } else if (name.startsWith('packageDetails.dimensions.')) {
      const field = name.split('.')[2];
      setFormData(prev => ({
        ...prev,
        packageDetails: {
          ...prev.packageDetails,
          dimensions: {
            ...prev.packageDetails.dimensions,
            [field]: value
          }
        }
      }));
    } else if (name.startsWith('packageDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        packageDetails: {
          ...prev.packageDetails,
          [field]: value
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const deliveryData = {
        ...formData,
        packageDetails: {
          ...formData.packageDetails,
          weight: parseFloat(formData.packageDetails.weight),
          value: parseFloat(formData.packageDetails.value),
          dimensions: {
            length: parseFloat(formData.packageDetails.dimensions.length),
            width: parseFloat(formData.packageDetails.dimensions.width),
            height: parseFloat(formData.packageDetails.dimensions.height)
          }
        }
      };

      await createDeliveryMutation.mutateAsync(deliveryData);
      setShowCreateForm(false);
      setFormData({
        pickupAddress: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
        deliveryAddress: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
        packageDetails: {
          description: '',
          weight: '',
          dimensions: { length: '', width: '', height: '' },
          value: ''
        }
      });
    } catch (error) {
      console.error('Failed to create delivery:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDeliveries}</p>
            </div>
            <Package className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingDeliveries}</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inTransitDeliveries}</p>
            </div>
            <Truck className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedDeliveries}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
      </div>

      {/* Create Delivery Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5" />
          <span>New Delivery</span>
        </button>
      </div>

      {/* Create Delivery Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Delivery</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pickup Address */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Pickup Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="pickupAddress.street"
                  value={formData.pickupAddress.street}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  name="pickupAddress.city"
                  value={formData.pickupAddress.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  name="pickupAddress.state"
                  value={formData.pickupAddress.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  name="pickupAddress.zipCode"
                  value={formData.pickupAddress.zipCode}
                  onChange={handleInputChange}
                  placeholder="ZIP Code"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-600" />
                Delivery Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="deliveryAddress.street"
                  value={formData.deliveryAddress.street}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  name="deliveryAddress.city"
                  value={formData.deliveryAddress.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  name="deliveryAddress.state"
                  value={formData.deliveryAddress.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  name="deliveryAddress.zipCode"
                  value={formData.deliveryAddress.zipCode}
                  onChange={handleInputChange}
                  placeholder="ZIP Code"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Package Details */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Package Details
              </h4>
              <div className="space-y-4">
                <textarea
                  name="packageDetails.description"
                  value={formData.packageDetails.description}
                  onChange={handleInputChange}
                  placeholder="Package Description"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Weight className="h-4 w-4 inline mr-1" />
                      Weight (lbs)
                    </label>
                    <input
                      name="packageDetails.weight"
                      type="number"
                      step="0.1"
                      value={formData.packageDetails.weight}
                      onChange={handleInputChange}
                      placeholder="0.0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Length (in)</label>
                    <input
                      name="packageDetails.dimensions.length"
                      type="number"
                      step="0.1"
                      value={formData.packageDetails.dimensions.length}
                      onChange={handleInputChange}
                      placeholder="0.0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (in)</label>
                    <input
                      name="packageDetails.dimensions.width"
                      type="number"
                      step="0.1"
                      value={formData.packageDetails.dimensions.width}
                      onChange={handleInputChange}
                      placeholder="0.0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (in)</label>
                    <input
                      name="packageDetails.dimensions.height"
                      type="number"
                      step="0.1"
                      value={formData.packageDetails.dimensions.height}
                      onChange={handleInputChange}
                      placeholder="0.0"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Package Value ($)
                  </label>
                  <input
                    name="packageDetails.value"
                    type="number"
                    step="0.01"
                    value={formData.packageDetails.value}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={createDeliveryMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {createDeliveryMutation.isPending ? 'Creating...' : 'Create Delivery'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deliveries List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries?.map(delivery => (
                <tr key={delivery._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {delivery.trackingNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.packageDetails.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      delivery.status === 'InTransit' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof delivery.driverId === 'object' && delivery.driverId ? 
                      delivery.driverId.name : 
                      <span className="text-yellow-600">Not assigned</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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