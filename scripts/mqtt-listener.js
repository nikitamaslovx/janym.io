const mqtt = require('mqtt');

console.log('Connecting to MQTT broker to listen for commands...');
const client = mqtt.connect('mqtt://localhost:1883', {
  clientId: 'test-listener',
});

client.on('connect', () => {
  console.log('Connected! Subscribing to hbot/#');
  client.subscribe('hbot/#', (err) => {
    if (!err) {
      console.log('Subscribed successfully');
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Received message on [${topic}]: ${message.toString()}`);
});
