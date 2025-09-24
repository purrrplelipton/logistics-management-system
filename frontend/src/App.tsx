import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Simple components for testing
const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Login to LogiTrack</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const SimpleNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav style={{ backgroundColor: '#2563eb', color: 'white', padding: '1rem' }}>
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">LogiTrack</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.name} ({user.role})</span>
            <button 
              onClick={logout}
              className="bg-blue-700 px-4 py-2 rounded-md hover:bg-blue-800"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <SimpleNavbar />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">{user?.role} Dashboard</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>Welcome to your dashboard, {user?.name}!</p>
          <p>Role: {user?.role}</p>
          <p>Email: {user?.email}</p>
          <div className="mt-4">
            <h3 className="font-bold mb-2">Available Features:</h3>
            <ul className="list-disc list-inside space-y-1">
              {user?.role === 'admin' && (
                <>
                  <li>Manage all deliveries</li>
                  <li>Assign drivers to deliveries</li>
                  <li>Manage users</li>
                  <li>View system analytics</li>
                </>
              )}
              {user?.role === 'customer' && (
                <>
                  <li>Create delivery requests</li>
                  <li>Track delivery status</li>
                  <li>View delivery history</li>
                </>
              )}
              {user?.role === 'driver' && (
                <>
                  <li>View assigned deliveries</li>
                  <li>Update delivery status</li>
                  <li>Get route directions</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  return <Dashboard />;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<DashboardRedirect />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
