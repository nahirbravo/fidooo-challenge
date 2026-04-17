import { EnvValidationError, validateEnv } from './env.schema';

describe('validateEnv', () => {
  const requiredKeys = [
    'CORS_ORIGIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'OPENAI_API_KEY',
  ] as const;

  function withCleanProcessEnv<T>(run: () => T): T {
    const previousValues = new Map(
      requiredKeys.map((key) => [key, process.env[key]]),
    );
    for (const key of requiredKeys) {
      delete process.env[key];
    }
    try {
      return run();
    } finally {
      for (const [key, value] of previousValues) {
        if (typeof value === 'string') {
          process.env[key] = value;
          continue;
        }
        delete process.env[key];
      }
    }
  }

  it('validates the provided config object without depending on process.env', () => {
    const parsed = withCleanProcessEnv(() =>
      validateEnv({
        PORT: '4000',
        NODE_ENV: 'development',
        CORS_ORIGIN: 'http://localhost:3000',
        FIREBASE_PROJECT_ID: 'demo-project',
        FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk@example.com',
        FIREBASE_PRIVATE_KEY: 'private-key',
        OPENAI_API_KEY: 'sk-proj-demo',
        RATE_LIMIT_TTL: '60',
        RATE_LIMIT_MAX: '20',
        LOG_LEVEL: 'info',
      }),
    );

    expect(parsed).toMatchObject({
      PORT: 4000,
      NODE_ENV: 'development',
      CORS_ORIGIN: 'http://localhost:3000',
      FIREBASE_PROJECT_ID: 'demo-project',
      OPENAI_MODEL: 'gpt-4o-mini',
      OPENAI_TIMEOUT_MS: 30000,
      RATE_LIMIT_TTL: 60,
      RATE_LIMIT_MAX: 20,
      LOG_LEVEL: 'info',
    });
  });

  it('throws EnvValidationError when required vars are missing', () => {
    expect(() =>
      withCleanProcessEnv(() => validateEnv({})),
    ).toThrow(EnvValidationError);
  });

  it('exposes the offending fields on the thrown error', () => {
    let thrown: unknown;
    try {
      withCleanProcessEnv(() => validateEnv({}));
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(EnvValidationError);
    const error = thrown as EnvValidationError;
    expect(Object.keys(error.fieldErrors)).toEqual(
      expect.arrayContaining([
        'CORS_ORIGIN',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
        'OPENAI_API_KEY',
      ]),
    );
  });

  it('throws when FIREBASE_CLIENT_EMAIL is not a valid email', () => {
    expect(() =>
      withCleanProcessEnv(() =>
        validateEnv({
          CORS_ORIGIN: 'http://localhost:3000',
          FIREBASE_PROJECT_ID: 'demo-project',
          FIREBASE_CLIENT_EMAIL: 'not-an-email',
          FIREBASE_PRIVATE_KEY: 'private-key',
          OPENAI_API_KEY: 'sk-proj-demo',
        }),
      ),
    ).toThrow(EnvValidationError);
  });
});
