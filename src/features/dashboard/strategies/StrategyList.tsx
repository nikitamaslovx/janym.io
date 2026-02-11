'use client';

import mqtt from 'mqtt';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Bot } from '@/types/bot';

export const StrategyList = () => {
  const t = useTranslations('StrategyList');
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bots from API
  useEffect(() => {
    const loadBots = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/bots');
        if (!response.ok) {
          throw new Error('Failed to load bots');
        }
        const data = await response.json();
        setBots(data.bots || []);
        setError(null);
      } catch (err) {
        console.error('Error loading bots:', err);
        setError('Failed to load bots');
      } finally {
        setIsLoading(false);
      }
    };

    loadBots();
  }, []);

  // MQTT connection for real-time updates
  useEffect(() => {
    // Connect to EMQX via WebSockets
    const client = mqtt.connect('ws://localhost:8083/mqtt', {
      clientId: `janym_dashboard_${Math.random().toString(16).slice(2, 8)}`,
      username: 'admin',
      password: 'public',
    });

    client.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('MQTT Connected');
      setIsConnected(true);
      // Subscribe to all bot statuses
      client.subscribe('hbot/+/status');
    });

    client.on('message', (topic, message) => {
      // topic: hbot/{bot_id}/status
      // message: { "status": "running" }
      try {
        const botId = topic.split('/')[1];
        const payload = JSON.parse(message.toString());

        setBots((prevBots) =>
          prevBots.map((bot) =>
            bot.id === botId ? { ...bot, status: payload.status as Bot['status'] } : bot,
          ),
        );
      } catch (error) {
        console.error('Failed to parse MQTT message:', error);
      }
    });

    client.on('error', (err) => {
      console.error('MQTT Error:', err);
      setIsConnected(false);
    });

    return () => {
      client.end();
    };
  }, []);

  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const sendCommand = async (botId: string, action: 'start' | 'stop') => {
    setLoadingMap((prev) => ({ ...prev, [botId]: true }));
    try {
      const response = await fetch(`/api/bots/${botId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send command');
      }

      // Optimistic update
      setBots((prev) =>
        prev.map((b) =>
          b.id === botId
            ? { ...b, status: action === 'start' ? ('running' as const) : ('stopped' as const) }
            : b,
        ),
      );
    } catch (error) {
      console.error('Error sending command:', error);
      alert(error instanceof Error ? error.message : 'Failed to send command');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [botId]: false }));
    }
  };

  const handleStartBot = (botId: string) => sendCommand(botId, 'start');
  const handleStopBot = (botId: string) => sendCommand(botId, 'stop');
  const handleAddBot = () => {
    router.push('/dashboard/strategies/new');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading bots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`size-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'MQTT Connected' : 'MQTT Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{bot.name}</CardTitle>
              <Badge
                variant={
                  bot.status === 'running'
                    ? 'default'
                    : bot.status === 'error'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {bot.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bot.tradingPair}</div>
              <p className="text-xs text-muted-foreground">{bot.strategyType}</p>
              <p className="text-xs text-muted-foreground mt-1">{bot.exchange}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/strategies/${bot.id}`)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={bot.status === 'running' || loadingMap[bot.id]}
                  onClick={() => handleStartBot(bot.id)}
                >
                  Start
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full"
                  disabled={bot.status === 'stopped' || loadingMap[bot.id]}
                  onClick={() => handleStopBot(bot.id)}
                >
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Bot Card */}
        <Card className="flex flex-col items-center justify-center border-dashed py-10 opacity-70 hover:opacity-100 cursor-pointer">
          <CardContent>
            <Button variant="outline" onClick={handleAddBot}>
              {t('add_bot')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
