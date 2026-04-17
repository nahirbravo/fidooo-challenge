'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from './logger';

interface UseClipboardOptions {
  /** ms to keep the `copied` flag true before resetting. */
  resetAfterMs?: number;
}

interface UseClipboardResult {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

const DEFAULT_RESET_MS = 1500;

export function useClipboard(
  options: UseClipboardOptions = {},
): UseClipboardResult {
  const { resetAfterMs = DEFAULT_RESET_MS } = options;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), resetAfterMs);
        return true;
      } catch (error) {
        logger.warn('useClipboard.copy.failed', { error });
        return false;
      }
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
