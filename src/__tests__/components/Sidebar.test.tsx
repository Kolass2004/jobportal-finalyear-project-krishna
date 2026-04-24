import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Sidebar from '@/components/Sidebar';

describe('Sidebar Component', () => {
  it('renders Admin specific links when user is ADMIN', () => {
    // In vitest.setup.ts, user is mocked as ADMIN
    render(<Sidebar />);
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
  });
});
