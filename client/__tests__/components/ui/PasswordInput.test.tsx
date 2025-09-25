import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from '@/components/ui/PasswordInput';

// Mock password strength calculation to return predictable results
jest.mock('@/lib/password-strength', () => ({
  calculatePasswordStrength: jest.fn((password: string) => {
    if (!password) {
      return {
        strength: 'weak',
        score: 0,
        feedback: ['Enter a password'],
        crackTimeDisplay: 'instantly',
        isValid: false,
      };
    }
    
    if (password === 'weak') {
      return {
        strength: 'weak',
        score: 1,
        feedback: ['Add more characters'],
        crackTimeDisplay: '10 minutes',
        isValid: false,
      };
    }
    
    if (password === 'okaypassword') {
      return {
        strength: 'okay',
        score: 2,
        feedback: ['Add more unique characters'],
        crackTimeDisplay: '3 hours',
        isValid: true,
      };
    }
    
    if (password === 'verystrongpassword') {
      return {
        strength: 'strong',
        score: 4,
        feedback: [],
        crackTimeDisplay: 'centuries',
        isValid: true,
      };
    }
    
    // Default for any other password
    return {
      strength: 'okay',
      score: 2,
      feedback: [],
      crackTimeDisplay: '1 day',
      isValid: true,
    };
  }),
}));

describe('PasswordInput Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PasswordInput onChange={() => {}} />);
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    render(<PasswordInput label="Password" onChange={() => {}} />);
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('renders with error message when provided', () => {
    render(<PasswordInput error="This field is required" onChange={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('shows password when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordInput value="testpassword" onChange={() => {}} />);
    
    const input = screen.getByDisplayValue('testpassword') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('Show password');
    
    expect(input.type).toBe('password');
    
    await user.click(toggleButton);
    
    expect(input.type).toBe('text');
  });

  it('hides password when eye icon is clicked twice', async () => {
    const user = userEvent.setup();
    render(<PasswordInput value="testpassword" onChange={() => {}} />);
    
    const input = screen.getByDisplayValue('testpassword') as HTMLInputElement;
    const toggleButton = screen.getByLabelText('Show password');
    
    await user.click(toggleButton);
    expect(input.type).toBe('text');
    
    await user.click(toggleButton);
    expect(input.type).toBe('password');
  });

  it('updates aria-label when password visibility changes', async () => {
    const user = userEvent.setup();
    render(<PasswordInput value="testpassword" onChange={() => {}} />);
    
    const toggleButton = screen.getByLabelText('Show password');
    
    await user.click(toggleButton);
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
  });

  it('renders strength indicator when showStrengthIndicator is true', () => {
    render(
      <PasswordInput 
        value="testpassword" 
        onChange={() => {}} 
        showStrengthIndicator 
      />
    );
    
    // Should render 3 strength bars
    const bars = document.querySelectorAll('.h-1.flex-1.rounded-full');
    expect(bars).toHaveLength(3);
  });

  it('does not render strength indicator when showStrengthIndicator is false', () => {
    render(<PasswordInput value="testpassword" onChange={() => {}} />);
    
    // Should not render strength bars
    const bars = document.querySelectorAll('.h-1.flex-1.rounded-full');
    expect(bars).toHaveLength(0);
  });

  it('renders custom startElement', () => {
    const startElement = <span data-testid="custom-start">Custom Start</span>;
    render(<PasswordInput startElement={startElement} onChange={() => {}} />);
    
    expect(screen.getByTestId('custom-start')).toBeInTheDocument();
  });

  it('renders custom endElement', () => {
    const endElement = <span data-testid="custom-end">Custom End</span>;
    render(<PasswordInput endElement={endElement} onChange={() => {}} />);
    
    expect(screen.getByTestId('custom-end')).toBeInTheDocument();
  });

  it('renders with required asterisk when required', () => {
    render(<PasswordInput label="Password" required onChange={() => {}} />);
    expect(screen.getByLabelText('required')).toBeInTheDocument();
  });

  it('renders with correct error styling', () => {
    const { container } = render(
      <PasswordInput error="This field is required" onChange={() => {}} />
    );
    
    const inputContainer = container.querySelector('.border');
    expect(inputContainer).toHaveClass('border-red-300');
  });

  it('renders with correct focus styling', () => {
    const { container } = render(<PasswordInput onChange={() => {}} />);
    
    const inputContainer = container.querySelector('.border');
    expect(inputContainer).toHaveClass('focus-within:ring-blue-500');
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    
    render(<PasswordInput onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('');
    await user.type(input, 'test');
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} onChange={() => {}} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders strength bars correctly', async () => {
    const { container } = render(
      <PasswordInput showStrengthIndicator value="okaypassword" onChange={() => {}} />
    );
    
    await waitFor(() => {
      // Should render 3 strength bars
      const bars = container.querySelectorAll('.h-1.flex-1.rounded-full');
      expect(bars).toHaveLength(3);
    });
  });

  it('applies custom className', () => {
    render(<PasswordInput className="custom-class" onChange={() => {}} />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveClass('custom-class');
  });

  it('supports all Input props', () => {
    render(
      <PasswordInput 
        placeholder="Custom placeholder"
        disabled
        required
        label="Password Field"
        error="This field is required"
        onChange={() => {}}
      />
    );
    
    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    
    expect(screen.getByText('Password Field')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('applies correct strength colors', async () => {
    const { container, rerender } = render(
      <PasswordInput showStrengthIndicator value="" onChange={() => {}} />
    );
    
    // Test weak password (red)
    rerender(<PasswordInput showStrengthIndicator value="weak" onChange={() => {}} />);
    await waitFor(() => {
      const weakText = screen.getByText('weak password');
      expect(weakText).toHaveClass('text-red-600');
    });
    
    // Test okay password (yellow)
    rerender(<PasswordInput showStrengthIndicator value="okaypassword" onChange={() => {}} />);
    await waitFor(() => {
      const okayText = screen.getByText('okay password');
      expect(okayText).toHaveClass('text-yellow-600');
    });
    
    // Test strong password (green)
    rerender(<PasswordInput showStrengthIndicator value="verystrongpassword" onChange={() => {}} />);
    await waitFor(() => {
      const strongText = screen.getByText('strong password');
      expect(strongText).toHaveClass('text-green-600');
    });
  });

  it('calls onStrengthChange when strength changes', async () => {
    const mockOnStrengthChange = jest.fn();
    
    render(
      <PasswordInput 
        showStrengthIndicator 
        value="okaypassword" 
        onChange={() => {}} 
        onStrengthChange={mockOnStrengthChange}
      />
    );
    
    await waitFor(() => {
      expect(mockOnStrengthChange).toHaveBeenCalledWith({
        strength: 'okay',
        score: 2,
        feedback: ['Add more unique characters'],
        crackTimeDisplay: '3 hours',
        isValid: true,
      });
    });
  });

  it('uses external strength info when provided', () => {
    const externalStrengthInfo = {
      strength: 'strong' as const,
      score: 4,
      feedback: [],
      crackTimeDisplay: 'centuries',
      isValid: true,
    };
    
    render(
      <PasswordInput 
        showStrengthIndicator
        value="testpassword"
        onChange={() => {}}
        strengthInfo={externalStrengthInfo}
      />
    );
    
    expect(screen.getByText('strong password')).toBeInTheDocument();
  });
});