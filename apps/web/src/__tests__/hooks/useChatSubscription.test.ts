import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const subscribeMock = vi.fn();
const loadOlderMock = vi.fn();

vi.mock('@/features/chat/services/chat-service', () => ({
  subscribe: (...args: unknown[]) => subscribeMock(...args),
  loadOlder: (...args: unknown[]) => loadOlderMock(...args),
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { useAuthStore, useChatStore } from '@/stores';
import { useChatSubscription } from '@/features/chat/hooks/useChatSubscription';

beforeEach(() => {
  subscribeMock.mockReset();
  loadOlderMock.mockReset();
  subscribeMock.mockReturnValue(() => {});
  useAuthStore.setState({
    user: null,
    authStatus: 'idle',
    lastEmail: '',
  });
  useChatStore.setState({ messages: [] });
});

describe('useChatSubscription — auth gate', () => {
  it('keeps isLoading=true while auth is settling (idle)', () => {
    useAuthStore.setState({ authStatus: 'idle', user: null });
    const { result } = renderHook(() => useChatSubscription());
    expect(result.current.isLoading).toBe(true);
    expect(subscribeMock).not.toHaveBeenCalled();
  });

  it('keeps isLoading=true while auth is loading', () => {
    useAuthStore.setState({ authStatus: 'loading', user: null });
    const { result } = renderHook(() => useChatSubscription());
    expect(result.current.isLoading).toBe(true);
    expect(subscribeMock).not.toHaveBeenCalled();
  });

  it('does not flash empty state before auth resolves', () => {
    useAuthStore.setState({ authStatus: 'loading', user: null });
    const { result, rerender } = renderHook(() => useChatSubscription());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.messages).toEqual([]);

    act(() => {
      useAuthStore.setState({
        authStatus: 'authenticated',
        user: { uid: 'u1', email: 'a@b.c', displayName: null, photoURL: null },
      });
    });
    rerender();

    expect(subscribeMock).toHaveBeenCalledTimes(1);
    expect(subscribeMock.mock.calls[0]?.[0]).toBe('u1');
    expect(result.current.isLoading).toBe(true);
  });

  it('stops loading without subscribing when auth resolves to unauthenticated', () => {
    useAuthStore.setState({ authStatus: 'unauthenticated', user: null });
    const { result } = renderHook(() => useChatSubscription());
    expect(result.current.isLoading).toBe(false);
    expect(subscribeMock).not.toHaveBeenCalled();
  });

  it('subscribes when authenticated and emits messages', () => {
    let onMessages: ((m: unknown[]) => void) | undefined;
    subscribeMock.mockImplementation((_uid, onMsgs) => {
      onMessages = onMsgs;
      return () => {};
    });

    useAuthStore.setState({
      authStatus: 'authenticated',
      user: { uid: 'u1', email: 'a@b.c', displayName: null, photoURL: null },
    });

    const { result } = renderHook(() => useChatSubscription());
    expect(result.current.isLoading).toBe(true);

    act(() => {
      onMessages?.([
        { id: 'm1', role: 'user', content: 'hi', uid: 'u1', createdAt: 1 },
      ]);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.messages).toHaveLength(1);
  });
});
