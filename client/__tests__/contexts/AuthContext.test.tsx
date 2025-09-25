import React, { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Mock the API calls
jest.mock('@/lib/api', () => ({
  authAPI: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

const { authAPI } = require('@/lib/api');

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, register, logout, loading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.name : 'No User'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: 'customer'
      })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuthProvider = (ui: ReactNode) => {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    
    consoleSpy.mockRestore();
  });

  it('provides initial loading state', () => {
    authAPI.getCurrentUser.mockResolvedValue(null);
    
    renderWithAuthProvider(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('loads current user on initialization', async () => {
    const mockUser = {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
    };

    authAPI.getCurrentUser.mockResolvedValue(mockUser);
    
    renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
    });
  });

  it('handles login successfully', async () => {
    const user = userEvent.setup();
    const mockUser = {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
    };

    authAPI.getCurrentUser.mockResolvedValue(null);
    authAPI.login.mockResolvedValue({ token: 'fake-token', user: mockUser });
    
    renderWithAuthProvider(<TestComponent />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
    });
  });

  it('handles login failure', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    authAPI.getCurrentUser.mockResolvedValue(null);
    authAPI.login.mockRejectedValue(new Error('Invalid credentials'));
    
    renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    const loginButton = screen.getByText('Login');
    
    await expect(async () => {
      await user.click(loginButton);
    }).rejects.toThrow('Invalid credentials');
    
    consoleSpy.mockRestore();
  });

  it('handles registration successfully', async () => {
    const user = userEvent.setup();
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
    };

    authAPI.getCurrentUser.mockResolvedValue(null);
    authAPI.register.mockResolvedValue({ token: 'fake-token', user: mockUser });
    
    renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    const registerButton = screen.getByText('Register');
    await user.click(registerButton);
    
    await waitFor(() => {
      expect(authAPI.register).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: 'customer',
      });
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
    });
  });

  it('handles registration failure', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    authAPI.getCurrentUser.mockResolvedValue(null);
    authAPI.register.mockRejectedValue(new Error('Email already exists'));
    
    renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    const registerButton = screen.getByText('Register');
    
    await expect(async () => {
      await user.click(registerButton);
    }).rejects.toThrow('Email already exists');
    
    consoleSpy.mockRestore();
  });

  it('handles logout successfully', async () => {
    const user = userEvent.setup();
    const mockUser = {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
    };

    authAPI.getCurrentUser.mockResolvedValue(mockUser);
    authAPI.logout.mockResolvedValue(undefined);
    
    renderWithAuthProvider(<TestComponent />);
    
    // Wait for initial user load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
    });
    
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);
    
    await waitFor(() => {
      expect(authAPI.logout).toHaveBeenCalled();
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
  });

  it('handles logout failure', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockUser = {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
    };

    authAPI.getCurrentUser.mockResolvedValue(mockUser);
    authAPI.logout.mockRejectedValue(new Error('Logout failed'));
    
    renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
    });
    
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);
    
    // Should still clear user even if logout fails
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
    
    consoleSpy.mockRestore();
  });

  it('handles getCurrentUser failure during initialization', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    authAPI.getCurrentUser.mockRejectedValue(new Error('Network error'));
    
    renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
    
    consoleSpy.mockRestore();
  });

  it('prevents multiple initializations', async () => {
    authAPI.getCurrentUser.mockResolvedValue(null);
    
    const { rerender } = renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Rerender and check that getCurrentUser is not called again
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(authAPI.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('handles server-side rendering', () => {
    // Mock window as undefined to simulate SSR
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    
    authAPI.getCurrentUser.mockResolvedValue(null);
    
    renderWithAuthProvider(<TestComponent />);
    
    // Should not crash during SSR
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    // Restore window
    global.window = originalWindow;
  });

  it('cleans up properly on unmount', async () => {
    authAPI.getCurrentUser.mockResolvedValue(null);
    
    const { unmount } = renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Should not throw error on unmount
    expect(() => unmount()).not.toThrow();
  });

  it('maintains consistent loading state', async () => {
    authAPI.getCurrentUser.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(null), 100))
    );
    
    renderWithAuthProvider(<TestComponent />);
    
    // Should start loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    // Should finish loading after promise resolves
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    }, { timeout: 200 });
  });
});