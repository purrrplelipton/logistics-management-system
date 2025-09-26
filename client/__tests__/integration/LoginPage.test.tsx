import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/contexts/AuthContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: { children: React.ReactNode; href: string } & React.HTMLAttributes<HTMLAnchorElement>) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

const mockPush = jest.fn();
const mockLogin = jest.fn();

(useRouter as jest.Mock).mockReturnValue({
  push: mockPush,
});

(useAuth as jest.Mock).mockReturnValue({
  login: mockLogin,
});

describe('LoginPage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByText('LogiTrack')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows user to input email and password', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('redirects to dashboard on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    const user = userEvent.setup();

    // Mock login to be pending
    mockLogin.mockImplementation(() => new Promise(() => {}));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('disables form during submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise(() => {}));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('clears error message on new submission attempt', async () => {
    const user = userEvent.setup();

    // First attempt fails
    mockLogin.mockRejectedValueOnce(new Error('First error'));

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Second attempt should clear the error
    mockLogin.mockResolvedValue(undefined);

    await user.clear(passwordInput);
    await user.type(passwordInput, 'correctpassword');
    await user.click(submitButton);

    // Error should be cleared immediately when form is submitted
    expect(screen.queryByText('First error')).not.toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });

    await user.type(emailInput, 'invalid-email');

    // HTML5 validation should prevent submission
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('requires both email and password', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Submit without filling fields
    await user.click(submitButton);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<LoginPage />);

    const form = screen.getByRole('form');
    const mainElement = screen.getByRole('main');

    expect(form).toBeInTheDocument();
    expect(mainElement).toBeInTheDocument();

    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    // Check for proper form labels
    expect(screen.getByLabelText(/email/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i, { selector: 'input' })).toBeInTheDocument();
  });

  it('prevents default form submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);

    const form = screen.getByRole('form');
    const submitSpy = jest.fn();

    form.onsubmit = submitSpy;

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('handles non-Error exceptions gracefully', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue('String error');

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/password/i, { selector: 'input' });
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });
  });

  it('renders registration link', () => {
    render(<LoginPage />);

    const registerLink = screen.getByText(/create an account/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('renders forgot password link', () => {
    render(<LoginPage />);

    const forgotLink = screen.getByText(/forgot your password/i);
    expect(forgotLink).toBeInTheDocument();
  });

  it('has proper styling and layout', () => {
    render(<LoginPage />);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen');

    // Check for LogiTrack branding
    expect(screen.getByText('LogiTrack')).toBeInTheDocument();
  });
});
