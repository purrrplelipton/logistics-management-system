import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle,
  MapPin,
  User,
  Phone,
  Navigation,
  Edit3
} from 'lucide-react';
import { deliveriesAPI } from '../services/api';
import { Delivery } from '../types';
import { useAuth } from '../contexts/AuthContext';

const DriverDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
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

  const updateDeliveryStatus = async (deliveryId: string, status: string, notes?: string) => {
    try {
      setUpdatingStatus(deliveryId);
      await deliveriesAPI.updateStatus(deliveryId, status, notes);
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const StatusUpdateModal: React.FC<{ 
    delivery: Delivery; 
    onClose: () => void; 
    onUpdate: (status: string, notes: string) => void 
  }> = ({ delivery, onClose, onUpdate }) => {
    const [newStatus, setNewStatus] = useState<'Pending' | 'InTransit' | 'Delivered'>(delivery.status as 'Pending' | 'InTransit' | 'Delivered');
    const [notes, setNotes] = useState(delivery.deliveryNotes || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdate(newStatus, notes);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Update Delivery Status
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'Pending' | 'InTransit' | 'Delivered')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="InTransit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any delivery notes..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AssignedDeliveries: React.FC = () => {
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

    const assignedDeliveries = deliveries.filter(d => d.driverId?._id === user?._id);

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
      total: assignedDeliveries.length,
      pending: assignedDeliveries.filter(d => d.status === 'Pending').length,
      inTransit: assignedDeliveries.filter(d => d.status === 'InTransit').length,
      delivered: assignedDeliveries.filter(d => d.status === 'Delivered').length
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assigned Deliveries</p>
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

        {/* Deliveries List */}
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Assigned Deliveries</h3>
          </div>
          
          {assignedDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No deliveries assigned</h3>
              <p className="mt-2 text-gray-500">You don't have any deliveries assigned to you yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {assignedDeliveries.map((delivery) => (
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
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                      <button
                        onClick={() => setSelectedDelivery(delivery)}
                        disabled={updatingStatus === delivery._id}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Update</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Customer Information</h5>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{delivery.customerId.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{delivery.customerId.phone || 'No phone'}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Package Details</h5>
                      <p className="text-sm text-gray-600 mb-1">
                        Weight: {delivery.packageDetails.weight} lbs
                      </p>
                      <p className="text-sm text-gray-600">
                        {delivery.packageDetails.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-blue-900 mb-1">Pickup Address</h5>
                          <p className="text-sm text-blue-800">
                            {delivery.pickupAddress.street}<br />
                            {delivery.pickupAddress.city}, {delivery.pickupAddress.state} {delivery.pickupAddress.zipCode}
                          </p>
                          <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                            <Navigation className="h-4 w-4" />
                            <span>Get Directions</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-green-900 mb-1">Delivery Address</h5>
                          <p className="text-sm text-green-800">
                            {delivery.deliveryAddress.street}<br />
                            {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state} {delivery.deliveryAddress.zipCode}
                          </p>
                          <button className="mt-2 text-sm text-green-600 hover:text-green-800 flex items-center space-x-1">
                            <Navigation className="h-4 w-4" />
                            <span>Get Directions</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {delivery.deliveryNotes && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Delivery Notes</h5>
                      <p className="text-sm text-gray-700">{delivery.deliveryNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Update Modal */}
        {selectedDelivery && (
          <StatusUpdateModal
            delivery={selectedDelivery}
            onClose={() => setSelectedDelivery(null)}
            onUpdate={(status, notes) => updateDeliveryStatus(selectedDelivery._id, status, notes)}
          />
        )}
      </div>
    );
  };

  const sidebarItems = [
    { name: 'My Deliveries', path: '/driver', icon: Package },
    { name: 'Route Planner', path: '/driver/routes', icon: Navigation },
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
          <h2 className="text-xl font-bold text-gray-800">Driver Dashboard</h2>
          <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
        </div>
        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/driver' && location.pathname === '/driver');
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
            <Route path="/" element={<AssignedDeliveries />} />
            <Route 
              path="/routes" 
              element={
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Planner</h3>
                  <p className="text-gray-600">Route planning feature coming soon...</p>
                </div>
              } 
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;