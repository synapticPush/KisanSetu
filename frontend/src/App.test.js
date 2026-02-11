import { render, screen } from '@testing-library/react';
import App from './App';

test('renders money records header', () => {
  render(<App />);
  const headerElement = screen.getByText(/moneyRecords/i);
  expect(headerElement).toBeInTheDocument();
});
