export type BotCommand = 'start' | 'stop' | 'restart' | 'config/update';

export type StartCommandPayload = {
  log_level?: 'INFO' | 'DEBUG' | 'WARNING' | 'ERROR';
  script?: string | null;
  is_quickstart?: boolean;
  config?: Record<string, unknown>;
  strategy_type?: string;
};

export type StopCommandPayload = {
  skip_order_cancellation?: boolean;
};

export type ConfigCommandPayload = Record<string, unknown> & {
  strategy_type?: string;
  remote_reload?: boolean;
};

export type BotCommandMessage = {
  command: BotCommand;
  payload: StartCommandPayload | StopCommandPayload | ConfigCommandPayload;
};

export type MessageCallback = (topic: string, message: any) => void;

export type MQTTConnectionStatus = {
  connected: boolean;
  lastError?: Error;
  reconnectAttempts?: number;
};
