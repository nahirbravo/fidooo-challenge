import { ContextService } from '../services/context.service';

describe('ContextService', () => {
  let service: ContextService;

  beforeEach(() => {
    service = new ContextService();
  });

  it('returns all messages when under limits', () => {
    const messages = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ] as const;
    const result = service.truncate(messages);
    expect(result).toHaveLength(2);
  });

  it('truncates to last 20 messages', () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `Message ${i}`,
    }));
    const result = service.truncate(messages);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('truncates by token estimate when messages are long', () => {
    const longContent = 'x'.repeat(16000);
    const messages = [
      { role: 'user', content: longContent },
      { role: 'assistant', content: longContent },
      { role: 'user', content: 'short' },
    ] as const;
    const result = service.truncate(messages);
    expect(result.length).toBeLessThan(messages.length);
    expect(result[result.length - 1]?.content).toBe('short');
  });

  it('returns empty array for empty input', () => {
    const result = service.truncate([]);
    expect(result).toHaveLength(0);
  });

  it('keeps most recent messages when truncating', () => {
    const messages = Array.from({ length: 5 }, () => ({
      role: 'user' as const,
      content: 'x'.repeat(8000),
    }));
    const result = service.truncate(messages);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(5);
  });
});
