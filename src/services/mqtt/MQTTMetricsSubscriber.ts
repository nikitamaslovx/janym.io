import { metricsService } from '../metrics/MetricsService';
import { mqttService } from './MQTTService';

type MetricsPayload = {
  timestamp?: string;
  balance?: {
    total?: number;
    available?: number;
    locked?: number;
  };
  pnl?: {
    total?: number;
    total_pct?: number;
    realized?: number;
    unrealized?: number;
  };
  orders?: {
    active?: number;
    filled_24h?: number;
    cancelled_24h?: number;
    volume_24h?: number;
  };
};

type OrderPayload = {
  exchange_order_id?: string;
  trading_pair: string;
  order_type: 'buy' | 'sell';
  order_side: 'limit' | 'market';
  price?: number;
  quantity?: number;
  filled_quantity?: number;
  status: 'open' | 'filled' | 'cancelled' | 'failed';
  exchange_timestamp?: string;
};

type LogPayload = {
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: Record<string, unknown>;
};

class MQTTMetricsSubscriber {
  private isSubscribed = false;

  async start() {
    if (this.isSubscribed) {
      return;
    }

    // Subscribe to metrics
    await mqttService.subscribe('hbot/+/metrics', (topic, message) => {
      this.handleMetrics(topic, message);
    });

    // Subscribe to orders
    await mqttService.subscribe('hbot/+/orders/+', (topic, message) => {
      this.handleOrder(topic, message);
    });

    // Subscribe to logs
    await mqttService.subscribe('hbot/+/logs/+', (topic, message) => {
      this.handleLog(topic, message);
    });

    this.isSubscribed = true;
    // eslint-disable-next-line no-console
    console.log('MQTT Metrics Subscriber: Started');
  }

  private async handleMetrics(topic: string, message: Buffer) {
    try {
      const botId = topic.split('/')[1];
      const payload: MetricsPayload = JSON.parse(message.toString());

      await metricsService.collectMetrics(botId, {
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
        balanceUsd: payload.balance?.total,
        totalPnl: payload.pnl?.total,
        totalPnlPct: payload.pnl?.total_pct,
        activeOrdersCount: payload.orders?.active,
        filledOrdersCount: payload.orders?.filled_24h,
        volume24h: payload.orders?.volume_24h,
      });
    } catch (error) {
      console.error('MQTT Metrics Subscriber: Error handling metrics', error);
    }
  }

  private async handleOrder(topic: string, message: Buffer) {
    try {
      const botId = topic.split('/')[1];
      const payload: OrderPayload = JSON.parse(message.toString());

      await metricsService.saveOrder({
        botId,
        exchangeOrderId: payload.exchange_order_id,
        tradingPair: payload.trading_pair,
        orderType: payload.order_type,
        orderSide: payload.order_side,
        price: payload.price,
        quantity: payload.quantity,
        filledQuantity: payload.filled_quantity,
        status: payload.status,
        exchangeTimestamp: payload.exchange_timestamp
          ? new Date(payload.exchange_timestamp)
          : undefined,
      });
    } catch (error) {
      console.error('MQTT Metrics Subscriber: Error handling order', error);
    }
  }

  private async handleLog(topic: string, message: Buffer) {
    try {
      const botId = topic.split('/')[1];
      const payload: LogPayload = JSON.parse(message.toString());

      await metricsService.saveLog({
        botId,
        level: payload.level,
        message: payload.message,
        metadata: payload.metadata,
      });
    } catch (error) {
      console.error('MQTT Metrics Subscriber: Error handling log', error);
    }
  }

  async stop() {
    // Unsubscribe is handled by MQTTService
    this.isSubscribed = false;
    // eslint-disable-next-line no-console
    console.log('MQTT Metrics Subscriber: Stopped');
  }
}

export const mqttMetricsSubscriber = new MQTTMetricsSubscriber();

// Start subscriber when module loads (in production, this should be controlled)
if (typeof window === 'undefined') {
  // Only run on server side
  mqttMetricsSubscriber.start().catch((error) => {
    console.error('Failed to start MQTT Metrics Subscriber', error);
  });
}
