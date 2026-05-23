import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../components/Dashboard';

global.fetch = jest.fn();

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'test-token-123');
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  test('renders dashboard container with main sections', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: [],
        stats: { total_projects: 0, total_waitlist: 0 }
      })
    });

    render(<Dashboard />);

    const container = screen.getByTestId('dashboard-container');
    expect(container).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  test('displays loading state while fetching data', () => {
    fetch.mockImplementation(() => new Promise(() => {}));

    render(<Dashboard />);

    const container = screen.getByTestId('dashboard-container');
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('fetches and displays dashboard data correctly', async () => {
    const mockData = {
      projects: [
        {
          id: '1',
          name: 'AI Fitness App',
          status: 'deployed',
          created_at: '2024-01-15T10:00:00Z',
          waitlist_count: 25
        },
        {
          id: '2',
          name: 'Smart Recipe Platform',
          status: 'in_progress',
          created_at: '2024-01-16T14:30:00Z',
          waitlist_count: 12
        }
      ],
      stats: {
        total_projects: 2,
        total_waitlist: 37,
        deployed_projects: 1
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.ainative.studio'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123'
          })
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('AI Fitness App')).toBeInTheDocument();
      expect(screen.getByText('Smart Recipe Platform')).toBeInTheDocument();
    });

    expect(screen.getByText(/25/)).toBeInTheDocument();
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  test('handles API error and displays error message', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch dashboard data'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    const container = screen.getByTestId('dashboard-container');
    expect(container).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  test('handles user interaction to view project details', async () => {
    const mockData = {
      projects: [
        {
          id: '1',
          name: 'AI Fitness App',
          status: 'deployed',
          created_at: '2024-01-15T10:00:00Z',
          waitlist_count: 25
        }
      ],
      stats: {
        total_projects: 1,
        total_waitlist: 25
      }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    const user = userEvent.setup();
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('AI Fitness App')).toBeInTheDocument();
    });

    const projectElement = screen.getByText('AI Fitness App');
    await user.click(projectElement);

    await waitFor(() => {
      expect(screen.getByText('AI Fitness App')).toBeInTheDocument();
    });
  });

  test('dashboard has proper accessibility attributes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        projects: [],
        stats: { total_projects: 0, total_waitlist: 0 }
      })
    });

    render(<Dashboard />);

    const container = screen.getByTestId('dashboard-container');
    expect(container).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const headings = screen.queryAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  test('handles unauthorized access and redirects', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' })
    });

    render(<Dashboard />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });
});