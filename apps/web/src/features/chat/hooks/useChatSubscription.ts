"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useChatStore, useAuthStore } from "@/stores";
import { subscribe, loadOlder } from "../services/chat-service";
import { logger } from "@/lib/logger";

export function useChatSubscription() {
  const uid = useAuthStore((s) => s.user?.uid);
  const authStatus = useAuthStore((s) => s.authStatus);
  const { setMessages, prependMessages, messages } = useChatStore(
    useShallow((s) => ({
      setMessages: s.setMessages,
      prependMessages: s.prependMessages,
      messages: s.messages,
    })),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const oldestTimestampRef = useRef<number | null>(null);

  const isAuthSettling = authStatus === "idle" || authStatus === "loading";

  useEffect(() => {
    if (isAuthSettling) {
      setIsLoading(true);
      return;
    }

    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribe(
      uid,
      (msgs) => {
        setMessages(msgs);
        setIsLoading(false);
        setError(null);
        setHasOlder(msgs.length >= 50);
        if (msgs.length > 0 && typeof msgs[0]?.createdAt === "number") {
          oldestTimestampRef.current = msgs[0].createdAt;
        }
      },
      (err) => {
        logger.error("useChatSubscription.onError", { error: err });
        setIsLoading(false);
        setError("errors.network");
      },
    );

    return () => {
      unsubscribe();
    };
  }, [uid, isAuthSettling, setMessages, retryCount]);

  const reconnect = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  const handleLoadOlder = useCallback(async () => {
    if (!uid || !oldestTimestampRef.current || isLoadingOlder) return;

    setIsLoadingOlder(true);
    try {
      const older = await loadOlder(uid, oldestTimestampRef.current);
      if (older.length > 0) {
        prependMessages(older);
        if (typeof older[0]?.createdAt === "number") {
          oldestTimestampRef.current = older[0].createdAt;
        }
      }
      setHasOlder(older.length >= 50);
    } catch (err) {
      logger.error("useChatSubscription.loadOlder", { error: err });
    } finally {
      setIsLoadingOlder(false);
    }
  }, [uid, isLoadingOlder, prependMessages]);

  return {
    messages,
    isLoading,
    error,
    hasOlder,
    isLoadingOlder,
    loadOlder: handleLoadOlder,
    reconnect,
  };
}
