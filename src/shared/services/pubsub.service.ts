/**
 * WebSocket PubSub service — manages real-time session / attendee events.
 * Replaces old EZWSPubSub class (Sockette-based) with native WebSocket
 * + reconnection logic + message queue.
 *
 * Source: old ezwspubsub.js (208 lines) → typed, functional.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PubSubMessage {
  action: string;
  data: {
    op: string;
    refId: string;
    codes?: string[];
    attendee?: unknown;
    webapp?: boolean;
    [key: string]: unknown;
  };
}

export type MessageHandler = (data: PubSubMessage["data"]) => void;

interface PubSubOptions {
  url?: string;
  maxQueueSize?: number;
  maxRetries?: number;
  retryDelay?: number;
}

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

const DEFAULT_WS_URL =
  "wss://pod0vc3lc6.execute-api.us-east-2.amazonaws.com/dev";
const DEFAULT_MAX_QUEUE = 1000;
const DEFAULT_MAX_RETRIES = 10;
const DEFAULT_RETRY_DELAY = 5000;

// ---------------------------------------------------------------------------
// PubSub Class
// ---------------------------------------------------------------------------

export class PubSubService {
  private ws: WebSocket | null = null;
  private queue: PubSubMessage[] = [];
  private connected = false;
  private retryCount = 0;
  private destroyed = false;

  private readonly url: string;
  private readonly maxQueueSize: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private onMessage: MessageHandler | null;

  constructor(onMessage: MessageHandler, options: PubSubOptions = {}) {
    this.onMessage = onMessage;
    this.url = options.url || DEFAULT_WS_URL;
    this.maxQueueSize = options.maxQueueSize || DEFAULT_MAX_QUEUE;
    this.maxRetries = options.maxRetries || DEFAULT_MAX_RETRIES;
    this.retryDelay = options.retryDelay || DEFAULT_RETRY_DELAY;
    this.connect();
  }

  // -----------------------------------------------------------------------
  // Connection lifecycle
  // -----------------------------------------------------------------------

  private connect() {
    if (this.destroyed) return;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.connected = true;
      this.retryCount = 0;
      this.flushQueue();
    };

    this.ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this.onMessage?.(data);
      } catch {
        console.error("[PubSub] Error parsing message");
      }
    };

    this.ws.onclose = (e) => {
      this.connected = false;
      if (e.code !== 1000 && !this.destroyed) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.connected = false;
    };
  }

  private scheduleReconnect() {
    if (this.retryCount >= this.maxRetries) {
      console.error("[PubSub] Max retries reached");
      this.queue = [];
      return;
    }
    this.retryCount++;
    setTimeout(() => this.connect(), this.retryDelay);
  }

  // -----------------------------------------------------------------------
  // Queue management
  // -----------------------------------------------------------------------

  private flushQueue() {
    while (this.queue.length > 0 && this.connected && this.ws) {
      const msg = this.queue.shift()!;
      try {
        this.ws.send(JSON.stringify(msg));
      } catch {
        this.queue.unshift(msg);
        break;
      }
    }
  }

  private send(msg: PubSubMessage) {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch {
        this.enqueue(msg);
      }
    } else {
      this.enqueue(msg);
    }
  }

  private enqueue(msg: PubSubMessage) {
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift(); // Drop oldest
    }
    this.queue.push(msg);
  }

  // -----------------------------------------------------------------------
  // Session operations
  // -----------------------------------------------------------------------

  connectSession(id: string) {
    this.send({
      action: "message",
      data: { op: "session:connect", refId: id },
    });
  }

  disconnectSession(id: string) {
    this.send({
      action: "message",
      data: { op: "session:disconnect", refId: id },
    });
  }

  updateSession(id: string, codes: { previous: { icon: number }; current: { icon: number } }) {
    this.send({
      action: "message",
      data: { op: "session:update", refId: id, codes: codes as unknown as string[] },
    });
  }

  endSession(id: string) {
    this.send({ action: "message", data: { op: "session:ended", refId: id } });
  }

  // -----------------------------------------------------------------------
  // Attendee operations
  // -----------------------------------------------------------------------

  connectAttendee(id: string) {
    this.send({
      action: "message",
      data: { op: "attendee:connect", refId: id },
    });
  }

  disconnectAttendee(id: string) {
    this.send({
      action: "message",
      data: { op: "attendee:disconnect", refId: id },
    });
  }

  checkinAttendee(id: string, attendee: unknown) {
    this.send({
      action: "message",
      data: { op: "attendee:checkin", refId: id, attendee, webapp: true },
    });
  }

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  close() {
    this.connected = false;
    this.ws?.close(1000);
    this.queue = [];
  }

  destroy() {
    this.destroyed = true;
    this.close();
    this.ws = null;
    this.onMessage = null;
  }

  // -----------------------------------------------------------------------
  // Utilities
  // -----------------------------------------------------------------------

  isConnected() {
    return this.connected;
  }

  getQueueSize() {
    return this.queue.length;
  }
}
