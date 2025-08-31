import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, ButtonProps } from './Button';

describe('Button', () => {
  const defaultProps: ButtonProps = {
    label: 'Click me',
  };

  it('renders with default props', () => {
    render(<Button {...defaultProps} />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('font-bold', 'py-2', 'px-4', 'rounded', 'text-base');
  });

  it('renders as primary button when primary prop is true', () => {
    render(<Button {...defaultProps} primary />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-hype-blue-500', 'hover:bg-hype-blue-700', 'text-white');
  });

  it('renders as secondary button when primary prop is false', () => {
    render(<Button {...defaultProps} primary={false} />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass(
      'bg-transparent',
      'hover:bg-cheers-coral-500',
      'text-cheers-coral-700',
      'border',
      'border-cheers-coral-500'
    );
  });

  it('applies small size classes', () => {
    render(<Button {...defaultProps} size="small" />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('text-sm');
  });

  it('applies medium size classes', () => {
    render(<Button {...defaultProps} size="medium" />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('text-base');
  });

  it('applies large size classes', () => {
    render(<Button {...defaultProps} size="large" />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('text-lg');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button {...defaultProps} disabled />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button {...defaultProps} onClick={handleClick} />);
    const button = screen.getByRole('button', { name: /click me/i });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button {...defaultProps} onClick={handleClick} disabled />);
    const button = screen.getByRole('button', { name: /click me/i });

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('passes through additional props', () => {
    render(<Button {...defaultProps} data-testid="custom-button" />);
    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
  });
});