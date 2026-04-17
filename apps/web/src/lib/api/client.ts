import { env } from '@/lib/env';
import { ChatReplyResponseSchema, type ChatReplyResponse } from '@fidooo/shared';

type TokenRefresher = () => Promise<string | null>;
type SessionInvalidator = () => Promise<void>;

let _refreshToken: TokenRefresher | null = null;
let _invalidateSession: SessionInvalidator | null = null;
let _refreshPromise: Promise<string | null> | null = null;
const CHAT_REPLY_URL = `${env.NEXT_PUBLIC_API_URL}/chat/reply`;

export function configureApiClient(opts: {
  refreshToken: TokenRefresher;
  invalidateSession: SessionInvalidator;
}): void {
  _refreshToken = opts.refreshToken;
  _invalidateSession = opts.invalidateSession;
}

async function handleUnauthorized(): Promise<string> {
  if (!_refreshToken || !_invalidateSession) {
    throw new Error('API client not configured');
  }

  if (!_refreshPromise) {
    _refreshPromise = _refreshToken().finally(() => {
      _refreshPromise = null;
    });
  }

  const freshToken = await _refreshPromise;
  if (!freshToken) {
    await _invalidateSession();
    throw new Error('Session expired');
  }
  return freshToken;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

const CHAT_REPLY_TIMEOUT_MS = 35_000;

async function requestChatReply(
  message: string,
  headers: HeadersInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHAT_REPLY_TIMEOUT_MS);
  try {
    return await fetch(CHAT_REPLY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Chat API request timed out');
    }
    throw new Error(`Network request to chat API failed: ${getErrorMessage(error)}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function postChatReply(
  message: string,
  token: string,
): Promise<ChatReplyResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  let response = await requestChatReply(message, headers);

  if (response.status === 401) {
    try {
      const freshToken = await handleUnauthorized();
      response = await requestChatReply(message, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${freshToken}`,
      });
    } catch {
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const parsed = ChatReplyResponseSchema.safeParse(body);
    const message = parsed.success
      ? parsed.data.error?.message
      : undefined;

    throw new Error(
      message ?? `Request failed with status ${response.status}`,
    );
  }

  const data: unknown = await response.json().catch(() => {
    throw new Error('Chat API returned invalid JSON');
  });

  const parsed = ChatReplyResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Chat API returned an invalid response shape');
  }

  return parsed.data;
}
