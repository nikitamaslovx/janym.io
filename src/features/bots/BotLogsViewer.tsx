'use client';

import type { Buffer } from 'node:buffer';

import mqtt from 'mqtt';
import React, { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BotLog } from '@/types/metrics';

type BotLogsViewerProps = {
  botId: string;
};

export const BotLogsViewer = ({ botId }: BotLogsViewerProps) => {
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to MQTT for real-time logs
    const client = mqtt.connect('ws://localhost:8083/mqtt', {
      clientId: `janym_logs_${botId}_${Math.random().toString(16).slice(2, 8)}`,
      username: 'admin',
      password: 'public',
    });

    client.on('connect', () => {
      setIsConnected(true);
      // Subscribe to all log levels for this bot
      client.subscribe(`hbot/${botId}/logs/+`);
    });

    client.on('message', (_topic: string, message: Buffer) => {
      try {
        const payload = JSON.parse(message.toString());
        const log: BotLog = {
          id: `mqtt_${Date.now()}_${Math.random()}`,
          botId,
          level: payload.level || 'info',
          message: payload.message || message.toString(),
          metadata: payload.metadata || null,
          createdAt: new Date(),
        };

        setLogs(prev => [log, ...prev].slice(0, 1000)); // Keep last 1000 logs
      } catch (error) {
        console.error('Failed to parse log message:', error);
      }
    });

    client.on('error', (err) => {
      console.error('MQTT Error:', err);
      setIsConnected(false);
    });

    return () => {
      client.end();
    };
  }, [botId]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'all' && log.level !== filterLevel) {
      return false;
    }
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bot Logs</CardTitle>
            <CardDescription>Real-time log stream</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Select value={filterLevel} onValueChange={value => setFilterLevel(value as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] space-y-2 overflow-y-auto">
          {filteredLogs.length === 0
            ? (
                <div className="py-8 text-center text-muted-foreground">No logs found</div>
              )
            : (
                filteredLogs.map(log => (
                  <div
                    key={log.id}
                    className={`rounded-md border p-3 ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-medium uppercase">{log.level}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {log.metadata && (
                          <pre className="mt-2 text-xs opacity-75">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
        </div>
      </CardContent>
    </Card>
  );
};
