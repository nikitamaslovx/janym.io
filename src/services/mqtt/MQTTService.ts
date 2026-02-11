import mqtt, { type MqttClient } from 'mqtt';

import type {
  BotCommand,
  ConfigCommandPayload,
  MessageCallback,
  MQTTConnectionStatus,
  StartCommandPayload,
  StopCommandPayload,
} from './types';

class MQTTService {
  private client: MqttClient | null = null;
  private isConnecting = false;
  private connectionStatus: MQTTConnectionStatus = {
    connected: false,
  };

  private subscribers: Map<string, Set<MessageCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  private getBrokerUrl(): string {
    // Use environment variable if available, otherwise default to localhost
    return process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  }

  private getBrokerOptions() {
    return {
      clientId: `janym_service_${Math.random().toString(16).slice(2, 8)}`,
      connectTimeout: 5000,
      reconnectPeriod: 5000,
      username: process.env.MQTT_USERNAME || 'admin',
      password: process.env.MQTT_PASSWORD || 'public',
      keepalive: 60,
      clean: true,
    };
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkInterval = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkInterval);
            if (this.client?.connected) {
              resolve();
            } else {
              reject(new Error('Connection failed'));
            }
          }
        }, 100);
        return;
      }

      this.isConnecting = true;
      const brokerUrl = this.getBrokerUrl();
      const options = this.getBrokerOptions();

      this.client = mqtt.connect(brokerUrl, options);

      this.client.on('connect', () => {
        // eslint-disable-next-line no-console
        console.log('MQTT Service: Connected to broker');
        this.isConnecting = false;
        this.connectionStatus.connected = true;
        this.connectionStatus.lastError = undefined;
        this.reconnectAttempts = 0;

        // Resubscribe to all previous subscriptions
        this.resubscribeAll();

        resolve();
      });

      this.client.on('error', (error) => {
        console.error('MQTT Service: Connection error', error);
        this.connectionStatus.lastError = error;
        this.isConnecting = false;
        reject(error);
      });

      this.client.on('close', () => {
        // eslint-disable-next-line no-console
        console.log('MQTT Service: Connection closed');
        this.connectionStatus.connected = false;
        this.isConnecting = false;
      });

      this.client.on('reconnect', () => {
        this.reconnectAttempts += 1;
        this.connectionStatus.reconnectAttempts = this.reconnectAttempts;
        // eslint-disable-next-line no-console
        console.log(
          `MQTT Service: Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('MQTT Service: Max reconnect attempts reached');
          this.client?.end();
        }
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });
    });
  }

  private handleMessage(topic: string, message: any) {
    // Find all matching subscribers
    for (const [pattern, callbacks] of this.subscribers.entries()) {
      if (this.topicMatches(pattern, topic)) {
        callbacks.forEach((callback) => {
          try {
            callback(topic, message);
          } catch (error) {
            console.error('MQTT Service: Error in message callback', error);
          }
        });
      }
    }
  }

  private topicMatches(pattern: string, topic: string): boolean {
    // Simple wildcard matching: + matches single level, # matches multiple levels
    const patternParts = pattern.split('/');
    const topicParts = topic.split('/');

    let patternIndex = 0;
    let topicIndex = 0;

    while (patternIndex < patternParts.length && topicIndex < topicParts.length) {
      const patternPart = patternParts[patternIndex];
      const topicPart = topicParts[topicIndex];

      if (patternPart === '#') {
        return true; // Multi-level wildcard matches everything
      }

      if (patternPart === '+') {
        // Single-level wildcard matches any single level
        patternIndex += 1;
        topicIndex += 1;
        continue;
      }

      if (patternPart !== topicPart) {
        return false;
      }

      patternIndex += 1;
      topicIndex += 1;
    }

    return patternIndex === patternParts.length && topicIndex === topicParts.length;
  }

  private resubscribeAll() {
    for (const [topic, callbacks] of this.subscribers.entries()) {
      if (callbacks.size > 0 && this.client?.connected) {
        this.client.subscribe(topic, { qos: 1 }, (err) => {
          if (err) {
            console.error(`MQTT Service: Failed to resubscribe to ${topic}`, err);
          } else {
            // eslint-disable-next-line no-console
            console.log(`MQTT Service: Resubscribed to ${topic}`);
          }
        });
      }
    }
  }

  async ensureConnected(): Promise<void> {
    if (!this.client || !this.client.connected) {
      await this.connect();
    }
  }

  async publishCommand(
    botId: string,
    command: BotCommand,
    payload?: StartCommandPayload | StopCommandPayload | ConfigCommandPayload,
  ): Promise<void> {
    await this.ensureConnected();

    if (!this.client) {
      throw new Error('MQTT client not initialized');
    }

    let topic = '';
    let message: string;

    switch (command) {
      case 'start': {
        topic = `hbot/${botId}/start`;
        const startPayload: StartCommandPayload = {
          log_level: 'INFO',
          script: null,
          is_quickstart: true,
          ...(payload as StartCommandPayload),
        };
        message = JSON.stringify(startPayload);
        break;
      }
      case 'stop': {
        topic = `hbot/${botId}/stop`;
        const stopPayload: StopCommandPayload = {
          skip_order_cancellation: false,
          ...(payload as StopCommandPayload),
        };
        message = JSON.stringify(stopPayload);
        break;
      }
      case 'config/update': {
        topic = `hbot/${botId}/config/update`;
        message = JSON.stringify(payload || {});
        break;
      }
      case 'restart': {
        // Restart is implemented as stop + start
        await this.publishCommand(botId, 'stop', payload);
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        }); // Wait 1 second
        await this.publishCommand(botId, 'start', payload);
        return;
      }
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('MQTT client not initialized'));
        return;
      }

      this.client.publish(topic, message, { qos: 1, retain: false }, (err) => {
        if (err) {
          console.error(`MQTT Service: Failed to publish to ${topic}`, err);
          reject(err);
        } else {
          // eslint-disable-next-line no-console
          console.log(`MQTT Service: Published ${command} command to ${topic}`);
          resolve();
        }
      });
    });
  }

  async subscribeToBot(botId: string, callback: MessageCallback): Promise<void> {
    const topic = `hbot/${botId}/+`;
    await this.subscribe(topic, callback);
  }

  async subscribeToAllBots(pattern: string, callback: MessageCallback): Promise<void> {
    const topic = `hbot/${pattern}`;
    await this.subscribe(topic, callback);
  }

  private async subscribe(topic: string, callback: MessageCallback): Promise<void> {
    await this.ensureConnected();

    if (!this.client) {
      throw new Error('MQTT client not initialized');
    }

    // Add callback to subscribers map
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic)!.add(callback);

    // Subscribe to topic
    this.client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`MQTT Service: Failed to subscribe to ${topic}`, err);
        // Remove callback on error
        this.subscribers.get(topic)?.delete(callback);
        throw err;
      } else {
        // eslint-disable-next-line no-console
        console.log(`MQTT Service: Subscribed to ${topic}`);
      }
    });
  }

  async unsubscribeFromBot(botId: string, callback?: MessageCallback): Promise<void> {
    const topic = `hbot/${botId}/+`;
    await this.unsubscribe(topic, callback);
  }

  private async unsubscribe(topic: string, callback?: MessageCallback): Promise<void> {
    if (!this.client) {
      return;
    }

    if (callback) {
      // Remove specific callback
      this.subscribers.get(topic)?.delete(callback);
      // If no more callbacks, unsubscribe from topic
      if (!this.subscribers.get(topic) || this.subscribers.get(topic)!.size === 0) {
        this.client.unsubscribe(topic);
        this.subscribers.delete(topic);
      }
    } else {
      // Remove all callbacks and unsubscribe
      this.client.unsubscribe(topic);
      this.subscribers.delete(topic);
    }
  }

  getConnectionStatus(): MQTTConnectionStatus {
    return {
      ...this.connectionStatus,
      connected: this.client?.connected ?? false,
    };
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(() => {
          // eslint-disable-next-line no-console
          console.log('MQTT Service: Disconnected');
          this.client = null;
          this.connectionStatus.connected = false;
          resolve();
        });
      });
    }
  }
}

// Singleton instance
export const mqttService = new MQTTService();
