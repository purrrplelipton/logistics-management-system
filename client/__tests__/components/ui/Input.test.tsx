import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('renders basic input correctly', () => {
    render(<Input placeholder="Test input" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Test input');
  });

  it('renders with label', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    const label = screen.getByLabelText('Email');
    expect(label).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Input label="Required Field" required />);
    const requiredIndicator = screen.getByLabelText('required');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveTextContent('*');
  });

  it('displays error message', () => {
    const errorMessage = 'This field is required';
    render(<Input error={errorMessage} />);
    
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(errorMessage);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    
    render(<Input onChange={mockOnChange} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'Hello World');
    
    expect(mockOnChange).toHaveBeenCalled();
    expect(input).toHaveValue('Hello World');
  });

  it('renders start element', () => {
    const startIcon = <span data-testid="start-icon">@</span>;
    render(<Input startElement={startIcon} />);
    
    const icon = screen.getByTestId('start-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders end element', () => {
    const endIcon = <span data-testid="end-icon">✓</span>;
    render(<Input endElement={endIcon} />);
    
    const icon = screen.getByTestId('end-icon');
    expect(icon).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const inputContainer = screen.getByTestId('input');
    expect(inputContainer).toHaveClass('custom-class');
  });

  it('generates unique id when not provided', () => {
    render(
      <>
        <Input label="First" />
        <Input label="Second" />
      </>
    );
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('id');
    expect(inputs[1]).toHaveAttribute('id');
    expect(inputs[0].id).not.toBe(inputs[1].id);
  });

  it('uses provided id', () => {
    render(<Input id="custom-id" label="Test" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('sets aria-describedby with error id', () => {
    render(<Input error="Error message" />);
    const input = screen.getByRole('textbox');
    const errorId = input.getAttribute('aria-describedby');
    
    expect(errorId).toBeTruthy();
    expect(screen.getByRole('alert')).toHaveAttribute('id', errorId);
  });

  it('applies error styling', () => {
    render(<Input error="Error message" data-testid="input-container" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('text-red-900', 'placeholder-red-300');
  });

  it('handles different input types', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('supports disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('supports readonly state', () => {
    render(<Input readOnly value="readonly" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveValue('readonly');
  });
});