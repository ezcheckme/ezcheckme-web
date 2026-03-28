/**
 * usePubSub — React hook for WebSocket PubSub connection.
 * Creates/destroys PubSubService tied to component lifecycle.
 */

import { useEffect, useRef, useCallback } from "react";
import {
  PubSubService,
  type MessageHandler,
} from "@/shared/services/pubsub.service";

interface UsePubSubOptions {
  /** Auto-connect on mount. Default: true */
  autoConnect?: boolean;
}

export function usePubSub(
  onMessage: MessageHandler,
  options: UsePubSubOptions = {},
) {
  const { autoConnect = true } = options;
  const serviceRef = useRef<PubSubService | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!autoConnect) return;
    serviceRef.current = new PubSubService((...args) =>
      onMessageRef.current(...args),
    );
    return () => {
      serviceRef.current?.destroy();
      serviceRef.current = null;
    };
  }, [autoConnect]);

  const connectSession = useCallback((id: string) => {
    serviceRef.current?.connectSession(id);
  }, []);

  const disconnectSession = useCallback((id: string) => {
    serviceRef.current?.disconnectSession(id);
  }, []);

  const updateSession = useCallback((id: string, codes: string[]) => {
    serviceRef.current?.updateSession(id, codes);
  }, []);

  const endSession = useCallback((id: string) => {
    serviceRef.current?.endSession(id);
  }, []);

  const connectAttendee = useCallback((id: string) => {
    serviceRef.current?.connectAttendee(id);
  }, []);

  const disconnectAttendee = useCallback((id: string) => {
    serviceRef.current?.disconnectAttendee(id);
  }, []);

  const checkinAttendee = useCallback((id: string, attendee: unknown) => {
    serviceRef.current?.checkinAttendee(id, attendee);
  }, []);

  const isConnected = useCallback(() => {
    return serviceRef.current?.isConnected() ?? false;
  }, []);

  return {
    connectSession,
    disconnectSession,
    updateSession,
    endSession,
    connectAttendee,
    disconnectAttendee,
    checkinAttendee,
    isConnected,
  };
}
