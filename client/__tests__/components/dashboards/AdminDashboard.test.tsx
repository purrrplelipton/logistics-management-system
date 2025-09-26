import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

// Mock the queries
jest.mock('@/lib/queries', () => ({
  useDeliveries: jest.fn(),
  useUsers: jest.fn(),
  useDrivers: jest.fn(),
  useAssignDriver: jest.fn(),
}));

// Mock icon component
jest.mock('@iconify-icon/react', () => {
  type IconProps = {
    icon?: unknown;
    className?: string;
  } & import('react').HTMLAttributes<HTMLSpanElement>;

  const Icon: import('react').FC<IconProps> = ({ icon, className, ...props }) => (
    <span data-testid={`icon-${String(icon)}`} className={className} {...props} />
  );

  return { Icon };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useDeliveries, useUsers, useDrivers, useAssignDriver } = require('@/lib/queries');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

const mockDeliveries = [
  {
    _id: '1',
    trackingNumber: 'TRK001',
    status: 'Pending',
    customerId: { name: 'John Doe' },
    driverId: null,
    packageDetails: { description: 'Package 1' },
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '2',
    trackingNumber: 'TRK002',
    status: 'InTransit',
    customerId: { name: 'Jane Smith' },
    driverId: { name: 'Driver One' },
    packageDetails: { description: 'Package 2' },
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    _id: '3',
    trackingNumber: 'TRK003',
    status: 'Delivered',
    customerId: { name: 'Bob Johnson' },
    driverId: { name: 'Driver Two' },
    packageDetails: { description: 'Package 3' },
    createdAt: '2024-01-03T00:00:00Z',
  },
];

const mockUsers = [
  { _id: '1', name: 'John Doe', role: 'customer', email: 'john@example.com' },
  { _id: '2', name: 'Jane Smith', role: 'customer', email: 'jane@example.com' },
  { _id: '3', name: 'Driver One', role: 'driver', email: 'driver1@example.com' },
  { _id: '4', name: 'Driver Two', role: 'driver', email: 'driver2@example.com' },
];

const mockDrivers = [
  { _id: '3', name: 'Driver One', email: 'driver1@example.com' },
  { _id: '4', name: 'Driver Two', email: 'driver2@example.com' },
];

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useDeliveries.mockReturnValue({
      data: mockDeliveries,
      isLoading: false,
    });

    useUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
    });

    useDrivers.mockReturnValue({
      data: mockDrivers,
      isLoading: false,
    });

    useAssignDriver.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it('renders loading state when data is loading', () => {
    useDeliveries.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });

  it('displays correct statistics', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    const getStatValue = (label: string) => {
      const labelElement = screen.getByText(label, { selector: 'p' });
      const statCard = labelElement.closest('div');
      if (!statCard) {
        throw new Error(`Stat card for ${label} not found`);
      }
      return within(statCard).getByText((content, element) => {
        return element?.tagName === 'P' && element.className.includes('text-3xl');
      });
    };

    expect(getStatValue('Total Deliveries')).toHaveTextContent('3');
    expect(getStatValue('Pending')).toHaveTextContent('1');
    expect(getStatValue('In Transit')).toHaveTextContent('1');
    expect(getStatValue('Completed')).toHaveTextContent('1');

    const getSecondaryStatValue = (label: string) => {
      const labelElement = screen.getByText(label, { selector: 'p' });
      const statCard = labelElement.closest('div');
      if (!statCard) {
        throw new Error(`Stat card for ${label} not found`);
      }
      return within(statCard).getByText((content, element) => {
        return element?.tagName === 'P' && element.className.includes('text-2xl');
      });
    };

    expect(getSecondaryStatValue('Total Users')).toHaveTextContent('4');
    expect(getSecondaryStatValue('Drivers')).toHaveTextContent('2');
    expect(getSecondaryStatValue('Customers')).toHaveTextContent('2');
  });

  it('displays statistics labels correctly', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Total Deliveries', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Pending', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('In Transit', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Completed', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Total Users', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Drivers', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Customers', { selector: 'p' })).toBeInTheDocument();
  });

  it('renders driver assignment section', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Assign Driver to Delivery')).toBeInTheDocument();
    expect(screen.getByText('Select Pending Delivery')).toBeInTheDocument();
    expect(screen.getByText('Select Driver')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assign Driver' })).toBeInTheDocument();
  });

  it('populates delivery dropdown with pending deliveries only', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    const deliverySelect = screen.getByLabelText('Select Pending Delivery');
    expect(deliverySelect).toBeInTheDocument();

    // Should contain only pending deliveries
    expect(screen.getByText('TRK001 - Package 1')).toBeInTheDocument();
    expect(screen.queryByText('TRK002 - Package 2')).not.toBeInTheDocument(); // InTransit
    expect(screen.queryByText('TRK003 - Package 3')).not.toBeInTheDocument(); // Delivered
  });

  it('populates driver dropdown with available drivers', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Driver One - driver1@example.com')).toBeInTheDocument();
    expect(screen.getByText('Driver Two - driver2@example.com')).toBeInTheDocument();
  });

  it('enables assign button when both delivery and driver are selected', async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />, { wrapper: createWrapper() });

    const assignButton = screen.getByRole('button', { name: 'Assign Driver' });
    expect(assignButton).toBeDisabled();

    const deliverySelect = screen.getByLabelText('Select Pending Delivery');
    const driverSelect = screen.getByLabelText('Select Driver');

    await user.selectOptions(deliverySelect, '1');
    await user.selectOptions(driverSelect, '3');

    expect(assignButton).toBeEnabled();
  });

  it('calls assign driver mutation when assign button is clicked', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = jest.fn().mockResolvedValue({});

    useAssignDriver.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    const deliverySelect = screen.getByLabelText('Select Pending Delivery');
    const driverSelect = screen.getByLabelText('Select Driver');
    const assignButton = screen.getByRole('button', { name: 'Assign Driver' });

    await user.selectOptions(deliverySelect, '1');
    await user.selectOptions(driverSelect, '3');
    await user.click(assignButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      deliveryId: '1',
      driverId: '3',
    });
  });

  it('shows loading state during assignment', () => {
    useAssignDriver.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: true,
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByRole('button', { name: 'Assigning...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Assigning...' })).toBeDisabled();
  });

  it('renders recent deliveries table', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Recent Deliveries')).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText('Tracking #')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();

    // Check table data
    expect(screen.getByText('TRK001')).toBeInTheDocument();
    expect(screen.getByText('TRK002')).toBeInTheDocument();
    expect(screen.getByText('TRK003')).toBeInTheDocument();
  });

  it('displays unassigned status for deliveries without drivers', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(screen.getByText('Driver One')).toBeInTheDocument();
    expect(screen.getByText('Driver Two')).toBeInTheDocument();
  });

  it('displays status badges with correct styling', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    // Find status badges
    const pendingBadge = screen.getByText('Pending', { selector: 'span' });
    const inTransitBadge = screen.getByText('InTransit', { selector: 'span' });
    const deliveredBadge = screen.getByText('Delivered', { selector: 'span' });

    expect(pendingBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    expect(inTransitBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    expect(deliveredBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('formats dates correctly in the table', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
    expect(screen.getByText('1/2/2024')).toBeInTheDocument();
    expect(screen.getByText('1/3/2024')).toBeInTheDocument();
  });

  it('clears selections after successful assignment', async () => {
    const user = userEvent.setup();
    const mockMutateAsync = jest.fn().mockResolvedValue({});

    useAssignDriver.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    const deliverySelect = screen.getByLabelText('Select Pending Delivery') as HTMLSelectElement;
    const driverSelect = screen.getByLabelText('Select Driver') as HTMLSelectElement;
    const assignButton = screen.getByRole('button', { name: 'Assign Driver' });

    await user.selectOptions(deliverySelect, '1');
    await user.selectOptions(driverSelect, '3');

    expect(deliverySelect.value).toBe('1');
    expect(driverSelect.value).toBe('3');

    await user.click(assignButton);

    await waitFor(() => {
      expect(deliverySelect.value).toBe('');
      expect(driverSelect.value).toBe('');
    });
  });

  it('handles assignment error gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Assignment failed'));

    useAssignDriver.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    render(<AdminDashboard />, { wrapper: createWrapper() });

    const deliverySelect = screen.getByLabelText('Select Pending Delivery');
    const driverSelect = screen.getByLabelText('Select Driver');
    const assignButton = screen.getByRole('button', { name: 'Assign Driver' });

    await user.selectOptions(deliverySelect, '1');
    await user.selectOptions(driverSelect, '3');
    await user.click(assignButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to assign driver:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
