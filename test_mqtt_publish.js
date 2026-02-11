const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');

const botId = '80ed35a9-1085-472e-847d-7321c0dea6fd';

client.on('connect', () => {
  console.log('Connected to broker at mqtt://localhost:1883');
  
  const payload = {
    exchange: 'binance',
    market: 'BTC-USDT',
    bid_spread: 0.1,
    ask_spread: 0.1,
    order_amount: 0.001
  };

  console.log(`Publishing to hbot/${botId}/start...`);
  client.publish(`hbot/${botId}/start`, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) {
      console.error('Failed to publish', err);
    } else {
      console.log('Successfully published start command!');
    }
    client.end();
  });
});
