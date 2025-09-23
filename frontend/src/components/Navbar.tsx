import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Truck, User, Package } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'customer':
        return '/customer';
      case 'driver':
        return '/driver';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center space-x-2">
              <Truck className="h-8 w-8" />
              <span className="font-bold text-xl">LogiTrack</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{user.name}</span>
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                    {user.role}
                  </span>
                </div>
                
                <Link
                  to="/track"
                  className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
                >
                  <Package className="h-5 w-5" />
                  <span>Track</span>
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;