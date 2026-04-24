import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NewJobPage from '@/app/(dashboard)/jobs/new/page';

// Mock the toast hook
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ addToast: vi.fn() })
}));

describe('NewJobPage Component', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([{ id: 'c1', name: 'Acme Corp', recruiterId: 'test-id' }])
    } as any);
  });

  it('renders correctly and fetches companies', async () => {
    render(<NewJobPage />);
    
    expect(screen.getByText('Post a New Job')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Senior Full-Stack Engineer')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  it('allows creating a job flow', async () => {
    render(<NewJobPage />);
    
    await waitFor(() => expect(screen.getByText('Acme Corp')).toBeInTheDocument());

    const titleInput = screen.getByPlaceholderText('e.g. Senior Full-Stack Engineer');
    fireEvent.change(titleInput, { target: { value: 'Frontend Developer' } });

    const descInput = screen.getByPlaceholderText(/Use ## for headings/);
    fireEvent.change(descInput, { target: { value: 'Description' } });

    // Click submit
    const submitBtn = screen.getByText('Post Job');
    
    // Setup fetch mock for POST
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ([]) } as any);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/jobs', expect.objectContaining({
        method: 'POST'
      }));
    });
  });
});
