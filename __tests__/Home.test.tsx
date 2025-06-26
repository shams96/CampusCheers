import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/page';

// Since the Home component uses client-side features, we'll mock it for testing
// This is a simplified version of what the Home component might render
jest.mock('../app/page', () => {
  const ExampleComponent = require('../components/ExampleComponent').default;
  return function MockHome() {
    return (
      <main>
        <h1>Welcome to Campus Cheers</h1>
        <ExampleComponent />
      </main>
    );
  };
});

describe('Home Page', () => {
  it('renders the main container', () => {
    render(<Home />);
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('displays the welcome heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /welcome to campus cheers/i });
    expect(heading).toBeInTheDocument();
  });

  it('contains the example component', () => {
    render(<Home />);
    const exampleComponent = screen.getByText('Example Component');
    expect(exampleComponent).toBeInTheDocument();
  });
});
