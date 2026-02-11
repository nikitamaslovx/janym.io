export type BotCommand = 'start' | 'stop' | 'restart';

export interface StartCommandPayload {
  log_level?: 'INFO' | 'DEBUG' | 'WARNING' | 'ERROR';
  script?: string | null;
  is_quickstart?: boolean;
  config?: Record<string, unknown>;
}

export interface StopCommandPayload {
  skip_order_cancellation?: boolean;
}

export interface BotCommandMessage {
  command: BotCommand;
  payload: StartCommandPayload | StopCommandPayload;
}

export type MessageCallback = (topic: string, message: Buffer) => void;

export interface MQTTConnectionStatus {
  connected: boolean;
  lastError?: Error;
  reconnectAttempts?: number;
}
