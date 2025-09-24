import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Package, 
  Truck, 
  BarChart3, 
  Settings, 
  Search,
  Eye,
  UserPlus,
  PackageCheck
} from 'lucide-react';
import { deliveriesAPI, usersAPI } from '../services/api';
import { Delivery, User } from '../types';

const AdminDashboard: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    inTransitDeliveries: 0,
    deliveredDeliveries: 0,
    totalDrivers: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, usersRes, driversRes] = await Promise.all([
        deliveriesAPI.getDeliveries(),
        usersAPI.getUsers(),
        usersAPI.getDrivers()
      ]);

      const deliveriesData = deliveriesRes.data.data;
      const usersData = usersRes.data.data;
      const driversData = driversRes.data.data;

      setDeliveries(deliveriesData);
      setUsers(usersData);
      setDrivers(driversData);

      // Calculate stats
      setStats({
        totalDeliveries: deliveriesData.length,
        pendingDeliveries: deliveriesData.filter((d: Delivery) => d.status === 'Pending').length,
        inTransitDeliveries: deliveriesData.filter((d: Delivery) => d.status === 'InTransit').length,
        deliveredDeliveries: deliveriesData.filter((d: Delivery) => d.status === 'Delivered').length,
        totalDrivers: usersData.filter((u: User) => u.role === 'driver').length,
        totalCustomers: usersData.filter((u: User) => u.role === 'customer').length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignDriver = async (deliveryId: string, driverId: string) => {
    try {
      await deliveriesAPI.assignDriver(deliveryId, driverId);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = 
    ({ title, value, icon, color }) => (
      <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="text-gray-400">
            {icon}
          </div>
        </div>
      </div>
    );

  const DeliveriesOverview: React.FC = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Deliveries"
          value={stats.totalDeliveries}
          icon={<Package className="h-8 w-8" />}
          color="border-blue-500"
        />
        <StatCard
          title="Pending"
          value={stats.pendingDeliveries}
          icon={<Package className="h-8 w-8" />}
          color="border-yellow-500"
        />
        <StatCard
          title="In Transit"
          value={stats.inTransitDeliveries}
          icon={<Truck className="h-8 w-8" />}
          color="border-blue-500"
        />
        <StatCard
          title="Delivered"
          value={stats.deliveredDeliveries}
          icon={<PackageCheck className="h-8 w-8" />}
          color="border-green-500"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Deliveries</h3>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.slice(0, 10).map((delivery) => (
                <tr key={delivery._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {delivery.trackingNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.customerId.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {delivery.driverId ? delivery.driverId.name : (
                      <select
                        onChange={(e) => assignDriver(delivery._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="">Assign Driver</option>
                        {drivers.map((driver) => (
                          <option key={driver._id} value={driver._id}>
                            {driver.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      delivery.status === 'InTransit' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(delivery.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const UsersOverview: React.FC = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<Users className="h-8 w-8" />}
          color="border-purple-500"
        />
        <StatCard
          title="Drivers"
          value={stats.totalDrivers}
          icon={<Truck className="h-8 w-8" />}
          color="border-blue-500"
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers}
          icon={<Users className="h-8 w-8" />}
          color="border-green-500"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Users Management</h3>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.slice(0, 10).map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'driver' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const sidebarItems = [
    { name: 'Overview', path: '/admin', icon: BarChart3 },
    { name: 'Deliveries', path: '/admin/deliveries', icon: Package },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Drivers', path: '/admin/drivers', icon: Truck },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
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
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        </div>
        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/admin' && location.pathname === '/admin');
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
            <Route path="/deliveries" element={<DeliveriesOverview />} />
            <Route path="/users" element={<UsersOverview />} />
            <Route path="/drivers" element={<UsersOverview />} />
            <Route 
              path="/settings" 
              element={
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                  <p className="text-gray-600">Settings panel coming soon...</p>
                </div>
              } 
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;