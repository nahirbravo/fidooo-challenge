'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

const BOTTOM_THRESHOLD = 100;

export function useAutoScroll(messagesLength: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessages, setShowNewMessages] = useState(false);

  const checkIfAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
    setIsAtBottom(atBottom);
    if (atBottom) setShowNewMessages(false);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
    setShowNewMessages(false);
    setIsAtBottom(true);
  }, []);

  const prevLengthRef = useRef(messagesLength);

  useEffect(() => {
    if (messagesLength <= prevLengthRef.current) {
      prevLengthRef.current = messagesLength;
      return;
    }
    prevLengthRef.current = messagesLength;

    requestAnimationFrame(() => {
      if (isAtBottom) {
        scrollToBottom();
      } else {
        setShowNewMessages(true);
      }
    });
  }, [messagesLength, isAtBottom, scrollToBottom]);

  return {
    containerRef,
    isAtBottom,
    showNewMessages,
    scrollToBottom,
    onScroll: checkIfAtBottom,
  };
}
