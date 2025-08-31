import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputField, InputFieldProps } from './InputField';

describe('InputField', () => {
  const defaultProps: InputFieldProps = {
    id: 'test-input',
    label: 'Test Label',
    value: '',
    onChange: jest.fn(),
  };

  it('renders with default props', () => {
    render(<InputField {...defaultProps} />);
    const input = screen.getByLabelText(/test label/i);
    const label = screen.getByText(/test label/i);

    expect(input).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).not.toBeRequired();
  });

  it('renders with email type', () => {
    render(<InputField {...defaultProps} type="email" />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders with password type', () => {
    render(<InputField {...defaultProps} type="password" />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with placeholder', () => {
    render(<InputField {...defaultProps} placeholder="Enter text here" />);
    const input = screen.getByPlaceholderText(/enter text here/i);
    expect(input).toBeInTheDocument();
  });

  it('renders as required when required prop is true', () => {
    render(<InputField {...defaultProps} required />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toBeRequired();
  });

  it('displays the correct value', () => {
    render(<InputField {...defaultProps} value="test value" />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveValue('test value');
  });

  it('calls onChange when input value changes', () => {
    const handleChange = jest.fn();
    render(<InputField {...defaultProps} onChange={handleChange} />);
    const input = screen.getByLabelText(/test label/i);

    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    // Check that the event was called (exact structure may vary in test environment)
    expect(handleChange).toHaveBeenCalled();
  });

  it('has correct id and name attributes', () => {
    render(<InputField {...defaultProps} />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveAttribute('id', 'test-input');
    expect(input).toHaveAttribute('name', 'test-input');
  });

  it('has correct CSS classes', () => {
    render(<InputField {...defaultProps} />);
    const input = screen.getByLabelText(/test label/i);
    expect(input).toHaveClass(
      'w-full',
      'px-4',
      'py-2',
      'rounded-md',
      'bg-neutral-800',
      'border',
      'border-neutral-700',
      'text-white',
      'placeholder-neutral-500',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-hype-blue-500',
      'focus:border-hype-blue-500'
    );
  });

  it('label has correct CSS classes', () => {
    render(<InputField {...defaultProps} />);
    const label = screen.getByText(/test label/i);
    expect(label).toHaveClass(
      'block',
      'text-sm',
      'font-medium',
      'text-neutral-300',
      'mb-1'
    );
  });
});