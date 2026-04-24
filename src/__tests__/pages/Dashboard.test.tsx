import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '@/app/(dashboard)/dashboard/page';

describe('Dashboard Initial Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ jobs: [], total: 0, pages: 1 })
    } as any);
  });

  it('renders dashboard greeting and fetches items', async () => {
    render(<DashboardPage />);
    
    expect(await screen.findByText(/👋/)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/jobs'));
    });
  });
});
