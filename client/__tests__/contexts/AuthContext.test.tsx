import React, { ReactNode } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Mock the API calls
jest.mock('@/lib/api', () => ({
  authAPI: {
    getMe: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

const { authAPI } = require('@/lib/api');

const waitForAuthSettled = () =>
  waitFor(() => {
    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
  });

// Test component that uses the auth context
const TestComponent = () => {
  const { user, login, register, logout, loading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.name : 'No User'}</div>
      <button onClick={() => login('test@example.com', 'password').catch(() => {})}>
        Login
      </button>
      <button onClick={() => register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: 'customer'
      }).catch(() => {})}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuthProvider = async (ui: ReactNode) => {
  const result = render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );

  await act(async () => {});

  return result;
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
      configurable: true,
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

  it('provides initial loading state', async () => {
    authAPI.getMe.mockResolvedValue({ data: { data: null } });
    
    await renderWithAuthProvider(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');

    await waitForAuthSettled();

    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('loads current user on initialization', async () => {
    const mockUser = {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
    };

    authAPI.getMe.mockResolvedValue({ data: { data: mockUser } });
    
  await renderWithAuthProvider(<TestComponent />);
    
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

    authAPI.getMe.mockResolvedValue({ data: { data: null } });
    authAPI.login.mockResolvedValue({ data: { data: { user: mockUser } } });
    
  await renderWithAuthProvider(<TestComponent />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);
    
    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
      expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
    });
  });

  it('handles login failure', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    authAPI.getMe.mockResolvedValue({ data: { data: null } });
    authAPI.login.mockRejectedValue(new Error('Invalid credentials'));
    
  await renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    const loginButton = screen.getByText('Login');
    
    await user.click(loginButton);

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
    
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

    authAPI.getMe.mockResolvedValue({ data: { data: null } });
    authAPI.register.mockResolvedValue({ data: { data: { user: mockUser } } });
    
  await renderWithAuthProvider(<TestComponent />);
    
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
    
    authAPI.getMe.mockResolvedValue({ data: { data: null } });
    authAPI.register.mockRejectedValue(new Error('Email already exists'));
    
  await renderWithAuthProvider(<TestComponent />);
    
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
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
    
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

    authAPI.getMe.mockResolvedValue({ data: { data: mockUser } });
    authAPI.logout.mockResolvedValue({ data: { data: null } });
    
  await renderWithAuthProvider(<TestComponent />);
    
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

    authAPI.getMe.mockResolvedValue({ data: { data: mockUser } });
    authAPI.logout.mockRejectedValue(new Error('Logout failed'));
    
  await renderWithAuthProvider(<TestComponent />);
    
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
    
    authAPI.getMe.mockRejectedValue(new Error('Network error'));
    
    await renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
    
    consoleSpy.mockRestore();
  });

  it('prevents multiple initializations', async () => {
    authAPI.getMe.mockResolvedValue({ data: { data: null } });
    
    const { rerender } = await renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Rerender and check that getCurrentUser is not called again
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(authAPI.getMe).toHaveBeenCalledTimes(1);
  });

  it('handles server-side rendering', async () => {
    // Mock window as undefined to simulate SSR
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    
    authAPI.getMe.mockResolvedValue({ data: { data: null } });
    
    await renderWithAuthProvider(<TestComponent />);
    
    // Should not crash during SSR
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    // Restore window
    global.window = originalWindow;
  });

  it('cleans up properly on unmount', async () => {
    authAPI.getMe.mockResolvedValue({ data: { data: null } });
    
    const { unmount } = await renderWithAuthProvider(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
    
    // Should not throw error on unmount
    expect(() => unmount()).not.toThrow();
  });

  it('maintains consistent loading state', async () => {
    authAPI.getMe.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { data: null } }), 100))
    );
    
    await renderWithAuthProvider(<TestComponent />);
    
    // Should start loading
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    
    // Should finish loading after promise resolves
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    }, { timeout: 200 });
  });
});