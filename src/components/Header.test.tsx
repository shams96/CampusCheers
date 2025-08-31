import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  const defaultProps = {
    onLogin: jest.fn(),
    onLogout: jest.fn(),
    onCreateAccount: jest.fn(),
  };

  it('renders logo and title', () => {
    render(<Header {...defaultProps} />);
    const logo = screen.getByTestId('campuscheers-logo'); // SVG logo
    const title = screen.getByText('CampusCheers');

    expect(logo).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('renders login and sign up buttons when user is not logged in', () => {
    render(<Header {...defaultProps} />);
    const loginButton = screen.getByRole('button', { name: /log in/i });
    const signUpButton = screen.getByRole('button', { name: /sign up/i });

    expect(loginButton).toBeInTheDocument();
    expect(signUpButton).toBeInTheDocument();
    expect(signUpButton).toHaveClass('bg-hype-blue-500'); // Primary button
  });

  it('calls onLogin when login button is clicked', () => {
    const handleLogin = jest.fn();
    render(<Header {...defaultProps} onLogin={handleLogin} />);
    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.click(loginButton);
    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateAccount when sign up button is clicked', () => {
    const handleCreateAccount = jest.fn();
    render(<Header {...defaultProps} onCreateAccount={handleCreateAccount} />);
    const signUpButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.click(signUpButton);
    expect(handleCreateAccount).toHaveBeenCalledTimes(1);
  });

  it('renders welcome message and logout button when user is logged in', () => {
    const user = { name: 'John Doe' };
    render(<Header {...defaultProps} user={user} />);
    const welcomeMessage = screen.getByText((content, element) => {
      return element?.textContent === 'Welcome, John Doe!';
    });
    const logoutButton = screen.getByRole('button', { name: /log out/i });

    expect(welcomeMessage).toBeInTheDocument();
    expect(logoutButton).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    const user = { name: 'John Doe' };
    const handleLogout = jest.fn();
    render(<Header {...defaultProps} user={user} onLogout={handleLogout} />);
    const logoutButton = screen.getByRole('button', { name: /log out/i });

    fireEvent.click(logoutButton);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('does not render login/signup buttons when user is logged in', () => {
    const user = { name: 'John Doe' };
    render(<Header {...defaultProps} user={user} />);
    const loginButton = screen.queryByRole('button', { name: /log in/i });
    const signUpButton = screen.queryByRole('button', { name: /sign up/i });

    expect(loginButton).not.toBeInTheDocument();
    expect(signUpButton).not.toBeInTheDocument();
  });

  it('does not render welcome message and logout button when user is not logged in', () => {
    render(<Header {...defaultProps} />);
    const welcomeMessage = screen.queryByText(/welcome/i);
    const logoutButton = screen.queryByRole('button', { name: /log out/i });

    expect(welcomeMessage).not.toBeInTheDocument();
    expect(logoutButton).not.toBeInTheDocument();
  });
});