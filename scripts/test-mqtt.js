const mqtt = require('mqtt');

console.log('Connecting to MQTT broker...');
const client = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'test-script',
  connectTimeout: 5000,
});

client.on('connect', () => {
  console.log('Connected!');
  client.publish('test/topic', 'Hello MQTT', (err) => {
    if (err) {
      console.error('Publish error:', err);
    } else {
      console.log('Message published to test/topic');
    }
    client.end();
  });
});

client.on('error', (err) => {
  console.error('Connection error:', err);
  client.end();
});
