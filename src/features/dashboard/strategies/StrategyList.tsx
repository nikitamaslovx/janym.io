'use client';

import mqtt from 'mqtt';
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

type BotStatus = 'running' | 'stopped' | 'error';

type Bot = {
  id: string;
  name: string;
  strategy: string;
  pair: string;
  status: BotStatus;
};

export const StrategyList = () => {
  const t = useTranslations('StrategyList');
  const [bots, setBots] = useState<Bot[]>([
    {
      id: 'bot-1',
      name: 'Binance BTC/USDT',
      strategy: 'pure_market_making',
      pair: 'BTC/USDT',
      status: 'stopped',
    },
    {
      id: 'bot-2',
      name: 'KuCoin ETH/USDT',
      strategy: 'cross_exchange_mining',
      pair: 'ETH/USDT',
      status: 'stopped',
    },
  ]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to EMQX via WebSockets
    const client = mqtt.connect('ws://localhost:8083/mqtt', {
      clientId: `janym_dashboard_${Math.random().toString(16).slice(2, 8)}`,
      username: 'admin', // Use public/anonymous if configured, or specific dash user
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

        setBots(prevBots =>
          prevBots.map(bot =>
            bot.id === botId ? { ...bot, status: payload.status } : bot,
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
    setLoadingMap(prev => ({ ...prev, [botId]: true }));
    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId, action }),
      });

      if (!response.ok) {
        console.error('Failed to send command');
        // Revert or show toast error
        return;
      }

      // Optimistic update
      setBots(prev =>
        prev.map(b => (b.id === botId ? { ...b, status: action === 'start' ? 'running' : 'stopped' } : b)),
      );
    } catch (error) {
      console.error('Error sending command:', error);
    } finally {
      setLoadingMap(prev => ({ ...prev, [botId]: false }));
    }
  };

  const handleStartBot = (botId: string) => sendCommand(botId, 'start');
  const handleStopBot = (botId: string) => sendCommand(botId, 'stop');

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
        {bots.map(bot => (
          <Card key={bot.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{bot.name}</CardTitle>
              <Badge
                variant={bot.status === 'running' ? 'default' : 'destructive'}
              >
                {bot.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bot.pair}</div>
              <p className="text-xs text-muted-foreground">{bot.strategy}</p>
              <div className="mt-4 flex gap-2">
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

        {/* Add New Bot Card Placeholder */}
        <Card className="flex flex-col items-center justify-center border-dashed py-10 opacity-70 hover:opacity-100">
          <CardContent>
            <Button variant="outline">{t('add_bot')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
