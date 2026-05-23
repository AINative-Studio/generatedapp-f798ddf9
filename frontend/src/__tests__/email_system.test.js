import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailSystem from '../components/EmailSystem';

global.fetch = jest.fn();

describe('EmailSystem', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders email system container correctly', () => {
    render(<EmailSystem />);
    const container = screen.getByTestId('email_system-container');
    expect(container).toBeInTheDocument();
  });

  test('displays list of captured emails from API', async () => {
    const mockEmails = [
      { id: '1', email: 'user1@example.com', timestamp: '2024-01-01T10:00:00Z' },
      { id: '2', email: 'user2@example.com', timestamp: '2024-01-02T11:00:00Z' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEmails })
    });

    render(<EmailSystem />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.ainative.studio'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-API-Key': expect.any(String)
        })
      })
    );
  });

  test('shows loading state while fetching emails', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(<EmailSystem />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('handles API error and displays error message', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch emails'));

    render(<EmailSystem />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('allows user to send email to waitlist', async () => {
    const user = userEvent.setup();
    const mockEmails = [
      { id: '1', email: 'user1@example.com', timestamp: '2024-01-01T10:00:00Z' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEmails })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<EmailSystem />);

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });

    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    await user.type(subjectInput, 'Welcome to our platform');
    await user.type(messageInput, 'Thank you for joining our waitlist');
    await user.click(sendButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.ainative.studio'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': expect.any(String)
          }),
          body: expect.stringContaining('Welcome to our platform')
        })
      );
    });
  });

  test('has proper accessibility attributes', async () => {
    const mockEmails = [];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockEmails })
    });

    render(<EmailSystem />);

    await waitFor(() => {
      const container = screen.getByTestId('email_system-container');
      expect(container).toBeInTheDocument();
    });

    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);

    expect(subjectInput).toHaveAttribute('type', 'text');
    expect(messageInput).toBeInTheDocument();
  });
});