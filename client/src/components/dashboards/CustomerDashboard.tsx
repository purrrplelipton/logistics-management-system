'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify-icon/react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerDeliveries, useCreateDelivery } from '@/lib/queries';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
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
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading deliveries"
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
        />
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
      setShowCreateModal(false);
      setFormData({
        pickupAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
        deliveryAddress: { street: '', city: '', state: '', zipCode: '', country: '' },
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
            <Icon icon="solar:box-outline" className="text-5xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingDeliveries}</p>
            </div>
            <Icon icon="solar:clock-circle-outline" className="text-5xl text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-3xl font-bold text-blue-600">{stats.inTransitDeliveries}</p>
            </div>
            <Icon icon="solar:delivery-outline" className="text-5xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedDeliveries}</p>
            </div>
            <Icon icon="solar:check-circle-outline" className="text-5xl text-green-600" />
          </div>
        </div>
      </div>

      {/* Create Delivery Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Deliveries</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Create new delivery request"
        >
          <Icon icon="solar:add-circle-outline" className="text-xl" />
          <span>New Delivery</span>
        </button>
      </div>

      {/* Create Delivery Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Delivery"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup Address */}
          <fieldset>
            <legend className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Icon icon="solar:map-point-outline" className="text-xl mr-2 text-green-600" aria-hidden="true" />
              Pickup Address
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="pickupAddress.street"
                label="Street Address"
                value={formData.pickupAddress.street}
                onChange={handleInputChange}
                placeholder="e.g., 123 Main Street, Apartment 4B"
                required
                aria-describedby="pickup-street-help"
              />
              <Input
                name="pickupAddress.city"
                label="City"
                value={formData.pickupAddress.city}
                onChange={handleInputChange}
                placeholder="e.g., London, Tokyo, São Paulo"
                required
              />
              <Input
                name="pickupAddress.state"
                label="State/Province/Region"
                value={formData.pickupAddress.state}
                onChange={handleInputChange}
                placeholder="State/Province/Region"
                required
              />
              <Input
                name="pickupAddress.zipCode"
                label="Postal Code"
                value={formData.pickupAddress.zipCode}
                onChange={handleInputChange}
                placeholder="Postal/ZIP Code"
                required
              />
              <Input
                name="pickupAddress.country"
                label="Country"
                value={formData.pickupAddress.country}
                onChange={handleInputChange}
                placeholder="e.g., United Kingdom, Japan, Brazil"
                required
              />
            </div>
          </fieldset>

          {/* Delivery Address */}
          <fieldset>
            <legend className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Icon icon="solar:map-point-outline" className="text-xl mr-2 text-red-600" aria-hidden="true" />
              Delivery Address
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="deliveryAddress.street"
                label="Street Address"
                value={formData.deliveryAddress.street}
                onChange={handleInputChange}
                placeholder="e.g., 456 Oak Avenue, Suite 200"
                required
              />
              <Input
                name="deliveryAddress.city"
                label="City"
                value={formData.deliveryAddress.city}
                onChange={handleInputChange}
                placeholder="e.g., Berlin, Sydney, Mumbai"
                required
              />
              <Input
                name="deliveryAddress.state"
                label="State/Province/Region"
                value={formData.deliveryAddress.state}
                onChange={handleInputChange}
                placeholder="State/Province/Region"
                required
              />
              <Input
                name="deliveryAddress.zipCode"
                label="Postal Code"
                value={formData.deliveryAddress.zipCode}
                onChange={handleInputChange}
                placeholder="Postal/ZIP Code"
                required
              />
              <Input
                name="deliveryAddress.country"
                label="Country"
                value={formData.deliveryAddress.country}
                onChange={handleInputChange}
                placeholder="e.g., Germany, Australia, India"
                required
              />
            </div>
          </fieldset>

          {/* Package Details */}
          <fieldset>
            <legend className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Icon icon="solar:box-outline" className="text-xl mr-2 text-blue-600" aria-hidden="true" />
              Package Details
            </legend>
            <div className="space-y-4">
              <div>
                <label htmlFor="package-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Package Description *
                </label>
                <textarea
                  id="package-description"
                  name="packageDetails.description"
                  value={formData.packageDetails.description}
                  onChange={handleInputChange}
                  placeholder="Describe contents, fragility, special handling needs..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-describedby="description-help"
                />
                <p id="description-help" className="mt-1 text-sm text-gray-500">
                  Provide a detailed description to help our drivers handle your package properly.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  name="packageDetails.weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  label="Weight (kg/lbs)"
                  startElement={<Icon icon="solar:scale-outline" className="text-xl" />}
                  value={formData.packageDetails.weight}
                  onChange={handleInputChange}
                  placeholder="Enter weight"
                  required
                  aria-describedby="weight-help"
                />
                <Input
                  name="packageDetails.dimensions.length"
                  type="number"
                  step="0.1"
                  min="0"
                  label="Length (cm/inches)"
                  value={formData.packageDetails.dimensions.length}
                  onChange={handleInputChange}
                  placeholder="Enter length"
                />
                <Input
                  name="packageDetails.dimensions.width"
                  type="number"
                  step="0.1"
                  min="0"
                  label="Width (cm/inches)"
                  value={formData.packageDetails.dimensions.width}
                  onChange={handleInputChange}
                  placeholder="Enter width"
                />
                <Input
                  name="packageDetails.dimensions.height"
                  type="number"
                  step="0.1"
                  min="0"
                  label="Height (cm/inches)"
                  value={formData.packageDetails.dimensions.height}
                  onChange={handleInputChange}
                  placeholder="Enter height"
                />
              </div>
              <Input
                name="packageDetails.value"
                type="number"
                step="0.01"
                min="0"
                label="Package Value"
                startElement={<Icon icon="solar:dollar-outline" className="text-xl" />}
                value={formData.packageDetails.value}
                onChange={handleInputChange}
                placeholder="Declared value (optional)"
                aria-describedby="value-help"
              />
              <p id="value-help" className="text-sm text-gray-500">
                Enter the declared value for insurance purposes.
              </p>
            </div>
          </fieldset>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDeliveryMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              aria-describedby="submit-help"
            >
              {createDeliveryMutation.isPending ? (
                <>
                  <span className="inline-block animate-spin rounded-full text-base border-b-2 border-white mr-2"></span>
                  Creating...
                </>
              ) : (
                'Create Delivery'
              )}
            </button>
            <p id="submit-help" className="sr-only">
              This will create a new delivery request and generate a tracking number
            </p>
          </div>
        </form>
      </Modal>

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