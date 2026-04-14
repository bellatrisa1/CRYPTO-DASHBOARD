// src/services/wsClient.ts

import type { StreamStatus } from '../types/ws';

type WsClientOptions = {
  url: string;
  maxReconnectAttempts?: number;
  reconnectBaseDelayMs?: number;
  reconnectMaxDelayMs?: number;
  onOpen?: () => void;
  onMessage?: (raw: string) => void;
  onClose?: () => void;
  onError?: () => void;
  onReconnectScheduled?: (attempt: number, delayMs: number) => void;
};

export class WsClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private manuallyClosed = false;
  private options: Required<
    Pick<
      WsClientOptions,
      'maxReconnectAttempts' | 'reconnectBaseDelayMs' | 'reconnectMaxDelayMs'
    >
  > &
    WsClientOptions;

  constructor(options: WsClientOptions) {
    this.options = {
      maxReconnectAttempts: 8,
      reconnectBaseDelayMs: 1000,
      reconnectMaxDelayMs: 15000,
      ...options,
    };
  }

  connect() {
    this.manuallyClosed = false;

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.socket = new WebSocket(this.options.url);

    this.socket.addEventListener('open', this.handleOpen);
    this.socket.addEventListener('message', this.handleMessage);
    this.socket.addEventListener('close', this.handleClose);
    this.socket.addEventListener('error', this.handleError);
  }

  disconnect() {
    this.manuallyClosed = true;
    this.clearReconnectTimer();

    if (!this.socket) return;

    this.socket.removeEventListener('open', this.handleOpen);
    this.socket.removeEventListener('message', this.handleMessage);
    this.socket.removeEventListener('close', this.handleClose);
    this.socket.removeEventListener('error', this.handleError);

    this.socket.close();
    this.socket = null;
  }

  send(data: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(data);
  }

  getStatus(): StreamStatus {
    if (!this.socket) return 'idle';

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'open';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'idle';
    }
  }

  private handleOpen = () => {
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    this.options.onOpen?.();
  };

  private handleMessage = (event: MessageEvent) => {
    if (typeof event.data === 'string') {
      this.options.onMessage?.(event.data);
    }
  };

  private handleClose = () => {
    this.options.onClose?.();

    if (this.manuallyClosed) {
      return;
    }

    this.scheduleReconnect();
  };

  private handleError = () => {
    this.options.onError?.();
  };

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts += 1;

    const exponentialDelay =
      this.options.reconnectBaseDelayMs * 2 ** (this.reconnectAttempts - 1);

    const delayMs = Math.min(
      exponentialDelay,
      this.options.reconnectMaxDelayMs,
    );

    this.options.onReconnectScheduled?.(this.reconnectAttempts, delayMs);

    this.clearReconnectTimer();

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delayMs);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}