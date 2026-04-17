'use client';

import { AlertCircle } from 'lucide-react';

interface AuthFieldErrorProps {
  id: string;
  message: string;
}

export function AuthFieldError({ id, message }: AuthFieldErrorProps) {
  return (
    <p id={id} className="auth-error" role="alert">
      <AlertCircle
        className="auth-error-icon"
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <span>{message}</span>
    </p>
  );
}

AuthFieldError.displayName = 'AuthFieldError';
