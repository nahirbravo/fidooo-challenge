import type { ConfigService } from '@nestjs/config';
import type { PinoLogger } from 'nestjs-pino';
import { FirebaseService } from '../firebase.service';

interface FakeDoc {
  id: string;
  data: () => Record<string, unknown>;
}

function makeFirestore(docs: FakeDoc[]): {
  firestore: unknown;
  add: jest.Mock;
  delete: jest.Mock;
  get: jest.Mock;
} {
  const add = jest.fn().mockResolvedValue({ id: 'new-message-id' });
  const del = jest.fn().mockResolvedValue(undefined);
  const get = jest.fn().mockResolvedValue({ docs });
  const collection = (): unknown => ({
    doc: () => ({
      collection: () => ({
        orderBy: () => ({
          limit: () => ({ get }),
        }),
        add,
        doc: () => ({ delete: del }),
      }),
    }),
  });
  return {
    firestore: { collection },
    add,
    delete: del,
    get,
  };
}

describe('FirebaseService — read & write logic', () => {
  const config = {
    getOrThrow: jest.fn(),
    get: jest.fn(),
  };
  const logger = {
    warn: jest.fn(),
  };

  let service: FirebaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FirebaseService(
      config as unknown as ConfigService,
      logger as unknown as PinoLogger,
    );
  });

  it('skips invalid documents in getRecentMessages and logs a warn', async () => {
    const { firestore, get } = makeFirestore([
      { id: 'good-1', data: () => ({ role: 'user', content: 'hi' }) },
      { id: 'bad-1', data: () => ({ role: 'invalid', content: 'oops' }) },
      { id: 'good-2', data: () => ({ role: 'assistant', content: 'hey' }) },
    ]);
    Object.assign(service, { firestore });

    const result = await service.getRecentMessages('uid', 10);

    // Reversed (oldest -> newest), invalid doc skipped
    expect(result).toEqual([
      { role: 'assistant', content: 'hey' },
      { role: 'user', content: 'hi' },
    ]);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalled();
  });

  it('writeUserMessage validates input via Zod and forwards uid + role + content', async () => {
    const { firestore, add } = makeFirestore([]);
    Object.assign(service, { firestore });

    const id = await service.writeUserMessage('uid-1', 'Hello world');

    expect(id).toBe('new-message-id');
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
        content: 'Hello world',
        uid: 'uid-1',
      }),
    );
  });

  it('writeAssistantMessage forwards role assistant', async () => {
    const { firestore, add } = makeFirestore([]);
    Object.assign(service, { firestore });

    await service.writeAssistantMessage('uid-1', 'Reply');

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'assistant', content: 'Reply' }),
    );
  });

  it('throws when writing an empty message (defensive Zod validation)', async () => {
    const { firestore } = makeFirestore([]);
    Object.assign(service, { firestore });

    await expect(service.writeUserMessage('uid-1', '')).rejects.toThrow();
  });

  it('deleteMessage swallows errors so the original error keeps propagating', async () => {
    const failingDel = jest.fn().mockRejectedValue(new Error('boom'));
    const firestore = {
      collection: () => ({
        doc: () => ({
          collection: () => ({
            doc: () => ({ delete: failingDel }),
          }),
        }),
      }),
    };
    Object.assign(service, { firestore });

    await expect(
      service.deleteMessage('uid-1', 'msg-1'),
    ).resolves.toBeUndefined();
    expect(logger.warn).toHaveBeenCalled();
  });
});
