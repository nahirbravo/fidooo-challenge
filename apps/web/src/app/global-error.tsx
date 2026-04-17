'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100dvh',
            gap: '1rem',
            padding: '2rem',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#666', textAlign: 'center', maxWidth: '24rem' }}>
            {error.digest ? `Error: ${error.digest}` : 'An unexpected error occurred'}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              background: 'transparent',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
