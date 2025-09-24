import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Clock, 
  Truck, 
  CheckCircle,
  MapPin,
  Weight
} from 'lucide-react';
import { deliveriesAPI } from '../services/api';
import { Delivery } from '../types';
import { useAuth } from '../contexts/AuthContext';

const CustomerDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveriesAPI.getDeliveries();
      setDeliveries(response.data.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const CreateDeliveryForm: React.FC = () => {
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
        value: ''
      },
      estimatedDeliveryDate: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const deliveryData = {
          ...formData,
          packageDetails: {
            ...formData.packageDetails,
            weight: parseFloat(formData.packageDetails.weight),
            value: formData.packageDetails.value ? parseFloat(formData.packageDetails.value) : 0
          }
        };

        await deliveriesAPI.createDelivery(deliveryData);
        setShowCreateForm(false);
        fetchDeliveries();
        
        // Reset form
        setFormData({
          pickupAddress: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
          deliveryAddress: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
          packageDetails: { description: '', weight: '', value: '' },
          estimatedDeliveryDate: ''
        });
      } catch (error) {
        console.error('Error creating delivery:', error);
      } finally {
        setSubmitting(false);
      }
    };

    const handleAddressChange = (type: 'pickupAddress' | 'deliveryAddress', field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [field]: value
        }
      }));
    };

    const handlePackageChange = (field: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        packageDetails: {
          ...prev.packageDetails,
          [field]: value
        }
      }));
    };

    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New Delivery</h3>
          <button
            onClick={() => setShowCreateForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup Address */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Pickup Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.pickupAddress.street}
                  onChange={(e) => handleAddressChange('pickupAddress', 'street', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.pickupAddress.city}
                  onChange={(e) => handleAddressChange('pickupAddress', 'city', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.pickupAddress.state}
                  onChange={(e) => handleAddressChange('pickupAddress', 'state', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  required
                  pattern="\d{5}(-\d{4})?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.pickupAddress.zipCode}
                  onChange={(e) => handleAddressChange('pickupAddress', 'zipCode', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Delivery Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.deliveryAddress.street}
                  onChange={(e) => handleAddressChange('deliveryAddress', 'street', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.deliveryAddress.city}
                  onChange={(e) => handleAddressChange('deliveryAddress', 'city', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.deliveryAddress.state}
                  onChange={(e) => handleAddressChange('deliveryAddress', 'state', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  type="text"
                  required
                  pattern="\d{5}(-\d{4})?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.deliveryAddress.zipCode}
                  onChange={(e) => handleAddressChange('deliveryAddress', 'zipCode', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Package Details</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.packageDetails.description}
                  onChange={(e) => handlePackageChange('description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.packageDetails.weight}
                    onChange={(e) => handlePackageChange('weight', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.packageDetails.value}
                    onChange={(e) => handlePackageChange('value', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date (Optional)</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.estimatedDeliveryDate}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedDeliveryDate: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Delivery'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const DeliveriesOverview: React.FC = () => {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'Pending':
          return <Clock className="h-5 w-5 text-yellow-500" />;
        case 'InTransit':
          return <Truck className="h-5 w-5 text-blue-500" />;
        case 'Delivered':
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        default:
          return <Package className="h-5 w-5 text-gray-500" />;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'InTransit':
          return 'bg-blue-100 text-blue-800';
        case 'Delivered':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const stats = {
      total: deliveries.length,
      pending: deliveries.filter(d => d.status === 'Pending').length,
      inTransit: deliveries.filter(d => d.status === 'InTransit').length,
      delivered: deliveries.filter(d => d.status === 'Delivered').length
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inTransit}</p>
              </div>
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-3xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Create Delivery Form */}
        {showCreateForm && <CreateDeliveryForm />}

        {/* Deliveries List */}
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">My Deliveries</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Delivery</span>
            </button>
          </div>
          
          {deliveries.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No deliveries yet</h3>
              <p className="mt-2 text-gray-500">Create your first delivery request to get started.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Delivery
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <div key={delivery._id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(delivery.status)}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          #{delivery.trackingNumber}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Created on {new Date(delivery.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pickup</p>
                        <p className="text-sm text-gray-600">
                          {delivery.pickupAddress.street}, {delivery.pickupAddress.city}, {delivery.pickupAddress.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Delivery</p>
                        <p className="text-sm text-gray-600">
                          {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Weight className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Package</p>
                        <p className="text-sm text-gray-600">
                          {delivery.packageDetails.weight} lbs
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{delivery.packageDetails.description}</p>
                  </div>

                  {delivery.driverId && (
                    <div className="mt-4 flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        Driver: <span className="font-medium">{delivery.driverId.name}</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const sidebarItems = [
    { name: 'My Deliveries', path: '/customer', icon: Package },
    { name: 'Create Delivery', path: '/customer/create', icon: Plus },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Customer Dashboard</h2>
          <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
        </div>
        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/customer' && location.pathname === '/customer');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Routes>
            <Route path="/" element={<DeliveriesOverview />} />
            <Route path="/create" element={<DeliveriesOverview />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;