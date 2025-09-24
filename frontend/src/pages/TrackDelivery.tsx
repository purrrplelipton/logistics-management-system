import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { deliveriesAPI } from '../services/api';

const TrackDelivery: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError('');
    setDeliveryInfo(null);

    try {
      const response = await deliveriesAPI.trackDelivery(trackingNumber.trim());
      setDeliveryInfo(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Delivery not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'InTransit':
        return <Truck className="h-6 w-6 text-blue-500" />;
      case 'Delivered':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Package className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'InTransit':
        return 'text-blue-600 bg-blue-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Package className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
            Track Your Delivery
          </h1>
          <p className="mt-2 text-gray-600">
            Enter your tracking number to get real-time updates
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter tracking number (e.g., TRK123456789)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !trackingNumber.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {deliveryInfo && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(deliveryInfo.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Tracking #{deliveryInfo.trackingNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order placed on {new Date(deliveryInfo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deliveryInfo.status)}`}>
                  {deliveryInfo.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {deliveryInfo.estimatedDeliveryDate && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Estimated Delivery</h4>
                    <p className="text-blue-800">
                      {new Date(deliveryInfo.estimatedDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {deliveryInfo.actualDeliveryDate && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Delivered On</h4>
                    <p className="text-green-800">
                      {new Date(deliveryInfo.actualDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {deliveryInfo.deliveryNotes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Delivery Notes</h4>
                  <p className="text-gray-700">{deliveryInfo.deliveryNotes}</p>
                </div>
              )}

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Delivery Timeline</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${deliveryInfo.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-gray-600">
                        {new Date(deliveryInfo.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${deliveryInfo.status === 'InTransit' || deliveryInfo.status === 'Delivered' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium">In Transit</p>
                      {deliveryInfo.status === 'InTransit' || deliveryInfo.status === 'Delivered' ? (
                        <p className="text-sm text-gray-600">Package is on the way</p>
                      ) : (
                        <p className="text-sm text-gray-400">Pending</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${deliveryInfo.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      {deliveryInfo.actualDeliveryDate ? (
                        <p className="text-sm text-gray-600">
                          {new Date(deliveryInfo.actualDeliveryDate).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">Pending</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackDelivery;