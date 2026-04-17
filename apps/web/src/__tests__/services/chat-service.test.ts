import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSubscribeToMessages = vi.fn();
const mockPostChatReply = vi.fn();
const mockGetIdToken = vi.fn();

vi.mock('@/lib/firebase/firestore', () => ({
  subscribeToMessages: (...args: unknown[]) => mockSubscribeToMessages(...args),
  loadOlderMessages: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  postChatReply: (...args: unknown[]) => mockPostChatReply(...args),
}));

vi.mock('@/features/auth/services/auth-service', () => ({
  getIdToken: () => mockGetIdToken(),
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { sendMessage, subscribe } from '@/features/chat/services/chat-service';

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribe', () => {
    it('calls subscribeToMessages with uid and callbacks', () => {
      const onMessages = vi.fn();
      const onError = vi.fn();
      const unsub = vi.fn();
      mockSubscribeToMessages.mockReturnValue(unsub);

      const result = subscribe('user-1', onMessages, onError);

      expect(mockSubscribeToMessages).toHaveBeenCalledWith('user-1', onMessages, onError);
      expect(result).toBe(unsub);
    });
  });

  describe('sendMessage', () => {
    it('gets token before calling the API', async () => {
      mockGetIdToken.mockResolvedValue('token-123');
      mockPostChatReply.mockResolvedValue({ ok: true, messageId: 'reply-id' });

      await sendMessage('Hello');

      expect(mockGetIdToken).toHaveBeenCalled();
      expect(mockPostChatReply).toHaveBeenCalledWith('Hello', 'token-123');
    });

    it('throws when not authenticated (no token)', async () => {
      mockGetIdToken.mockResolvedValue(null);

      await expect(sendMessage('Hello')).rejects.toThrow('Not authenticated');
      expect(mockPostChatReply).not.toHaveBeenCalled();
    });

    it('calls postChatReply with content and token', async () => {
      mockGetIdToken.mockResolvedValue('token-123');
      mockPostChatReply.mockResolvedValue({ ok: true, messageId: 'reply-id' });

      const result = await sendMessage('Hello');

      expect(mockPostChatReply).toHaveBeenCalledWith('Hello', 'token-123');
      expect(result).toEqual({ ok: true, messageId: 'reply-id' });
    });

    it('propagates API error', async () => {
      mockGetIdToken.mockResolvedValue('token-123');
      mockPostChatReply.mockRejectedValue(new Error('502 Bad Gateway'));

      await expect(sendMessage('Hello')).rejects.toThrow('502 Bad Gateway');
    });
  });
});
