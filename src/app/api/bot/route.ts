import mqtt from 'mqtt';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // eslint-disable-next-line no-console
  console.log('API /api/bot called');
  try {
    const body = await request.json();
    const { botId, action } = body;

    if (!botId || !['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request. "botId" and "action" (start/stop) are required.' },
        { status: 400 },
      );
    }

    // Connect to MQTT Broker (EMQX)
    // Note: In Docker environment, 'localhost' might need to be 'emqx' or host.docker.internal
    // For local dev, localhost:1883 is correct.
    const client = mqtt.connect('mqtt://localhost:1883', {
      clientId: `janym_api_${Math.random().toString(16).slice(2, 8)}`,
      connectTimeout: 5000,
    });

    return new Promise((resolve) => {
      client.on('connect', () => {
        let topic = '';
        let message = '';

        if (action === 'start') {
          topic = `hbot/${botId}/start`;
          message = JSON.stringify({
            log_level: 'info',
            script: null,
            is_quickstart: true,
          });
        } else if (action === 'stop') {
          topic = `hbot/${botId}/stop`;
          message = JSON.stringify({
            skip_order_cancellation: false,
          });
        }

        client.publish(topic, message, { qos: 1 }, (err) => {
          client.end();
          if (err) {
            console.error('MQTT Publish Error:', err);
            resolve(
              NextResponse.json(
                { error: 'Failed to send command to bot network.' },
                { status: 500 },
              ),
            );
          } else {
            // eslint-disable-next-line no-console
            console.log(`Command "${action}" sent to ${topic}`);
            resolve(
              NextResponse.json({ success: true, message: `Command ${action} sent to ${botId}` }),
            );
          }
        });
      });

      client.on('error', (err) => {
        console.error('MQTT Connection Error:', err);
        client.end();
        resolve(
          NextResponse.json(
            { error: 'Failed to connect to MQTT broker.' },
            { status: 503 },
          ),
        );
      });
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
