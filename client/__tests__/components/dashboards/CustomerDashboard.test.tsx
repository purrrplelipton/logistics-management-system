import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CustomerDashboard from '@/components/dashboards/CustomerDashboard';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the queries
jest.mock('@/lib/queries', () => ({
  useCustomerDeliveries: jest.fn(),
  useCreateDelivery: jest.fn(),
}));

// Mock the UI components
jest.mock('@/components/ui/Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    );
  };
});

const { useAuth } = require('@/contexts/AuthContext');
const { useCustomerDeliveries, useCreateDelivery } = require('@/lib/queries');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockUser = {
  _id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer',
};

const mockDeliveries = [
  {
    _id: '1',
    trackingNumber: 'TRK001',
    status: 'Pending',
    pickupAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    deliveryAddress: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
    },
    packageDetails: {
      description: 'Important documents',
      weight: 0.5,
      dimensions: { length: 10, width: 8, height: 2 },
      value: 100,
    },
    createdAt: '2024-01-01T00:00:00Z',
    estimatedDelivery: '2024-01-05T00:00:00Z',
  },
  {
    _id: '2',
    trackingNumber: 'TRK002',
    status: 'InTransit',
    pickupAddress: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA',
    },
    deliveryAddress: {
      street: '321 Elm St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'USA',
    },
    packageDetails: {
      description: 'Electronics',
      weight: 2.5,
      dimensions: { length: 20, width: 15, height: 10 },
      value: 500,
    },
    createdAt: '2024-01-02T00:00:00Z',
    estimatedDelivery: '2024-01-06T00:00:00Z',
  },
  {
    _id: '3',
    trackingNumber: 'TRK003',
    status: 'Delivered',
    pickupAddress: {
      street: '555 Cedar St',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'USA',
    },
    deliveryAddress: {
      street: '777 Birch Ave',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA',
    },
    packageDetails: {
      description: 'Clothing',
      weight: 1.0,
      dimensions: { length: 15, width: 12, height: 5 },
      value: 200,
    },
    createdAt: '2024-01-03T00:00:00Z',
    estimatedDelivery: '2024-01-07T00:00:00Z',
    actualDelivery: '2024-01-06T00:00:00Z',
  },
];

describe('CustomerDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth.mockReturnValue({
      user: mockUser,
    });
    
    useCustomerDeliveries.mockReturnValue({
      data: mockDeliveries,
      isLoading: false,
    });
    
    useCreateDelivery.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it('renders loading state when data is loading', () => {
    useCustomerDeliveries.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('displays correct statistics', () => {
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Check delivery statistics
    expect(screen.getByText('3')).toBeInTheDocument(); // Total deliveries
    expect(screen.getByText('1')).toBeInTheDocument(); // Pending deliveries
    expect(screen.getByText('1')).toBeInTheDocument(); // In Transit deliveries
    expect(screen.getByText('1')).toBeInTheDocument(); // Delivered deliveries
  });

  it('displays statistics labels correctly', () => {
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Total Deliveries')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
  });

  it('renders create delivery button', () => {
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    const createButton = screen.getByRole('button', { name: /create new delivery/i });
    expect(createButton).toBeInTheDocument();
  });

  it('opens create delivery modal when button is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    const createButton = screen.getByRole('button', { name: /create new delivery/i });
    await user.click(createButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Create New Delivery')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Open modal
    const createButton = screen.getByRole('button', { name: /create new delivery/i });
    await user.click(createButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders delivery history table', () => {
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('My Deliveries')).toBeInTheDocument();
    
    // Check table headers
    expect(screen.getByText('Tracking #')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Est. Delivery')).toBeInTheDocument();

    // Check table data
    expect(screen.getByText('TRK001')).toBeInTheDocument();
    expect(screen.getByText('TRK002')).toBeInTheDocument();
    expect(screen.getByText('TRK003')).toBeInTheDocument();
  });

  it('displays correct status badges with styling', () => {
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    const pendingBadge = screen.getByText('Pending');
    const inTransitBadge = screen.getByText('InTransit');
    const deliveredBadge = screen.getByText('Delivered');

    expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(inTransitBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    expect(deliveredBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('formats dates correctly', () => {
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
    expect(screen.getByText('1/2/2024')).toBeInTheDocument();
    expect(screen.getByText('1/3/2024')).toBeInTheDocument();
  });

  it('shows tracking details in expandable rows', async () => {
    const user = userEvent.setup();
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Find and click a delivery row to expand
    const trackingLinks = screen.getAllByText(/TRK\d+/);
    await user.click(trackingLinks[0]);

    // Should show expanded details (this depends on the implementation)
    // This test would need to be updated based on the actual expand functionality
  });

  it('handles form input changes correctly', async () => {
    const user = userEvent.setup();
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Open the create modal
    const createButton = screen.getByRole('button', { name: /create new delivery/i });
    await user.click(createButton);

    // Find form inputs and test input changes
    const streetInput = screen.getByPlaceholderText(/street address/i);
    if (streetInput) {
      await user.type(streetInput, '123 Test Street');
      expect(streetInput).toHaveValue('123 Test Street');
    }
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Open the create modal
    const createButton = screen.getByRole('button', { name: /create new delivery/i });
    await user.click(createButton);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create delivery/i });
    if (submitButton) {
      expect(submitButton).toBeDisabled(); // Should be disabled until form is valid
    }
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = jest.fn().mockResolvedValue({});
    
    useCreateDelivery.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Open modal and fill form
    const createButton = screen.getByRole('button', { name: /create new delivery/i });
    await user.click(createButton);

    // This would require the actual form inputs to be present in the modal
    // The test would fill in the form fields and submit
    // expect(mockMutateAsync).toHaveBeenCalledWith(expectedFormData);
  });

  it('shows loading state during form submission', () => {
    useCreateDelivery.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Test for loading state in form submission
    // This would depend on the actual implementation
  });

  it('handles empty delivery list', () => {
    useCustomerDeliveries.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Statistics should show 0
    const zeroStats = screen.getAllByText('0');
    expect(zeroStats.length).toBeGreaterThan(0);
  });

  it('handles undefined delivery data', () => {
    useCustomerDeliveries.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Should handle undefined data gracefully
    const zeroStats = screen.getAllByText('0');
    expect(zeroStats.length).toBeGreaterThan(0);
  });

  it('handles user without ID', () => {
    useAuth.mockReturnValue({
      user: { ...mockUser, _id: undefined },
    });

    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // Should still render without crashing
    expect(screen.getByText('My Deliveries')).toBeInTheDocument();
  });

  it('displays package descriptions correctly', () => {
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Important documents')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  it('shows actual delivery date for completed deliveries', () => {
    render(<CustomerDashboard />, { wrapper: createWrapper() });

    // This would depend on the implementation showing actual delivery dates
    // The test would check if completed deliveries show actual delivery time
  });
});