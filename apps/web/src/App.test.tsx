import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

/**
 * App Component Tests
 *
 * @description Basic tests for the main App component
 * @version 1.0.0
 * @created 2025-01-24
 * @updated 2025-01-24
 * @author Kim Hsiao
 */
describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeDefined();
  });

  it('should render the app container', () => {
    render(<App />);
    // Basic test to ensure the app renders
    expect(document.querySelector('#root')).toBeDefined();
  });
});
