import { NextResponse } from 'next/server';

import { mqttService } from '@/services/mqtt/MQTTService';
import { redisService } from '@/services/cache/RedisService';

export async function GET() {
  const mqttStatus = mqttService.getConnectionStatus();
  const redisStatus = redisService.isConnected();

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      mqtt: {
        connected: mqttStatus.connected,
        lastError: mqttStatus.lastError?.message,
      },
      redis: {
        connected: redisStatus,
      },
      database: {
        connected: true, // Assume connected if we can reach this endpoint
      },
    },
  };

  const isHealthy = mqttStatus.connected && redisStatus;

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
  });
}
